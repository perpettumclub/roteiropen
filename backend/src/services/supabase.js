import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Supabase credentials not set. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
