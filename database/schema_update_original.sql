-- Actualización aditiva para la base existente merysalud_db.
-- No elimina ni vacía tablas. Las tablas existentes se conservan por CREATE TABLE IF NOT EXISTS.
-- Roles/categorías existentes no se actualizan; productos con IDs ya existentes se omiten.
-- Realiza primero una copia de seguridad desde MySQL Workbench.

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

INSERT IGNORE INTO roles (id, nombre) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_REPARTIDOR'),
(3, 'ROLE_CLIENTE')
;

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(50) DEFAULT 'pill'
);

INSERT IGNORE INTO categorias (id, nombre, slug, icono) VALUES
(1, 'Medicamentos', 'medicamentos', 'pill'),
(2, 'Cuidado Personal', 'cuidado-personal', 'sparkles'),
(3, 'Bienestar y Nutrición', 'bienestar', 'heart-pulse'),
(4, 'Mamá y Bebé', 'mama-bebe', 'baby')
;

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

-- Los usuarios de prueba se crean solo al ejecutar el perfil local con
-- MERY_SEED_DEMO=true y contraseñas recibidas por variables de entorno.

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

INSERT IGNORE INTO productos (id, categoria_id, nombre, principio_activo, presentacion, precio, stock, imagen_url, requiere_receta, destacado, activo) VALUES
(1, 1, 'Paracetamol 500 mg', 'Paracetamol', 'Caja × 20 tabletas', 12.90, 24, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80', FALSE, TRUE, TRUE),
(2, 1, 'Ibuprofeno 400 mg', 'Ibuprofeno', 'Caja × 30 tabletas', 18.50, 15, 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, TRUE),
(3, 3, 'Vitamina C 1000 mg', 'Ácido ascórbico', 'Tubo × 20 tabletas', 24.90, 18, 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80', FALSE, TRUE, TRUE),
(4, 1, 'Omeprazol 20 mg', 'Omeprazol', 'Caja × 30 cápsulas', 15.90, 4, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=80', TRUE, TRUE, TRUE),
(5, 2, 'Alcohol medicinal 70°', 'Alcohol etílico', 'Frasco × 250 ml', 8.50, 30, 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(6, 2, 'Gasas estériles', 'Material de curación', 'Paquete × 10 unidades', 6.00, 12, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(7, 2, 'Protector solar SPF 50', 'Cuidado de la piel', 'Tubo × 50 ml', 49.90, 0, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(8, 3, 'Multivitamínico', 'Vitaminas y minerales', 'Frasco × 30 tabletas', 35.00, 10, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1001, 2, 'Termómetro digital', 'Accesorio de medición', 'Unidad con estuche', 19.90, 16, 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1002, 2, 'Mascarillas descartables', 'Protección personal', 'Caja × 50 unidades', 15.00, 40, 'https://images.unsplash.com/photo-1586942593568-29361efcd571?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1003, 2, 'Vendas elásticas', 'Material de curación', 'Venda de 10 cm × 5 m', 9.50, 25, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1004, 2, 'Algodón hidrófilo', 'Material de curación', 'Bolsa × 100 g', 7.90, 32, 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1005, 2, 'Apósitos adhesivos', 'Material de curación', 'Caja × 20 unidades', 6.90, 35, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1006, 2, 'Gel antibacterial', 'Higiene de manos', 'Frasco × 250 ml', 10.90, 28, 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1007, 2, 'Jabón líquido neutro', 'Higiene personal', 'Frasco × 400 ml', 14.90, 22, 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1008, 2, 'Cepillo dental suave', 'Higiene bucal', 'Unidad', 8.90, 30, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1009, 2, 'Pasta dental', 'Higiene bucal', 'Tubo × 90 g', 11.90, 24, 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1010, 2, 'Pañales para adulto talla M', 'Cuidado del adulto', 'Paquete × 10 unidades', 32.90, 14, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1011, 3, 'Bebida nutricional de vainilla', 'Complemento nutricional', 'Botella × 237 ml', 12.50, 20, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE),
(1012, 3, 'Barra de avena y frutos secos', 'Alimento envasado', 'Caja × 6 barras', 18.90, 18, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80', FALSE, FALSE, TRUE)
;

-- 5. Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_orden VARCHAR(50) NOT NULL UNIQUE,
    usuario_id BIGINT NULL,
    repartidor_id BIGINT NULL,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(100) NOT NULL,
    direccion_entrega VARCHAR(255),
    referencia VARCHAR(255),
    tipo_entrega VARCHAR(50) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    receta_estado VARCHAR(30) DEFAULT 'NO_REQUIERE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (repartidor_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    producto_nombre VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
