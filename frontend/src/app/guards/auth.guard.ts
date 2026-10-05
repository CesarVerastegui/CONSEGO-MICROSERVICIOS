import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard Funcional de Angular 17+ para proteger rutas privadas.
 * Verifica si existe un token JWT válido; de lo contrario, redirige al usuario a /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Si no está autenticado, redirigir a la pantalla de login
  router.navigate(['/login']);
  return false;
};
