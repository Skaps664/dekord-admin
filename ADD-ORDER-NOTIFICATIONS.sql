-- Add customer_confirmed field to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_confirmed BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS confirmation_query TEXT;

-- Create notification logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'email' or 'whatsapp'
  channel TEXT NOT NULL, -- 'placed', 'processing', 'shipped', 'delivered'
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
  message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id ON public.notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Anyone can view notification logs"
  ON public.notification_logs FOR SELECT
  USING (true);

-- Allow insert
CREATE POLICY "Anyone can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (true);
