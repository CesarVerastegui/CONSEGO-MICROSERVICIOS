# Microservicio de Solicitudes

Este servicio maneja las solicitudes de acceso y el catalogo de plataformas del sistema CONSEGO.
Se comunica con auth-service usando Feign Client y envia mensajes a RabbitMQ para auditoria.

Puerto: 8082
BD: MySQL (appdb)

Para crear la imagen en docker:
1. Empaquetar el proyecto: `mvn clean package -DskipTests`
2. Crear imagen: `docker build -t solicitudes-service .`
3. Correr contenedor en la red consego-net en el puerto 8082.
