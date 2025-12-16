import { AppDataSource } from '../config/database';
import { Candidature } from '../entities/Candidature';

export class GdprService {
  private candidatureRepository = AppDataSource.getRepository(Candidature);

  /**
   * Récupère toutes les données d'un candidat par son email
   */
  async getCandidatureData(email: string) {
    return this.candidatureRepository.find({ 
      where: { email },
      select: [
        'id', 'firstName', 'lastName', 'nationality', 'gender', 'dateOfBirth',
        'placeOfBirth', 'phoneNumber', 'email', 'organization', 'country',
        'department', 'currentPosition', 'taskDescription', 'diploma',
        'institution', 'field', 'languages', 'languageLevels', 'expectedResults',
        'otherInformation', 'fundingSource', 'institutionName',
        'contactPerson', 'contactEmail', 'informationSource',
        'consent', 'submissionDate'
      ]
    });
  }

  /**
   * Met à jour les données d'un candidat
   */
  async updateCandidatureData(id: number, updateData: Partial<Candidature>) {
    const candidature = await this.candidatureRepository.findOne({ where: { id } });
    if (!candidature) {
      throw new Error('Candidature non trouvée');
    }
    
    Object.assign(candidature, updateData);
    return this.candidatureRepository.save(candidature);
  }

  /**
   * Supprime définitivement les données d'un candidat
   */
  async deleteCandidatureData(id: number) {
    const result = await this.candidatureRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Candidature non trouvée');
    }
    return { success: true };
  }

  /**
   * Anonymise les données d'un candidat (au lieu de les supprimer complètement)
   */
  async anonymizeCandidatureData(id: number) {
    const candidature = await this.candidatureRepository.findOne({ where: { id } });
    if (!candidature) {
      throw new Error('Candidature non trouvée');
    }

    // Anonymisation des données personnelles
    const anonymizedData = {
      firstName: 'ANONYME',
      lastName: 'ANONYME',
      nationality: 'ANONYME',
      phoneNumber: 'ANONYME',
      email: `anonyme_${Date.now()}@anonyme.com`,
      organization: 'ANONYME',
      contactPerson: 'ANONYME',
      contactEmail: `anonyme_${Date.now()}_contact@anonyme.com`,
      consent: false,
      // Conserver les autres données non personnelles pour les statistiques
    };

    Object.assign(candidature, anonymizedData);
    return this.candidatureRepository.save(candidature);
  }

  /**
   * Exporte toutes les données d'un candidat dans un format structuré
   */
  async exportCandidatureData(email: string) {
    const candidatures = await this.getCandidatureData(email);
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCount: candidatures.length,
      },
      data: candidatures,
    };
  }
}
