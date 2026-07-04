import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// S'assurer que les variables d'environnement sont chargées
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Utiliser la Service Role Key pour bypasser RLS côté serveur backend

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  Les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY ne sont pas définies !");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
