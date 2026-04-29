-- Contact / feedback: public can submit; no public reads (privacy)
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  subject text NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_created_at ON public.feedback (created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon and authenticated can insert feedback"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.feedback IS 'User feedback and contact form submissions; RLS: insert-only for public roles.';
