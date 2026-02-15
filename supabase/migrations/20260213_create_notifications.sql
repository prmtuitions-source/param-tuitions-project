-- Create notifications table to store in-app alerts for admins and superadmins
-- Run this in Supabase SQL editor or include it as a migration.

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  recipient_role text,
  recipient_id uuid,
  title text,
  message text,
  payload jsonb,
  is_read boolean DEFAULT false
);

-- Index for fast lookups by role and unread
CREATE INDEX IF NOT EXISTS idx_notifications_role_unread ON public.notifications (recipient_role, is_read) WHERE (is_read = false);
