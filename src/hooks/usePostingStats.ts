import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { POSTING_GOAL_DAYS } from '../shared/constants';

// Helper: convert a UTC timestamp to Brasilia date string (YYYY-MM-DD)
const toBrasiliaDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
};

// Helper: get today's date in Brasilia timezone
const getTodayBrasilia = (): string => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
};

export interface PostingStats {
    postingStreak: number;
    totalPostingDays: number;
    daysToGoal60: number;
    postsThisWeek: number;
    postingDaysThisWeek: number;
    postingLog: { [date: string]: number };
    refreshStats: () => Promise<void>;
}

export const usePostingStats = (): PostingStats => {
    const [postingStreak, setPostingStreak] = useState(0);
    const [totalPostingDays, setTotalPostingDays] = useState(0);
    const [daysToGoal60, setDaysToGoal60] = useState(60);
    const [postsThisWeek, setPostsThisWeek] = useState(0);
    const [postingDaysThisWeek, setPostingDaysThisWeek] = useState(0);
    const [postingLog, setPostingLog] = useState<{ [date: string]: number }>({});

    const fetchPostingStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: postings } = await supabase
                .from('frequency_scripts')
                .select('posted_at')
                .eq('user_id', user.id)
                .not('posted_at', 'is', null)
                .order('posted_at', { ascending: false });

            if (!postings || postings.length === 0) {
                setPostingStreak(0);
                setTotalPostingDays(0);
                setDaysToGoal60(60);
                setPostsThisWeek(0);
                setPostingDaysThisWeek(0);
                setPostingLog({});
                return;
            }

            const allBrasiliaDates: string[] = postings.map((p: any) => toBrasiliaDate(p.posted_at)); // any: posting row not typed
            const uniqueDates = new Set(allBrasiliaDates);

            // 1. POSTING LOG (for heatmap)
            const log: { [date: string]: number } = {};
            allBrasiliaDates.forEach((dateStr: string) => {
                log[dateStr] = (log[dateStr] || 0) + 1;
            });
            setPostingLog(log);

            // 2. STREAK (consecutive days with at least 1 post)
            const todayStr = getTodayBrasilia();
            let streak = 0;
            let checkDate = new Date(todayStr + 'T12:00:00');

            if (!uniqueDates.has(todayStr)) {
                checkDate.setDate(checkDate.getDate() - 1);
            }

            while (true) {
                const dateStr = checkDate.toLocaleDateString('en-CA');
                if (uniqueDates.has(dateStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            setPostingStreak(streak);

            // 3. TOTAL POSTING DAYS + GOAL 60
            const totalUniqueDays = uniqueDates.size;
            setTotalPostingDays(totalUniqueDays);
            setDaysToGoal60(Math.max(POSTING_GOAL_DAYS - totalUniqueDays, 0));

            // 4. POSTING DAYS THIS WEEK (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            const sevenDaysAgoStr = sevenDaysAgo.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

            let daysThisWeek = 0;
            uniqueDates.forEach(dateStr => {
                if (dateStr >= sevenDaysAgoStr && dateStr <= todayStr) {
                    daysThisWeek++;
                }
            });
            setPostingDaysThisWeek(daysThisWeek);
            setPostsThisWeek(postings.length);

        } catch (error) {
            console.error('Error fetching posting stats:', error);
        }
    };

    useEffect(() => {
        fetchPostingStats();
    }, []);

    return {
        postingStreak,
        totalPostingDays,
        daysToGoal60,
        postsThisWeek,
        postingDaysThisWeek,
        postingLog,
        refreshStats: fetchPostingStats,
    };
};
