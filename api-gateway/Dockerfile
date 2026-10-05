# ==============================================================================
# Dockerfile Multi-Etapa Estándar para Microservicios Spring Boot (Java 17)
# ==============================================================================

# Etapa 1: Compilación y empaquetado (Build Stage)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# 1. Copiar pom.xml y descargar dependencias para aprovechar caché de capas Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Copiar código fuente y compilar empaquetando el artefacto .jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Etapa 2: Imagen ligera de ejecución (Runtime Stage)
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Crear usuario y grupo no-root para ejecución segura en contenedor
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar el archivo .jar compilado desde la etapa anterior
COPY --from=builder /build/target/*.jar app.jar

# Configurar variables de memoria para contenedores y comando de inicio
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
