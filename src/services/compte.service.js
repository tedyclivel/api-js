import compteRepository from '../repositories/compte.repository.js';
import historiqueRepository from '../repositories/historique.repository.js';
import { MetierException } from '../errors/MetierException.js';

export class CompteService {
    /**
     * Crée un compte pour un utilisateur avec un solde initial optionnel.
     */
    async creerCompte(utilisateurId, typeCompte, soldeInitial = 0) {
        const type = (typeCompte || 'COURANT').toUpperCase();
        
        const compte = await compteRepository.sauvegarder({
            utilisateur_id: utilisateurId,
            type_compte: type,
            solde: 0.0
        });

        // Si un solde initial est fourni, on effectue un dépôt
        if (soldeInitial && soldeInitial > 0) {
            return await this.crediterCompte(compte.id, soldeInitial, utilisateurId);
        }

        return compte;
    }

    async listerComptes(utilisateurId) {
        return await compteRepository.trouverParUtilisateurId(utilisateurId);
    }

    async consulterCompte(id, utilisateurId) {
        const compte = await compteRepository.trouverParId(id);
        if (!compte) {
            throw new MetierException(`Compte non trouvé avec l'id : ${id}`, 404);
        }
        if (compte.utilisateur_id !== utilisateurId) {
            throw new MetierException("Accès refusé. Ce compte ne vous appartient pas.", 403);
        }
        return compte;
    }

    async crediterCompte(id, montant, utilisateurId) {
        if (!montant || montant <= 0) {
            throw new MetierException("Le montant doit être strictement positif.");
        }
        
        const compte = await this.consulterCompte(id, utilisateurId);
        const nouveauSolde = parseFloat(compte.solde) + parseFloat(montant);
        
        const compteMaj = await compteRepository.mettreAJourSolde(id, nouveauSolde);
        
        // Enregistrement dans l'historique — champ "type_transaction" aligné avec la DB
        await historiqueRepository.sauvegarder({
            compte_id: id,
            type_transaction: 'DEPOT',
            montant: montant
        });

        return compteMaj;
    }

    async debiterCompte(id, montant, utilisateurId) {
        if (!montant || montant <= 0) {
            throw new MetierException("Le montant doit être strictement positif.");
        }
        
        const compte = await this.consulterCompte(id, utilisateurId);
        if (parseFloat(compte.solde) < parseFloat(montant)) {
            throw new MetierException("Solde insuffisant.");
        }

        const nouveauSolde = parseFloat(compte.solde) - parseFloat(montant);
        const compteMaj = await compteRepository.mettreAJourSolde(id, nouveauSolde);

        await historiqueRepository.sauvegarder({
            compte_id: id,
            type_transaction: 'RETRAIT',
            montant: montant
        });

        return compteMaj;
    }

    async virer(sourceId, destinationId, montant, utilisateurId) {
        const srcId = parseInt(sourceId);
        const destId = parseInt(destinationId);

        if (srcId === destId) {
            throw new MetierException("Le compte source et le compte de destination doivent être différents.");
        }
        if (!montant || montant <= 0) {
            throw new MetierException("Le montant doit être strictement positif.");
        }

        // Vérification du compte source (appartenance + solde)
        const compteSource = await this.consulterCompte(srcId, utilisateurId);
        
        if (parseFloat(compteSource.solde) < parseFloat(montant)) {
            throw new MetierException("Solde insuffisant.");
        }

        // Vérification du compte destination (existence uniquement)
        const compteDestination = await compteRepository.trouverParId(destId);
        if (!compteDestination) {
            throw new MetierException(`Compte de destination non trouvé avec l'id : ${destId}`, 404);
        }

        // Exécution du virement
        const nouveauSoldeSource = parseFloat(compteSource.solde) - parseFloat(montant);
        const nouveauSoldeDest = parseFloat(compteDestination.solde) + parseFloat(montant);

        await compteRepository.mettreAJourSolde(srcId, nouveauSoldeSource);
        await compteRepository.mettreAJourSolde(destId, nouveauSoldeDest);

        // Historique pour le compte source
        await historiqueRepository.sauvegarder({
            compte_id: srcId,
            type_transaction: 'VIREMENT',
            montant: montant,
            autre_partie_id: destId
        });

        // Historique pour le compte destination
        await historiqueRepository.sauvegarder({
            compte_id: destId,
            type_transaction: 'VIREMENT',
            montant: montant,
            autre_partie_id: srcId
        });
    }

    async obtenirHistorique(id, utilisateurId) {
        // Valide que le compte appartient bien à l'utilisateur
        await this.consulterCompte(id, utilisateurId);
        return await historiqueRepository.trouverParCompteId(id);
    }
}

export default new CompteService();
