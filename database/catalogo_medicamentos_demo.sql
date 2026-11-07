-- Datos para el catálogo local. Precios y existencias de demostración.
-- Ejecutar con MySQL después de crear el esquema. Conserva los productos existentes.
-- Fotos de envase y fichas de referencia:
-- Allegra 120 mg: https://inkafarma.pe/producto/allegra-120-mg-tabletas-recubiertas/134166
-- Digestase 80 mg: https://inkafarma.pe/producto/digestase-80-mg-tableta-masticable/012136
-- Mucosolvan 30 mg/5 mL: https://inkafarma.pe/producto/mucosolvan-30mg-5ml-jarabe-adulto/423691
-- Gravicoll 50 mg: https://inkafarma.pe/producto/gravicoll-50-mg-comprimido/420679
-- Terbinafina Portugal 1%: https://inkafarma.pe/producto/Terbinafina-1%25-Crema/018529
-- Ibuprofeno Genfar 800 mg: https://inkafarma.pe/producto/ibuprofeno-800mg-tableta-recubierta-genfar/230420

USE merysalud_db;
SET NAMES utf8mb4;

INSERT INTO productos (
    categoria_id, nombre, principio_activo, presentacion, precio, stock,
    imagen_url, requiere_receta, destacado, activo
)
SELECT categoria.id, nuevo.nombre, nuevo.principio_activo, nuevo.presentacion,
       nuevo.precio, nuevo.stock, nuevo.imagen_url, nuevo.requiere_receta, nuevo.destacado, TRUE
FROM (
    SELECT 'Allegra 120 mg' AS nombre, 'Fexofenadina clorhidrato' AS principio_activo, 'Caja × 10 tabletas recubiertas' AS presentacion, 39.9 AS precio, 18 AS stock, 'assets/img/products/allegra-120mg.jpg' AS imagen_url, FALSE AS requiere_receta, TRUE AS destacado
    UNION ALL SELECT 'Digestase 80 mg', 'Simeticona', 'Caja × 120 tabletas masticables', 79.9, 8, 'assets/img/products/digestase-80mg.jpg', FALSE, FALSE
    UNION ALL SELECT 'Mucosolvan 30 mg/5 mL', 'Ambroxol clorhidrato', 'Jarabe para adultos × 120 mL', 24.9, 14, 'assets/img/products/mucosolvan-30mg-5ml.jpg', FALSE, TRUE
    UNION ALL SELECT 'Gravicoll 50 mg', 'Dimenhidrinato', 'Caja × 100 tabletas', 89.9, 6, 'assets/img/products/gravicoll-50mg.jpg', TRUE, FALSE
    UNION ALL SELECT 'Terbinafina Portugal 1%', 'Terbinafina clorhidrato', 'Tubo de crema × 20 g', 5.9, 20, 'assets/img/products/terbinafina-portugal-1pct.jpg', TRUE, FALSE
    UNION ALL SELECT 'Ibuprofeno Genfar 800 mg', 'Ibuprofeno', 'Caja × 50 tabletas recubiertas', 49.9, 10, 'assets/img/products/ibuprofeno-genfar-800mg.jpg', TRUE, FALSE
) AS nuevo
JOIN categorias AS categoria ON categoria.slug = 'medicamentos'
WHERE NOT EXISTS (
    SELECT 1 FROM productos AS existente
    WHERE existente.nombre = nuevo.nombre AND existente.presentacion = nuevo.presentacion
);
