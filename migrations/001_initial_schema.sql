-- ============================================
-- POS SYSTEM DATABASE SCHEMA FOR SUPABASE
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================
-- 1. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. PRODUCTS TABLE
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(12, 2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. TRANSACTIONS TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
  amount_paid DECIMAL(12, 2) NOT NULL,
  change_amount DECIMAL(12, 2) DEFAULT 0,
  cashier_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. TRANSACTION ITEMS TABLE
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(200) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL
);
-- 5. STOCK ALERTS TABLE (logs for low stock)
CREATE TABLE stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(200) NOT NULL,
  current_stock INTEGER NOT NULL,
  min_stock INTEGER NOT NULL,
  alert_type VARCHAR(20) DEFAULT 'low_stock',
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
-- 6. INDEXES FOR BETTER PERFORMANCE
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_min_stock ON products(min_stock);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_stock_alerts_unresolved ON stock_alerts(is_resolved);
-- 7. FUNCTION TO AUTO-GENERATE INVOICE NUMBER
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(COALESCE(
    (SELECT COUNT(*) FROM transactions WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%') + 1, 1) AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_invoice_number
BEFORE INSERT ON transactions
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
EXECUTE FUNCTION generate_invoice_number();
-- 8. FUNCTION TO UPDATE STOCK & CREATE ALERTS AFTER TRANSACTION (FIXED)
CREATE OR REPLACE FUNCTION update_stock_after_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_product RECORD;
BEGIN
  FOR v_product IN
    SELECT product_id, quantity FROM transaction_items WHERE transaction_id = NEW.id
  LOOP
    UPDATE products SET stock = stock - v_product.quantity WHERE id = v_product.product_id;
    IF EXISTS (
      SELECT 1 FROM products WHERE id = v_product.product_id AND stock <= min_stock
    ) THEN
      INSERT INTO stock_alerts (product_id, product_name, current_stock, min_stock, alert_type)
      SELECT id, name, stock, min_stock, 'low_stock' FROM products WHERE id = v_product.product_id;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_stock
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_transaction();
-- 9. FUNCTION TO UPDATE updated_at TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 10. RLS (ROW LEVEL SECURITY) POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transaction_items" ON transaction_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock_alerts" ON stock_alerts FOR ALL USING (true) WITH CHECK (true);
-- 11. SEED DATA - SAMPLE CATEGORIES
INSERT INTO categories (name, description) VALUES
  ('Minuman', 'Berbagai jenis minuman'),
  ('Makanan', 'Berbagai jenis makanan'),
  ('Snack', 'Camilan dan snack'),
  ('Elektronik', 'Produk elektronik'),
  ('Kecantikan', 'Produk perawatan dan kecantikan'),
  ('Kebutuhan Rumah Tangga', 'Perlengkapan rumah tangga');
-- 12. SEED DATA - SAMPLE PRODUCTS
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Kopi Susu', 'KPS001', id, 15000, 8000, 50, 10 FROM categories WHERE name = 'Minuman' LIMIT 1;
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Teh Botol', 'TBT001', id, 8000, 4000, 100, 15 FROM categories WHERE name = 'Minuman' LIMIT 1;
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Air Mineral', 'AMN001', id, 5000, 2000, 200, 20 FROM categories WHERE name = 'Minuman' LIMIT 1;
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Nasi Goreng', 'NGR001', id, 20000, 10000, 30, 5 FROM categories WHERE name = 'Makanan' LIMIT 1;
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Mie Instan', 'MIS001', id, 5000, 2500, 8, 15 FROM categories WHERE name = 'Makanan' LIMIT 1;
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Roti Bakar', 'RBK001', id, 12000, 6000, 25, 8 FROM categories WHERE name = 'Makanan' LIMIT 1;
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Keripik Singkong', 'KRS001', id, 10000, 5000, 45, 10 FROM categories WHERE name = 'Snack' LIMIT 1;
INSERT INTO products (name, sku, category_id, price, cost_price, stock, min_stock) 
SELECT 'Coklat Batang', 'CKB001', id, 15000, 8000, 60, 10 FROM categories WHERE name = 'Snack' LIMIT 1;
-- 13. VIEW - LOW STOCK PRODUCTS
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.stock,
  p.min_stock,
  c.name AS category_name,
  CASE 
    WHEN p.stock = 0 THEN 'habis'
    WHEN p.stock <= p.min_stock / 2 THEN 'kritis'
    ELSE 'menipis'
  END AS alert_level
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.min_stock AND p.is_active = true
ORDER BY p.stock ASC;