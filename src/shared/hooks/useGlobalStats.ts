import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface GlobalStats {
    totalScripts: number;
    activeCreators: number;
    isLoading: boolean;
}

export const useGlobalStats = (): GlobalStats => {
    const [stats, setStats] = useState<GlobalStats>({
        totalScripts: 0,
        activeCreators: 0,
        isLoading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data, error } = await supabase.rpc('get_global_script_stats');

                if (error) {
                    console.error('Error fetching global stats:', error);
                    throw error;
                }

                if (data) {
                    setStats({
                        totalScripts: data.total_scripts || 0,
                        activeCreators: data.total_creators || 0,
                        isLoading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching global stats:', error);
                setStats({ totalScripts: 0, activeCreators: 0, isLoading: false });
            }
        };

        fetchStats();
    }, []);

    return stats;
};
