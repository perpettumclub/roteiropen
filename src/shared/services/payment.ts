import { createClient } from '@supabase/supabase-js';

// Initialize a client specifically for invoking functions
// We can use the main client if it's exported, but for safety in this isolated file:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CheckoutResponse {
    id: string;
    init_point: string;
    sandbox_init_point: string;
}

export const initiateCheckout = async (userEmail?: string): Promise<CheckoutResponse> => {
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { userEmail }
        });

        if (error) throw error;
        return data as CheckoutResponse;

    } catch (error) {
        console.error('Checkout initiation failed:', error);
        throw error;
    }
};
