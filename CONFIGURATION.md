# Guide de Configuration - GPE Yale App Backend

## 🔧 Configuration des Variables d'Environnement

### Variables Obligatoires

Toutes les variables suivantes sont **OBLIGATOIRES**. L'application refusera de démarrer si l'une d'elles est absente.

#### Base de Données PostgreSQL

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DB_HOST` | Hôte PostgreSQL | `localhost` ou `host.docker.internal` |
| `DB_PORT` | Port PostgreSQL | `5433` |
| `DB_USER` | Utilisateur PostgreSQL | `maarch` |
| `DB_PASSWORD` | Mot de passe | `M@arch_2026!Secure` |
| `DB_NAME` | Nom de la base | `gpe_yale` |

#### Serveur

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port d'écoute du serveur | `3003` |
| `NODE_ENV` | Environnement | `development` ou `production` |

#### Email (SMTP)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `EMAIL_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `EMAIL_PORT` | Port SMTP | `587` |
| `EMAIL_USER` | Utilisateur SMTP | `votre-email@gmail.com` |
| `EMAIL_PASS` | Mot de passe SMTP | `votre-mot-de-passe` |
| `EMAIL_FROM` | Email expéditeur | `noreply@example.com` |

---

## 🚀 Démarrage

### En Local (Développement)

1. **Copier le fichier d'exemple :**
   ```bash
   cp .env.example .env
   ```

2. **Éditer `.env` avec vos valeurs :**
   ```bash
   nano .env  # ou utilisez votre éditeur préféré
   ```

3. **Installer les dépendances :**
   ```bash
   npm install
   ```

4. **Démarrer l'application :**
   ```bash
   npm run dev
   ```

### Avec Docker (Production)

1. **S'assurer que le fichier `.env` est configuré correctement**

2. **Builder et démarrer le container :**
   ```bash
   docker-compose up -d --build
   ```

3. **Vérifier les logs :**
   ```bash
   docker-compose logs -f app
   ```

   Vous devriez voir :
   ```
   📊 Tentative de connexion à PostgreSQL...
      └─ Hôte: host.docker.internal
      └─ Port: 5433
      └─ Base de données: gpe_yale
      └─ Utilisateur: maarch
      └─ Environnement: production
      └─ Synchronisation auto: ✗ désactivée (prod)
   ✅ Connexion à la base de données établie avec succès.
   ```

---

## ⚠️ Points Importants

### 1. Utilisateur PostgreSQL

**IMPORTANT :** Utilisez l'utilisateur `maarch`, **pas `postgres`**.

L'utilisateur doit avoir les permissions suivantes :
```sql
GRANT ALL PRIVILEGES ON DATABASE gpe_yale TO maarch;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO maarch;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO maarch;
```

### 2. Synchronisation TypeORM

- **Développement (`NODE_ENV=development`)** : `synchronize: true`
  - TypeORM synchronise automatiquement le schéma
  - Pratique pour le prototypage rapide

- **Production (`NODE_ENV=production`)** : `synchronize: false`
  - TypeORM ne modifie PAS le schéma
  - Utilisez les migrations pour les changements de schéma

### 3. Migrations en Production

Pour apporter des modifications au schéma en production :

```bash
# Générer une migration
npm run typeorm migration:generate -- -n NomDeLaMigration

# Exécuter les migrations
npm run typeorm migration:run

# Annuler la dernière migration
npm run typeorm migration:revert
```

### 4. Docker et Variables d'Environnement

Le fichier `docker-compose.yml` utilise maintenant `env_file` :

```yaml
env_file:
  - .env
```

Cela permet de charger automatiquement toutes les variables depuis `.env`.

Les variables définies dans `environment:` ont priorité sur celles du fichier `.env`.

---

## 🐛 Dépannage

### Erreur : "Variable d'environnement requise mais absente"

**Cause :** Une variable obligatoire n'est pas définie.

**Solution :**
1. Vérifiez que votre fichier `.env` contient toutes les variables
2. Vérifiez qu'il n'y a pas d'espaces autour du `=`
3. Avec Docker, assurez-vous que `env_file` est défini dans `docker-compose.yml`

### Erreur : "permission denied for table candidatures"

**Cause :** L'utilisateur PostgreSQL n'a pas les permissions nécessaires.

**Solution :**
```sql
-- Se connecter avec un superutilisateur
psql -U postgres -p 5433 -d gpe_yale

-- Accorder les permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO maarch;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO maarch;
ALTER TABLE candidatures OWNER TO maarch;
```

### Erreur : "relation candidatures already exists"

**Cause :** `synchronize: true` tente de recréer une table existante.

**Solution :** Cette erreur ne devrait plus apparaître avec la nouvelle configuration. En production, `synchronize` est automatiquement désactivé.

### Erreur : "password authentication failed"

**Cause :** Mot de passe incorrect ou utilisateur inexistant.

**Solution :**
1. Vérifiez que `DB_PASSWORD` dans `.env` correspond au mot de passe PostgreSQL
2. Vérifiez que l'utilisateur `DB_USER` existe dans PostgreSQL
3. Testez la connexion manuellement :
   ```bash
   psql -U maarch -h localhost -p 5433 -d gpe_yale
   ```

---

## 📝 Changements Apportés

### 1. Configuration TypeORM (`src/config/database.ts`)
- ✅ Suppression de toutes les valeurs par défaut (plus de `|| 'postgres'`)
- ✅ Validation stricte des variables d'environnement au démarrage
- ✅ Messages d'erreur explicites en cas de configuration manquante
- ✅ Logs détaillés de connexion (sans exposer le mot de passe)
- ✅ `synchronize` automatiquement désactivé en production

### 2. Fichier `.env`
- ✅ Variables renommées : `DB_USERNAME` → `DB_USER` (cohérence)
- ✅ Commentaires explicatifs pour chaque variable
- ✅ Utilisateur `maarch` au lieu de `postgres`

### 3. Docker Compose
- ✅ Utilisation de `env_file` pour charger automatiquement `.env`
- ✅ Simplification : moins de duplication de variables
- ✅ Variables spécifiques à la production dans `environment:`

### 4. Documentation
- ✅ Fichier `.env.example` mis à jour avec commentaires détaillés
- ✅ Guide de configuration complet (ce fichier)

---

## 🔒 Sécurité

### Mots de Passe
- ⚠️ **Ne jamais commiter le fichier `.env` dans Git**
- ✅ Le fichier `.env` est déjà dans `.gitignore`
- ✅ Partagez `.env.example` à la place
- ✅ Utilisez des mots de passe forts en production

### Permissions PostgreSQL
- ✅ Créez un utilisateur dédié par application (pas `postgres`)
- ✅ Accordez uniquement les permissions nécessaires
- ✅ Utilisez des connexions SSL en production

---

## 📞 Support

En cas de problème persistant :
1. Vérifiez les logs : `docker-compose logs -f app`
2. Vérifiez la connexion PostgreSQL manuellement
3. Consultez ce guide de dépannage
4. Vérifiez que toutes les variables d'environnement sont définies
