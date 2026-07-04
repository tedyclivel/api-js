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

/**
 * @swagger
 * /mes-comptes:
 *   get:
 *     summary: Lister les comptes de l'utilisateur
 *     description: Renvoie la liste de tous les comptes appartenant à l'utilisateur authentifié.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des comptes
 */
router.get('/mes-comptes', getMesComptes);

/**
 * @swagger
 * /comptes:
 *   post:
 *     summary: Ouvrir un nouveau compte
 *     description: "Crée un nouveau compte (ex: EPARGNE) pour l'utilisateur connecté."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_compte
 *             properties:
 *               type_compte:
 *                 type: string
 *                 example: "EPARGNE"
 *               solde_initial:
 *                 type: number
 *                 example: 50.0
 *     responses:
 *       201:
 *         description: Compte créé
 */
router.post('/comptes', createCompte);

/**
 * @swagger
 * /comptes/{id}:
 *   get:
 *     summary: Obtenir les détails d'un compte
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du compte
 *       404:
 *         description: Compte non trouvé ou accès interdit
 */
router.get('/comptes/:id', getCompte);

/**
 * @swagger
 * /comptes/{id}/historique:
 *   get:
 *     summary: Voir l'historique d'un compte
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des transactions
 */
router.get('/comptes/:id/historique', getHistorique);

/**
 * @swagger
 * /comptes/{id}/depot:
 *   post:
 *     summary: Effectuer un dépôt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montant:
 *                 type: number
 *                 example: 100.50
 *     responses:
 *       200:
 *         description: Dépôt effectué
 */
router.post('/comptes/:id/depot', depot);

/**
 * @swagger
 * /comptes/{id}/retrait:
 *   post:
 *     summary: Effectuer un retrait
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montant:
 *                 type: number
 *                 example: 20.00
 *     responses:
 *       200:
 *         description: Retrait effectué
 *       400:
 *         description: Solde insuffisant
 */
router.post('/comptes/:id/retrait', retrait);

/**
 * @swagger
 * /comptes/{id}/virement:
 *   post:
 *     summary: Effectuer un virement
 *     description: Transférer de l'argent vers un autre compte.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du compte source
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - compteDestinationId
 *               - montant
 *             properties:
 *               compteDestinationId:
 *                 type: string
 *               montant:
 *                 type: number
 *     responses:
 *       200:
 *         description: Virement effectué
 */
router.post('/comptes/:id/virement', virement);

export default router;
