FROM eclipse-temurin:17-jdk-alpine
# carpeta de trabajo
WORKDIR /app
COPY target/*.jar app.jar
# puerto de auth
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
