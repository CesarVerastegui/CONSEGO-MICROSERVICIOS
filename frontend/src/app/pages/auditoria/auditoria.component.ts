import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../models/audit.models';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Auditoría</h1>
          <p class="text-sm text-slate-500 mt-1">
            Historial de eventos y registro de actividad del sistema.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" [(ngModel)]="autoRefresh" (change)="toggleAutoRefresh()" class="rounded text-blue-600">
            <span>Actualizar automáticamente</span>
          </label>

          <button (click)="loadLogs()" [disabled]="isLoading"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all">
            <span class="material-symbols-outlined text-[16px]" [class.animate-spin]="isLoading">sync</span>
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="bg-surface-card p-4 rounded-xl border border-border-default shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button (click)="filterEvent = 'TODOS'"
                  [ngClass]="filterEvent === 'TODOS' ? 'bg-primary-midnight text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Todos ({{ logs.length }})
          </button>
          <button (click)="filterEvent = 'SOLICITUD_CREADA'"
                  [ngClass]="filterEvent === 'SOLICITUD_CREADA' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Solicitudes ({{ countByEvent('SOLICITUD_CREADA') }})
          </button>
          <button (click)="filterEvent = 'SOLICITUD_ACTUALIZADA'"
                  [ngClass]="filterEvent === 'SOLICITUD_ACTUALIZADA' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Evaluadas ({{ countByEvent('SOLICITUD_ACTUALIZADA') }})
          </button>
          <button (click)="filterEvent = 'USUARIO_REGISTRADO'"
                  [ngClass]="filterEvent === 'USUARIO_REGISTRADO' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Usuarios Nuevos ({{ countByEvent('USUARIO_REGISTRADO') }})
          </button>
          <button (click)="filterEvent = 'USUARIO_APROBADO'"
                  [ngClass]="filterEvent === 'USUARIO_APROBADO' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Usuarios Aprobados ({{ countByEvent('USUARIO_APROBADO') }})
          </button>
          <button (click)="filterEvent = 'USUARIO_RECHAZADO'"
                  [ngClass]="filterEvent === 'USUARIO_RECHAZADO' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Usuarios Rechazados ({{ countByEvent('USUARIO_RECHAZADO') }})
          </button>
        </div>

        <div class="relative w-full md:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Buscar por detalle o ID..."
                 class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
        </div>
      </div>

      <!-- Logs Table Card -->
      <div class="bg-surface-card rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Evento</th>
                <th class="py-3 px-4">Entidad ID</th>
                <th class="py-3 px-4">Usuario</th>
                <th class="py-3 px-4">Fecha y Hora</th>
                <th class="py-3 px-4">Detalle</th>
                <th class="py-3 px-4 text-right">Datos</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (log of filteredLogs; track log.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3.5 px-4 font-mono text-slate-700">
                    <span class="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200 text-slate-600">
                      {{ log.id || 'N/A' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-mono font-semibold">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px]"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800 border border-blue-200': log.tipoEvento === 'SOLICITUD_CREADA',
                            'bg-purple-100 text-purple-800 border border-purple-200': log.tipoEvento === 'SOLICITUD_ACTUALIZADA',
                            'bg-rose-100 text-rose-800 border border-rose-200': log.tipoEvento === 'SOLICITUD_ELIMINADA',
                            'bg-amber-100 text-amber-800 border border-amber-200': log.tipoEvento === 'USUARIO_REGISTRADO',
                            'bg-emerald-100 text-emerald-800 border border-emerald-200': log.tipoEvento === 'USUARIO_APROBADO',
                            'bg-red-100 text-red-800 border border-red-200': log.tipoEvento === 'USUARIO_RECHAZADO'
                          }">
                      {{ log.tipoEvento }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-800">#{{ log.entidadId }}</td>
                  <td class="py-3.5 px-4 font-mono text-slate-600">Usuario #{{ log.usuarioId }}</td>
                  <td class="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {{ log.fechaEvento | date:'dd/MM/yyyy HH:mm:ss' }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-700 max-w-md">
                    <div class="truncate" [title]="log.detalle">{{ log.detalle }}</div>
                    @if (log.metadatos && hasKeys(log.metadatos)) {
                      <div class="flex flex-wrap gap-1 mt-1">
                        @for (k of getKeys(log.metadatos); track k) {
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200"
                                [title]="k + ': ' + log.metadatos[k]">
                            {{ k }}: {{ log.metadatos[k] }}
                          </span>
                        }
                      </div>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <button (click)="viewRawJson(log)"
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors">
                      <span class="material-symbols-outlined text-[14px]">code</span>
                      <span>Ver JSON</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: VISOR DE JSON DOCUMENT                                  -->
      <!-- ============================================================== -->
      @if (selectedJsonLog) {
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 rounded-2xl shadow-xl max-w-xl w-full border border-slate-700 overflow-hidden text-white">
            <div class="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-400">data_object</span>
                <h3 class="font-mono font-bold text-sm">Detalle de Evento: {{ selectedJsonLog.id }}</h3>
              </div>
              <button (click)="selectedJsonLog = null" class="text-slate-400 hover:text-white">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div class="p-5">
              <pre class="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">{{ rawJsonString }}</pre>
            </div>

            <div class="p-4 bg-slate-800/60 border-t border-slate-700 flex items-center justify-between">
              <span class="text-xs text-slate-400">Registro en base de datos</span>
              <button (click)="copyJson()"
                      class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors">
                <span class="material-symbols-outlined text-[14px]">content_copy</span>
                <span>{{ copied ? '¡Copiado!' : 'Copiar' }}</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AuditoriaComponent implements OnInit, OnDestroy {
  private readonly auditService = inject(AuditService);

  logs: AuditLog[] = [];
  filterEvent: string = 'TODOS';
  searchQuery = '';
  isLoading = false;
  autoRefresh = false;
  private intervalId: any;

  selectedJsonLog: AuditLog | null = null;
  rawJsonString = '';
  copied = false;

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadLogs(): void {
    this.isLoading = true;
    this.auditService.getAuditLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar auditoría', err);
        this.isLoading = false;
      }
    });
  }

  toggleAutoRefresh(): void {
    if (this.autoRefresh) {
      this.intervalId = setInterval(() => this.loadLogs(), 5000);
    } else {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }

  get filteredLogs(): AuditLog[] {
    return this.logs.filter(l => {
      const matchEvent = this.filterEvent === 'TODOS' || l.tipoEvento === this.filterEvent;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (l.id && l.id.toLowerCase().includes(q)) ||
        (l.detalle && l.detalle.toLowerCase().includes(q)) ||
        String(l.entidadId).includes(q) ||
        String(l.usuarioId).includes(q);
      return matchEvent && matchQuery;
    });
  }

  countByEvent(event: string): number {
    return this.logs.filter(l => l.tipoEvento === event).length;
  }

  viewRawJson(log: AuditLog): void {
    this.selectedJsonLog = log;
    this.rawJsonString = JSON.stringify(log, null, 2);
    this.copied = false;
  }

  copyJson(): void {
    if (this.rawJsonString) {
      navigator.clipboard.writeText(this.rawJsonString);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }
  }

  hasKeys(obj?: Record<string, any>): boolean {
    return !!obj && Object.keys(obj).length > 0;
  }

  getKeys(obj?: Record<string, any>): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
