# Procedencia de las capturas del capítulo V

Las imágenes `01` a `05` se tomaron el 03/10/2026 con Chromium en el equipo local, usando el frontend en `localhost:3000` y la API Spring Boot en `localhost:8080`. El backend ejecutaba el perfil `demo`, que utiliza H2 en memoria. Se registró un cliente ficticio y un pedido de prueba sin receta para mostrar el mismo código en el panel administrador y en el historial del cliente. Al detener el backend, esos datos de prueba se eliminan.

La imagen `06` muestra la rama pública `desarrollador/GDvega` en GitHub y el commit `700ead3`. Las imágenes `07` y `08` son diagramas elaborados a partir de `database/schema.sql` y de la configuración del proyecto; no son capturas de MySQL ni pruebas de ejecución. Ninguna captura fue generada con IA. Las capturas anteriores no prueban todavía el funcionamiento con MySQL; esa verificación debe hacerse con la base local configurada.
