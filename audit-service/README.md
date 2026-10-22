# Audit Service

Microservicio de auditoria del proyecto CONSEGO. Escucha la cola de RabbitMQ y guarda el historial de eventos en MongoDB.

## Tecnologias
- Spring Boot
- MongoDB (base de datos `auditdb`)
- RabbitMQ
- Puerto: `8083`

## Docker
```bash
docker build -t audit-service .
docker run -d --name audit-service --network consego-net -p 8083:8083 audit-service
```
