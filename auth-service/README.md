# Servicio de Autenticación (auth-service)

Microservicio encargado del login, registro de usuarios y roles con JWT.
Usa base de datos MySQL y envia eventos por RabbitMQ.

### Datos principales
* Puerto: 8081
* Base de datos: `authdb` (MySQL)
* Java 17 y Spring Boot 3

### Ejecución
Generar el jar con maven y levantar la imagen:
```bash
docker build -t auth-service .
docker run -d -p 8081:8081 --name auth-service --network consego-net auth-service
```
