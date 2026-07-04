import { Router } from 'express';
import { register, login } from '../controllers/utilisateur.controller.js';

const router = Router();

router.post('/utilisateurs/register', register);
router.post('/login', login);

export default router;
