# imagen java 17
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# pasar el jar al contenedor
COPY target/*.jar app.jar
# puerto 8082
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
