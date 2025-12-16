import { Request, Response, NextFunction, RequestHandler, Express } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Configuration de la politique de sécurité du contenu (CSP)
const cspConfig = {
  useDefaults: true,
  directives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", '"unsafe-inline"', '"unsafe-eval"'],
    'style-src': ["'self'", '"unsafe-inline"', 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'connect-src': ["'self'"],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'frame-src': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : null,
  }
};

// Configuration de la limitation de débit
const limiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limite par défaut de 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: JSON.stringify({
    success: false,
    message: 'Trop de requêtes depuis cette adresse IP. Veuillez réessayer plus tard.'
  })
};

const limiter = rateLimit(limiterOptions as any);

// Middleware pour les en-têtes de sécurité personnalisés
const securityHeaders: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // Suppression des en-têtes potentiellement sensibles
  res.removeHeader('X-Powered-By');
  
  // Ajout d'en-têtes de sécurité
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // Protection contre le détournement de clics (Clickjacking)
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none';");
  
  // Désactive la mise en cache côté client pour les réponses sensibles
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  
  next();
};

// Configuration complète du middleware de sécurité
export const securityMiddleware = [
  // Configuration Helmet de base avec les fonctionnalités essentielles
  helmet({
    contentSecurityPolicy: cspConfig,
    frameguard: { action: 'deny' },
    hsts: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    xssFilter: true
  }),
  
  // Application de la limitation de débit
  limiter,
  
  // Ajout des en-têtes de sécurité personnalisés
  securityHeaders
];

// Fonction utilitaire pour configurer la sécurité sur une application Express
export const configureSecurity = (app: Express): void => {
  app.use(securityMiddleware);
};
