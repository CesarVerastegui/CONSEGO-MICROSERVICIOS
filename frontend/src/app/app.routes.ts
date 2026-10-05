import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SolicitudesComponent } from './pages/solicitudes/solicitudes.component';
import { authGuard } from './guards/auth.guard';

/**
 * Definición central de rutas de la SPA en Angular.
 * - /login: Ruta pública para autenticación.
 * - /solicitudes: Ruta protegida mediante authGuard (requiere token JWT).
 */
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'solicitudes',
    component: SolicitudesComponent,
    canActivate: [authGuard] // Protección perimetral con Guard
  },
  {
    path: '',
    redirectTo: 'solicitudes',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'solicitudes'
  }
];
