import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { setupSwagger } from './swagger.js';
import { errorHandler } from './middleware/error.middleware.js';
import utilisateurRoutes from './routes/utilisateur.routes.js';
import compteRoutes from './routes/compte.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Documentation Swagger
setupSwagger(app);

// Routes API
app.get('/health', (req, res) => res.json({ status: 'OK', name: 'TEMA API' }));
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use('/', utilisateurRoutes);
app.use('/', compteRoutes);

// Middleware de gestion d'erreur global (toujours avant le static)
app.use(errorHandler);

// Servir les fichiers statiques du front-end React compilé (production)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback — toutes les routes inconnues renvoient index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

export default app;
