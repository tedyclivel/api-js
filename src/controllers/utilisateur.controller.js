import utilisateurService from '../services/utilisateur.service.js';
import compteService from '../services/compte.service.js';

export const register = async (req, res, next) => {
    try {
        const { nom, prenom, email, motDePasse, age, soldeInitial } = req.body;
        
        // Inscription de l'utilisateur
        const user = await utilisateurService.inscrireUtilisateur(nom, prenom, email, motDePasse, age);
        
        // Création du compte courant
        const compte = await compteService.creerCompte(user.id, 'courant');

        if (soldeInitial && soldeInitial > 0) {
            // Le dépôt initial est fait par l'utilisateur lui-même (user.id pour valider)
            await compteService.crediterCompte(compte.id, soldeInitial, user.id);
        }

        res.status(201).json({ 
            message: "Utilisateur créé avec succès", 
            utilisateurId: user.id 
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, motDePasse } = req.body;
        
        const user = await utilisateurService.authentifierUtilisateur(email, motDePasse);
        const token = utilisateurService.genererToken(user);
        
        res.json({ token });
    } catch (err) {
        next(err);
    }
};
