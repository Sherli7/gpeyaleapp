import { Request, Response } from 'express';
import { GdprService } from '../services/GdprService';

export class GdprController {
  private gdprService = new GdprService();

  /**
   * Endpoint pour exporter toutes les données d'un candidat
   */
  async exportData(req: Request, res: Response) {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email est requis' 
        });
      }

      const data = await this.gdprService.exportCandidatureData(email);
      res.json({ success: true, data });
    } catch (error: unknown) {
      console.error('Error exporting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: 'Failed to export data', details: errorMessage });
    }
  }

  /**
   * Endpoint pour mettre à jour les données d'un candidat
   */
  async updateData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID est requis' 
        });
      }

      const updated = await this.gdprService.updateCandidatureData(
        parseInt(id, 10), 
        updateData
      );
      
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la mise à jour des données' 
      });
    }
  }

  /**
   * Endpoint pour supprimer les données d'un candidat
   */
  async deleteData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { anonymize = true } = req.query;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID est requis' 
        });
      }

      let result;
      if (anonymize === 'false') {
        // Suppression complète des données
        result = await this.gdprService.deleteCandidatureData(parseInt(id, 10));
      } else {
        // Anonymisation des données (par défaut)
        result = await this.gdprService.anonymizeCandidatureData(parseInt(id, 10));
      }

      res.json({ 
        success: true, 
        message: anonymize === 'false' ? 'Données supprimées avec succès' : 'Données anonymisées avec succès',
        data: result 
      });
    } catch (error: unknown) {
      console.error('Error deleting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression des données',
        error: errorMessage
      });
    }
  }
}
