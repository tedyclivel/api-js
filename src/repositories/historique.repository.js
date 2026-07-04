import { supabase } from '../utils/db.js';

export class HistoriqueRepository {
    async sauvegarder(historique) {
        const { data, error } = await supabase
            .from('historique')
            .insert([{
                compte_id: historique.compte_id,
                type_transaction: historique.type_transaction,  // aligné avec le schema SQL
                montant: historique.montant,
                autre_partie_id: historique.autre_partie_id || null
            }])
            .select()
            .single();

        if (error) throw new Error(`Erreur lors de la sauvegarde de l'historique: ${error.message}`);
        return data;
    }

    async trouverParCompteId(compteId) {
        const { data, error } = await supabase
            .from('historique')
            .select('*')
            .eq('compte_id', compteId)
            .order('date_transaction', { ascending: false }); // colonne correcte du schema

        if (error) throw new Error(`Erreur lors de la recherche de l'historique: ${error.message}`);
        return data;
    }
}

export default new HistoriqueRepository();
