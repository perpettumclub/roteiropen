
export const GOAL_TIERS = [
    1000,
    5000,
    10000,
    25000,
    50000,
    100000,
    150000,
    200000,
    500000,
    1000000
];

export const getNextTier = (currentFollowers: number): number => {
    // Find the first tier that is strictly greater than current followers
    const nextTier = GOAL_TIERS.find(tier => tier > currentFollowers);

    // If user exceeds all tiers (e.g. > 1M), just add 500k as a fallback
    return nextTier || currentFollowers + 500000;
};
