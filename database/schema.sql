-- =====================================================
-- BASE DE DATOS: MERY SALUD
-- Script de Creación de Tablas y Datos Semilla (Seed)
-- =====================================================

CREATE DATABASE IF NOT EXISTS merysalud_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE merysalud_db;

-- 1. Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (id, nombre) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_REPARTIDOR'),
(3, 'ROLE_CLIENTE')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(50) DEFAULT 'pill'
);

INSERT INTO categorias (id, nombre, slug, icono) VALUES
(1, 'Medicamentos', 'medicamentos', 'pill'),
(2, 'Cuidado Personal', 'cuidado-personal', 'sparkles'),
(3, 'Bienestar y Nutrición', 'bienestar', 'heart-pulse'),
(4, 'Mamá y Bebé', 'mama-bebe', 'baby')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- 3. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id BIGINT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Limpiar e insertar usuarios de prueba iniciales
DELETE FROM usuarios WHERE email IN ('admin@merysalud.pe', 'repartidor@merysalud.pe', 'cliente@gmail.com');

INSERT INTO usuarios (id, nombre, email, password, telefono, rol_id, activo, created_at) VALUES
(1, 'Administrador General', 'admin@merysalud.pe', 'admin123', '987111222', 1, 1, NOW()),
(2, 'Carlos Repartidor', 'repartidor@merysalud.pe', 'driver123', '987333444', 2, 1, NOW()),
(3, 'Juan Pérez', 'cliente@gmail.com', 'cliente123', '987555666', 3, 1, NOW())
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 4. Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    principio_activo VARCHAR(150),
    presentacion VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(500),
    requiere_receta BOOLEAN DEFAULT FALSE,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

INSERT INTO productos (id, categoria_id, nombre, principio_activo, presentacion, precio, stock, imagen_url, requiere_receta, destacado, activo) VALUES
(1, 1, 'Paracetamol 500mg', 'Paracetamol', 'Caja x 20 tabletas', 12.90, 45, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', FALSE, TRUE, TRUE),
(2, 1, 'Amoxicilina 500mg', 'Amoxicilina', 'Caja x 12 cápsulas', 24.50, 18, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60', TRUE, TRUE, TRUE),
(3, 3, 'Vitamina C + Zinc', 'Ácido Ascórbico + Zinc', 'Tubo x 10 efervescentes', 18.00, 30, 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=60', FALSE, TRUE, TRUE),
(4, 2, 'Alcohol en Gel 70% 500ml', 'Alcohol Etílico 70%', 'Frasco dosificador 500ml', 9.90, 60, 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=60', FALSE, FALSE, TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- 5. Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_orden VARCHAR(50) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(100) NOT NULL,
    direccion_entrega VARCHAR(255),
    tipo_entrega VARCHAR(50) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);