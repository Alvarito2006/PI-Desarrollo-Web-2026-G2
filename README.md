# PI - Desarrollo Web 2026 - Grupo 2

Aplicación web de prueba para **Prácticas Iniciales – Segundo Semestre 2026** de la Facultad de Ingeniería, USAC.

| Nombre | Carné |  |
| :--- | :---: | :--- |
| Álvaro Moisés Girón Morales | 202501955 | Coordinador |
| Jeremy Panameño | 202505989 | |
| Josselyn Gabriela Mendoza Camargo | 202500317 | |
| José Andrés Díaz Maldonado | 202505653 | |
| Diego Alexander Loch Cocón | 202504811 | |
| Diego Otto Eduardo Rodas Aceytuno | 202505251 | |

El sistema permite que estudiantes registrados publiquen opiniones sobre cursos y catedráticos, comenten publicaciones, busquen perfiles y administren sus cursos aprobados y créditos acumulados.

## Funciones implementadas

- Registro de usuario con registro académico, nombres, apellidos, correo y contraseña.
- Inicio de sesión.
- Recuperación de contraseña mediante registro académico + correo.
- Publicaciones ordenadas de la más reciente a la más antigua.
- Publicaciones sobre cursos o catedráticos.
- Filtros por curso, catedrático, nombre de curso y nombre de catedrático.
- Comentarios en cada publicación.
- Búsqueda de perfiles mediante registro académico.
- Edición del perfil propio sin permitir cambiar el registro académico.
- Registro y visualización de cursos aprobados.
- Cálculo de créditos acumulados.
- API REST con autenticación JWT.
- Contraseñas almacenadas con hash bcrypt.

## Tecnologías

### Frontend
- React
- Vite
- React Router
- CSS responsive

### Backend
- Node.js
- Express
- MySQL2
- JWT
- bcryptjs

### Base de datos
- MySQL 8

## Estructura

```text
PI-Desarrollo-Web-2026-G2/
├── backend/
│   ├── src/
│   │   ├── auth.js
│   │   ├── db.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

# Cómo ejecutar el proyecto

Se necesitan **Node.js 20 o superior**, **npm** y **MySQL 8**. Docker es opcional.

## 1. Clonar el repositorio

```bash
git clone https://github.com/Alvarito2006/PI-Desarrollo-Web-2026-G2.git
cd PI-Desarrollo-Web-2026-G2
```

## 2. Preparar MySQL

### Opción A: MySQL instalado en Windows

1. Abre MySQL Workbench.
2. Abre el archivo `database/schema.sql`.
3. Ejecuta todo el script.
4. El script crea la base de datos `pi_desarrollo_web`, las tablas y datos iniciales de cursos/catedráticos.

También se puede ejecutar desde terminal:

```bash
mysql -u root -p < database/schema.sql
```

### Opción B: Docker

Si tienes Docker Desktop:

```bash
docker compose up -d mysql
```

La configuración incluida crea MySQL en `localhost:3306` con:

```text
usuario: root
contraseña: root
base: pi_desarrollo_web
```

> Si ya existe el volumen de Docker y necesitas volver a ejecutar `schema.sql`, usa `docker compose down -v` y luego `docker compose up -d mysql`. Esto elimina la base de datos local del contenedor.

## 3. Configurar y levantar el backend

Entra a la carpeta:

```bash
cd backend
```

Instala dependencias:

```bash
npm install
```

Copia `.env.example` como `.env`.

### Windows CMD

```cmd
copy .env.example .env
```

### PowerShell

```powershell
Copy-Item .env.example .env
```

### Linux/macOS/Git Bash

```bash
cp .env.example .env
```

Edita `backend/.env` según tu MySQL. Ejemplo si usas MySQL local:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_DE_MYSQL
DB_NAME=pi_desarrollo_web
JWT_SECRET=grupo2-practicas-iniciales-2026-cambiar-por-clave-segura
FRONTEND_URL=http://localhost:5173
```

Si usaste el `docker-compose.yml` incluido, coloca:

```env
DB_PASSWORD=root
```

Ejecuta el servidor:

```bash
npm run dev
```

Debe aparecer algo similar a:

```text
API disponible en http://localhost:3000
MySQL conectado correctamente.
```

Puedes comprobar la conexión abriendo:

```text
http://localhost:3000/api/health
```

Debe responder `ok: true`.

## 4. Levantar el frontend

Abre **otra terminal**, desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará normalmente:

```text
http://localhost:5173
```

Abre esa dirección en el navegador.

No es obligatorio crear `frontend/.env`, porque por defecto se utiliza:

```text
http://localhost:3000/api
```

Si el backend se ejecuta en otra dirección, crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

# Primera prueba recomendada

1. Abre `http://localhost:5173`.
2. Presiona **Crear cuenta**.
3. Registra un usuario.
4. Inicia sesión.
5. Crea una publicación sobre un curso.
6. Crea otra sobre un catedrático.
7. Agrega comentarios.
8. Prueba los cuatro filtros de la pantalla inicial.
9. Ve a **Mi perfil** y modifica nombres/correo.
10. Agrega cursos aprobados y verifica el total de créditos.
11. Registra un segundo usuario para probar el buscador de perfiles.

# Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del backend y MySQL |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/reset-password` | Restablecer contraseña |
| GET | `/api/catalog/courses` | Listar cursos |
| GET | `/api/catalog/teachers` | Listar catedráticos |
| GET | `/api/posts` | Listar/filtrar publicaciones |
| POST | `/api/posts` | Crear publicación |
| GET | `/api/posts/:id/comments` | Obtener comentarios |
| POST | `/api/posts/:id/comments` | Crear comentario |
| GET | `/api/users/me` | Perfil propio |
| PUT | `/api/users/me` | Editar perfil propio |
| GET | `/api/users/:registro` | Buscar perfil |
| GET | `/api/users/:registro/courses` | Cursos aprobados del usuario |
| POST | `/api/users/me/courses` | Agregar curso aprobado |
| DELETE | `/api/users/me/courses/:courseId` | Quitar curso aprobado |

Excepto registro, login, recuperación de contraseña, catálogos y health, las funciones de usuario utilizan un token JWT.

# Datos de cursos y catedráticos

`database/schema.sql` incluye información inicial basada en el **Horario Clase de ECYS para 2026, Segundo Semestre** publicado por DTT. El equipo puede completar más cursos o ajustar créditos desde el mismo script si lo considera necesario antes de la evaluación.

Fuente de referencia del horario:
https://dtt-ecys.org/resources?r=10

# Notas de seguridad

- No subas el archivo `backend/.env` al repositorio.
- No guardes contraseñas de MySQL reales dentro del código.
- Cambia `JWT_SECRET` por una cadena larga antes de utilizar la aplicación fuera de una prueba local.
- Las contraseñas de estudiantes se almacenan con bcrypt, no en texto plano.

# Desarrollo

Repositorio del Grupo 2:
https://github.com/Alvarito2006/PI-Desarrollo-Web-2026-G2
