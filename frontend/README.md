# Frontend CONSEGO

Parte visual del proyecto hecha en Angular 17. Se conecta al API Gateway en el puerto 8080.

## Ejecutar en local
```bash
npm install
npm start
```
Abrir en el navegador `http://localhost:4200`.

## Con Docker
```bash
docker build -t frontend-consego .
docker run -d -p 4200:80 --name frontend-consego frontend-consego
```
