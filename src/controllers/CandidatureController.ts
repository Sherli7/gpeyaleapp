
import { Request, Response } from 'express';
import { CandidatureService } from '../services/CandidatureService';
import { EmailService } from '../services/EmailService';
// import { mapFrenchToCandidature } from '../mappers/CandidatureMapper';
// const entity = mapFrenchToCandidature(payloadFR);
// await candidatureRepository.save(entity);
export class CandidatureController {
  private candidatureService = new CandidatureService();
  private emailService = new EmailService();

  async createCandidature(req: Request, res: Response) {
    try {
      console.log('Nouvelle demande de candidature reçue');
      console.log('Données reçues :', JSON.stringify(req.body, null, 2));
      
      // Valider et créer la candidature
      const candidature = await this.candidatureService.createCandidature(req.body);
      
      console.log('Candidature créée avec succès, ID:', candidature.id);
      
      // Envoyer l'email de confirmation de manière asynchrone
      this.emailService.sendConfirmationEmail(candidature)
        .then(() => {
          console.log(`Email de confirmation envoyé à ${candidature.email}`);
        })
        .catch(error => {
          console.error('Échec de l\'envoi de l\'email de confirmation:', {
            error: error.message,
            candidatureId: candidature.id,
            email: candidature.email
          });
        });
      
      // Répondre avec succès
      res.status(201).json({
        success: true,
        data: {
          id: candidature.id,
          firstName: candidature.firstName,
          lastName: candidature.lastName,
          email: candidature.email,
          submissionDate: candidature.submissionDate
        },
        message: 'Candidature soumise avec succès',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors de la création de la candidature:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      });
      
      // Déterminer le code d'erreur approprié
      const statusCode = errorMessage.includes('validation') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: 'Erreur lors de la création de la candidature',
        error: errorMessage
      });
    }
  }

  // Autres méthodes pour récupérer, mettre à jour, supprimer les candidatures...
}
