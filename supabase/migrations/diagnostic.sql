-- DIAGNOSTIC: Run this in Supabase SQL Editor to see the actual data
-- Copy the ENTIRE output and send it to me

SELECT 
    id,
    posted_at,
    (posted_at AT TIME ZONE 'America/Sao_Paulo')::date as brasilia_date,
    posted_at::text as raw_timestamp
FROM frequency_scripts 
WHERE posted_at IS NOT NULL
ORDER BY posted_at DESC;
