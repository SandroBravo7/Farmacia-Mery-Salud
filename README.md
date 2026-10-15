# Farmacia Mery Salud

Aplicación local para catálogo, registro de clientes, pedidos sin receta, inventario, usuarios y reparto. El frontend usa HTML, CSS y JavaScript; el backend usa Java 21, Spring Boot 4, Spring Security y JPA. La base de datos prevista es MySQL 8. Este repositorio contiene código, esquema y documentación para reproducir el entorno en otra computadora.

## Estado real

En modo conectado se pueden registrar clientes, iniciar sesión con BCrypt/JWT, consultar y filtrar el catálogo, crear pedidos sin receta con descuento transaccional de stock, consultar pedidos propios, administrarlos y asignar entregas a repartidores. El servidor protege las rutas por rol. Hay pruebas automatizadas del flujo de API.

El modo `?demo=1` usa datos ficticios en el navegador y sirve para explorar pantallas. **No es evidencia de persistencia real.** En modo conectado siguen pendientes la carga/revisión de recetas, el pago, el pedido como invitado, el CRUD de categorías y algunas operaciones de perfil/dirección. Los productos con receta se bloquean al confirmar un pedido real hasta implementar su validación. La interfaz conserva WhatsApp como enlace de contacto; abrirlo no equivale a un pedido ni a un pago. Datos de contacto y dirección mostrados por la plantilla deben confirmarse con la farmacia.

## Estructura

- `backend/`: API REST, seguridad, entidades, repositorios, servicios y pruebas Maven.
- `frontend/`: páginas, estilos, scripts y comprobaciones de JavaScript.
- `database/schema.sql`: esquema y catálogo inicial para una **base nueva** de MySQL.
- `docs/`: informe del capítulo V, matriz corregida y evidencias de pruebas.

## Requisitos

- VS Code u otro editor, JDK 21 y MySQL 8 para el entorno previsto.
- Un servidor HTTP estático para `frontend/` (por ejemplo Live Server de VS Code o Python 3).
- Maven se ejecuta con el wrapper `backend/mvnw` o `backend/mvnw.cmd`.

## Instalación con MySQL

1. Clona la rama de trabajo: `git clone -b desarrollador/GDvega https://github.com/SandroBravo7/Farmacia-Mery-Salud.git`.
2. En una base de desarrollo **nueva**, ejecuta `database/schema.sql` desde DBeaver, MySQL Workbench o la consola MySQL. En Ubuntu con autenticación local de administrador: `sudo mysql < database/schema.sql`. El script inserta el catálogo solo cuando no existe cada ID; no reinicializa su stock. Si ya tienes datos de una versión anterior, haz una copia de seguridad y revisa la migración antes de usar el esquema.
3. Crea un usuario MySQL con permisos sobre `merysalud_db`. Configura las variables de entorno `MERY_DB_USER`, `MERY_DB_PASSWORD`, `MERY_JWT_SECRET` (mínimo 32 caracteres aleatorios) y, si cambiaste host o puerto, `MERY_DB_URL`. No pongas contraseñas en Git.
4. Para crear cuentas locales de administrador y repartidor en la primera ejecución, configura también `MERY_SEED_DEMO=true`, `MERY_ADMIN_PASSWORD` y `MERY_DRIVER_PASSWORD` (mínimo 8 caracteres). Los correos son `admin@demo.local` y `repartidor@demo.local`. Cambia estas claves en un entorno compartido. Un cliente se registra desde `auth.html`.
5. Desde `backend/`, ejecuta `./mvnw spring-boot:run` en Linux/macOS o `mvnw.cmd spring-boot:run` en Windows. La API escucha en `http://localhost:8080`.
6. Sirve `frontend/` en `http://localhost:3000` o `http://localhost:5500`. Por ejemplo: `python3 -m http.server 3000 --directory frontend`. Abre `http://localhost:3000/auth.html`. Los orígenes permitidos se configuran en `MERY_FRONTEND_ORIGINS` si usas otro puerto.

Las variables se definen con `export NOMBRE=valor` en Bash o `$env:NOMBRE='valor'` en PowerShell. Abre una terminal nueva si las configuraste desde el sistema operativo. El avance se revisó en Ubuntu 26.04.1 LTS.

### Preparación rápida en Ubuntu

Si MySQL ya está instalado y tienes permisos `sudo`, desde la raíz del repositorio ejecuta `sudo bash scripts/setup-local-ubuntu.sh`. El script instala OpenJDK 21, crea el esquema y un usuario MySQL limitado a `merysalud_db`, y guarda claves generadas en `.env` con permisos privados. Si Java 21 ya está instalado, añade `--skip-java` para omitir la descarga. `.env` está ignorado por Git. Para iniciar el backend en otra terminal, ejecuta `cd backend`, `set -a; source ../.env; set +a` y `./mvnw spring-boot:run`. Para consultar la base desde DBeaver usa el usuario y la contraseña guardados en `.env`, host `localhost` y puerto `3306`. El script está pensado para una base de desarrollo local nueva; no sustituye la revisión de migraciones de una base con datos previos.

### Entorno local de prueba sin MySQL

Para comprobar la aplicación antes de configurar MySQL, se puede ejecutar el perfil `demo` con H2 en memoria: define `MERY_JWT_SECRET`, `MERY_ADMIN_PASSWORD` y `MERY_DRIVER_PASSWORD`, y desde `backend/` ejecuta `./mvnw spring-boot:run -Dspring-boot.run.profiles=demo`. Este perfil crea un catálogo pequeño y se borra al detener el proceso. Es distinto del modo `?demo=1` del navegador: el perfil H2 sí ejecuta la API y las reglas del backend, mientras que `?demo=1` usa almacenamiento del navegador.

## Pruebas

Desde `backend/`: `./mvnw test` (usa H2 en memoria). Desde la raíz: `node frontend/tests/check.cjs`. La matriz en `docs/` distingue las pruebas automatizadas en H2, las capturas de interfaz y las verificaciones de API y SQL con MySQL local. El resultado de la prueba real de pedido, descuento de stock y persistencia tras reiniciar se conserva en `docs/evidencias/verificacion_mysql.json`.

Con el backend local en ejecución y MySQL configurado, ejecuta `python3 scripts/medir-catalogo.py` para repetir 30 solicitudes secuenciales a `GET /api/productos`. El script muestra el mínimo, la mediana, el percentil 95 y el máximo, junto con el tamaño del catálogo. El resultado de la ejecución documentada está en `docs/evidencias/medicion_catalogo_mysql.json`; la medición es local y no representa una prueba de carga concurrente.

## Git

El trabajo de este avance está en `desarrollador/GDvega`. Mantén cambios en commits descriptivos y revisa `git status` antes de subir. No se incluyen credenciales, directorios `target/` ni archivos `.env`.
