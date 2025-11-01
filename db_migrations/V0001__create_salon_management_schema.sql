-- Таблица Клиенты
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    birth_date DATE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    allergies TEXT,
    registration_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица Сотрудники
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(100),
    specialization VARCHAR(255),
    hire_date DATE,
    salary DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Активен'
);

-- Таблица Услуги
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER,
    base_price DECIMAL(10, 2)
);

-- Таблица Товары
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50),
    purchase_price DECIMAL(10, 2),
    expiry_date DATE,
    min_stock INTEGER DEFAULT 1,
    current_stock DECIMAL(10, 2) DEFAULT 0
);

-- Таблица Поставщики
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    delivery_conditions TEXT
);

-- Таблица Запись (на услуги)
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    employee_id INTEGER REFERENCES employees(id),
    service_id INTEGER REFERENCES services(id),
    appointment_datetime TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Запланирована',
    notes TEXT
);

-- Таблица Чек (оплата)
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    sale_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Оплачен'
);

-- Таблица Расход материалов
CREATE TABLE IF NOT EXISTS material_consumption (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    product_id INTEGER REFERENCES products(id),
    quantity_used DECIMAL(10, 2) NOT NULL,
    consumption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица Поступление товара
CREATE TABLE IF NOT EXISTS product_arrivals (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    product_id INTEGER REFERENCES products(id),
    quantity DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2),
    arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица Строка чека
CREATE TABLE IF NOT EXISTS receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES receipts(id),
    product_id INTEGER REFERENCES products(id),
    quantity DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * price) STORED
);

-- Вставка начальных данных
INSERT INTO products (id, name, description, price, unit, purchase_price, min_stock, current_stock) VALUES
(2, 'Машинки', 'Инструмент для стрижек', 560, 'шт', 450, 5, 10),
(6, 'Маска', 'Для роста волос', 900, 'шт', 700, 1, 10),
(3, 'Шампунь', 'После стрижек', 700, 'шт', 500, 1, 40),
(5, 'Крем после бритья', 'Успокаивающий', 450, 'шт', 300, 2, 7),
(1, 'Перчатки', 'Для мастеров', 10, 'уп', 5, 10, 11)
ON CONFLICT (id) DO NOTHING;