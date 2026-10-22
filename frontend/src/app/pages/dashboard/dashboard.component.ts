import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { AuditService } from '../../services/audit.service';
import { AuthService } from '../../services/auth.service';
import { Solicitud } from '../../models/solicitud.models';
import { AuditLog } from '../../models/audit.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p class="text-sm text-slate-500 mt-1">
            Bienvenido, <strong class="text-slate-800">{{ authService.getUserSession()?.nombres ? (authService.getUserSession()?.nombres + ' ' + authService.getUserSession()?.apellidos) : authService.getUserSession()?.username }}</strong>. 
            {{ authService.isSolicitante() ? 'Resumen personal de tus solicitudes de acceso.' : 'Resumen general del estado de solicitudes en la plataforma.' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="loadData()" [disabled]="isLoading"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all">
            <span class="material-symbols-outlined text-[16px]" [class.animate-spin]="isLoading">sync</span>
            <span>Actualizar</span>
          </button>
          
          <a routerLink="/solicitudes"
             class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all">
            <span class="material-symbols-outlined text-[16px]">add</span>
            <span>Nueva Solicitud</span>
          </a>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-surface-card p-5 rounded-xl border border-border-default shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">assignment</span>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-3xl font-bold text-slate-900 font-mono">{{ kpis.total }}</p>
            <p class="text-xs text-slate-400 mt-1">Solicitudes registradas</p>
          </div>
        </div>
        <div class="bg-surface-card p-5 rounded-xl border border-amber-200/80 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pendientes</span>
            <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-3xl font-bold text-amber-600 font-mono">{{ kpis.pendientes }}</p>
            <p class="text-xs text-amber-700/80 mt-1">En espera de revisión</p>
          </div>
        </div>
        <div class="bg-surface-card p-5 rounded-xl border border-emerald-200/80 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Aprobadas</span>
            <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-3xl font-bold text-emerald-600 font-mono">{{ kpis.aprobadas }}</p>
            <p class="text-xs text-emerald-700/80 mt-1">Acceso otorgado</p>
          </div>
        </div>
        <div class="bg-surface-card p-5 rounded-xl border border-rose-200/80 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider">Rechazadas</span>
            <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">cancel</span>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-3xl font-bold text-rose-600 font-mono">{{ kpis.rechazadas }}</p>
            <p class="text-xs text-rose-700/80 mt-1">Denegadas</p>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 bg-surface-card rounded-xl border border-border-default shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-slate-900">Solicitudes Recientes</h2>
              <p class="text-xs text-slate-500">Últimas solicitudes ingresadas en la plataforma</p>
            </div>
            <a routerLink="/solicitudes" class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>Ver todas</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 uppercase font-mono border-y border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">ID</th>
                  <th class="py-2.5 px-3">Plataforma</th>
                  <th class="py-2.5 px-3">Solicitante</th>
                  <th class="py-2.5 px-3">Estado</th>
                  <th class="py-2.5 px-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of recentSolicitudes; track item.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-3 px-3 font-mono font-bold text-slate-800">#{{ item.id }}</td>
                    <td class="py-3 px-3">
                      <div class="font-semibold text-slate-900">{{ item.plataforma }}</div>
                      <div class="text-[11px] text-slate-500 truncate max-w-[200px]">{{ item.motivo || item.justificacion || 'Sin motivo especificado' }}</div>
                    </td>
                    <td class="py-3 px-3 font-mono text-slate-600">Usuario #{{ item.usuarioSolicitanteId }}</td>
                    <td class="py-3 px-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            [ngClass]="{
                              'bg-amber-50 text-amber-700 border border-amber-200': item.estado === 'PENDIENTE',
                              'bg-emerald-50 text-emerald-700 border border-emerald-200': item.estado === 'APROBADA',
                              'bg-rose-50 text-rose-700 border border-rose-200': item.estado === 'RECHAZADA'
                            }">
                        {{ item.estado }}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right font-mono text-slate-500">{{ item.fechaCreacion | date:'dd/MM HH:mm' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="py-6 text-center text-slate-400">
                      No hay solicitudes registradas aún.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="lg:col-span-4 bg-surface-card rounded-xl border border-border-default shadow-sm p-5 flex flex-col justify-between">
          @if (authService.isAdmin() || authService.isAuditor()) {
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                  <h2 class="text-base font-bold text-slate-900">Actividad Reciente</h2>
                </div>
                <span class="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Historial</span>
              </div>
              <p class="text-xs text-slate-500 mb-3">Registro de eventos y cambios de estado.</p>

              <div class="space-y-3">
                @for (log of recentLogs; track log.id) {
                  <div class="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                    <div class="flex items-center justify-between text-[11px] mb-1">
                      <span class="font-semibold px-1.5 py-0.5 rounded"
                            [ngClass]="{
                              'bg-blue-100 text-blue-800': log.tipoEvento === 'SOLICITUD_CREADA',
                              'bg-purple-100 text-purple-800': log.tipoEvento === 'SOLICITUD_ACTUALIZADA',
                              'bg-rose-100 text-rose-800': log.tipoEvento === 'SOLICITUD_ELIMINADA'
                            }">
                        {{ log.tipoEvento }}
                      </span>
                      <span class="text-slate-400 font-mono text-[10px]">{{ log.fechaEvento | date:'HH:mm:ss' }}</span>
                    </div>
                    <p class="text-xs text-slate-700 line-clamp-2">{{ log.detalle }}</p>
                    <div class="mt-1.5 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Solicitud: #{{ log.entidadId }}</span>
                      <span>Usuario: #{{ log.usuarioId }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="py-8 text-center text-slate-400 text-xs">
                    No hay actividad reciente registrada.
                  </div>
                }
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 mt-4">
              <a routerLink="/auditoria"
                 class="w-full py-2 px-3 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors block">
                Ver historial completo →
              </a>
            </div>
          } @else {
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600 text-[20px]">shield</span>
                  <h2 class="text-base font-bold text-slate-900">Políticas y Privacidad</h2>
                </div>
                <span class="text-[11px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded font-semibold">
                  Solicitante
                </span>
              </div>
              
              <div class="space-y-3.5 text-xs text-slate-600">
                <div class="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-slate-700">
                  <div class="font-semibold text-blue-900 text-xs flex items-center gap-1.5 mb-1">
                    <span class="material-symbols-outlined text-[16px] text-blue-600">lock</span>
                    Confidencialidad de Accesos
                  </div>
                  <p class="text-[11px] leading-relaxed">
                    Tu cuenta solo tiene visibilidad sobre tus solicitudes personales de acceso. El Administrador y Auditor supervisan la autorización institucional.
                  </p>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5">
                  <div class="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-slate-600">help</span>
                    ¿Cómo solicitar acceso?
                  </div>
                  <ol class="list-decimal list-inside text-[11px] space-y-1 text-slate-600">
                    <li>Haz clic en <strong>Nueva Solicitud</strong>.</li>
                    <li>Selecciona la plataforma requerida.</li>
                    <li>Ingresa la justificación clara de negocio.</li>
                    <li>Sigue el estado en tu bandeja personal.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 mt-4">
              <a routerLink="/solicitudes"
                 class="w-full py-2 px-3 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors block">
                Ver Mis Solicitudes →
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly auditService = inject(AuditService);
  readonly authService = inject(AuthService);

  isLoading = false;
  kpis = {
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0
  };

  recentSolicitudes: Solicitud[] = [];
  recentLogs: AuditLog[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    const session = this.authService.getUserSession();
    const usuarioId = (this.authService.isSolicitante() && session?.id) ? session.id : undefined;

    this.solicitudService.getSolicitudes(usuarioId).subscribe({
      next: (sols) => {
        this.kpis.total = sols.length;
        this.kpis.pendientes = sols.filter(s => s.estado === 'PENDIENTE').length;
        this.kpis.aprobadas = sols.filter(s => s.estado === 'APROBADA').length;
        this.kpis.rechazadas = sols.filter(s => s.estado === 'RECHAZADA').length;
        this.recentSolicitudes = [...sols].slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    if (this.authService.isAdmin() || this.authService.isAuditor()) {
      this.auditService.getAuditLogs().subscribe({
        next: (logs) => {
          this.recentLogs = logs.slice(0, 5);
        },
        error: () => {}
      });
    } else {
      this.recentLogs = [];
    }
  }
}
