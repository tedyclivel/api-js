# NeoBanque API - Node.js (api-js)

Cette API est une réécriture complète en **Node.js/Express** de l'ancienne API Java/Spring Boot pour le projet NeoBanque.
Elle utilise **Supabase (PostgreSQL)** comme base de données, et implémente l'authentification sécurisée par JWT.

## Technologies Utilisées
- **Backend:** Node.js, Express.js
- **Base de données:** Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Sécurité:** JSON Web Tokens (JWT), bcryptjs
- **Tests:** Vitest, Supertest, @vitest/coverage-v8

## Installation

1. Accédez au répertoire de l'API :
   ```bash
   cd api-js
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez vos variables d'environnement. Copiez le fichier `.env.example` en `.env` et remplissez-le avec vos identifiants Supabase :
   ```bash
   PORT=3000
   SUPABASE_URL=https://<votre-projet>.supabase.co
   SUPABASE_ANON_KEY=<votre_anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
   JWT_SECRET=<une_cle_secrete_tres_longue>
   ```

## Configuration Supabase
Exécutez le script SQL situé dans `supabase/schema.sql` directement dans l'éditeur SQL de votre tableau de bord Supabase pour créer les tables `utilisateur`, `compte`, et `historique`.

## Lancement du Backend
```bash
# Mode développement (avec redémarrage automatique)
npm run dev

# Mode production
npm start
```

## Lancement du Frontend
Assurez-vous que le fichier `next.config.ts` dans le dossier `frontend-next` pointe bien vers l'URL locale :
`destination: 'http://localhost:3000/:path*'`
Puis lancez le frontend :
```bash
cd ../frontend-next
npm run dev
```

## Commandes de Tests
```bash
# Lancer les tests unitaires et d'intégration
npm test

# Lancer les tests avec le mode "watch"
npm run test:watch

# Lancer les tests et générer le rapport de couverture (Coverage)
npm run vitests:coverage
```

## Déploiement sur Render
1. Créez un nouveau **Web Service** sur Render.
2. Définissez le répertoire racine (**Root Directory**) sur `api-js`.
3. Commande de build : `npm install`
4. Commande de démarrage : `npm start`
5. Dans l'onglet **Environment**, ajoutez toutes les variables d'environnement présentes dans votre `.env` (ex: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`).
6. Une fois déployé, mettez à jour votre `frontend-next/next.config.ts` pour qu'il pointe vers l'URL Render (ex: `https://api-js-votrenom.onrender.com/:path*`).

## Endpoints Disponibles
- `POST /utilisateurs/register` : Création de compte et ouverture de compte courant.
- `POST /login` : Authentification et obtention du token JWT.
- `GET /mes-comptes` : Liste des comptes de l'utilisateur connecté.
- `POST /comptes` : Ouvrir un nouveau compte (ex: épargne).
- `GET /comptes/:id` : Détails d'un compte.
- `GET /comptes/:id/historique` : Historique des transactions du compte.
- `POST /comptes/:id/depot` : Déposer de l'argent.
- `POST /comptes/:id/retrait` : Retirer de l'argent.
- `POST /comptes/:id/virement` : Effectuer un virement vers un autre compte.

## Architecture
Le projet suit une architecture par couches séparées :
- **Routes (`src/routes`)** : Définissent les endpoints HTTP.
- **Controllers (`src/controllers`)** : Gèrent les requêtes HTTP et appellent les services.
- **Services (`src/services`)** : Contiennent la logique métier (ex: vérification des soldes, hashage).
- **Repositories (`src/repositories`)** : S'interfacent avec Supabase pour les opérations sur les données.
- **Middlewares (`src/middleware`)** : Gèrent l'authentification et les erreurs de manière centralisée.
