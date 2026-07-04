import { describe, it, expect, vi, beforeEach } from 'vitest';
import utilisateurService from '../../src/services/utilisateur.service.js';
import utilisateurRepository from '../../src/repositories/utilisateur.repository.js';
import bcrypt from 'bcryptjs';

vi.mock('../../src/repositories/utilisateur.repository.js');
vi.mock('bcryptjs');

describe('UtilisateurService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'testsecret';
    });

    describe('inscrireUtilisateur', () => {
        it('devrait inscrire un utilisateur avec succès', async () => {
            const user = { nom: 'Doe', prenom: 'John', email: 'john@test.com', motDePasse: 'password123', age: 30 };
            
            utilisateurRepository.trouverParEmail.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');
            utilisateurRepository.sauvegarder.mockResolvedValue({ id: 1, ...user, mot_de_passe: 'hashedPassword' });

            const result = await utilisateurService.inscrireUtilisateur(user.nom, user.prenom, user.email, user.motDePasse, user.age);
            
            expect(result.id).toBe(1);
            expect(utilisateurRepository.sauvegarder).toHaveBeenCalled();
        });

        it('devrait échouer si email invalide', async () => {
            await expect(utilisateurService.inscrireUtilisateur('Doe', 'John', 'invalid-email', 'pass', 30))
                .rejects.toThrow("Format d'adresse email invalide.");
        });

        it('devrait échouer si email déjà utilisé', async () => {
            utilisateurRepository.trouverParEmail.mockResolvedValue({ id: 1 });
            await expect(utilisateurService.inscrireUtilisateur('Doe', 'John', 'test@test.com', 'pass', 30))
                .rejects.toThrow("Un utilisateur avec cet email existe déjà.");
        });
    });

    describe('authentifierUtilisateur', () => {
        it('devrait authentifier avec succès', async () => {
            utilisateurRepository.trouverParEmail.mockResolvedValue({ id: 1, email: 'test@test.com', mot_de_passe: 'hashed' });
            bcrypt.compare.mockResolvedValue(true);

            const result = await utilisateurService.authentifierUtilisateur('test@test.com', 'pass');
            expect(result.id).toBe(1);
        });

        it('devrait échouer si mauvais email', async () => {
            utilisateurRepository.trouverParEmail.mockResolvedValue(null);
            await expect(utilisateurService.authentifierUtilisateur('bad@test.com', 'pass'))
                .rejects.toThrow("Email ou mot de passe incorrect.");
        });

        it('devrait échouer si mauvais mot de passe', async () => {
            utilisateurRepository.trouverParEmail.mockResolvedValue({ id: 1, mot_de_passe: 'hashed' });
            bcrypt.compare.mockResolvedValue(false);
            await expect(utilisateurService.authentifierUtilisateur('test@test.com', 'badpass'))
                .rejects.toThrow("Email ou mot de passe incorrect.");
        });
    });

    describe('genererToken', () => {
        it('devrait générer un token JWT', () => {
            const token = utilisateurService.genererToken({ id: 1, email: 't@t.com' });
            expect(typeof token).toBe('string');
        });

        it('devrait lancer une erreur si JWT_SECRET est absent', () => {
            delete process.env.JWT_SECRET;
            expect(() => utilisateurService.genererToken({ id: 1 })).toThrow("JWT_SECRET");
        });
    });
});
