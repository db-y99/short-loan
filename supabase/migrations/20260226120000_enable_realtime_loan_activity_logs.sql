-- Enable Realtime for loan_activity_logs table
-- This allows clients to subscribe to INSERT/UPDATE/DELETE events

ALTER PUBLICATION supabase_realtime ADD TABLE loan_activity_logs;
