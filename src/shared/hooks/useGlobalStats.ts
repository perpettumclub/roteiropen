import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Base offsets - numbers start from here and grow as real users join
const BASE_SCRIPTS = 487;
const BASE_CREATORS = 56;

interface GlobalStats {
    totalScripts: number;
    activeCreators: number;
    isLoading: boolean;
}

/**
 * Hook that fetches real-time global stats from Supabase
 * and adds a base offset so numbers don't start from zero.
 * 
 * - totalScripts = BASE_SCRIPTS + real scripts count from frequency_scripts
 * - activeCreators = BASE_CREATORS + real unique users from profiles
 */
export const useGlobalStats = (): GlobalStats => {
    const [stats, setStats] = useState<GlobalStats>({
        totalScripts: BASE_SCRIPTS,
        activeCreators: BASE_CREATORS,
        isLoading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Call the secure RPC function to get global totals
                // This bypasses RLS for counting purposes only
                const { data, error } = await supabase.rpc('get_global_script_stats');

                if (error) {
                    console.error('Error fetching global stats via RPC:', error);
                    throw error;
                }

                if (data) {
                    setStats({
                        totalScripts: BASE_SCRIPTS + (data.total_scripts || 0),
                        activeCreators: BASE_CREATORS + (data.total_creators || 0),
                        isLoading: false
                    });
                }



            } catch (error) {
                console.error('Error fetching global stats:', error);
                // Fallback to base numbers
                setStats({
                    totalScripts: BASE_SCRIPTS,
                    activeCreators: BASE_CREATORS,
                    isLoading: false
                });
            }
        };

        fetchStats();
    }, []);

    return stats;
};
