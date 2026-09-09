# Frontend · Farmacia Mery Salud

Implementación HTML, CSS y JavaScript nativo basada en **AVANCE 1. INTEGRADOR II.docx**, apartados 2.3 (alcance), 4.4 (UX), anexo 8 (RF01–RF15) y anexo 11 (mockups).

## Ejecutar

Desde la raíz del repositorio:

```sh
python3 -m http.server 5500 --directory frontend
```

- Tienda: http://localhost:5500/
- Prototipo completo: http://localhost:5500/index.html?demo=1
- Perfiles de prueba: http://localhost:5500/auth.html?demo=1

La franja superior identifica la demostración. En acceso, los botones Cliente, Administrador y Repartidor permiten recorrer los tres perfiles sin contraseñas. Los datos ficticios se conservan en este navegador; no se realizan compras, cobros ni solicitudes a la API. Para recorrer una compra como cliente, entra primero con ese perfil y utiliza su correo en el checkout. Los pedidos de invitado también aparecen en su historial local.

## Recorrido de validación

1. Entrar como cliente, buscar un producto y agregarlo. Verificar el límite de stock, las cantidades y la eliminación.
2. Continuar al checkout. Comparar delivery (+ S/ 5) con recojo (gratis). Adjuntar JPG, PNG o PDF hasta 5 MB si el producto requiere receta.
3. Confirmar y consultar el pedido en **Mis pedidos**. Mientras está pendiente, actualizar su dirección.
4. Entrar como administrador. En **Pedidos**, revisar y aprobar/rechazar la receta. Asignar un repartidor, o preparar el recojo. La cancelación repone las unidades en la demostración.
5. Entrar como repartidor. Iniciar ruta y confirmar entrega. Volver al historial del cliente y comprobar el estado.
6. Probar inventario (alta, edición, eliminación), categorías (alta, edición, eliminación sin productos asociados) y usuarios (registro, edición y estado).

## Alcance de integración

| Función | Interfaz / demostración | API existente |
| --- | --- | --- |
| Registro e inicio de sesión | Formularios y perfiles ficticios | `/api/auth/login`, `/api/auth/register` |
| Catálogo e inventario | Búsqueda, filtros, stock y CRUD | GET/POST `/api/productos`; eliminación pendiente |
| Usuarios | Alta, edición, activación y roles | GET/POST `/api/usuarios`; edición y estado pendientes |
| Categorías | Gestión y filtros sincronizados | Sin endpoint en el repositorio |
| Carrito y checkout | Persistencia, totales, entrega y receta | Confirmación completa pendiente |
| Pedidos y recetas | Historial, dirección, revisión y cancelación | La API guarda cabeceras, pero no detalle ni archivos |
| Entregas | Asignación, ruta y confirmación | Sin contrato de entregas en el repositorio |

El modo conectado consume las operaciones disponibles. Las acciones sin soporte muestran su limitación y conservan el carrito; no se presentan confirmaciones ficticias como compras reales. No se consulta el listado global de pedidos desde el historial del cliente, porque la API no ofrece una consulta privada por usuario.

El control de rutas por rol es navegación de frontend, no una barrera de seguridad: la autorización, las transacciones de stock, los archivos privados y la protección de credenciales deben implementarse en el servidor antes de producción. El backend y la base de datos no se modificaron.

En demo, las recetas se guardan localmente para poder revisarlas desde el administrador. Usar únicamente archivos ficticios; el límite depende del almacenamiento disponible del navegador. WhatsApp abre un resumen explícitamente marcado como demostración y requiere que el usuario lo envíe. Los datos de contacto existentes de la plantilla necesitan confirmación de la farmacia antes de publicar.

## Comprobaciones

```sh
node frontend/tests/check.cjs
```

Comprueba totales en céntimos, formatos/tamaño de recetas, escape de texto, lectura de almacenamiento, separación de demo/API, ausencia de contraseñas en demo y referencias HTML. Sin instalar dependencias.

Diseño: identidad azul sanitario y verde, controles con foco visible, diálogos nativos con confinamiento de foco y Escape, etiquetas de campos, estados vacíos/de error, reducción de movimiento y adaptación desde 320 px. No se añade una pasarela de pagos ni se piden datos de tarjeta, conforme al alcance del documento.
