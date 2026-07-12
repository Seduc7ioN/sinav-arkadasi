-- Cemil Torna - Shop Status & Service Requests
-- Add this to your Supabase SQL editor

-- ============================================
-- SHOP STATUS
-- ============================================
CREATE TABLE shop_status (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_open BOOLEAN NOT NULL DEFAULT true,
  message TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO shop_status (id, is_open, message) VALUES (1, true, '')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE shop_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shop status" ON shop_status
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update shop status" ON shop_status
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert shop status" ON shop_status
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- SERVICE REQUESTS
-- ============================================
CREATE TYPE request_status AS ENUM ('pending', 'contacted', 'completed', 'cancelled');

CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  vehicle_brand TEXT DEFAULT '',
  vehicle_model TEXT DEFAULT '',
  vehicle_year TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at DESC);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create service request" ON service_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read service requests" ON service_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update service requests" ON service_requests
  FOR UPDATE USING (auth.role() = 'authenticated');
