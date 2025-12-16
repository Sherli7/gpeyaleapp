# Documentation de l'API Candidature

## Base URL
`http://localhost:3000/api` (développement)
`https://localhost/api` (production)

## 1. Soumettre une candidature

### Requête
```typescript
// Exemple avec fetch API
const submitCandidature = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/candidatures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la soumission');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

// Exemple d'utilisation
const formData = {
  nom: "Dupont",
  prenom: "Jean",
  nationalite: "Française",
  dateNaissance: "1990-05-15",
  email: "jean.dupont@example.com",
  telephone: "+33123456789",
  // ... autres champs
  consentementRGPD: true
};

submitCandidature(formData)
  .then(data => console.log('Succès:', data))
  .catch(error => console.error('Erreur:', error));
```

### Réponse en cas de succès (201)
```json
{
  "success": true,
  "message": "Candidature soumise avec succès",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "dateSoumission": "2025-07-29T17:30:00.000Z"
  }
}
```

### Réponse en cas d'erreur (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "L'email est requis"
    }
  ]
}
```

## 2. Télécharger un fichier (CV/Lettre de motivation)

### Exemple avec FormData
```typescript
const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type); // 'cv' ou 'lettreMotivation'

  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      // Note: Ne pas définir manuellement Content-Type pour FormData
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};
```

## 3. Exporter les données personnelles (RGPD)

### Requête
```typescript
const exportData = async (email) => {
  try {
    const response = await fetch(`http://localhost:3000/api/gdpr/export/${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export des données');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};
```

## 4. Supprimer les données personnelles (RGPD)

### Requête
```typescript
const deleteData = async (email) => {
  try {
    const response = await fetch(`http://localhost:3000/api/gdpr/delete/${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression des données');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};
```

## Codes d'état HTTP

| Code | Description |
|------|-------------|
| 200 | Requête réussie |
| 201 | Ressource créée avec succès |
| 400 | Requête invalide |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

## Sécurité

- Toutes les requêtes doivent être faites en HTTPS en production
- Les fichiers uploadés sont limités à 5Mo par défaut
- Le taux de requêtes est limité à 100 requêtes par fenêtre de 15 minutes par adresse IP