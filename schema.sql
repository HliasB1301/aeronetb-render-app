DROP TABLE IF EXISTS audit_logs, shipments, purchase_orders, supplier_part_offerings, parts, suppliers, users, roles CASCADE;

CREATE TABLE suppliers (
  supplier_id SERIAL PRIMARY KEY,
  business_name VARCHAR(120) NOT NULL,
  address TEXT,
  accreditation_status VARCHAR(80),
  contact_email VARCHAR(120),
  contact_phone VARCHAR(40)
);

CREATE TABLE parts (
  part_id SERIAL PRIMARY KEY,
  part_name VARCHAR(120) NOT NULL,
  description TEXT,
  part_category VARCHAR(80)
);

CREATE TABLE supplier_part_offerings (
  supplier_part_id SERIAL PRIMARY KEY,
  supplier_id INT NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  part_id INT NOT NULL REFERENCES parts(part_id) ON DELETE RESTRICT,
  customisation_summary TEXT,
  active_flag BOOLEAN DEFAULT TRUE,
  UNIQUE(supplier_id, part_id)
);

CREATE TABLE purchase_orders (
  order_id SERIAL PRIMARY KEY,
  supplier_id INT NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  order_date DATE NOT NULL,
  desired_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  status VARCHAR(30) NOT NULL CHECK (status IN ('Placed','Confirmed','Dispatched','Delivered','Completed'))
);

CREATE TABLE shipments (
  shipment_id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES purchase_orders(order_id) ON DELETE RESTRICT,
  tracking_number VARCHAR(80) UNIQUE NOT NULL,
  port_of_entry VARCHAR(100),
  shipment_status VARCHAR(50)
);

CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE users (
  emp_id VARCHAR(20) PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INT NOT NULL REFERENCES roles(role_id),
  department VARCHAR(80)
);

CREATE TABLE audit_logs (
  audit_id SERIAL PRIMARY KEY,
  emp_id VARCHAR(20) REFERENCES users(emp_id),
  action_type VARCHAR(40) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  outcome VARCHAR(30) DEFAULT 'Success'
);
