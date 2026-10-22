# Eureka Server - CONSEGO

Servidor de descubrimiento para los microservicios del proyecto de DSW2.

## Puerto
Corre en el puerto `8761`.

## Como ejecutar con Docker
Primero compilar el proyecto con Maven (`mvn clean package`) y luego:

```bash
docker build -t eureka-server .
docker run -d --name eureka-server --network consego-net -p 8761:8761 eureka-server
```
