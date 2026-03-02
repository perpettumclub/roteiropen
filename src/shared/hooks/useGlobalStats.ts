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
                // 1. Count total scripts created (Real Users)
                const { count: scriptsCount, error: scriptsError } = await supabase
                    .from('frequency_scripts')
                    .select('*', { count: 'exact', head: true });

                // 2. Count anonymous scripts created
                const { count: anonCount, error: anonError } = await supabase
                    .from('anonymous_stats')
                    .select('*', { count: 'exact', head: true });

                // 3. Count unique creators (distinct user_ids who created scripts)
                const { data: usersData, error: usersError } = await supabase
                    .from('frequency_scripts')
                    .select('user_id');

                let uniqueUsers = 0;
                if (usersData && !usersError) {
                    const uniqueUserIds = new Set(usersData.map((r: any) => r.user_id));
                    uniqueUsers = uniqueUserIds.size;
                }

                if (scriptsError) console.error('Error fetching scripts count:', scriptsError);
                if (anonError) console.error('Error fetching anonymous count:', anonError);
                if (usersError) console.error('Error fetching users count:', usersError);

                setStats({
                    totalScripts: BASE_SCRIPTS + (scriptsCount || 0) + (anonCount || 0),
                    activeCreators: BASE_CREATORS + uniqueUsers,
                    isLoading: false
                });



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
