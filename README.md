## ¿Qué es Klubly?

**Klubly** es una plataforma integral diseñada para centralizar y simplificar la gestión administrativa de entidades y clubes deportivos. Desarrollada como Trabajo de Fin de Grado (TFG) del Grado de Ingeniería Informático de la Universitat Oberta de Catalunya (UOC) en el área de Desarrollo Web, la aplicación nace con el objetivo de transformar la gestión tradicional —a menudo dispersa en hojas de cálculo o procesos manuales— en un ecosistema digital robusto, eficiente y fácil de usar.

El sistema permite un control total sobre los pilares operativos de un club a través de una arquitectura modular. Entre sus funciones principales destacan la gestión avanzada de usuarios y roles, la organización de equipos y afiliaciones, y la planificación de actividades con sus respectivos sistemas de inscripción. Además, Klubly incorpora herramientas críticas para la salud del club, como un módulo de control de tesorería para monitorizar el flujo económico y una sección de gestión de inventario para supervisar el material deportivo disponible.

## Guía de Configuración y Despliegue - Klubly

Este repositorio contiene el ecosistema completo de **Klubly** (Frontend, Backend y Base de Datos) automatizado mediante contenedores para facilitar su despliegue y evaluación.

- **En este enlace puede consultar un vídeo explicativo de la configuración para dispositivos Windows: https://youtu.be/vfgu_6p86LE**
- **En este enlace puede consultar un vídeo explicativo de la configuración para dispositivos MacOS: https://youtu.be/l5aGmwEL7oM**

## Requisitos

- Docker Desktop instalado y en ejecución
- Puerto 80 (Frontend), 8080 (Backend API), 5432 (PostgreSQL) y 8888 (Adminer) libres en el sistema

## Obtención del proyecto

- Opción 1: Descarga directa (ZIP) desde https://github.com/guillebenya/Klubly_TFG_2026_GuillermoReyes.git

1.  Haz clic en el botón verde 'Code' de GitHub y selecciona 'Download ZIP'.

2.  Extrae el contenido y abre una terminal dentro de la carpeta raíz del proyecto.

- Opción 2: Clonado mediante Git

1. Ejecuta el siguiente comando en tu terminal:
  *git clone https://github.com/guillebenya/Klubly_TFG_2026_GuillermoReyes.git*

2. Luego, accede a la carpeta con el comando: *cd Klubly_TFG_2026_GuillermoReyes*

## Configuración de variables de entorno

Por seguridad, las credenciales no están incluidas en el código fuente. Es obligatorio configurar el archivo de entorno antes de arrancar:

1. Crear el archivo de configuración:

**IMPORTANTE: Nota SOLO para usuarios de macOS:**
Para poder crear el archivo correctamente en MacOS, accede a la terminal y sitúate en la carpeta raíz del proyecto. Ahí, utiliza el comando *cp env.template .env* para poder renombrar correctamente el archivo .env. De otra manera, dará errores.

- Localiza el archivo *env.template* en la raíz del proyecto y haz una copia (o simplemente renombra el archivo env.template) llamada exactamente: *.env* *(Asegúrate de que no tenga extensión .txt al final.)*

2. Editar las credenciales:

**IMPORTANTE: Nota para usuarios de macOS:**
El archivo .env es un archivo de sistema y puede aparecer oculto. **Para visualizarlo en el Finder, presiona la combinación de teclas: Cmd + Shift + . (punto)**

- Abre *.env* con cualquier editor de texto y sustituye los valores entre corchetes por los tuyos (sin los corchetes):

- *DB_USER* / *DB_PASSWORD* / *DB_NAME*: Credenciales para la base de datos (necesarias para el Backend y Adminer). 

**NOTA: Si solo quieres probar la aplicación, puedes dejar los valores de la base de datos que vienen por defecto en el archivo env.template. Se exponen aquí por seguridad y para evitar conflictos si se despliega junto a otras bases de datos..**

- *JWT_SECRET*: Clave para el cifrado de las sesiones. **IMPORTANTE**: Debe tener al menos 32 caracteres (256 bits) para cumplir con el estándar de seguridad HS256. Si es más corta, el Backend lanzará un error crítico al arrancar.

- *APP_DEFAULT_PASSWORD*: Contraseña genérica para los usuarios que se cargan automáticamente en la base de datos al inicio. **IMPORTANTE**: El sistema  exige un mínimo estricto de 6 caracteres para cualquier contraseña nueva o actualizada por motivos de seguridad.

## Cómo ejecutar 

- En la terminal, nos situamos en la raíz del proyecto (donde está el archivo *docker-compose.yml*)

- 1ª vez (Compilación total); usamos el comando: *docker-compose up --build -d*
- 2ª vez y sucesivas; usamos el comando: *docker-compose up* (para ver los logs en tiempo real) o *docker-compose up -d* para no verla y que todo se ejecute en segundo plano. Si has usado la opción en segundo plano pero decides que quieres ver los logs puedes usar *docker-compose logs -f*

## Parada y limpieza

'docker-compose down' para detener los servicios
'docker-compose down -v' para limpieza total borrando también los datos de la base de datos (recomendable si queremos evitar problemas y comenzar totalmente de 0)

