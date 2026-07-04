-- supabase/schema.sql
-- Script de création des tables pour l'application TEMA

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
    type_compte VARCHAR(50) NOT NULL CHECK (type_compte IN ('COURANT', 'EPARGNE')),
    solde DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table `historique`
CREATE TABLE public.historique (
    id SERIAL PRIMARY KEY,
    compte_id INT NOT NULL REFERENCES public.compte(id) ON DELETE CASCADE,
    type_transaction VARCHAR(50) NOT NULL CHECK (type_transaction IN ('DEPOT', 'RETRAIT', 'VIREMENT')),
    montant DECIMAL(15, 2) NOT NULL,
    date_transaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    autre_partie_id INT REFERENCES public.compte(id) ON DELETE SET NULL -- NULL si dépôt ou retrait
);

-- Note: La sécurité Row Level Security (RLS) est désactivée car le backend
-- gère lui-même les autorisations via le middleware JWT.
