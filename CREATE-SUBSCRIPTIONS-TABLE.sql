-- Create email_subscriptions table
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'website', -- 'website', 'footer', 'blog', etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON public.email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_is_active ON public.email_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_created_at ON public.email_subscriptions(created_at DESC);

-- Enable RLS
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
  ON public.email_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read subscriptions (for unsubscribe links)
CREATE POLICY "Anyone can read subscriptions"
  ON public.email_subscriptions
  FOR SELECT
  USING (true);

-- Policy: Anyone can update their own subscription (for unsubscribe)
CREATE POLICY "Anyone can update subscriptions"
  ON public.email_subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.email_subscriptions TO anon, authenticated;

COMMENT ON TABLE public.email_subscriptions IS 'Email subscription list for newsletters and promotions';
COMMENT ON COLUMN public.email_subscriptions.source IS 'Where the subscription came from (website, footer, blog, etc.)';
COMMENT ON COLUMN public.email_subscriptions.is_active IS 'Whether the subscription is currently active';
