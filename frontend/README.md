# Frontend de Farmacia Mery Salud

Sirve esta carpeta por HTTP en el puerto 3000 o 5500, con el backend local en `http://localhost:8080`. Consulta la guía de instalación y el alcance real en el [README principal](../README.md).

El parámetro `?demo=1` activa una exploración ficticia con datos de `localStorage`. Sin ese parámetro, el catálogo, la autenticación, los pedidos y las operaciones administrativas compatibles usan la API. Las categorías, los archivos de receta y el pago aún no están conectados; el servidor bloquea pedidos reales con productos que requieren receta. La prueba estática del frontend es `node frontend/tests/check.cjs` desde la raíz.
