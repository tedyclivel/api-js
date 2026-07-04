import { Router } from 'express';
import { register, login } from '../controllers/utilisateur.controller.js';

const router = Router();

/**
 * @swagger
 * /utilisateurs/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un nouvel utilisateur et lui ouvre un compte courant par défaut.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - email
 *               - motDePasse
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               motDePasse:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: "Erreur de validation (ex: email déjà pris)"
 */
router.post('/utilisateurs/register', register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification d'un utilisateur
 *     description: Renvoie un JWT valide si les identifiants sont corrects.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - motDePasse
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               motDePasse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie, retourne le token JWT
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', login);

export default router;
