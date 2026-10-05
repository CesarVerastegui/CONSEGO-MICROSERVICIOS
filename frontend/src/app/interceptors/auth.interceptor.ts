import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor HTTP Funcional (Angular 17+).
 * Intercepta todas las peticiones salientes de HttpClient.
 * Si existe un token JWT en el almacenamiento local, clona la petición
 * y adjunta la cabecera 'Authorization: Bearer <token>'.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Obtener token JWT almacenado en localStorage
  const token = localStorage.getItem('consego_jwt_token');

  // 2. Si el token existe, clonar la petición agregando la cabecera Authorization
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // 3. Continuar la cadena normal si no hay token (ej. peticiones públicas de login)
  return next(req);
};
