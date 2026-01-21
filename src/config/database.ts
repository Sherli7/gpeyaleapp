import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement dès le début
dotenv.config();

/**
 * Valide et récupère une variable d'environnement requise.
 * Lève une erreur si la variable est absente ou vide.
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `❌ ERREUR DE CONFIGURATION: La variable d'environnement "${key}" est requise mais absente.\n` +
      `Vérifiez votre fichier .env ou vos variables d'environnement Docker.`
    );
  }
  return value.trim();
}

/**
 * Récupère et valide toutes les variables de configuration de la base de données.
 */
function getDatabaseConfig() {
  const config = {
    host: getRequiredEnv('DB_HOST'),
    port: parseInt(getRequiredEnv('DB_PORT'), 10),
    username: getRequiredEnv('DB_USER'),
    password: getRequiredEnv('DB_PASSWORD'),
    database: getRequiredEnv('DB_NAME'),
    nodeEnv: process.env.NODE_ENV || 'development',
  };

  // Validation du port
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(
      `❌ ERREUR DE CONFIGURATION: DB_PORT doit être un nombre entre 1 et 65535 (actuel: ${process.env.DB_PORT})`
    );
  }

  return config;
}

// Récupération et validation de la configuration
const dbConfig = getDatabaseConfig();

// Configuration des chemins des entités et migrations
const entitiesPath = path.join(__dirname, '..', 'entities', '*.{js,ts}');
const migrationsPath = path.join(__dirname, '..', 'migrations', '*.{js,ts}');

// Création de la DataSource TypeORM avec configuration validée
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  
  // IMPORTANT: synchronize doit être désactivé en production
  // En production, utilisez les migrations TypeORM
  synchronize: dbConfig.nodeEnv === 'development',
  
  logging: dbConfig.nodeEnv === 'development',
  entities: [entitiesPath],
  migrations: [migrationsPath],
  subscribers: [],
  
  // Configuration SSL pour les environnements de production
  ssl: dbConfig.nodeEnv === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

/**
 * Initialise la connexion à la base de données.
 * Affiche les informations de connexion (sans le mot de passe) et gère les erreurs.
 */
export const initializeDatabase = async () => {
  try {
    // Log des paramètres de connexion (sans le mot de passe pour la sécurité)
    console.log('📊 Tentative de connexion à PostgreSQL...');
    console.log(`   └─ Hôte: ${dbConfig.host}`);
    console.log(`   └─ Port: ${dbConfig.port}`);
    console.log(`   └─ Base de données: ${dbConfig.database}`);
    console.log(`   └─ Utilisateur: ${dbConfig.username}`);
    console.log(`   └─ Environnement: ${dbConfig.nodeEnv}`);
    console.log(`   └─ Synchronisation auto: ${dbConfig.nodeEnv === 'development' ? '✓ activée (dev)' : '✗ désactivée (prod)'}`);
    
    await AppDataSource.initialize();
    
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la base de données:');
    console.error(error);
    console.error('\n💡 Vérifiez que:');
    console.error('   - PostgreSQL est démarré et accessible');
    console.error(`   - Le port ${dbConfig.port} est ouvert`);
    console.error(`   - L'utilisateur "${dbConfig.username}" a les permissions nécessaires`);
    console.error('   - Les variables d\'environnement sont correctement configurées');
    process.exit(1);
  }
};
