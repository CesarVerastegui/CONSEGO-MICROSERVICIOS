import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-surface-canvas overflow-hidden font-sans">
      <aside class="w-64 bg-primary-midnight text-white flex flex-col justify-between border-r border-slate-800 shrink-0 z-20">
        <div>
          <div class="p-5 border-b border-slate-800 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              <span class="material-symbols-outlined text-[22px]">security</span>
            </div>
            <div>
              <h1 class="font-bold text-base tracking-tight text-white leading-tight">CONSEGO</h1>
              <p class="text-[11px] text-slate-400">Control, Seguridad y Gobernanza</p>
            </div>
          </div>
          <div class="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
            <span class="text-xs text-slate-400">Rol:</span>
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  [ngClass]="{
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30': authService.isAdmin(),
                    'bg-purple-500/20 text-purple-300 border border-purple-500/30': authService.isAuditor(),
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30': authService.isSolicitante()
                  }">
              {{ authService.getRole() }}
            </span>
          </div>
          <nav class="p-3 space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-blue-600 text-white font-semibold"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors">
              <span class="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Dashboard</span>
            </a>

            <a routerLink="/solicitudes" routerLinkActive="bg-blue-600 text-white font-semibold"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors">
              <span class="material-symbols-outlined text-[20px]">rule</span>
              <span>Solicitudes</span>
            </a>

            <a routerLink="/plataformas" routerLinkActive="bg-blue-600 text-white font-semibold"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors">
              <span class="material-symbols-outlined text-[20px]">hub</span>
              <span>Catálogo de Plataformas</span>
            </a>
            @if (authService.isAdmin()) {
              <a routerLink="/usuarios" routerLinkActive="bg-blue-600 text-white font-semibold"
                 class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors">
                <span class="material-symbols-outlined text-[20px]">manage_accounts</span>
                <span>Usuarios</span>
              </a>
            }
            @if (authService.isAdmin() || authService.isAuditor()) {
              <a routerLink="/auditoria" routerLinkActive="bg-blue-600 text-white font-semibold"
                 class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                <span>Auditoría</span>
              </a>
            }
          </nav>
        </div>
        <div class="p-4 border-t border-slate-800 bg-slate-900/40">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white border border-slate-600">
                {{ (authService.getUserSession()?.username || 'U')[0].toUpperCase() }}
              </div>
              <div class="overflow-hidden">
                <p class="text-xs font-semibold text-white truncate max-w-[110px]">
                  {{ authService.getUserSession()?.username }}
                </p>
                <p class="text-[10px] text-slate-400">En línea</p>
              </div>
            </div>
            <button (click)="logout()"
                    title="Cerrar sesión"
                    class="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
              <span class="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
          <div class="text-[10px] text-slate-500 text-center border-t border-slate-800/60 pt-2">
            CONSEGO • IDM Technology
          </div>
        </div>
      </aside>
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        <header class="h-14 bg-surface-card border-b border-border-default px-6 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span class="font-medium text-slate-700">Plataforma CONSEGO</span>
            <span class="text-slate-300">/</span>
            <span>Panel de Control</span>
          </div>

          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Sistema conectado
            </span>
            <span class="text-slate-300">|</span>
            <span class="font-medium text-slate-700">{{ authService.getUserSession()?.username }}</span>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6 bg-surface-canvas">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
