import compteService from '../services/compte.service.js';

export const getMesComptes = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const comptes = await compteService.listerComptes(userId);
        res.json(comptes);
    } catch (err) {
        next(err);
    }
};

export const createCompte = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { typeCompte } = req.body;
        
        const compte = await compteService.creerCompte(userId, typeCompte || 'epargne');
        res.status(201).json(compte);
    } catch (err) {
        next(err);
    }
};

export const getCompte = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const compteId = parseInt(req.params.id);
        
        const compte = await compteService.consulterCompte(compteId, userId);
        res.json(compte);
    } catch (err) {
        next(err);
    }
};

export const getHistorique = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const compteId = parseInt(req.params.id);
        
        const historique = await compteService.obtenirHistorique(compteId, userId);
        res.json(historique);
    } catch (err) {
        next(err);
    }
};

export const depot = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const compteId = parseInt(req.params.id);
        const { montant } = req.body;
        
        const compte = await compteService.crediterCompte(compteId, montant, userId);
        res.json(compte);
    } catch (err) {
        next(err);
    }
};

export const retrait = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const compteId = parseInt(req.params.id);
        const { montant } = req.body;
        
        const compte = await compteService.debiterCompte(compteId, montant, userId);
        res.json(compte);
    } catch (err) {
        next(err);
    }
};

export const virement = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const compteSourceId = parseInt(req.params.id);
        const { compteDestinationId, montant } = req.body;
        
        await compteService.virer(compteSourceId, compteDestinationId, montant, userId);
        res.json({ message: "Virement effectué avec succès" });
    } catch (err) {
        next(err);
    }
};
