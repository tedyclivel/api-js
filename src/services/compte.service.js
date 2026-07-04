import compteRepository from '../repositories/compte.repository.js';
import historiqueRepository from '../repositories/historique.repository.js';
import { MetierException } from '../errors/MetierException.js';

export class CompteService {
    async creerCompte(utilisateurId, typeCompte) {
        return await compteRepository.sauvegarder({
            utilisateur_id: utilisateurId,
            type_compte: typeCompte,
            solde: 0.0
        });
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
        if (montant <= 0) {
            throw new MetierException("Le montant doit être strictement positif.");
        }
        
        const compte = await this.consulterCompte(id, utilisateurId);
        const nouveauSolde = parseFloat(compte.solde) + parseFloat(montant);
        
        const compteMaj = await compteRepository.mettreAJourSolde(id, nouveauSolde);
        
        await historiqueRepository.sauvegarder({
            compte_id: id,
            type: 'DEPOT',
            montant: montant
        });

        return compteMaj;
    }

    async debiterCompte(id, montant, utilisateurId) {
        if (montant <= 0) {
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
            type: 'RETRAIT',
            montant: montant
        });

        return compteMaj;
    }

    async virer(sourceId, destinationId, montant, utilisateurId) {
        if (sourceId === destinationId) {
            throw new MetierException("Le compte source et le compte de destination doivent être différents.");
        }
        if (montant <= 0) {
            throw new MetierException("Le montant doit être strictement positif.");
        }

        // Vérification du compte source
        const compteSource = await this.consulterCompte(sourceId, utilisateurId);
        
        if (parseFloat(compteSource.solde) < parseFloat(montant)) {
            throw new MetierException("Solde insuffisant.");
        }

        // Vérification du compte destination
        const compteDestination = await compteRepository.trouverParId(destinationId);
        if (!compteDestination) {
            throw new MetierException(`Compte de destination non trouvé avec l'id : ${destinationId}`, 404);
        }

        // Exécution du virement (sans transaction forte pour l'instant via Supabase JS de base)
        const nouveauSoldeSource = parseFloat(compteSource.solde) - parseFloat(montant);
        const nouveauSoldeDest = parseFloat(compteDestination.solde) + parseFloat(montant);

        await compteRepository.mettreAJourSolde(sourceId, nouveauSoldeSource);
        await compteRepository.mettreAJourSolde(destinationId, nouveauSoldeDest);

        await historiqueRepository.sauvegarder({
            compte_id: sourceId,
            type: 'VIREMENT_ENVOYE',
            montant: montant,
            autre_partie_id: destinationId
        });

        await historiqueRepository.sauvegarder({
            compte_id: destinationId,
            type: 'VIREMENT_RECU',
            montant: montant,
            autre_partie_id: sourceId
        });
    }

    async obtenirHistorique(id, utilisateurId) {
        // Valide que le compte appartient bien à l'utilisateur
        await this.consulterCompte(id, utilisateurId);
        return await historiqueRepository.trouverParCompteId(id);
    }
}

export default new CompteService();
