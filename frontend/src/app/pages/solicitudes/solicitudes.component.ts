import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { PlataformaService } from '../../services/plataforma.service';
import { AuthService } from '../../services/auth.service';
import { Solicitud } from '../../models/solicitud.models';
import { Plataforma, CampoPersonalizado } from '../../models/plataforma.models';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
            {{ authService.isSolicitante() ? 'Mis Solicitudes de Acceso' : 'Solicitudes de Acceso' }}
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            {{ authService.isSolicitante() ? 'Consulta el estado y seguimiento de tus solicitudes personales.' : 'Consulta, crea y administra las solicitudes de acceso a plataformas.' }}
          </p>
        </div>

        <button (click)="openCreateModal()"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Nueva Solicitud</span>
        </button>
      </div>
      <div class="bg-surface-card p-4 rounded-xl border border-border-default shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button (click)="filterState = 'TODAS'"
                  [ngClass]="filterState === 'TODAS' ? 'bg-primary-midnight text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Todas ({{ solicitudes.length }})
          </button>
          <button (click)="filterState = 'PENDIENTE'"
                  [ngClass]="filterState === 'PENDIENTE' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Pendientes ({{ countByState('PENDIENTE') }})
          </button>
          <button (click)="filterState = 'APROBADA'"
                  [ngClass]="filterState === 'APROBADA' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Aprobadas ({{ countByState('APROBADA') }})
          </button>
          <button (click)="filterState = 'RECHAZADA'"
                  [ngClass]="filterState === 'RECHAZADA' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Rechazadas ({{ countByState('RECHAZADA') }})
          </button>
        </div>
        <div class="relative w-full md:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Buscar por plataforma o motivo..."
                 class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
        </div>
      </div>
      <div class="bg-surface-card rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase font-mono border-b border-slate-200">
              <tr>
                <th class="py-3 px-3 text-center w-12">#</th>
                <th class="py-3 px-4 min-w-[200px]">Plataforma & Parámetros</th>
                <th class="py-3 px-4 min-w-[150px]">Solicitante</th>
                <th class="py-3 px-4 min-w-[220px]">Motivo / Justificación</th>
                <th class="py-3 px-4 min-w-[130px]">Estado & Vigencia</th>
                <th class="py-3 px-4 min-w-[150px]">Resolución / Fecha</th>
                <th class="py-3 px-4 text-right min-w-[130px] sticky right-0 bg-slate-50 border-l border-slate-200 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of filteredSolicitudes; track item.id) {
                <tr class="hover:bg-slate-50/80 transition-colors group">
                  <!-- ID -->
                  <td class="py-3 px-3 font-mono font-bold text-slate-800 text-center">
                    #{{ item.id }}
                  </td>

                  <!-- Plataforma & Parámetros -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5 font-semibold text-slate-900">
                      <span class="material-symbols-outlined text-[18px] text-blue-600 shrink-0">cloud</span>
                      <span>{{ item.plataforma }}</span>
                    </div>
                    @if (hasDetalles(item)) {
                      <div class="flex flex-wrap gap-1 mt-1.5">
                        @for (d of getDetallesEntries(item); track d.key) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                                [title]="formatParamKey(d.key) + ': ' + d.value">
                            <span class="text-slate-500 mr-1 font-medium">{{ formatParamKey(d.key) }}:</span>
                            <span class="font-semibold">{{ d.value }}</span>
                          </span>
                        }
                      </div>
                    }
                  </td>

                  <!-- Solicitante -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {{ getUserInitials(item.usuarioSolicitanteId) }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-slate-900 text-xs truncate">{{ getUserName(item.usuarioSolicitanteId) }}</p>
                        <p class="text-[10px] text-slate-400 font-mono">{{ getUserHandle(item.usuarioSolicitanteId) }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Motivo / Justificación -->
                  <td class="py-3 px-4 text-slate-700 text-xs">
                    <p class="line-clamp-2" [title]="item.motivo || item.justificacion || ''">
                      {{ item.motivo || item.justificacion || 'Sin motivo especificado' }}
                    </p>
                  </td>

                  <!-- Estado & Vigencia -->
                  <td class="py-3 px-4">
                    <div class="space-y-1">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            [ngClass]="{
                              'bg-amber-50 text-amber-700 border border-amber-200': item.estado === 'PENDIENTE',
                              'bg-emerald-50 text-emerald-700 border border-emerald-200': item.estado === 'APROBADA',
                              'bg-rose-50 text-rose-700 border border-rose-200': item.estado === 'RECHAZADA'
                            }">
                        <span class="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
                              [ngClass]="{
                                'bg-amber-500': item.estado === 'PENDIENTE',
                                'bg-emerald-500': item.estado === 'APROBADA',
                                'bg-rose-500': item.estado === 'RECHAZADA'
                              }"></span>
                        {{ item.estado }}
                      </span>
                      <div class="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <span class="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                        <span>{{ item.vigenciaDias ? (item.vigenciaDias + ' días') : 'Permanente' }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Resolución / Fecha -->
                  <td class="py-3 px-4 text-slate-600 text-[11px]">
                    @if (item.comentarioResolucion) {
                      <div class="flex items-start gap-1" [title]="item.comentarioResolucion">
                        <span class="material-symbols-outlined text-[14px] text-slate-400 shrink-0 mt-0.5">comment</span>
                        <span class="line-clamp-2 text-slate-700">{{ item.comentarioResolucion }}</span>
                      </div>
                    } @else {
                      <span class="text-slate-400 font-mono">-</span>
                    }
                    <div class="text-[10px] text-slate-400 font-mono mt-1">
                      {{ item.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                    </div>
                  </td>

                  <!-- Acciones (Sticky para que NUNCA se oculte) -->
                  <td class="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/80 border-l border-slate-200 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] transition-colors">
                    @if (authService.isAdmin() || authService.isAuditor()) {
                      @if (item.estado === 'PENDIENTE') {
                        <button (click)="openResolucionModal(item)"
                                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all">
                          <span class="material-symbols-outlined text-[16px]">how_to_reg</span>
                          <span>Evaluar</span>
                        </button>
                      } @else {
                        <button (click)="openDetallesModal(item)"
                                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors">
                          <span class="material-symbols-outlined text-[15px]">visibility</span>
                          <span>Detalle</span>
                        </button>
                      }
                    } @else {
                      <button (click)="openDetallesModal(item)"
                              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors">
                        <span class="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Detalle</span>
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                    <span class="material-symbols-outlined text-3xl block mb-2 text-slate-300">inbox</span>
                    No se encontraron solicitudes registradas.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      @if (showCreateModal) {
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">add_task</span>
                <h3 class="font-bold text-base">Nueva Solicitud de Acceso</h3>
              </div>
              <button (click)="showCreateModal = false" class="text-slate-400 hover:text-white">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form (ngSubmit)="onCreateSolicitud()" class="p-6 space-y-4 overflow-y-auto">
              @if (createError) {
                <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {{ createError }}
                </div>
              }
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Plataforma o Servicio *</label>
                <select [(ngModel)]="newSolicitud.plataforma" name="plataforma" (change)="onPlataformaChanged()" required
                        class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                  <option value="" disabled>Selecciona una plataforma...</option>
                  @for (plat of plataformas; track plat.id) {
                    <option [value]="plat.nombre">{{ plat.nombre }} ({{ plat.categoria }})</option>
                  }
                </select>
              </div>
              @if (currentSelectedPlataforma?.camposPersonalizados && currentSelectedPlataforma!.camposPersonalizados!.length > 0) {
                <div class="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px] text-blue-600">tune</span>
                      Parámetros Específicos: {{ currentSelectedPlataforma?.nombre }}
                    </span>
                    <span class="text-[10px] text-blue-700 font-medium">Requeridos por el servicio</span>
                  </div>

                  <div class="space-y-3">
                    @for (campo of currentSelectedPlataforma!.camposPersonalizados!; track campo.id) {
                      <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">
                          {{ campo.etiqueta }}
                          @if (campo.requerido) { <span class="text-rose-500 font-bold">*</span> }
                        </label>
                        @if (campo.tipo === 'select') {
                          <select [(ngModel)]="newDetalles[campo.id]" [name]="'det_' + campo.id"
                                  class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                            <option value="" disabled>Selecciona una opción...</option>
                            @for (opt of campo.opciones; track opt) {
                              <option [value]="opt">{{ opt }}</option>
                            }
                          </select>
                        } @else if (campo.tipo === 'textarea') {
                          <textarea [(ngModel)]="newDetalles[campo.id]" [name]="'det_' + campo.id"
                                    [placeholder]="campo.placeholder || ''" rows="2"
                                    class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"></textarea>
                        } @else {
                          <input [type]="campo.tipo || 'text'" [(ngModel)]="newDetalles[campo.id]" [name]="'det_' + campo.id"
                                 [placeholder]="campo.placeholder || ''"
                                 class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                        }
                      </div>
                    }
                  </div>
                </div>
              }
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Vigencia del Acceso</label>
                <select [(ngModel)]="newSolicitud.vigenciaDias" name="vigenciaDias"
                        class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                  <option [ngValue]="undefined">Acceso Permanente (Sin caducidad)</option>
                  <option [ngValue]="30">Acceso Temporal — 30 días</option>
                  <option [ngValue]="60">Acceso Temporal — 60 días</option>
                  <option [ngValue]="90">Acceso Temporal — 90 días</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Motivo / Justificación *</label>
                <textarea [(ngModel)]="newSolicitud.motivo" name="motivo" required rows="3"
                          placeholder="Describe brevemente la razón por la que necesitas acceso..."
                          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"></textarea>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button type="button" (click)="showCreateModal = false"
                        class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="isSubmitting"
                        class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <span class="material-symbols-outlined text-[16px]">send</span>
                  <span>{{ isSubmitting ? 'Enviando...' : 'Enviar Solicitud' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      @if (showResolucionModal && selectedSolicitud) {
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-400">gavel</span>
                <h3 class="font-bold text-base">Evaluar Solicitud #{{ selectedSolicitud.id }}</h3>
              </div>
              <button (click)="closeResolucionModal()" class="text-slate-400 hover:text-white">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div class="p-6 space-y-4 overflow-y-auto">
              <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p><strong>Plataforma:</strong> {{ selectedSolicitud.plataforma }}</p>
                <p><strong>Solicitante:</strong> {{ getUserName(selectedSolicitud.usuarioSolicitanteId) }} ({{ getUserHandle(selectedSolicitud.usuarioSolicitanteId) }})</p>
                <p><strong>Motivo:</strong> {{ selectedSolicitud.motivo || selectedSolicitud.justificacion }}</p>
                <p><strong>Vigencia:</strong> {{ selectedSolicitud.vigenciaDias ? (selectedSolicitud.vigenciaDias + ' días') : 'Permanente' }}</p>
              </div>
              @if (hasDetalles(selectedSolicitud)) {
                <div class="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div class="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <span class="material-symbols-outlined text-[15px] text-blue-600">tune</span>
                    <span>Parámetros Técnicos Solicitados</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    @for (param of getDetallesEntries(selectedSolicitud); track param.key) {
                      <div class="p-2 bg-white rounded-lg border border-blue-100">
                        <span class="block text-[10px] font-bold text-blue-600 uppercase">{{ formatParamKey(param.key) }}</span>
                        <span class="font-mono text-xs font-semibold text-slate-800 break-all">{{ param.value }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-2">Decisión</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button"
                          (click)="resolucionAccion = 'APROBADA'"
                          [ngClass]="resolucionAccion === 'APROBADA' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 bg-white text-slate-600'"
                          class="p-3 rounded-lg border text-xs flex items-center justify-center gap-2 transition-all">
                    <span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                    <span>Aprobar Acceso</span>
                  </button>
                  <button type="button"
                          (click)="resolucionAccion = 'RECHAZADA'"
                          [ngClass]="resolucionAccion === 'RECHAZADA' ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold' : 'border-slate-200 bg-white text-slate-600'"
                          class="p-3 rounded-lg border text-xs flex items-center justify-center gap-2 transition-all">
                    <span class="material-symbols-outlined text-[18px] text-rose-600">cancel</span>
                    <span>Rechazar Acceso</span>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Comentario de Resolución <span class="text-rose-600">*</span>
                </label>
                <textarea [(ngModel)]="resolucionComentario"
                          rows="3"
                          placeholder="Indica el motivo de la aprobación o rechazo..."
                          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"></textarea>
              </div>

              @if (resolucionError) {
                <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {{ resolucionError }}
                </div>
              }

              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button type="button" (click)="closeResolucionModal()"
                        class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="button"
                        (click)="submitResolucion()"
                        [disabled]="isSubmitting || resolucionComentario.trim().length < 5"
                        [ngClass]="resolucionAccion === 'APROBADA' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'"
                        class="px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <span class="material-symbols-outlined text-[16px]">check</span>
                  <span>{{ isSubmitting ? 'Guardando...' : (resolucionAccion === 'APROBADA' ? 'Confirmar Aprobación' : 'Confirmar Rechazo') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      @if (showDetallesModal && selectedSolicitud) {
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">info</span>
                <h3 class="font-bold text-sm">Detalles de Solicitud #{{ selectedSolicitud.id }}</h3>
              </div>
              <button (click)="showDetallesModal = false" class="text-slate-400 hover:text-white">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div class="p-5 space-y-3">
              <div class="text-xs space-y-1 text-slate-700">
                <p><strong>Plataforma:</strong> {{ selectedSolicitud.plataforma }}</p>
                <p><strong>Solicitante:</strong> {{ getUserName(selectedSolicitud.usuarioSolicitanteId) }} ({{ getUserHandle(selectedSolicitud.usuarioSolicitanteId) }})</p>
                <p><strong>Estado:</strong> {{ selectedSolicitud.estado }}</p>
                <p><strong>Motivo:</strong> {{ selectedSolicitud.motivo || selectedSolicitud.justificacion }}</p>
                <p><strong>Vigencia:</strong> {{ selectedSolicitud.vigenciaDias ? (selectedSolicitud.vigenciaDias + ' días') : 'Permanente' }}</p>
                @if (selectedSolicitud.comentarioResolucion) {
                  <p><strong>Resolución:</strong> {{ selectedSolicitud.comentarioResolucion }}</p>
                }
              </div>

              @if (hasDetalles(selectedSolicitud)) {
                <div class="pt-3 border-t border-slate-100">
                  <span class="text-[11px] font-bold text-slate-800 block mb-2">Parámetros Técnicos Específicos:</span>
                  <div class="space-y-1.5 text-xs">
                    @for (param of getDetallesEntries(selectedSolicitud); track param.key) {
                      <div class="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                        <span class="font-semibold text-slate-600">{{ formatParamKey(param.key) }}:</span>
                        <span class="font-mono text-slate-800">{{ param.value }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <div class="pt-3 border-t border-slate-100 flex justify-end">
                <button type="button" (click)="showDetallesModal = false"
                        class="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SolicitudesComponent implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly plataformaService = inject(PlataformaService);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);

  solicitudes: Solicitud[] = [];
  plataformas: Plataforma[] = [];
  filterState: 'TODAS' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' = 'TODAS';
  searchQuery = '';

  showCreateModal = false;
  isSubmitting = false;
  createError = '';
  newSolicitud: Solicitud = {
    plataforma: '',
    usuarioSolicitanteId: 1,
    motivo: '',
    vigenciaDias: undefined,
    detallesServicio: {}
  };
  newDetalles: Record<string, any> = {};

  showResolucionModal = false;
  showDetallesModal = false;
  selectedSolicitud: Solicitud | null = null;
  resolucionAccion: 'APROBADA' | 'RECHAZADA' = 'APROBADA';
  resolucionComentario = '';
  resolucionError = '';
  userMap = new Map<number, { name: string, username: string }>();

  ngOnInit(): void {
    this.loadSolicitudes();
    this.loadPlataformas();
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.userMap.clear();
        for (const u of users) {
          const fullName = (u.nombres && u.apellidos) ? `${u.nombres} ${u.apellidos}`.trim() : (u.username || `Usuario #${u.id}`);
          this.userMap.set(u.id, { name: fullName, username: u.username || '' });
        }
      },
      error: () => {}
    });
  }

  getUserName(id: number | undefined): string {
    if (!id) return '-';
    const u = this.userMap.get(id);
    return u ? u.name : `Usuario #${id}`;
  }

  getUserHandle(id: number | undefined): string {
    if (!id) return '';
    const u = this.userMap.get(id);
    return u && u.username ? `@${u.username}` : '';
  }

  getUserInitials(id: number | undefined): string {
    if (!id) return '?';
    const u = this.userMap.get(id);
    if (u && u.name) {
      const parts = u.name.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return u.name.substring(0, 2).toUpperCase();
    }
    return `#${id}`;
  }

  loadSolicitudes(): void {
    const session = this.authService.getUserSession();
    const usuarioId = (this.authService.isSolicitante() && session?.id) ? session.id : undefined;

    this.solicitudService.getSolicitudes(usuarioId).subscribe({
      next: (data) => {
        this.solicitudes = data;
      },
      error: (err) => console.error('Error al cargar solicitudes', err)
    });
  }

  loadPlataformas(): void {
    this.plataformaService.getPlataformas(true).subscribe({
      next: (data) => {
        this.plataformas = data;

        this.route.queryParams.subscribe(params => {
          if (params['plataforma']) {
            this.openCreateModal(params['plataforma']);
          }
        });
      },
      error: () => {}
    });
  }

  get currentSelectedPlataforma(): Plataforma | undefined {
    return this.plataformas.find(p => p.nombre === this.newSolicitud.plataforma);
  }

  onPlataformaChanged(): void {
    this.newDetalles = {};
    const plat = this.currentSelectedPlataforma;
    if (plat && plat.camposPersonalizados) {
      for (const campo of plat.camposPersonalizados) {
        this.newDetalles[campo.id] = (campo.tipo === 'select' && campo.opciones && campo.opciones.length > 0)
          ? campo.opciones[0]
          : '';
      }
    }
  }

  get filteredSolicitudes(): Solicitud[] {
    return this.solicitudes.filter(s => {
      const matchState = this.filterState === 'TODAS' || s.estado === this.filterState;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        s.plataforma.toLowerCase().includes(q) ||
        (s.motivo && s.motivo.toLowerCase().includes(q)) ||
        (s.justificacion && s.justificacion.toLowerCase().includes(q)) ||
        (s.comentarioResolucion && s.comentarioResolucion.toLowerCase().includes(q));
      return matchState && matchQuery;
    });
  }

  countByState(state: string): number {
    return this.solicitudes.filter(s => s.estado === state).length;
  }

  openCreateModal(preselectedPlat?: string): void {
    const session = this.authService.getUserSession();
    const platNombre = preselectedPlat || (this.plataformas.length > 0 ? this.plataformas[0].nombre : '');
    this.newSolicitud = {
      plataforma: platNombre,
      usuarioSolicitanteId: session?.id || 1,
      motivo: '',
      vigenciaDias: undefined,
      detallesServicio: {}
    };
    this.onPlataformaChanged();
    this.createError = '';
    this.showCreateModal = true;
  }

  onCreateSolicitud(): void {
    if (!this.newSolicitud.plataforma || !this.newSolicitud.motivo) {
      this.createError = 'Por favor selecciona la plataforma e ingresa el motivo general.';
      return;
    }

    const plat = this.currentSelectedPlataforma;
    if (plat && plat.camposPersonalizados) {
      for (const campo of plat.camposPersonalizados) {
        const val = this.newDetalles[campo.id];
        if (campo.requerido && (!val || !val.toString().trim())) {
          this.createError = `El parámetro "${campo.etiqueta}" es obligatorio para ${plat.nombre}.`;
          return;
        }
      }
    }

    this.newSolicitud.detallesServicio = this.newDetalles;
    this.isSubmitting = true;
    this.createError = '';

    this.solicitudService.crearSolicitud(this.newSolicitud).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showCreateModal = false;
        this.loadSolicitudes();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.createError = err?.error?.message || 'Error al registrar la solicitud.';
      }
    });
  }

  openResolucionModal(sol: Solicitud): void {
    this.selectedSolicitud = sol;
    this.resolucionAccion = 'APROBADA';
    this.resolucionComentario = '';
    this.resolucionError = '';
    this.showResolucionModal = true;
  }

  closeResolucionModal(): void {
    this.showResolucionModal = false;
    this.selectedSolicitud = null;
  }

  openDetallesModal(sol: Solicitud): void {
    this.selectedSolicitud = sol;
    this.showDetallesModal = true;
  }

  submitResolucion(): void {
    if (!this.selectedSolicitud || !this.selectedSolicitud.id) return;

    if (this.resolucionComentario.trim().length < 5) {
      this.resolucionError = 'Por favor ingresa un comentario de al menos 5 caracteres.';
      return;
    }

    this.isSubmitting = true;
    this.resolucionError = '';

    const req$ = this.resolucionAccion === 'APROBADA'
      ? this.solicitudService.aprobarSolicitud(this.selectedSolicitud.id, this.resolucionComentario.trim())
      : this.solicitudService.rechazarSolicitud(this.selectedSolicitud.id, this.resolucionComentario.trim());

    req$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeResolucionModal();
        this.loadSolicitudes();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.resolucionError = err?.error?.message || 'Error al procesar la solicitud.';
      }
    });
  }

  hasDetalles(item: Solicitud | null): boolean {
    if (!item || !item.detallesServicio) return false;
    return Object.keys(item.detallesServicio).length > 0;
  }

  getDetallesEntries(item: Solicitud | null): { key: string; value: any }[] {
    if (!item || !item.detallesServicio) return [];
    return Object.entries(item.detallesServicio).map(([key, value]) => ({ key, value }));
  }

  formatParamKey(key: string): string {
    return key.replace(/_/g, ' ').toUpperCase();
  }
}
