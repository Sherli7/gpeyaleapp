Voici le README complet pour le backend, adapté à l’intégration avec le frontend Angular de ton formulaire de candidature, en prenant en compte PostgreSQL, RGPD, validation, API REST, et envoi d’email de confirmation.

---

# 📦 Backend – Formulaire de Candidature

## Sommaire

- [Description](#description)
- [Stack technique](#stack-technique)
- [Modèle de données](#modèle-de-données)
- [API REST](#api-rest)
- [Validation & Sécurité](#validation--sécurité)
- [Installation & Lancement](#installation--lancement)
- [Variables d'environnement](#variables-denvironnement)
- [Endpoints](#endpoints)
- [Sécurité](#sécurité)

---

## Description

Ce backend reçoit les candidatures soumises via le formulaire Angular, les valide, les stocke dans une base PostgreSQL, et envoie un email de confirmation au candidat.  
Il est conçu pour être sécurisé, conforme RGPD, et facilement extensible.

---

## Stack technique

- **Node.js** (Express)
- **TypeScript**
- **PostgreSQL** (ORM recommandé : Prisma ou TypeORM)
- **nodemailer** (ou SendGrid/Mailgun) pour l’email
- **Joi** ou **class-validator** pour la validation

---

## Modèle de données (PostgreSQL)

```sql
CREATE TABLE candidatures (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nationalite VARCHAR(50) NOT NULL,
    sexe VARCHAR(10) NOT NULL,
    date_naissance DATE NOT NULL,
    lieu_naissance VARCHAR(50) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    organisation VARCHAR(200),
    pays VARCHAR(50) NOT NULL,
    departement VARCHAR(100),
    poste_actuel VARCHAR(100) NOT NULL,
    description_taches VARCHAR(500) NOT NULL,
    diplome VARCHAR(50) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    domaine VARCHAR(100) NOT NULL,
    langues TEXT[] NOT NULL,
    niveaux JSONB NOT NULL, -- { "Français": "Avancé", ... }
    resultats_attendus VARCHAR(500) NOT NULL,
    autres_infos VARCHAR(1000),
    mode_financement VARCHAR(20) NOT NULL,
    institution_financement VARCHAR(200),
    contact_financement VARCHAR(100),
    email_contact_financement VARCHAR(150),
    source_information VARCHAR(50) NOT NULL,
    consentement BOOLEAN NOT NULL DEFAULT TRUE,
    date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API REST

### Endpoint principal

- **POST** `/api/candidatures`
- **Content-Type** : `application/json`

#### Exemple de payload

```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "nationalite": "Cameroun",
  "sexe": "Homme",
  "dateNaissance": "1990-01-01",
  "lieuNaissance": "Cameroun",
  "telephone": "+237 699999999",
  "email": "jean.dupont@email.com",
  "organisation": "Entreprise X",
  "pays": "Cameroun",
  "departement": "Informatique",
  "posteActuel": "Développeur",
  "descriptionTaches": "Développement d'applications",
  "diplome": "Master/MBA",
  "institution": "Université de Yaoundé",
  "domaine": "Informatique",
  "langues": ["Français", "Anglais"],
  "niveaux": { "Français": "Natif", "Anglais": "Intermédiaire" },
  "resultatsAttendus": "Acquérir de nouvelles compétences",
  "autresInfos": "",
  "mode": "Vous-même",
  "institutionFinancement": "",
  "contactFinancement": "",
  "emailContactFinancement": "",
  "source": "Site web",
  "consentement": true
}
```

#### Réponse

- **Succès** :  
  `201 Created`
  ```json
  { "success": true, "message": "Candidature envoyée avec succès." }
  ```
- **Erreur** :  
  `400 Bad Request` ou `500 Internal Server Error`
  ```json
  { "success": false, "message": "Erreur lors de la soumission. Merci de réessayer." }
  ```

---

## Validation & Sécurité

- **Validation stricte** de tous les champs (longueur, format, email, téléphone, etc.).
- **Champs conditionnels** : les infos de financement sont obligatoires si `mode` = "Institution" ou "Autre".
- **Protection** contre les injections SQL (ORM, requêtes paramétrées).
- **HTTPS** obligatoire en production.
- **Rate limiting** recommandé pour éviter le spam.
- **Logs** des erreurs et tentatives.

---

## Envoi d’email de confirmation

- Après insertion en base, envoyer un email à l’adresse du candidat.
- Exemple de contenu :

```
Objet : Confirmation de réception de votre candidature

Bonjour [Prénom] [Nom],

Votre candidature a bien été reçue. Nous vous remercions pour votre intérêt et vous contacterons prochainement.

Cordialement,
Service des affaires académiques
```

- Utiliser un service SMTP, gmail.
- Gérer les erreurs d’envoi d’email (ne pas bloquer la soumission si l’email échoue, mais logger l’erreur).

---

## RGPD & Confidentialité

- **Consentement** : le champ `consentement` doit être explicitement à `true`.
- **Utilisation** : les données sont utilisées uniquement pour la gestion des candidatures.
- **Suppression** : prévoir une procédure de suppression sur demande.
- **Sécurité** : accès restreint à la base, chiffrement des backups, etc.

---

## Installation & Lancement

1. **Cloner le repo**
   ```bash
   git clone <repo-backend>
   cd <repo-backend>
   ```

2. **Configurer la base PostgreSQL**
   - Créer la base et la table selon le schéma ci-dessus.

3. **Configurer les variables d’environnement**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/gpyaleapp
   SMTP_HOST=http://localhost
   SMTP_USER=postgres
   SMTP_PASS=gmail
   EMAIL_FROM=...
   ```

4. **Installer les dépendances**
   ```bash
   npm install
   ```

5. **Lancer le serveur**
   ```bash
   npm run start
   ```

---

## Exemples de requêtes

```bash
curl -X POST http://localhost:3000/api/candidatures \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

---

## Contact

Pour toute question technique ou besoin d’intégration, contacter l’équipe DevOps.

---

> **NB** : Adapter ce README selon le framework Node.js choisi (Express, NestJS, etc.) et les conventions de votre équipe.

---

Si tu veux un README pour le frontend ou un exemple de code backend (Express/NestJS), fais-le moi savoir !