-- Enable pg_cron extension (requires Supabase project setting support)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Create the cron job
-- Runs every Monday at 9:00 AM UTC (adjust as needed)
select
  cron.schedule(
    'weekly-growth-reminder',
    '0 9 * * 1', 
    $$
    select
      net.http_post(
          url:='https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-growth-reminders',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_SERVICE_ROLE_KEY>"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
  );

-- Note: You need to replace <YOUR_PROJECT_REF> and <YOUR_SERVICE_ROLE_KEY> with actual values.
-- Or better, use vault.secrets if available, but for now hardcoded in the deployment step is common or env vars.
-- Since this is a migration file running in migrations... hardcoding secrets is bad.
-- STRATEGY: We will creating the cron job via Dashboard SQL Editor usually, BUT I will provide the script template.
-- Better approach for automated deployment: Use a secure wrapper function or just notify the user to setup the cron via Dashboard "Edge Functions" triggers if available, but pg_cron is the standard SQL way.

-- Let's stick to enabling the extension for now.
