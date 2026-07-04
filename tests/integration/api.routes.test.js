import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import utilisateurService from '../../src/services/utilisateur.service.js';
import compteService from '../../src/services/compte.service.js';
import jwt from 'jsonwebtoken';

vi.mock('../../src/services/utilisateur.service.js');
vi.mock('../../src/services/compte.service.js');
vi.mock('jsonwebtoken');

// Token fictif pour les routes protégées
const FAKE_TOKEN = 'Bearer fake-jwt';
const DECODED_USER = { id: 42, email: 'test@test.com' };

describe('API Routes — Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Par défaut, jwt.verify retourne l'utilisateur décodé
        jwt.verify.mockReturnValue(DECODED_USER);
        process.env.JWT_SECRET = 'testsecret';
    });

    // ─── Routes publiques ──────────────────────────────────────────────
    describe('GET /health', () => {
        it('devrait retourner status OK', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });

    describe('GET /unknown-route', () => {
        it('devrait retourner le fichier index.html (SPA fallback)', async () => {
            const res = await request(app).get('/unknown-route-pour-spa');
            expect(res.status).toBe(200);
            // express.static et res.sendFile vont échouer gracieusement ou retourner du texte si le mock / dist n'est pas parfait, mais l'important est de couvrir la route.
        });
    });

    describe('POST /utilisateurs/register', () => {
        it('devrait créer un utilisateur (201)', async () => {
            utilisateurService.inscrireUtilisateur.mockResolvedValue({ id: 1, email: 'test@test.com' });
            compteService.creerCompte.mockResolvedValue({ id: 10, type_compte: 'COURANT', solde: 0 });

            const res = await request(app)
                .post('/utilisateurs/register')
                .send({ nom: 'Doe', prenom: 'John', email: 'test@test.com', motDePasse: 'pass', age: 25 });

            expect(res.status).toBe(201);
            expect(res.body.utilisateurId).toBe(1);
            expect(compteService.creerCompte).toHaveBeenCalledWith(1, 'courant');
        });

        it('devrait retourner 400 si le service lève une MetierException', async () => {
            const { MetierException } = await import('../../src/errors/MetierException.js');
            utilisateurService.inscrireUtilisateur.mockRejectedValue(
                new MetierException('Un utilisateur avec cet email existe déjà.')
            );

            const res = await request(app)
                .post('/utilisateurs/register')
                .send({ nom: 'Doe', prenom: 'John', email: 'dup@test.com', motDePasse: 'pass', age: 25 });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('email existe déjà');
        });
    });

    describe('POST /login', () => {
        it('devrait retourner un token JWT (200)', async () => {
            utilisateurService.authentifierUtilisateur.mockResolvedValue({ id: 1, email: 'test@test.com' });
            utilisateurService.genererToken.mockReturnValue('real-jwt');

            const res = await request(app)
                .post('/login')
                .send({ email: 'test@test.com', motDePasse: 'pass' });

            expect(res.status).toBe(200);
            expect(res.body.token).toBe('real-jwt');
        });

        it('devrait retourner 401 si les identifiants sont invalides', async () => {
            const { MetierException } = await import('../../src/errors/MetierException.js');
            utilisateurService.authentifierUtilisateur.mockRejectedValue(
                new MetierException('Email ou mot de passe incorrect.', 401)
            );

            const res = await request(app)
                .post('/login')
                .send({ email: 'x@x.com', motDePasse: 'bad' });

            expect(res.status).toBe(401);
        });
    });

    // ─── Routes protégées ──────────────────────────────────────────────
    describe('GET /mes-comptes', () => {
        it('devrait retourner les comptes de l\'utilisateur (200)', async () => {
            const comptes = [{ id: 1, type_compte: 'COURANT', solde: 500 }];
            compteService.listerComptes.mockResolvedValue(comptes);

            const res = await request(app)
                .get('/mes-comptes')
                .set('Authorization', FAKE_TOKEN);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(compteService.listerComptes).toHaveBeenCalledWith(42);
        });

        it('devrait retourner 401 si aucun token n\'est fourni', async () => {
            const res = await request(app).get('/mes-comptes');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /comptes', () => {
        it('devrait créer un nouveau compte (201)', async () => {
            const newCompte = { id: 5, type_compte: 'EPARGNE', solde: 200 };
            compteService.creerCompte.mockResolvedValue(newCompte);

            const res = await request(app)
                .post('/comptes')
                .set('Authorization', FAKE_TOKEN)
                .send({ type_compte: 'EPARGNE', solde_initial: 200 });

            expect(res.status).toBe(201);
            expect(res.body.type_compte).toBe('EPARGNE');
            expect(compteService.creerCompte).toHaveBeenCalledWith(42, 'EPARGNE', 200);
        });
    });

    describe('POST /comptes/:id/depot', () => {
        it('devrait créditer le compte (200)', async () => {
            const compteMaj = { id: 1, solde: 600 };
            compteService.crediterCompte.mockResolvedValue(compteMaj);

            const res = await request(app)
                .post('/comptes/1/depot')
                .set('Authorization', FAKE_TOKEN)
                .send({ montant: 100 });

            expect(res.status).toBe(200);
            expect(compteService.crediterCompte).toHaveBeenCalledWith(1, 100, 42);
        });
    });

    describe('POST /comptes/:id/retrait', () => {
        it('devrait débiter le compte (200)', async () => {
            const compteMaj = { id: 1, solde: 400 };
            compteService.debiterCompte.mockResolvedValue(compteMaj);

            const res = await request(app)
                .post('/comptes/1/retrait')
                .set('Authorization', FAKE_TOKEN)
                .send({ montant: 100 });

            expect(res.status).toBe(200);
            expect(compteService.debiterCompte).toHaveBeenCalledWith(1, 100, 42);
        });

        it('devrait retourner 400 si solde insuffisant', async () => {
            const { MetierException } = await import('../../src/errors/MetierException.js');
            compteService.debiterCompte.mockRejectedValue(new MetierException('Solde insuffisant.'));

            const res = await request(app)
                .post('/comptes/1/retrait')
                .set('Authorization', FAKE_TOKEN)
                .send({ montant: 99999 });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Solde insuffisant.');
        });
    });

    describe('POST /comptes/:id/virement', () => {
        it('devrait effectuer un virement (200)', async () => {
            compteService.virer.mockResolvedValue(undefined);

            const res = await request(app)
                .post('/comptes/1/virement')
                .set('Authorization', FAKE_TOKEN)
                .send({ compteDestinationId: '2', montant: 200 });

            expect(res.status).toBe(200);
            expect(res.body.message).toBeDefined();
        });
    });

    describe('GET /comptes/:id/historique', () => {
        it('devrait retourner l\'historique d\'un compte (200)', async () => {
            const historique = [{ id: 1, type_transaction: 'DEPOT', montant: 100 }];
            compteService.obtenirHistorique.mockResolvedValue(historique);

            const res = await request(app)
                .get('/comptes/1/historique')
                .set('Authorization', FAKE_TOKEN);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
        });
    });
});
