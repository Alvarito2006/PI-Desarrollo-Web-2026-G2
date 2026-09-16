# Tareas restantes del equipo

El desarrollo base de la aplicación está en el repositorio. Las cinco personas restantes pueden dividir los entregables y la preparación de la evaluación de esta forma.

## Integrante 2 — Manual de Usuario, parte 1

Documentar con capturas:

1. Portada e introducción.
2. Requisitos para usar la aplicación.
3. Registro de usuario.
4. Inicio de sesión.
5. Recuperación de contraseña.
6. Pantalla principal.
7. Cerrar sesión.

Debe explicar cada paso y mostrar mensajes de éxito/error importantes.

## Integrante 3 — Manual de Usuario, parte 2

Documentar con capturas:

1. Listado de publicaciones.
2. Filtros por curso y catedrático.
3. Búsqueda por nombre de curso/catedrático.
4. Creación de publicaciones.
5. Comentarios.
6. Búsqueda de perfiles.
7. Edición del perfil propio.
8. Cursos aprobados.
9. Créditos acumulados.

Al finalizar, Integrantes 2 y 3 consolidan un único Manual de Usuario.

## Integrante 4 — Manual Técnico, backend/API

Documentar:

1. Node.js y Express.
2. Arquitectura cliente-servidor.
3. Organización de `backend/`.
4. Archivo `server.js`.
5. Autenticación JWT y bcrypt.
6. Tabla de endpoints (puede partir de la tabla del README).
7. Ejemplos de request/response.
8. Manejo de errores.

## Integrante 5 — Manual Técnico, base de datos/instalación

Documentar:

1. MySQL.
2. Diagrama entidad-relación.
3. Tablas: users, courses, teachers, posts, comments, user_courses.
4. Llaves primarias y foráneas.
5. Relaciones entre tablas.
6. Instalación del proyecto desde cero.
7. Configuración de `.env`.
8. Ejecución de frontend y backend.

Integrantes 4 y 5 consolidan un único Manual Técnico.

## Integrante 6 — Pruebas y preparación de evaluación

Debe ejecutar y registrar evidencia de estas pruebas:

- Registro exitoso.
- Registro duplicado rechazado.
- Login exitoso.
- Login con contraseña incorrecta.
- Recuperación de contraseña.
- Creación de publicación de curso.
- Creación de publicación de catedrático.
- Orden de publicaciones.
- Cada uno de los cuatro filtros.
- Agregar comentario.
- Buscar perfil existente.
- Buscar perfil inexistente.
- Editar perfil propio.
- Confirmar que el registro académico no se edita.
- Agregar curso aprobado.
- Eliminar curso aprobado.
- Verificar créditos acumulados.

También prepara preguntas para que todos puedan explicar React, Node.js, REST API, MySQL, JWT, bcrypt, rutas, endpoints, llaves foráneas y flujo frontend-backend.

## Commits sugeridos

Cada integrante debe subir su trabajo al repositorio usando su propia cuenta de GitHub. Ejemplos:

```text
docs: agregar primera parte del manual de usuario
docs: documentar publicaciones y perfiles
docs: documentar endpoints del backend
docs: agregar modelo de base de datos e instalacion
test: agregar evidencias y checklist de pruebas
```

No se recomienda que una persona haga los commits por los demás. Cada integrante debe poder explicar lo que agregó.
