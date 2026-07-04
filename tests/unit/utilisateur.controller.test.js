import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from '../../src/controllers/utilisateur.controller.js';
import utilisateurService from '../../src/services/utilisateur.service.js';
import compteService from '../../src/services/compte.service.js';

vi.mock('../../src/services/utilisateur.service.js');
vi.mock('../../src/services/compte.service.js');

const makeReq = (body = {}) => ({ body });
const makeRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};
const makeNext = () => vi.fn();

describe('UtilisateurController', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('register', () => {
        it('devrait inscrire un utilisateur et créer un compte courant', async () => {
            utilisateurService.inscrireUtilisateur.mockResolvedValue({ id: 1, email: 'test@test.com' });
            compteService.creerCompte.mockResolvedValue({ id: 10, type_compte: 'COURANT', solde: 0 });

            const req = makeReq({ nom: 'Doe', prenom: 'John', email: 'test@test.com', motDePasse: 'pass', age: 25 });
            const res = makeRes();
            await register(req, res, makeNext());

            expect(utilisateurService.inscrireUtilisateur).toHaveBeenCalledWith('Doe', 'John', 'test@test.com', 'pass', 25);
            expect(compteService.creerCompte).toHaveBeenCalledWith(1, 'courant');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ utilisateurId: 1 }));
        });

        it('devrait créditer le compte si soldeInitial > 0', async () => {
            utilisateurService.inscrireUtilisateur.mockResolvedValue({ id: 1 });
            compteService.creerCompte.mockResolvedValue({ id: 10 });
            compteService.crediterCompte.mockResolvedValue({ id: 10, solde: 500 });

            const req = makeReq({ nom: 'Doe', prenom: 'John', email: 'test@test.com', motDePasse: 'pass', age: 25, soldeInitial: 500 });
            const res = makeRes();
            await register(req, res, makeNext());

            expect(compteService.crediterCompte).toHaveBeenCalledWith(10, 500, 1);
        });

        it('ne devrait PAS créditer si soldeInitial est 0 ou absent', async () => {
            utilisateurService.inscrireUtilisateur.mockResolvedValue({ id: 1 });
            compteService.creerCompte.mockResolvedValue({ id: 10 });

            const req = makeReq({ nom: 'Doe', prenom: 'John', email: 'test@test.com', motDePasse: 'pass', age: 25 });
            const res = makeRes();
            await register(req, res, makeNext());

            expect(compteService.crediterCompte).not.toHaveBeenCalled();
        });

        it('devrait appeler next() en cas d\'erreur service', async () => {
            const error = new Error('Email déjà utilisé');
            utilisateurService.inscrireUtilisateur.mockRejectedValue(error);
            const next = makeNext();

            await register(makeReq({ nom: 'A', prenom: 'B', email: 'x@x.com', motDePasse: 'p', age: 20 }), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        it('devrait authentifier et retourner un token JWT', async () => {
            utilisateurService.authentifierUtilisateur.mockResolvedValue({ id: 1, email: 'test@test.com' });
            utilisateurService.genererToken.mockReturnValue('jwt-token-fake');

            const req = makeReq({ email: 'test@test.com', motDePasse: 'pass' });
            const res = makeRes();
            await login(req, res, makeNext());

            expect(utilisateurService.authentifierUtilisateur).toHaveBeenCalledWith('test@test.com', 'pass');
            expect(utilisateurService.genererToken).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ token: 'jwt-token-fake' });
        });

        it('devrait appeler next() si les identifiants sont invalides', async () => {
            const error = new Error('Email ou mot de passe incorrect.');
            utilisateurService.authentifierUtilisateur.mockRejectedValue(error);
            const next = makeNext();

            await login(makeReq({ email: 'x@x.com', motDePasse: 'bad' }), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
