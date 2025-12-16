import { AppDataSource } from '../config/database';
import { Candidature } from '../entities/Candidature';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { QueryFailedError } from 'typeorm';

export class CandidatureService {
  private candidatureRepository = AppDataSource.getRepository(Candidature);

  async createCandidature(candidatureData: Partial<Candidature>) {
    try {
      // Convertir les données brutes en instance de Candidature
      const candidature = plainToInstance(Candidature, candidatureData);
      
      // Valider les données
      const errors = await validate(candidature);
      if (errors.length > 0) {
        const errorMessages = errors.map(e => 
          Object.values(e.constraints || {}).join(', ')
        ).join('; ');
        
        console.error('Erreur de validation:', errorMessages);
        throw new Error(`Erreur de validation: ${errorMessages}`);
      }

      // Sauvegarder la candidature
      console.log('Tentative de sauvegarde de la candidature:', candidature);
      const savedCandidature = await this.candidatureRepository.save(candidature);
      console.log('Candidature sauvegardée avec succès:', savedCandidature.id);
      
      return savedCandidature;
    } catch (error) {
      console.error('Erreur lors de la création de la candidature:', error);
      
      if (error instanceof QueryFailedError) {
        // Gestion spécifique des erreurs de base de données
        if (error.message.includes('duplicate key')) {
          throw new Error('Une candidature avec cet email existe déjà');
        }
        if (error.message.includes('violates foreign key constraint')) {
          throw new Error('Erreur de référence: une contrainte de clé étrangère a échoué');
        }
      }
      
      // Relancer l'erreur pour qu'elle soit gérée par le contrôleur
      throw error;
    }
  }

  async getCandidatureById(id: number) {
    return this.candidatureRepository.findOne({ where: { id } });
  }

  async getAllCandidatures() {
    return this.candidatureRepository.find();
  }

  // Ajouter d'autres méthodes selon les besoins (update, delete, etc.)
}
