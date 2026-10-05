# 📘 Manual de Despliegue, Operación y Pruebas - CONSEGO (v1.0)
**Proyecto:** CONSEGO - Sistema Distribuido de Control de Solicitudes de Acceso  
**Curso:** Desarrollo de Servicios Web II  
**Versión de Rama:** `v1.0`  
**Repositorio Oficial:** [https://github.com/CesarVerastegui/CONSEGO-MICROSERVICIOS.git](https://github.com/CesarVerastegui/CONSEGO-MICROSERVICIOS.git)

---

## 🎯 Objetivo de este Documento

Esta guía está diseñada para que cualquier miembro del equipo de desarrollo, evaluador o profesor pueda:
1. **Configurar el entorno** desde cero en pocos minutos.
2. **Levantar la arquitectura completa de microservicios** (5 microservicios + 3 motores de base de datos y mensajería) con Docker Compose.
3. **Ejecutar la aplicación web Frontend** en Angular 17.
4. **Reproducir el flujo de pruebas paso a paso** que cubre el 100% de la rúbrica académica (JWT, OpenFeign, Circuit Breaker, RabbitMQ, MongoDB, Eureka y pruebas `@DataJpaTest`).

---

## 🏗️ Mapa de Componentes y Puertos

| Servicio / Contenedor | Puerto Local | Tecnología | Rol en el Sistema |
|---|:---:|---|---|
| **consego-mysql** | `3306` | MySQL 8.0 | BD Relacional (`authdb` y `appdb`). |
| **consego-mongodb** | `27017` | MongoDB 7.0 | BD NoSQL documental para logs de auditoría (`auditdb`). |
| **consego-rabbitmq** | `5672` / `15672` | RabbitMQ 3.13 | Broker de mensajería AMQP y Consola Web administrativa. |
| **eureka-server** | `8761` | Spring Cloud Netflix Eureka | Registro y descubrimiento dinámico de microservicios. |
| **auth-service** | `8081` | Spring Boot 3 + Spring Security | Autenticación, JWT, encriptación BCrypt y consulta de usuarios. |
| **solicitudes-service** | `8082` | Spring Boot 3 + Data JPA + OpenFeign | Core de negocio: CRUD, validación sincrónica con Circuit Breaker. |
| **audit-service** | `8083` | Spring Boot 3 + Data MongoDB + AMQP | Consumidor asíncrono de eventos y persistencia en MongoDB. |
| **api-gateway** | `8080` | Spring Cloud Gateway (WebFlux) | Puerta de enlace perimetral, balanceo `lb://`, filtro JWT y CORS. |
| **frontend** | `4200` | Angular 17 Standalone | Interfaz gráfica SPA para login, dashboard y CRUD. |

---

## 📋 1. Prerrequisitos del Entorno de Desarrollo

Antes de comenzar, asegúrate de tener instalado en tu máquina:
- **Git:** [git-scm.com](https://git-scm.com/)
- **Docker Desktop** (con Docker Compose activo): [docker.com](https://www.docker.com/)  
  *(Asegúrate de que Docker Desktop esté encendido y en estado "Engine running")*.
- **Node.js 18+ o 20+** (LTS recomendado): [nodejs.org](https://nodejs.org/)
- **Java 17 JDK y Maven 3.9+** *(Opcional, únicamente si deseas compilar microservicios individualmente en IntelliJ/Eclipse/VSCode)*.

---

## 🚀 2. Clonación y Despliegue en 2 Pasos

### Paso 2.1: Clonar el repositorio en la rama `v1.0`
Abre una terminal (PowerShell, Git Bash o CMD) y ejecuta:

```bash
git clone -b v1.0 https://github.com/CesarVerastegui/CONSEGO-MICROSERVICIOS.git
cd CONSEGO-MICROSERVICIOS
```

---

### Paso 2.2: Levantar toda la infraestructura con Docker Compose
Desde la raíz del proyecto, ejecuta:

```bash
docker compose up -d --build
```

> **¿Qué hace este comando automáticamente?**  
> 1. Descarga las imágenes oficiales de MySQL 8.0, MongoDB 7.0 y RabbitMQ 3.13 con Management.  
> 2. Inicializa las bases de datos con usuarios precargados vía [`docker/mysql/init.sql`](../docker/mysql/init.sql).  
> 3. Compila con Maven y empaqueta en contenedores ligeros los 5 microservicios (`eureka-server`, `auth-service`, `solicitudes-service`, `audit-service`, `api-gateway`).  
> 4. Respeta el orden de arranque mediante `healthchecks` para garantizar que las bases de datos y Eureka estén listos antes de levantar los servicios de negocio.

---

### Paso 2.3: Verificar que todos los contenedores estén saludables
```bash
docker compose ps
```
Deberás ver los 8 contenedores en estado `Up` o `Healthy`:
```text
NAME                  STATUS                    PORTS
api-gateway           Up                        0.0.0.0:8080->8080/tcp
audit-service         Up                        0.0.0.0:8083->8083/tcp
auth-service          Up                        0.0.0.0:8081->8081/tcp
consego-mongodb       Up (healthy)              0.0.0.0:27017->27017/tcp
consego-mysql         Up (healthy)              0.0.0.0:3306->3306/tcp
consego-rabbitmq      Up (healthy)              0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
eureka-server         Up                        0.0.0.0:8761->8761/tcp
solicitudes-service   Up                        0.0.0.0:8082->8082/tcp
```

---

## 💻 3. Ejecución del Frontend en Angular 17

En una nueva terminal, desplázate a la carpeta del frontend y levanta el servidor de desarrollo:

```bash
cd frontend
npm install
npm start
```
*(O también: `npx ng serve --open`)*

Una vez iniciado, abre tu navegador web en:  
👉 **[http://localhost:4200](http://localhost:4200)**

---

## 👥 4. Credenciales de Prueba Precargadas

El sistema cuenta con usuarios listos con diferentes roles (sus contraseñas ya están cifradas con algoritmo **BCrypt** en la base de datos `authdb`):

| Usuario | Contraseña | Rol | ¿Para qué sirve en la demostración? |
|:---:|:---:|:---:|:---|
| **`admin`** | `password123` | **Admin** | Permiso total: crear solicitudes, aprobar (✓), rechazar (✕) y eliminar (🗑). |
| **`operador`** | `password123` | **Solicitante** | Usuario técnico operativo para demostrar creación de requerimientos. |
| **`auditor`** | `password123` | **Auditor** | Usuario enfocado en supervisión y trazabilidad de eventos. |

---

## 🧪 5. Guía de Demostración Paso a Paso (Para la Exposición y Evaluación)

Sigue este guion durante tu sustentación frente al profesor:

### 🔹 Demostración 1: Registro y Descubrimiento dinámico con Eureka
1. En tu navegador abre: **[http://localhost:8761](http://localhost:8761)**.
2. Muestra la tabla **"Instances currently registered with Eureka"**:
   - `API-GATEWAY` (Puerto 8080)
   - `AUTH-SERVICE` (Puerto 8081)
   - `SOLICITUDES-SERVICE` (Puerto 8082)
   - `AUDIT-SERVICE` (Puerto 8083)
3. **Explicación para el profesor:** *Todos los microservicios se registran dinámicamente y el API Gateway utiliza enrutamiento balanceado mediante `lb://` sin necesidad de IPs fijas.*

---

### 🔹 Demostración 2: Autenticación, JWT y Cifrado BCrypt
1. Entra a **[http://localhost:4200](http://localhost:4200)**.
2. Ingresa `admin` y `password123`, y presiona **"Ingresar al Sistema"**.
3. Abre las herramientas de desarrollador (`F12` -> pestaña *Application* -> *Local Storage*):
   - Muestra la clave `consego_jwt_token`.
   - Explica que el token JWT contiene claims firmados (`id`, `username`, `rol`) y se envía automáticamente en la cabecera `Authorization: Bearer <token>` a través del interceptor funcional de Angular.

---

### 🔹 Demostración 3: Creación de Solicitud con Validación Sincrónica OpenFeign + Resilience4J
1. Haz clic en el botón azul **"+ Nueva Solicitud"**.
2. Selecciona una plataforma (ej. `AWS Cloud` o `GitHub Organization`).
3. Observa que el campo *ID Usuario Solicitante* muestra automáticamente tu sesión actual `admin (ID: 1)` y permite probar con otros IDs registrados como `2` (`operador`).
4. Escribe un motivo (ej. `Apertura de puertos para API de pagos`) y haz clic en **"Registrar Solicitud"**.
5. Verás:
   - El modal se cierra automáticamente.
   - Aparece la notificación verde de éxito con el ID asignado.
   - La nueva solicitud aparece en la primera fila con su fecha de registro y estado `PENDIENTE`.
6. **Explicación técnica en logs:**  
   En la terminal ejecuta: `docker logs solicitudes-service --tail 10`  
   El profesor verá:
   ```text
   INFO: Validando usuario solicitante ID: 1 con auth-service vía OpenFeign
   INFO: Usuario validado: admin (Rol: Admin). Guardando solicitud...
   Hibernate: insert into solicitudes ...
   INFO: Evento emitido a RabbitMQ: [Exchange=consego.events.tx, RoutingKey=solicitud.creada, ...]
   ```

---

### 🔹 Demostración 4: Resiliencia con Fallback ante Usuarios Inexistentes
1. Abre de nuevo el modal **"+ Nueva Solicitud"**.
2. En *ID Usuario Solicitante*, escribe un ID que no exista (por ejemplo: `999`).
3. Escribe un motivo y presiona **"Registrar Solicitud"**.
4. Verás aparecer un aviso controlado en rojo:  
   *`Validación fallida: El usuario solicitante con ID 999 no existe o no se encuentra registrado en auth-service.`*
5. **Explicación:** *El Feign Client cuenta con un fallback de Circuit Breaker (`AuthClientFallback`) y un `@RestControllerAdvice` global que evita caídas del sistema y responde con un código HTTP 400 amigable.*

---

### 🔹 Demostración 5: Auditoría Asíncrona Event-Driven con RabbitMQ y MongoDB
1. Abre en tu navegador la Consola de RabbitMQ: **[http://localhost:15672](http://localhost:15672)**  
   *(Usuario: `guest` / Contraseña: `guest`)*.
   - Ve a la pestaña **Queues** y muestra la cola `consego.audit.queue` enlazada al topic exchange `consego.events.tx`.
2. Para mostrar cómo los eventos llegaron y se guardaron en MongoDB, ejecuta en tu terminal:
   ```bash
   docker exec -it consego-mongodb mongosh auditdb --eval "db.audit_logs.find().sort({fechaEvento: -1}).limit(3)"
   ```
   Verás los documentos JSON inmutables con los campos:
   - `tipoEvento: "SOLICITUD_CREADA"`
   - `entidadId: <ID_DE_SOLICITUD>`
   - `usuarioId: 1`
   - `fechaEvento: ISODate(...)`
   - `detalle: "Solicitud de acceso registrada para plataforma..."`

---

### 🔹 Demostración 6: Operaciones CRUD Completas (PUT y DELETE)
1. En la tabla del Frontend:
   - Presiona el botón verde **✓** para **Aprobar** una solicitud: el estado cambiará a `APROBADA` y se emitirá el evento `SOLICITUD_ACTUALIZADA` hacia RabbitMQ y MongoDB.
   - Presiona el botón naranja **✕** para **Rechazar**: cambiará a `RECHAZADA`.
   - Presiona el botón rojo **🗑** para **Eliminar**: tras confirmar el diálogo, la solicitud se borrará físicamente de MySQL (`appdb.solicitudes`) y se auditará `SOLICITUD_ELIMINADA`.
2. **Explicación:** *Se cubren explícitamente los 4 verbos HTTP (GET, POST, PUT, DELETE) tal como lo exige la rúbrica.*

---

### 🔹 Demostración 7: Ejecución de Pruebas Unitarias de Repositorio (`@DataJpaTest`)
Para sustentar los 6.0 puntos de pruebas unitarias:
1. Abre una terminal y dirígete a `solicitudes-service`:
   ```bash
   cd solicitudes-service
   mvn test -Dtest=SolicitudRepositoryTest
   ```
2. Las 4 pruebas se ejecutarán sobre una base de datos en memoria H2 aislada:
   - `a) testInsertarSolicitud()`: Comprueba persistencia y generación de ID autoincremental no nulo.
   - `b) testActualizarSolicitud()`: Comprueba transición de estado de PENDIENTE a APROBADA.
   - `c) testListarSolicitudes()`: Comprueba recuperación múltiple con `findAll()`.
   - `d) testEliminarSolicitud()`: Comprueba borrado por ID y validación con `Optional.empty()`.

---

## 🛠️ 6. Solución de Problemas Frecuentes (FAQ / Troubleshooting)

### ❓ Problema 1: "Puerto ya en uso (Port 3306 or 8080 is already allocated)"
- **Causa:** Tienes otro servicio de MySQL o Tomcat corriendo en tu máquina fuera de Docker.
- **Solución:** Detén el servicio local de MySQL (`net stop MySQL` o desde la app Services de Windows) o cambia el puerto host en `docker-compose.yml` (ej. `"3308:3306"`).

### ❓ Problema 2: "Los cambios en Angular no se reflejan"
- **Solución:** En el navegador presiona **`Ctrl + F5`** (o `Shift + F5`) para forzar la recarga limpia de caché y recargar los scripts JavaScript.

### ❓ Problema 3: "Quiero reiniciar todo limpio desde cero"
Ejecuta:
```bash
docker compose down -v
docker compose up -d --build
```
*(El parámetro `-v` elimina los volúmenes para que MySQL y MongoDB se vuelvan a inicializar con los scripts limpios).*

---

## 👨‍💻 Créditos del Equipo
- **Repositorio:** [CONSEGO-MICROSERVICIOS (v1.0)](https://github.com/CesarVerastegui/CONSEGO-MICROSERVICIOS)  
- **Desarrollado para:** Curso de Desarrollo de Servicios Web II - CIBERTEC.
