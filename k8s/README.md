# Guía de Orquestación con Kubernetes - CONSEGO (Tema 6 del Sílabo)

Este directorio contiene los manifiestos declarativos de Kubernetes para orquestar la arquitectura de microservicios CONSEGO en un clúster local (**Minikube**, **Docker Desktop Kubernetes**, o **k3s/cloud**).

---

## 1. Arquitectura de Despliegue en Kubernetes

- **Namespace Dedicado**: `consego` (Aislamiento de recursos y gobernanza).
- **Capa de Datos**:
  - `02-mysql.yaml`: Base de Datos Relacional para `auth-service` y `solicitudes-service` (PersistentVolumeClaim + Deployment + Service).
  - `03-mongodb.yaml`: Base de Datos NoSQL Documental para `audit-service` (PersistentVolumeClaim + Deployment + Service).
- **Capa de Mensajería & Descubrimiento**:
  - `04-rabbitmq.yaml`: Broker de mensajería AMQP y consola de gestión.
  - `05-eureka.yaml`: Servidor de Service Discovery Eureka.
- **Capa de Microservicios de Aplicación**:
  - `06-auth-service.yaml`: Autenticación, JWT y BCrypt con Health Probes (Spring Boot Actuator).
  - `07-solicitudes-service.yaml`: Core de Solicitudes con OpenFeign, Resilience4J y Health Probes.
  - `08-audit-service.yaml`: Consumidor de eventos con MongoDB y Health Probes.
  - `09-api-gateway.yaml`: Puerta de enlace perimetral expuesta vía `NodePort` (Puerto 30080 o 8080).

---

## 2. Instrucciones de Despliegue

### Paso 1: Crear las imágenes Docker locales (si se compilan desde local)
```powershell
docker build -t consego/eureka-server:latest ./eureka-server
docker build -t consego/auth-service:latest ./auth-service
docker build -t consego/solicitudes-service:latest ./solicitudes-service
docker build -t consego/audit-service:latest ./audit-service
docker build -t consego/api-gateway:latest ./api-gateway
```

### Paso 2: Aplicar los Manifiestos en Kubernetes
```powershell
# Aplicar todos los manifiestos en orden
kubectl apply -f k8s/
```

### Paso 3: Verificar el Estado de Pods y Servicios
```powershell
kubectl get pods -n consego
kubectl get services -n consego
```

### Paso 4: Probar la Observabilidad y Health Probes (Tema 7 del Sílabo)
```powershell
# Port-forward para consultar Actuator directamente
kubectl port-forward svc/api-gateway 8080:8080 -n consego
# Probar endpoint de salud
curl http://localhost:8080/actuator/health
```

### Paso 5: Eliminar Recursos (Limpieza)
```powershell
kubectl delete -f k8s/
```
