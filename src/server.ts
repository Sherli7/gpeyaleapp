// server.ts
import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { createCandidatureRoutes } from './routes/candidature.routes';
import { createGdprRoutes } from './routes/gdpr.routes';
import { configureSecurity } from './middleware/security.middleware';

dotenv.config();

const app = express();

// ▶️ Le backend écoute par défaut sur 3003 (aligné avec Apache ProxyPass ...:3003)
const PORT = Number(process.env.PORT) || 3003;

// Derrière un reverse-proxy (Apache) pour que req.ip & co. soient corrects
app.set('trust proxy', true);

/* -------------------------------------------------------
 * CORS — Autoriser explicitement les origins souhaités
 * -----------------------------------------------------*/

// Origins par défaut (prod + dev courants)
const defaults = [
  'https://gpe-yale.edocsflow.com',     // PROD (ton domaine)
  'http://localhost:8007',              // Vite dev server (si utilisé localement)
  'http://localhost:5173',              // autre port Vite classique
];

// Variables d'environnement optionnelles
// - FRONTEND_URL: un seul origin (ex: https://gpe-yale.edocsflow.com)
// - ALLOWED_ORIGINS: liste séparée par virgules (ex: "https://a.com,https://b.com")
const fromEnvSingle = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
const fromEnvList = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [];

// Construire l'ensemble des origins autorisés
const allowedOriginSet = new Set<string>([...defaults, ...fromEnvSingle, ...fromEnvList]);

// Petit log pour diagnostiquer en prod
console.log('[CORS] Allowed origins:', Array.from(allowedOriginSet).join(', ') || '(none)');

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser aussi les requêtes sans Origin (e.g. curl, healthchecks)
    if (!origin || allowedOriginSet.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
};

// Appliquer CORS (et gérer le préflight)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* -------------------------------------------------------
 * Sécurité (Helmet, rate-limit, headers) via ton middleware
 * -----------------------------------------------------*/
configureSecurity(app);

/* -------------------------------------------------------
 * Body parsers (taille réaliste pour un formulaire)
 * -----------------------------------------------------*/
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* -------------------------------------------------------
 * Routes applicatives
 * -----------------------------------------------------*/
console.log('Montage des routes /api/candidatures');
app.use('/api/candidatures', createCandidatureRoutes());
console.log('Routes /api/candidatures montées');

app.use('/api/gdpr', createGdprRoutes());

/* -------------------------------------------------------
 * Health checks (utile pour tests directs et via Apache)
 * -----------------------------------------------------*/
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Accessible via Apache avec ProxyPass /api → backend
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

/* -------------------------------------------------------
 * 404 handler
 * -----------------------------------------------------*/
app.use((req: Request, res: Response) => {
  console.log('Requête non trouvée:', req.method, req.url);
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* -------------------------------------------------------
 * Erreurs de parsing (JSON invalide / payload trop gros)
 * -----------------------------------------------------*/
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'JSON invalide' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Payload trop volumineux' });
  }
  return next(err);
});

/* -------------------------------------------------------
 * Error handler générique (dernier middleware)
 * -----------------------------------------------------*/
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Log server side
  console.error('Erreur serveur:', err?.stack || err);
  // Réponse générique (en dev, on peut exposer err.message)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? (err?.message || 'Unknown error') : {}
  });
});

/* -------------------------------------------------------
 * Bootstrapping
 * -----------------------------------------------------*/
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Base de données initialisée avec succès');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app };

