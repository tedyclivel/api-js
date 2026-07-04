import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import utilisateurRepository from '../repositories/utilisateur.repository.js';
import { MetierException } from '../errors/MetierException.js';

export class UtilisateurService {
    async inscrireUtilisateur(nom, prenom, email, motDePasse, age) {
        // Validation email
        if (!email || !email.match(/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
            throw new MetierException("Format d'adresse email invalide.");
        }

        // Vérifier si l'utilisateur existe déjà
        const existant = await utilisateurRepository.trouverParEmail(email);
        if (existant) {
            throw new MetierException("Un utilisateur avec cet email existe déjà.");
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashMdp = await bcrypt.hash(motDePasse, salt);

        // Sauvegarder
        return await utilisateurRepository.sauvegarder({
            nom,
            prenom,
            email,
            mot_de_passe: hashMdp,
            age
        });
    }

    async authentifierUtilisateur(email, motDePasse) {
        const user = await utilisateurRepository.trouverParEmail(email);
        if (!user) {
            throw new MetierException("Email ou mot de passe incorrect.", 401);
        }

        const isMatch = await bcrypt.compare(motDePasse, user.mot_de_passe);
        if (!isMatch) {
            throw new MetierException("Email ou mot de passe incorrect.", 401);
        }

        return user;
    }

    genererToken(utilisateur) {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET n'est pas défini");

        return jwt.sign(
            { id: utilisateur.id, email: utilisateur.email },
            secret,
            { expiresIn: '24h' }
        );
    }
}

export default new UtilisateurService();
