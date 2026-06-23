CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    tax_id VARCHAR(50) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    engine VARCHAR(100) NOT NULL,
    plate VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(50) NOT NULL,
    owner_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id UUID NOT NULL REFERENCES vehiculos(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    estimated_delivery_at TIMESTAMP,
    mileage INTEGER NOT NULL,
    fuel_level VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    images TEXT, -- Consider storing JSON array of URLs if needed, but keeping as TEXT for now or simple comma separated
    labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS tareas_orden (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    cost_per_hour DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS repuestos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    brand_compat VARCHAR(255) NOT NULL,
    car_models TEXT,
    year_compat VARCHAR(100),
    location VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS partes_usadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES repuestos(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    issue_date TIMESTAMP DEFAULT NOW(),
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    taxes DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS presupuestos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    vehicle_info TEXT NOT NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    issue_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presupuesto_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presupuesto_id UUID NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'operador', -- 'admin' u 'operador'
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuarios administradores por defecto (contraseña: admin)
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
  'Administrador',
  'admin',
  '$2b$10$R9hbyuCshZ42QG9P5y7p/OQ3Kovz/LqG0LqZ2R5M3T6h/0N2S4U3.',
  'admin'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
  'Administrador',
  'admin@taller.com',
  '$2b$10$R9hbyuCshZ42QG9P5y7p/OQ3Kovz/LqG0LqZ2R5M3T6h/0N2S4U3.',
  'admin'
) ON CONFLICT (email) DO NOTHING;
