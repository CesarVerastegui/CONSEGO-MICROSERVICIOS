# Imagen base de Java 17
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Copiamos el jar generado por maven
COPY target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
