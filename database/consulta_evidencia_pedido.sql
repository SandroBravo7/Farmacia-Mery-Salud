SELECT
    VERSION() AS mysql_version,
    p.codigo_orden,
    p.estado,
    p.total,
    p.tipo_entrega,
    p.created_at,
    d.producto_nombre,
    d.cantidad,
    d.precio_unitario,
    pr.stock AS stock_actual
FROM merysalud_db.pedidos AS p
JOIN merysalud_db.detalle_pedidos AS d ON d.pedido_id = p.id
JOIN merysalud_db.productos AS pr ON pr.id = d.producto_id
WHERE p.codigo_orden = 'ORD-6D2F2983-120';
