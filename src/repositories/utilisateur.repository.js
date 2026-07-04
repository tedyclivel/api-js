import { supabase } from '../utils/db.js';
import { MetierException } from '../errors/MetierException.js';

export class UtilisateurRepository {
    async trouverParEmail(email) {
        const { data, error } = await supabase
            .from('utilisateur')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            throw new Error(`Erreur lors de la recherche utilisateur: ${error.message}`);
        }
        return data;
    }

    async trouverParId(id) {
        const { data, error } = await supabase
            .from('utilisateur')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw new Error(`Erreur lors de la recherche utilisateur: ${error.message}`);
        }
        return data;
    }

    async sauvegarder(utilisateur) {
        const { data, error } = await supabase
            .from('utilisateur')
            .insert([{
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                mot_de_passe: utilisateur.mot_de_passe,
                age: utilisateur.age
            }])
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        }
        return data;
    }
}

export default new UtilisateurRepository();
