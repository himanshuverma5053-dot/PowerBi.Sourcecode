-- ==============================================================================
-- Production-Ready PostgreSQL Schema for B2B Tyre Dealership Products Table
-- Works seamlessly with Supabase / PostgreSQL & Admin Console CRUD Operations
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'RADIAL',
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing Fields (DECIMAL with 2 decimal places)
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (mrp >= 0),
    dealer_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (dealer_price >= 0),
    bulk_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (bulk_price >= 0),
    
    -- Stock & Quantity Controls
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock_level INTEGER DEFAULT 5 CHECK (min_stock_level >= 0),
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,
    
    -- Tyre Technical Specifications
    width INTEGER DEFAULT 295,
    aspect_ratio INTEGER DEFAULT 90,
    rim_size INTEGER DEFAULT 20,
    speed_rating VARCHAR(10) DEFAULT 'K',
    load_index INTEGER DEFAULT 152,
    terrain VARCHAR(50) DEFAULT 'Regional / On-Off Road',
    warranty_years INTEGER DEFAULT 3,
    fuel_efficiency VARCHAR(10) DEFAULT 'B',
    wet_grip VARCHAR(10) DEFAULT 'A',
    noise_db INTEGER DEFAULT 71,
    hsn_code VARCHAR(20) DEFAULT '40111010',
    product_code VARCHAR(50),
    pattern VARCHAR(100) DEFAULT 'Tread Pattern',
    
    -- Media & Features
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    compatible_vehicles JSONB DEFAULT '["Commercial Truck", "Multi-Axle Trailer"]'::jsonb,
    tags JSONB DEFAULT '["Tubeless", "Heavy Duty"]'::jsonb,
    components JSONB DEFAULT '[]'::jsonb,
    
    -- Status & Flags
    status VARCHAR(50) NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Pre-Order', 'Active', 'Inactive')),
    featured BOOLEAN DEFAULT FALSE,
    ev_ready BOOLEAN DEFAULT FALSE,
    
    -- Audit Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for High-Performance Querying & Admin Filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 3. Automatic Updated_At Timestamp Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for customer catalog fetching)
CREATE POLICY "Public Read Access Products"
ON products FOR SELECT
USING (true);

-- Allow full write/CRUD access for Admin Console
CREATE POLICY "Full Admin Access Products"
ON products FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Initial Seed Data for B2B Tyre Catalog
INSERT INTO products (name, brand, category, sku, description, price, mrp, dealer_price, bulk_price, stock, image, status, featured, width, aspect_ratio, rim_size)
VALUES
('295/90 R20 ENDUTRAX MD+', 'Apollo', 'RADIAL', 'AP-29590R20-MD', 'Heavy duty steer & drive axle radial tyre built for severe mining and construction haulage.', 18500.00, 22000.00, 16800.00, 16200.00, 45, 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800', 'In Stock', true, 295, 90, 20),
('ENDURACE LD', 'Apollo', 'RADIAL', 'AP-ENDURACE-LD', 'Long distance highway drive tyre with low rolling resistance and ultra-high mileage tread design.', 19200.00, 23500.00, 17500.00, 17000.00, 30, 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800', 'In Stock', true, 295, 80, 22),
('Amar Gold', 'JK Tyre', 'NON RADIAL', 'JK-AMAR-GOLD-1020', 'Heavy commercial bias ply tyre designed for extreme overloads and rough regional roads.', 13800.00, 16500.00, 12200.00, 11800.00, 60, 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800', 'In Stock', false, 1000, 20, 20),
('Abhimanyu', 'CEAT', 'NON RADIAL', 'CE-ABHIMANYU-1020', 'Reinforced nylon cross-ply commercial tyre with cut-resistant compound.', 14200.00, 17000.00, 12800.00, 12400.00, 25, 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800', 'In Stock', false, 1000, 20, 20)
ON CONFLICT (sku) DO UPDATE SET
    stock = EXCLUDED.stock,
    price = EXCLUDED.price,
    updated_at = NOW();
