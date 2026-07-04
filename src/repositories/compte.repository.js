import { supabase } from '../utils/db.js';

export class CompteRepository {
    async sauvegarder(compte) {
        const { data, error } = await supabase
            .from('compte')
            .insert([{
                utilisateur_id: compte.utilisateur_id,
                type_compte: compte.type_compte,
                solde: compte.solde || 0.0
            }])
            .select()
            .single();

        if (error) throw new Error(`Erreur lors de la création du compte: ${error.message}`);
        return data;
    }

    async trouverParId(id) {
        const { data, error } = await supabase
            .from('compte')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw new Error(`Erreur de recherche du compte: ${error.message}`);
        return data;
    }

    async trouverParUtilisateurId(utilisateurId) {
        const { data, error } = await supabase
            .from('compte')
            .select('*')
            .eq('utilisateur_id', utilisateurId);

        if (error) throw new Error(`Erreur de recherche des comptes: ${error.message}`);
        return data;
    }

    async mettreAJourSolde(id, nouveauSolde) {
        const { data, error } = await supabase
            .from('compte')
            .update({ solde: nouveauSolde })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Erreur lors de la mise à jour du solde: ${error.message}`);
        return data;
    }
}

export default new CompteRepository();
