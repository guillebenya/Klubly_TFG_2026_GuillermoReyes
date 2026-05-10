Guía de Configuración y Despliegue - Klubly

Este repositorio contiene el ecosistema completo de **Klubly** (Frontend, Backend y Base de Datos) automatizado mediante contenedores para facilitar su despliegue y evaluación:

## Requisitos

- Docker Desktop instalado y en ejecución
- Puerto 80 (Frontend), 8080 (Backend API), 5432 (PostgreSQL) y 8888 (Adminer) libres en el sistema

## Obtención del proyecto

- Opción 1: Descarga directa (ZIP) desde https://github.com/guillebenya/Klubly_TFG_2026_GuillermoReyes.git

1.  Haz clic en el botón verde 'Code' de GitHub y selecciona 'Download ZIP'.
2.  Extrae el contenido y abre una terminal dentro de la carpeta raíz del proyecto.

- Opción 2: Clonado mediante Git
  Ejecuta el siguiente comando en tu terminal:
  git clone https://github.com/guillebenya/Klubly_TFG_2026_GuillermoReyes.git
  Luego, accede a la carpeta: cd Klubly_TFG_2026_GuillermoReyes

## Configuración de variables de entorno

Por seguridad, las credenciales no están incluidas en el código fuente. Es obligatorio configurar el archivo de entorno antes de arrancar:

Localiza el archivo env.template en la raíz del proyecto.

Renombra o copia el archivo como .env (el nombre tiene que ser exactamente ese).

Edita el archivo .env y sustituye los valores entre corchetes por los tuyos:

DB_USER / DB_PASSWORD / DB_NAME: Credenciales para la base de datos (necesarias para el Backend y Adminer).

JWT_SECRET: Una cadena de texto larga y aleatoria. Se usa para firmar los tokens de sesión de forma segura.

APP_DEFAULT_PASSWORD: Contraseña genérica para los usuarios que se cargan automáticamente en la base de datos al inicio.

## Cómo ejecutar (en la raíz del proyecto (donde está el archivo docker-compose.yml))

- 1ª vez (Compilación total): 'docker-compose up --build'
- 2ª vez y sucesivas: 'docker-compose up' (para ver los logs en tiempo real) o 'docker-compose up -d' para no verla y que todo se ejecute en segundo plano. Si has usado la opción en segundo plano pero decides que quieres ver los logs puedes usar 'docker-compose logs -f'

## Accesos

- Frontend: http://localhost => Interfaz de usuario final y panel de gestión.
- Backend: http://localhost:8080 => Punto de entrada del API REST de Spring Boot.
- Adminer: http://localhost:8888 => Interfaz web para gestionar la base de datos PostgreSQL. (Marcar PostgreSQL como motor de base de datos y usar las credenciales definidas en el archivo .env)

## Usuarios de Prueba (Data Seeding)

Para facilitar la evaluación, el sistema carga automáticamente los siguientes perfiles.

IMPORTANTE: La contraseña para todos los usuarios es la que hayas definido en la variable APP_DEFAULT_PASSWORD de tu archivo .env

USUARIO - ROL - DESCRIPCIÓN
1. admin - Rol ADMIN - Acceso total. Director general del sistema.
2. staff - Rol STAFF - Técnico con equipos asignados (Equipo de Prueba y Juvenil).
3. member - Rol MEMBER - Socio activo con afiliación al "Equipo de Prueba".
4. aspirante - Rol MEMBER - Usuario con registro pendiente de aprobación (Inactivo). NO PODRÁS ACCEDER CON ESTA CUENTA HASTA QUE UN ADMIN NO TE APRUEBE
5. staff_sin_equipo - Rol STAFF - Usuario técnico sin equipos ni afiliaciones asignadas
6. usuario.borrado - Rol MEMBER - Usuario marcada como eliminado (soft delete). SIRVE PARA HACER COMPROBACIONES DEL HISTORIAL LOGGEÁNDOTE COMO ADMIN, PERO NO PODRÁS ACCEDER CON ESTE USUARIO
7. user_rol_informativo - Rol ROL INFORMATIVO - Usuario del rol que no es de los principales del sistema llamado ROL INFORMATIVO. Con él podrás ver directamente la pantalla creada para los roles que no son de sistema.

## Cómo probar la API (Swagger)

Accede a http://localhost:8080/swagger-ui/index.html

Los endpoints están protegidos por seguridad JWT. Para probarlos desde la interfaz de Swagger:

1. Accede al endpoint POST /api/auth/login.

2. Haz clic en Try it out e introduce las credenciales (por defecto en el seeding).

3. Copia el valor del token recibido en la respuesta (sin las comillas).

4. Sube al inicio de la página de Swagger y haz clic en el botón Authorize (el candado).

5. Pega el token y haz clic en Authorize.

6. Ahora ya puedes ejecutar cualquier método y Swagger enviará automáticamente el token en la cabecera.

## Parada y limpieza

'docker-compose down' para detener los servicios
'docker-compose down -v' para limpieza total borrando también los datos de la base de datos

NOTA: El sistema utiliza una política de create-drop para la base de datos, lo que garantiza que, en cada despliegue (docker-compose up), los datos de prueba se carguen correctamente y el entorno esté limpio.
