# Guía de Equipo (v3.0): Repositorios Individuales y Ejecución con Docker Manual

Esta carpeta `v3.0` contiene los **6 componentes independientes** listos para repartir entre los integrantes del equipo, cada uno con su propio `.gitignore` y su `Dockerfile` simple de 5 líneas (sin `docker-compose`).

---

## 1. Carpetas por Integrante / Repositorio

Cada integrante solo debe copiar la carpeta que le corresponde y crear un repositorio nuevo en su cuenta de GitHub:

1. **`eureka-server`** (Puerto `8761`) — Servidor de Descubrimiento Netflix Eureka.
2. **`api-gateway`** (Puerto `8080`) — Puerta de enlace Spring Cloud Gateway y filtro JWT.
3. **`auth-service`** (Puerto `8081`) — Microservicio de Usuarios, Login, Roles y Admisión (MySQL + RabbitMQ).
4. **`solicitudes-service`** (Puerto `8082`) — Microservicio Core de Solicitudes y Catálogo de Plataformas (MySQL + OpenFeign + Resilience4j + RabbitMQ).
5. **`audit-service`** (Puerto `8083`) — Microservicio Consumidor de Auditoría NoSQL (MongoDB + RabbitMQ).
6. **`frontend`** (Puerto `4200` / `80`) — Aplicación Web en Angular 17.

### Comandos para que cada compañero suba su carpeta a su repositorio:
Dentro de su carpeta respectiva (por ejemplo `cd auth-service`), abrir terminal y ejecutar:

```bash
git init
git add .
git commit -m "Subida inicial del microservicio"
git branch -M main
git remote add origin https://github.com/USUARIO/NOMBRE-REPO.git
git push -u origin main
```

---

## 2. Cómo Levantar Todo Manualmente con Docker (Sin Docker Compose)

Como el `Dockerfile` de cada microservicio usa la estructura clásica de clase:
```dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Paso 0: Generar el archivo `.jar` en cada microservicio
Antes de ejecutar `docker build`, abrir cada microservicio en **IntelliJ IDEA / Eclipse / NetBeans** (o terminal con Maven) y ejecutar:
- En IntelliJ: Pestaña **Maven** -> `Lifecycle` -> **package** (o por terminal: `mvn clean package -DskipTests`).
- Esto generará el archivo `.jar` dentro de la carpeta `target/`.

---

### Paso 1: Crear la Red de Docker
Para que todos los contenedores puedan comunicarse entre sí por su nombre sin usar `docker-compose`, crear una red en Docker:

```bash
docker network create consego-net
```

---

### Paso 2: Levantar Contenedores de Base de Datos y Mensajería
Ejecutar estos 3 comandos para iniciar MySQL, MongoDB y RabbitMQ dentro de la red `consego-net`:

```bash
# 1. MySQL 8.0
docker run -d --name consego-mysql --network consego-net -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=authdb mysql:8.0

# 2. MongoDB 7.0
docker run -d --name consego-mongodb --network consego-net -p 27017:27017 mongo:7.0

# 3. RabbitMQ con panel web
docker run -d --name consego-rabbitmq --network consego-net -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

---

### Paso 3: Construir (`docker build`) y Ejecutar (`docker run`) cada Microservicio

#### 1. `eureka-server` (Puerto 8761)
```bash
cd eureka-server
docker build -t eureka-server .
docker run -d --name eureka-server --network consego-net -p 8761:8761 eureka-server
```

#### 2. `auth-service` (Puerto 8081)
```bash
cd auth-service
docker build -t auth-service .
docker run -d --name auth-service --network consego-net -p 8081:8081 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://consego-mysql:3306/authdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true" \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root \
  -e SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQLDialect \
  -e SPRING_RABBITMQ_HOST=consego-rabbitmq \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" \
  auth-service
```

