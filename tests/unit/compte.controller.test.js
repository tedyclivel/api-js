import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMesComptes, createCompte, getCompte, getHistorique, depot, retrait, virement } from '../../src/controllers/compte.controller.js';
import compteService from '../../src/services/compte.service.js';

vi.mock('../../src/services/compte.service.js');

// Helper pour créer req/res/next mock
const makeReq = (params = {}, body = {}, user = { id: 10 }) => ({ params, body, user });
const makeRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};
const makeNext = () => vi.fn();

describe('CompteController', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getMesComptes', () => {
        it('devrait retourner la liste des comptes de l\'utilisateur', async () => {
            const comptes = [{ id: 1, solde: 100 }];
            compteService.listerComptes.mockResolvedValue(comptes);

            const req = makeReq();
            const res = makeRes();
            await getMesComptes(req, res, makeNext());

            expect(compteService.listerComptes).toHaveBeenCalledWith(10);
            expect(res.json).toHaveBeenCalledWith(comptes);
        });

        it('devrait appeler next() en cas d\'erreur', async () => {
            const error = new Error('DB Error');
            compteService.listerComptes.mockRejectedValue(error);
            const next = makeNext();
            await getMesComptes(makeReq(), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('createCompte', () => {
        it('devrait créer un compte et retourner 201', async () => {
            const newCompte = { id: 5, type_compte: 'EPARGNE', solde: 0 };
            compteService.creerCompte.mockResolvedValue(newCompte);

            const req = makeReq({}, { type_compte: 'EPARGNE', solde_initial: 0 });
            const res = makeRes();
            await createCompte(req, res, makeNext());

            expect(compteService.creerCompte).toHaveBeenCalledWith(10, 'EPARGNE', 0);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newCompte);
        });

        it('devrait normaliser le type en majuscules', async () => {
            compteService.creerCompte.mockResolvedValue({ id: 5 });
            const req = makeReq({}, { type_compte: 'epargne', solde_initial: 100 });
            const res = makeRes();
            await createCompte(req, res, makeNext());
            expect(compteService.creerCompte).toHaveBeenCalledWith(10, 'EPARGNE', 100);
        });

        it('devrait utiliser COURANT et 0 par défaut si champs absents', async () => {
            compteService.creerCompte.mockResolvedValue({ id: 5 });
            const req = makeReq({}, {});
            const res = makeRes();
            await createCompte(req, res, makeNext());
            expect(compteService.creerCompte).toHaveBeenCalledWith(10, 'COURANT', 0);
        });

        it('devrait appeler next() en cas d\'erreur', async () => {
            const error = new Error('Creation failed');
            compteService.creerCompte.mockRejectedValue(error);
            const next = makeNext();
            await createCompte(makeReq(), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getCompte', () => {
        it('devrait retourner un compte spécifique', async () => {
            const compte = { id: 1, solde: 500 };
            compteService.consulterCompte.mockResolvedValue(compte);

            const req = makeReq({ id: '1' });
            const res = makeRes();
            await getCompte(req, res, makeNext());

            expect(compteService.consulterCompte).toHaveBeenCalledWith(1, 10);
            expect(res.json).toHaveBeenCalledWith(compte);
        });

        it('devrait appeler next() en cas d\'erreur', async () => {
            const error = new Error('Not found');
            compteService.consulterCompte.mockRejectedValue(error);
            const next = makeNext();
            await getCompte(makeReq({ id: '1' }), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getHistorique', () => {
        it('devrait retourner l\'historique d\'un compte', async () => {
            const historique = [{ id: 1, type_transaction: 'DEPOT', montant: 100 }];
            compteService.obtenirHistorique.mockResolvedValue(historique);

            const req = makeReq({ id: '1' });
            const res = makeRes();
            await getHistorique(req, res, makeNext());

            expect(compteService.obtenirHistorique).toHaveBeenCalledWith(1, 10);
            expect(res.json).toHaveBeenCalledWith(historique);
        });

        it('devrait appeler next() en cas d\'erreur', async () => {
            const error = new Error('Not found');
            compteService.obtenirHistorique.mockRejectedValue(error);
            const next = makeNext();
            await getHistorique(makeReq({ id: '1' }), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('depot', () => {
        it('devrait effectuer un dépôt et retourner le compte mis à jour', async () => {
            const compteMaj = { id: 1, solde: 600 };
            compteService.crediterCompte.mockResolvedValue(compteMaj);

            const req = makeReq({ id: '1' }, { montant: 100 });
            const res = makeRes();
            await depot(req, res, makeNext());

            expect(compteService.crediterCompte).toHaveBeenCalledWith(1, 100, 10);
            expect(res.json).toHaveBeenCalledWith(compteMaj);
        });

        it('devrait appeler next() en cas d\'erreur', async () => {
            const error = new Error('Invalid');
            compteService.crediterCompte.mockRejectedValue(error);
            const next = makeNext();
            await depot(makeReq({ id: '1' }, { montant: 100 }), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('retrait', () => {
        it('devrait effectuer un retrait et retourner le compte mis à jour', async () => {
            const compteMaj = { id: 1, solde: 400 };
            compteService.debiterCompte.mockResolvedValue(compteMaj);

            const req = makeReq({ id: '1' }, { montant: 100 });
            const res = makeRes();
            await retrait(req, res, makeNext());

            expect(compteService.debiterCompte).toHaveBeenCalledWith(1, 100, 10);
            expect(res.json).toHaveBeenCalledWith(compteMaj);
        });

        it('devrait appeler next() en cas d\'erreur', async () => {
            const error = new Error('Insuffisant');
            compteService.debiterCompte.mockRejectedValue(error);
            const next = makeNext();
            await retrait(makeReq({ id: '1' }, { montant: 100 }), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('virement', () => {
        it('devrait effectuer un virement avec succès', async () => {
            compteService.virer.mockResolvedValue(undefined);

            const req = makeReq({ id: '1' }, { compteDestinationId: '2', montant: 200 });
            const res = makeRes();
            await virement(req, res, makeNext());

            expect(compteService.virer).toHaveBeenCalledWith(1, '2', 200, 10);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
        });

        it('devrait appeler next() en cas d\'erreur', async () => {
            const error = new Error('Insuffisant');
            compteService.virer.mockRejectedValue(error);
            const next = makeNext();
            await virement(makeReq({ id: '1' }, { compteDestinationId: '2', montant: 200 }), makeRes(), next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
