import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger vistas de Auditoría y Trazabilidad (exclusivas de Admin y Auditor).
 */
export const auditorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && (authService.isAdmin() || authService.isAuditor())) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
