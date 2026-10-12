import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SolicitudesComponent } from './pages/solicitudes/solicitudes.component';
import { PlataformasComponent } from './pages/plataformas/plataformas.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { AuditoriaComponent } from './pages/auditoria/auditoria.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { auditorGuard } from './guards/auditor.guard';

/**
 * Enrutamiento central para CONSEGO v2.0
 */
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'solicitudes',
        component: SolicitudesComponent
      },
      {
        path: 'plataformas',
        component: PlataformasComponent
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'auditoria',
        component: AuditoriaComponent,
        canActivate: [auditorGuard]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
