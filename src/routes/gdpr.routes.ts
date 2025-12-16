import { Router } from 'express';
import { GdprController } from '../controllers/GdprController';

export const createGdprRoutes = () => {
  const router = Router();
  const gdprController = new GdprController();

  // Exporter toutes les données d'un candidat
  router.get('/export/:email', gdprController.exportData.bind(gdprController));
  
  // Mettre à jour les données d'un candidat
  router.put('/update/:id', gdprController.updateData.bind(gdprController));
  
  // Supprimer ou anonymiser les données d'un candidat
  router.delete('/delete/:id', gdprController.deleteData.bind(gdprController));

  return router;
};