#### 3. `solicitudes-service` (Puerto 8082)
```bash
cd solicitudes-service
docker build -t solicitudes-service .
docker run -d --name solicitudes-service --network consego-net -p 8082:8082 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://consego-mysql:3306/appdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true" \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root \
  -e SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQLDialect \
  -e SPRING_RABBITMQ_HOST=consego-rabbitmq \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" \
  -e AUTH_SERVICE_URL="http://auth-service:8081" \
  solicitudes-service
```

#### 4. `audit-service` (Puerto 8083)
```bash
cd audit-service
docker build -t audit-service .
docker run -d --name audit-service --network consego-net -p 8083:8083 \
  -e SPRING_DATA_MONGODB_HOST=consego-mongodb \
  -e SPRING_RABBITMQ_HOST=consego-rabbitmq \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" \
  audit-service
```

#### 5. `api-gateway` (Puerto 8080)
```bash
cd api-gateway
docker build -t api-gateway .
docker run -d --name api-gateway --network consego-net -p 8080:8080 \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" \
  -e AUTH_SERVICE_URI="http://auth-service:8081" \
  -e SOLICITUDES_SERVICE_URI="http://solicitudes-service:8082" \
  -e AUDIT_SERVICE_URI="http://audit-service:8083" \
  api-gateway
```

#### 6. `frontend` (Puerto 4200)
```bash
cd frontend
docker build -t frontend-consego .
docker run -d --name frontend-consego --network consego-net -p 4200:80 frontend-consego
```

---

### Comandos en PowerShell (En una sola línea cada `docker run` para Windows)

Si ejecutan los comandos desde **PowerShell en Windows**, usar estas versiones de una sola línea:

```powershell
# Red
docker network create consego-net

# Infraestructura
docker run -d --name consego-mysql --network consego-net -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=authdb mysql:8.0
docker run -d --name consego-mongodb --network consego-net -p 27017:27017 mongo:7.0
docker run -d --name consego-rabbitmq --network consego-net -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# 1. Eureka
docker build -t eureka-server ./eureka-server
docker run -d --name eureka-server --network consego-net -p 8761:8761 eureka-server

# 2. Auth Service
docker build -t auth-service ./auth-service
docker run -d --name auth-service --network consego-net -p 8081:8081 -e SPRING_DATASOURCE_URL="jdbc:mysql://consego-mysql:3306/authdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true" -e SPRING_DATASOURCE_USERNAME=root -e SPRING_DATASOURCE_PASSWORD=root -e SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQLDialect -e SPRING_RABBITMQ_HOST=consego-rabbitmq -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" auth-service

# 3. Solicitudes Service
docker build -t solicitudes-service ./solicitudes-service
docker run -d --name solicitudes-service --network consego-net -p 8082:8082 -e SPRING_DATASOURCE_URL="jdbc:mysql://consego-mysql:3306/appdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true" -e SPRING_DATASOURCE_USERNAME=root -e SPRING_DATASOURCE_PASSWORD=root -e SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQLDialect -e SPRING_RABBITMQ_HOST=consego-rabbitmq -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" -e AUTH_SERVICE_URL="http://auth-service:8081" solicitudes-service

# 4. Audit Service
docker build -t audit-service ./audit-service
docker run -d --name audit-service --network consego-net -p 8083:8083 -e SPRING_DATA_MONGODB_HOST=consego-mongodb -e SPRING_RABBITMQ_HOST=consego-rabbitmq -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" audit-service

# 5. API Gateway
docker build -t api-gateway ./api-gateway
docker run -d --name api-gateway --network consego-net -p 8080:8080 -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/" -e AUTH_SERVICE_URI="http://auth-service:8081" -e SOLICITUDES_SERVICE_URI="http://solicitudes-service:8082" -e AUDIT_SERVICE_URI="http://audit-service:8083" api-gateway

# 6. Frontend
docker build -t frontend-consego ./frontend
docker run -d --name frontend-consego --network consego-net -p 4200:80 frontend-consego
```
