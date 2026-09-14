-- Migration: Add pending_access, webhook_logs tables for Lynk.id webhook integration

-- ── Pending Access (for users who haven't registered yet) ─────────────────────
CREATE TABLE IF NOT EXISTS public.pending_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  product_name TEXT,
  customer_name TEXT,
  status TEXT DEFAULT 'pending',  -- pending | fulfilled | expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  UNIQUE(email, transaction_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_pending_access_email ON public.pending_access(email);
CREATE INDEX IF NOT EXISTS idx_pending_access_status ON public.pending_access(status);

-- ── Webhook Logs (idempotency) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'lynk.id',
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received',  -- received | processed | failed | duplicate
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction ON public.webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);

-- ── Product name to product_id mapping ────────────────────────────────────────
-- This table maps Lynk.id product names to our internal product IDs
CREATE TABLE IF NOT EXISTS public.product_name_map (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lynk_product_name TEXT UNIQUE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS (service-only, webhook is server-side) ────────────────────────────────
ALTER TABLE public.pending_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_name_map ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.pending_access FROM anon, authenticated;
REVOKE ALL ON public.webhook_logs FROM anon, authenticated;
REVOKE ALL ON public.product_name_map FROM anon, authenticated;