import { Router } from 'express';
import { 
    getMesComptes, 
    createCompte, 
    getCompte, 
    getHistorique, 
    depot, 
    retrait, 
    virement 
} from '../controllers/compte.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Toutes les routes de compte nécessitent d'être authentifié
router.use(authMiddleware);

router.get('/mes-comptes', getMesComptes);
router.post('/comptes', createCompte);
router.get('/comptes/:id', getCompte);
router.get('/comptes/:id/historique', getHistorique);
router.post('/comptes/:id/depot', depot);
router.post('/comptes/:id/retrait', retrait);
router.post('/comptes/:id/virement', virement);

export default router;
