# Farmacia Mery Salud - Sistema Web E-Commerce & Gestión Farmacéutica

Plataforma web integral para la farmacia comunitaria **Mery Salud**, diseñada para facilitar el acceso rápido a medicamentos, gestión de pedidos con delivery, carga de recetas y administración centralizada de inventario y personal.

---

## Estructura del Proyecto

El repositorio está organizado bajo una arquitectura cliente-servidor desacoplada:

```text
MerySalud/
├── backend/                  # API REST construida con Spring Boot & Maven
│   ├── src/main/java/com/merysalud/
│   │   ├── controller/       # AuthController, ProductoController, UsuarioController
│   │   ├── entity/           # Producto, Usuario
│   │   ├── repository/       # ProductoRepository, UsuarioRepository
│   │   └── MerysaludBackendApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── mvnw.cmd / mvnw
│   └── pom.xml
│
├── frontend/                 # Aplicación Web (HTML5, CSS3, JavaScript nativo)
│   ├── assets/
│   │   ├── css/              # styles.css, admin.css, auth.css
│   │   └── js/               # main.js, catalogo.js, admin.js, auth.js
│   ├── index.html            # Landing page y productos destacados
│   ├── catalogo.html         # Catálogo interactivo con filtros y búsqueda
│   ├── auth.html             # Login y Registro con conmutación dinámica
│   ├── admin.html            # Panel administrativo (Productos, Pedidos, Usuarios)
│   └── repartidor.html       # Módulo para repartidores
│
├── README.md
└── .gitignore
```

---

## Características Implementadas

### Catálogo & E-Commerce:
* Vista principal con productos destacados y catálogo completo independiente (`catalogo.html`).
* Filtrado dinámico por categoría, precio máximo y medicamentos con receta.
* Búsqueda reactiva por nombre o principio activo.
* Carrito de compras persistente (`localStorage`) y simulación de checkout con entrega a domicilio o recojo en tienda.

### Autenticación & Control de Acceso:
* Login centralizado con redirección condicional por roles (`ADMIN`, `REPARTIDOR`, `CLIENTE`).
* Auto-registro de clientes directamente hacia MySQL con inicio de sesión inmediato.
* Menú de usuario en Navbar con avatar, datos del perfil y cierre de sesión.

### Panel de Administración (`admin.html`):
* Gestión de productos: listado, creación con métricas de stock y control de recetas.
* Gestión de usuarios y personal: listado en tiempo real y registro manual de repartidores/admins.
* Persistencia de navegación por hash (`#products`, `#orders`, `#users`) sin parpadeos de carga.

---

## Tecnologías Utilizadas

* **Backend:** Java 17+, Spring Boot 3.x, Spring Data JPA, Hibernate, Maven.
* **Base de Datos:** MySQL 8.x (`merysalud_db`).
* **Frontend:** HTML5 semántico, CSS3 (Variables, Grid, Flexbox), Vanilla JavaScript (ES6+), Lucide Icons.

---

## Guía de Trabajo Colaborativo (Para el Equipo de Desarrollo)

Para mantener la rama `main` siempre estable y funcional, **queda prohibido realizar commits directos sobre `main`**. Todo el equipo debe seguir este flujo:

### 1. Clonar el repositorio por primera vez
```bash
git clone <URL_DEL_REPOSITORIO>
cd MerySalud
```

### 2. Crear una rama de trabajo individual
Cada integrante debe crear una rama con la nomenclatura `feature/nombre-tarea` o `desarrollador/NombreApellido`:
```bash
git checkout main
git pull origin main
git checkout -b desarrollador/TuNombre
```

### 3. Flujo diario de trabajo y subida de cambios
```bash
# Guardar cambios locales
git add .
git commit -m "feat: descripcion clara del avance realizado"

# Subir tu rama a GitHub
git push origin desarrollador/TuNombre
```

### 4. Mantener tu rama actualizada con `main`
Antes de integrar cambios, trae lo último que otros compañeros hayan subido a `main`:
```bash
git checkout main
git pull origin main
git checkout desarrollador/TuNombre
git merge main
```

---

## Configuración y Ejecución Local

### 1. Base de Datos (MySQL)

Asegúrate de tener creado el esquema `merysalud_db` en MySQL y ajusta las credenciales en `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/merysalud_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 2. Iniciar Backend

Abre una terminal en la carpeta `backend`:

```bash
cd backend
./mvnw spring-boot:run
```
*(En Windows CMD: `mvnw.cmd spring-boot:run`)*

El servidor iniciará en: `http://localhost:8080`

### 3. Iniciar Frontend

Abre la carpeta `frontend/` mediante la extensión **Live Server** en VS Code o ejecutando cualquier servidor local en los puertos `5500` / `3000`.

---

## Credenciales de Prueba

| Rol | Correo Electrónico | Contraseña | Redirección Inicial |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@merysalud.pe` | `admin123` | `admin.html` |
| **Repartidor** | `repartidor@merysalud.pe` | `driver123` | `repartidor.html` |
| **Cliente** | `cliente@gmail.com` | `cliente123` | `index.html` |