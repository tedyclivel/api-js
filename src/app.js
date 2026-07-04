import express from 'express';
import cors from 'cors';

import utilisateurRoutes from './routes/utilisateur.routes.js';
import compteRoutes from './routes/compte.routes.js';

import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

import { setupSwagger } from './swagger.js';
setupSwagger(app);

// Routes principales
app.get('/', (req, res) => res.json({ status: 'API NeoBanque is running' }));
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.use('/', utilisateurRoutes);
app.use('/', compteRoutes); // Le router contient les paths /mes-comptes et /comptes


// Middleware de gestion d'erreur global (toujours en dernier)
app.use(errorHandler);

export default app;
