import { describe, it, expect, vi, beforeEach } from 'vitest';
import compteService from '../../src/services/compte.service.js';
import compteRepository from '../../src/repositories/compte.repository.js';
import historiqueRepository from '../../src/repositories/historique.repository.js';

vi.mock('../../src/repositories/compte.repository.js');
vi.mock('../../src/repositories/historique.repository.js');

const mockCompte = { id: 1, utilisateur_id: 10, type_compte: 'COURANT', solde: 500 };

describe('CompteService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('creerCompte', () => {
        it('devrait créer un compte COURANT par défaut', async () => {
            compteRepository.sauvegarder.mockResolvedValue(mockCompte);

            const compte = await compteService.creerCompte(10, 'COURANT');
            expect(compte.type_compte).toBe('COURANT');
            expect(compteRepository.sauvegarder).toHaveBeenCalledWith(
                expect.objectContaining({ type_compte: 'COURANT' })
            );
        });

        it('devrait normaliser le type en majuscules', async () => {
            compteRepository.sauvegarder.mockResolvedValue({ ...mockCompte, type_compte: 'EPARGNE' });

            await compteService.creerCompte(10, 'epargne');
            expect(compteRepository.sauvegarder).toHaveBeenCalledWith(
                expect.objectContaining({ type_compte: 'EPARGNE' })
            );
        });

        it('devrait créditer le compte si un solde initial est fourni', async () => {
            compteRepository.sauvegarder.mockResolvedValue(mockCompte);
            compteRepository.trouverParId.mockResolvedValue(mockCompte);
            compteRepository.mettreAJourSolde.mockResolvedValue({ ...mockCompte, solde: 200 });
            historiqueRepository.sauvegarder.mockResolvedValue({});

            await compteService.creerCompte(10, 'COURANT', 200);
            expect(compteRepository.mettreAJourSolde).toHaveBeenCalledWith(1, 700);
        });
    });

    describe('crediterCompte', () => {
        it('devrait augmenter le solde du compte', async () => {
            compteRepository.trouverParId.mockResolvedValue(mockCompte);
            compteRepository.mettreAJourSolde.mockResolvedValue({ ...mockCompte, solde: 600 });
            historiqueRepository.sauvegarder.mockResolvedValue({});

            await compteService.crediterCompte(1, 100, 10);
            expect(compteRepository.mettreAJourSolde).toHaveBeenCalledWith(1, 600);
            expect(historiqueRepository.sauvegarder).toHaveBeenCalledWith(
                expect.objectContaining({ type_transaction: 'DEPOT' })
            );
        });

        it('devrait refuser un montant négatif ou zéro', async () => {
            await expect(compteService.crediterCompte(1, -50, 10)).rejects.toThrow('strictement positif');
            await expect(compteService.crediterCompte(1, 0, 10)).rejects.toThrow('strictement positif');
        });
    });

    describe('debiterCompte', () => {
        it('devrait diminuer le solde du compte', async () => {
            compteRepository.trouverParId.mockResolvedValue(mockCompte);
            compteRepository.mettreAJourSolde.mockResolvedValue({ ...mockCompte, solde: 400 });
            historiqueRepository.sauvegarder.mockResolvedValue({});

            await compteService.debiterCompte(1, 100, 10);
            expect(compteRepository.mettreAJourSolde).toHaveBeenCalledWith(1, 400);
            expect(historiqueRepository.sauvegarder).toHaveBeenCalledWith(
                expect.objectContaining({ type_transaction: 'RETRAIT' })
            );
        });

        it('devrait refuser si solde insuffisant', async () => {
            compteRepository.trouverParId.mockResolvedValue({ ...mockCompte, solde: 50 });
            await expect(compteService.debiterCompte(1, 100, 10)).rejects.toThrow('Solde insuffisant');
        });
    });

    describe('virer', () => {
        it('devrait transférer le montant entre deux comptes', async () => {
            const compteSource = { id: 1, utilisateur_id: 10, solde: 500 };
            const compteDest = { id: 2, utilisateur_id: 20, solde: 100 };

            compteRepository.trouverParId
                .mockResolvedValueOnce(compteSource)
                .mockResolvedValueOnce(compteDest);
            compteRepository.mettreAJourSolde.mockResolvedValue({});
            historiqueRepository.sauvegarder.mockResolvedValue({});

            await compteService.virer(1, 2, 200, 10);

            expect(compteRepository.mettreAJourSolde).toHaveBeenCalledWith(1, 300);
            expect(compteRepository.mettreAJourSolde).toHaveBeenCalledWith(2, 300);
            expect(historiqueRepository.sauvegarder).toHaveBeenCalledTimes(2);
            expect(historiqueRepository.sauvegarder).toHaveBeenCalledWith(
                expect.objectContaining({ type_transaction: 'VIREMENT', compte_id: 1 })
            );
        });

        it('devrait refuser un virement vers le même compte', async () => {
            await expect(compteService.virer(1, 1, 100, 10)).rejects.toThrow('différents');
        });

        it('devrait refuser si le compte destination n\'existe pas', async () => {
            compteRepository.trouverParId
                .mockResolvedValueOnce(mockCompte)
                .mockResolvedValueOnce(null);
            await expect(compteService.virer(1, 99, 100, 10)).rejects.toThrow('non trouvé');
        });
    });

    describe('consulterCompte', () => {
        it('devrait retourner le compte si l\'utilisateur est propriétaire', async () => {
            compteRepository.trouverParId.mockResolvedValue(mockCompte);
            const compte = await compteService.consulterCompte(1, 10);
            expect(compte.id).toBe(1);
        });

        it('devrait refuser si le compte n\'appartient pas à l\'utilisateur', async () => {
            compteRepository.trouverParId.mockResolvedValue(mockCompte);
            await expect(compteService.consulterCompte(1, 99)).rejects.toThrow('Accès refusé');
        });

        it('devrait refuser si le compte n\'existe pas', async () => {
            compteRepository.trouverParId.mockResolvedValue(null);
            await expect(compteService.consulterCompte(999, 10)).rejects.toThrow('non trouvé');
        });
    });
});
