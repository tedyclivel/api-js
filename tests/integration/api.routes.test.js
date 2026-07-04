import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import utilisateurService from '../../src/services/utilisateur.service.js';
import compteService from '../../src/services/compte.service.js';

vi.mock('../../src/services/utilisateur.service.js');
vi.mock('../../src/services/compte.service.js');

describe('API Routes Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /utilisateurs/register', () => {
        it('devrait inscrire un utilisateur et créer un compte', async () => {
            utilisateurService.inscrireUtilisateur.mockResolvedValue({ id: 1, email: 'test@test.com' });
            compteService.creerCompte.mockResolvedValue({ id: 10, utilisateur_id: 1 });
            compteService.crediterCompte.mockResolvedValue(true);

            const res = await request(app)
                .post('/utilisateurs/register')
                .send({ nom: 'Test', prenom: 'User', email: 'test@test.com', motDePasse: 'pass', age: 25, soldeInitial: 100 });

            expect(res.status).toBe(201);
            expect(res.body.utilisateurId).toBe(1);
            expect(compteService.creerCompte).toHaveBeenCalledWith(1, 'courant');
            expect(compteService.crediterCompte).toHaveBeenCalledWith(10, 100, 1);
        });
    });

    describe('POST /login', () => {
        it('devrait connecter et retourner un token', async () => {
            utilisateurService.authentifierUtilisateur.mockResolvedValue({ id: 1, email: 'test@test.com' });
            utilisateurService.genererToken.mockReturnValue('fake-jwt-token');

            const res = await request(app)
                .post('/login')
                .send({ email: 'test@test.com', motDePasse: 'pass' });

            expect(res.status).toBe(200);
            expect(res.body.token).toBe('fake-jwt-token');
        });
    });
});
