-- supabase/schema.sql

-- 1. Table `utilisateur`
CREATE TABLE public.utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table `compte`
CREATE TABLE public.compte (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES public.utilisateur(id) ON DELETE CASCADE,
    type_compte VARCHAR(50) NOT NULL,
    solde DECIMAL(15, 2) NOT NULL DEFAULT 0.0,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table `historique`
CREATE TABLE public.historique (
    id SERIAL PRIMARY KEY,
    compte_id INT NOT NULL REFERENCES public.compte(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'DEPOT', 'RETRAIT', 'VIREMENT_ENVOYE', 'VIREMENT_RECU'
    montant DECIMAL(15, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    autre_partie_id INT -- Peut être NULL (si dépôt ou retrait), référence un autre compte si virement
);

-- Sécurité Row Level Security (RLS) désactivée pour ce cas simple, car le backend gère la sécurité.
-- Mais vous pouvez l'activer si besoin plus tard.
