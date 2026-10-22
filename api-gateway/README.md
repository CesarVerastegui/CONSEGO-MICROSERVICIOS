# API Gateway

Gateway del proyecto CONSEGO hecho con Spring Cloud Gateway. Redirige las peticiones a los demás microservicios.

- Puerto: 8080
- Requiere que `eureka-server` este corriendo.

Comandos docker:
```
docker build -t api-gateway .
docker run -d --name api-gateway --network consego-net -p 8080:8080 api-gateway
```
