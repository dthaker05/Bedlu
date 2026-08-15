-- ============================================================================
-- Navratri Event Management Platform - PostgreSQL Database Schema
-- Optimized for Supabase / Railway / Render (Free Tier)
-- ============================================================================

-- 1. Digital Passes & QR Tokens Table
CREATE TABLE IF NOT EXISTS public.digital_passes (
  pass_id VARCHAR(100) PRIMARY KEY,
  reg_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(150) NOT NULL,
  user_phone VARCHAR(20),
  pass_type VARCHAR(50) NOT NULL,
  tier_title VARCHAR(100) NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'UNUSED', -- 'UNUSED' or 'USED'
  scan_timestamp TIMESTAMPTZ,
  gate_id VARCHAR(50),
  gate_operator VARCHAR(100),
  security_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payments Table (Razorpay HMAC Signature Records)
CREATE TABLE IF NOT EXISTS public.payments (
  id VARCHAR(50) PRIMARY KEY,
  reg_id VARCHAR(50) NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  payment_id VARCHAR(100) NOT NULL,
  signature TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  actor VARCHAR(100) NOT NULL,
  details TEXT,
  severity VARCHAR(20) DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
  ip_address VARCHAR(45),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for Fast Gate QR Validation (< 5ms response)
CREATE INDEX IF NOT EXISTS idx_passes_qr_token ON public.digital_passes(qr_token);
CREATE INDEX IF NOT EXISTS idx_passes_status ON public.digital_passes(status);

-- Enable Supabase Row Level Security Policies
ALTER TABLE public.digital_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write" ON public.digital_passes FOR ALL USING (true);
CREATE POLICY "Allow public read and write" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow public read and write" ON public.audit_logs FOR ALL USING (true);
