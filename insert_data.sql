INSERT INTO suppliers (business_name, address, accreditation_status, contact_email, contact_phone) VALUES
('AeroForge Components', 'Bristol, UK', 'ISO 9001, AS9100', 'contact@aeroforge.test', '+44 111 222'),
('CompositeWing Ltd', 'Toulouse, France', 'AS9100', 'sales@compositewing.test', '+33 111 222'),
('SkyPanel Systems', 'Hamburg, Germany', 'ISO 9001', 'info@skypanel.test', '+49 111 222');

INSERT INTO parts (part_name, description, part_category) VALUES
('A320 Fuselage Panel', 'Baseline fuselage panel with aerospace tolerance requirements', 'Fuselage'),
('Wing Rib Assembly', 'Structural wing component for commercial aircraft', 'Wing'),
('Engine Mount Bracket', 'High-strength engine support bracket', 'Engine');

INSERT INTO supplier_part_offerings (supplier_id, part_id, customisation_summary) VALUES
(1, 1, 'Anti-corrosion coating and RFID lifecycle tags'),
(2, 1, 'Reinforced composite layering and shock sensor packaging'),
(3, 2, 'Optimised heat treatment and digital twin data supplied');

INSERT INTO purchase_orders (supplier_id, order_date, desired_delivery_date, actual_delivery_date, status) VALUES
(1, '2026-04-10', '2026-05-10', NULL, 'Dispatched'),
(2, '2026-04-12', '2026-05-15', '2026-05-14', 'Delivered'),
(3, '2026-04-20', '2026-06-01', NULL, 'Confirmed');

INSERT INTO shipments (order_id, tracking_number, port_of_entry, shipment_status) VALUES
(1, 'TRK-AERO-1001', 'London Gateway', 'In Transit'),
(2, 'TRK-COMP-1002', 'Dover', 'Delivered'),
(3, 'TRK-SKYP-1003', 'Hamburg Port', 'Awaiting Dispatch');

INSERT INTO roles (role_name) VALUES
('Procurement Officer'), ('Quality Inspector'), ('Supply Chain Manager'), ('Equipment Engineer'), ('Auditor');

-- Password for all users is: password123
INSERT INTO users (emp_id, full_name, email, password_hash, role_id, department) VALUES
('EMP001', 'Procurement User', 'procurement@test.com', '$2a$10$hK/o3RxPRzK8RwYy.WKXb.7yDMEz0cFN9f4FoQvlEjV8Zq8stsn6u', 1, 'Procurement'),
('EMP002', 'Quality User', 'quality@test.com', '$2a$10$hK/o3RxPRzK8RwYy.WKXb.7yDMEz0cFN9f4FoQvlEjV8Zq8stsn6u', 2, 'Quality'),
('EMP003', 'Manager User', 'manager@test.com', '$2a$10$hK/o3RxPRzK8RwYy.WKXb.7yDMEz0cFN9f4FoQvlEjV8Zq8stsn6u', 3, 'Supply Chain'),
('EMP004', 'Engineer User', 'engineer@test.com', '$2a$10$hK/o3RxPRzK8RwYy.WKXb.7yDMEz0cFN9f4FoQvlEjV8Zq8stsn6u', 4, 'Engineering'),
('EMP005', 'Auditor User', 'auditor@test.com', '$2a$10$hK/o3RxPRzK8RwYy.WKXb.7yDMEz0cFN9f4FoQvlEjV8Zq8stsn6u', 5, 'Compliance');