NOTA: El sistema utiliza una política de create-drop para la base de datos, lo que garantiza que, en cada despliegue (docker-compose up), los datos de prueba se carguen correctamente y el entorno esté limpio.

## Accesos

- Frontend: *http://localhost* => Interfaz de usuario final y panel de gestión.
- Adminer: *http://localhost:8888* => Interfaz web para gestionar la base de datos PostgreSQL. **(Marcar PostgreSQL como motor de base de datos y usar las credenciales definidas en el archivo *.env*)**

## Usuarios de Prueba (Data Seeding)

Para facilitar la evaluación, el sistema carga automáticamente los siguientes perfiles.

IMPORTANTE: La contraseña para todos los usuarios es la que hayas definido en la variable *APP_DEFAULT_PASSWORD* de tu archivo *.env*

USUARIO - ROL - DESCRIPCIÓN
1. admin - Rol ADMIN - Acceso total. Director general del sistema.
2. staff - Rol STAFF - Técnico con equipos asignados (Equipo de Prueba y Juvenil).
3. member - Rol MEMBER - Socio activo con afiliación al "Equipo de Prueba".
4. aspirante - Rol MEMBER - Usuario con registro pendiente de aprobación (Inactivo). NO PODRÁS ACCEDER CON ESTA CUENTA HASTA QUE UN ADMIN NO TE APRUEBE
5. staff_sin_equipo - Rol STAFF - Usuario técnico sin equipos ni afiliaciones asignadas
6. usuario.borrado - Rol MEMBER - Usuario marcada como eliminado (soft delete). SIRVE PARA HACER COMPROBACIONES DEL HISTORIAL LOGGEÁNDOTE COMO ADMIN, PERO NO PODRÁS ACCEDER CON ESTE USUARIO
7. user_rol_informativo - Rol ROL INFORMATIVO - Usuario del rol que no es de los principales del sistema llamado ROL INFORMATIVO. Con él podrás ver directamente la pantalla creada para los roles que no son de sistema.

## Cómo probar la API (Swagger)

Accede a *http://localhost:8080/swagger-ui/index.html*

Los endpoints están protegidos por seguridad JWT. Para probarlos desde la interfaz de Swagger:

1. Accede al endpoint POST /api/auth/login.

2. Haz clic en Try it out e introduce las credenciales (por defecto en el seeding).

3. Copia el valor del token recibido en la respuesta (sin las comillas).

4. Sube al inicio de la página de Swagger y haz clic en el botón Authorize (el candado).

5. Pega el token y haz clic en Authorize.

6. Ahora ya puedes ejecutar cualquier método y Swagger enviará automáticamente el token en la cabecera.

## Cómo ejecutar tests de manera independiente

- Tests del Backend (JUnit 5 & Mockito):

1. Navega a la carpeta del backend con el comando: *cd backend*

2. Ejecuta el comando: *mvn test*

3. Los resultados se mostrarán en la terminal y se generará un reporte detallado en **target/surefire-reports*

- Tests del Frontend (Vitest / Jest)

1. Navega a la carpeta del frontend: cd frontend

2. Si tienes Node.js instalado localmente, ejecuta el comando: *npm test*

3. Alternativamente, si prefieres no instalar Node localmente, puedes ejecutarlos mediante Docker (mientras el contenedor esté en ejecución) con el comando:
*docker exec -it klubly-frontend npm test*

## Calidad de Código

Este proyecto utiliza SonarCloud para el análisis estático de código, asegurando estándares de seguridad, mantenibilidad y fiabilidad.

Puedes consultar el estado actual del proyecto, la deuda técnica y las vulnerabilidades detectadas en el siguiente enlace:
https://sonarcloud.io/project/overview?id=guillebenya_Klubly_TFG_2026_GuillermoReyes

Si deseas replicar el análisis de calidad en tu entorno local, sigue estos pasos:

- Prerrequisitos:
Java 21+ y Maven
Docker Desktop
Token de acceso (Para facilitar la evaluación, se proporciona el token de acceso directo (solo para fines de revisión académica)).

- Análisis del Backend:
Dentro de la carpeta /backend ejecutar el siguiente comando en el PowerShell (buscar cómo adaptar comando si es una terminal diferente).

mvn clean verify sonar:sonar "-Dsonar.projectKey=guillebenya_Klubly_TFG_2026_GuillermoReyes" "-Dsonar.organization=tfg-desarrolloweb" "-Dsonar.host.url=https://sonarcloud.io" "-Dsonar.token=0fc785cd0f82cddf20ab9851236d6ea79cfc1531"

- Análisis del Frontend:
Dentro de la carpeta /frontend ejecutar el siguiente comando en el PowerShell (buscar cómo adaptar comando si es una terminal diferente).

docker run --rm -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli sonar-scanner "-Dsonar.projectKey=guillebenya_Klubly_TFG_2026_GuillermoReyes_Frontend" "-Dsonar.organization=tfg-desarrolloweb" "-Dsonar.sources=src" "-Dsonar.host.url=https://sonarcloud.io" "-Dsonar.token=0fc785cd0f82cddf20ab9851236d6ea79cfc1531"
