import { Router } from 'express';
import { CandidatureController } from '../controllers/CandidatureController';
import { validationMiddleware } from '../middleware/validation.middleware';
import { Candidature } from '../entities/Candidature';

export const createCandidatureRoutes = () => {
  const router = Router();
  const candidatureController = new CandidatureController();

  // Route pour soumettre une nouvelle candidature avec validation
  router.post(
    '/',
    validationMiddleware(Candidature, false),
    candidatureController.createCandidature.bind(candidatureController)
  );

  // Autres routes peuvent être ajoutées ici
  // router.get('/', candidatureController.getAllCandidatures.bind(candidatureController));
  // router.get('/:id', candidatureController.getCandidatureById.bind(candidatureController));

  return router;
};
