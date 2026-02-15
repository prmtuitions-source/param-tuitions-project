-- Create notification_jobs, notification_logs, templates and enqueue helper
-- Idempotent: safe to run multiple times

CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  attempts integer DEFAULT 0 NOT NULL,
  scheduled_at timestamptz DEFAULT now() NOT NULL,
  template_key text,
  recipient_type text,
  recipient_id uuid,
  recipient_phone text,
  tuition_id uuid,
  application_id uuid,
  event_ref text,
  payload jsonb,
  dedup_key text
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_scheduled ON public.notification_jobs (status, scheduled_at);

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  tuition_id uuid,
  application_id uuid,
  event_ref text,
  recipient_type text,
  recipient_id uuid,
  recipient_phone text,
  template_key text,
  payload jsonb,
  dedup_key text,
  sent_at timestamptz,
  delivery_status text,
  provider_response jsonb
);

CREATE TABLE IF NOT EXISTS public.notification_templates (
  template_key text PRIMARY KEY,
  title text,
  recipient_type text,
  body text,
  created_at timestamptz DEFAULT now()
);

/* Helper RPC: enqueue a notification job and return the job id */
CREATE OR REPLACE FUNCTION public.enqueue_notification_job(
  p_event_ref text,
  p_tuition_id uuid,
  p_application_id uuid,
  p_recipient_type text,
  p_recipient_id uuid,
  p_payload jsonb,
  p_template_key text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  jid uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.notification_jobs(
    id, tuition_id, application_id, event_ref, recipient_type, recipient_id, payload, template_key, status, created_at, scheduled_at
  ) VALUES (
    jid, p_tuition_id, p_application_id, p_event_ref, p_recipient_type, p_recipient_id, COALESCE(p_payload, '{}'::jsonb), p_template_key, 'pending', now(), now()
  );

  RETURN jid;
END;
$$;

-- End migration
