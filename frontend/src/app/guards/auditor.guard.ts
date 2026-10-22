import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const auditorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && (authService.isAdmin() || authService.isAuditor())) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
