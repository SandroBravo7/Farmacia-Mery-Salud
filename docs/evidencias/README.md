# Procedencia de las capturas del capítulo V

Las imágenes `01` a `05` se tomaron el 03/10/2026 con Chromium en el equipo local, usando el frontend en `localhost:3000` y la API Spring Boot en `localhost:8080`. El backend ejecutaba el perfil `demo`, que utiliza H2 en memoria. Se registró un cliente ficticio y un pedido de prueba sin receta para mostrar el mismo código en el panel administrador y en el historial del cliente. Al detener el backend, esos datos de prueba se eliminan.

La imagen `06` muestra la rama pública `desarrollador/GDvega` en GitHub y el commit `700ead3`. Las imágenes `07` y `08` son diagramas elaborados a partir de `database/schema.sql` y de la configuración del proyecto; no son capturas de MySQL. Ninguna de las capturas `01` a `06` fue generada con IA.

Las figuras `09` y `10` son resúmenes gráficos elaborados con datos de pruebas reales; no se presentan como capturas de una interfaz. La figura `09` utiliza `verificacion_mysql.json`: MySQL 8.4 local, 20 productos en la API, un pedido de prueba, stock de 24 a 23 unidades y persistencia comprobada después de reiniciar Spring Boot. La figura `10` utiliza el resultado de JUnit (4 pruebas correctas), la comprobación del frontend y `medicion_catalogo_mysql.json` (30 solicitudes al catálogo de 20 productos; mediana de 3,81 ms y máximo de 6,44 ms en este equipo). Las mediciones de rendimiento describen solo este entorno local y no predicen tiempos con usuarios concurrentes o despliegue remoto.

Las capturas `01` a `05` siguen correspondiendo al perfil H2. La comprobación posterior con MySQL se hizo mediante API y SQL, por lo que no debe interpretarse que esas pantallas fueron fotografiadas contra MySQL.
