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
      <!-- Title & Action Bar -->
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

      <!-- Filters & Search Toolbar -->
      <div class="bg-surface-card p-4 rounded-xl border border-border-default shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Filter Tabs -->
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

        <!-- Search Input -->
        <div class="relative w-full md:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Buscar por plataforma o motivo..."
                 class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="bg-surface-card rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Plataforma & Parámetros</th>
                <th class="py-3 px-4">Solicitante</th>
                <th class="py-3 px-4">Motivo / Justificación</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4">Vigencia</th>
                <th class="py-3 px-4">Resolución</th>
                <th class="py-3 px-4">Fecha</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of filteredSolicitudes; track item.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-900">#{{ item.id }}</td>
                  <td class="py-3.5 px-4 font-semibold text-slate-900">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[18px] text-blue-600">cloud</span>
                      <span>{{ item.plataforma }}</span>
                    </div>
                    @if (hasDetalles(item)) {
                      <div class="flex flex-wrap gap-1 mt-1.5">
                        @for (d of getDetallesEntries(item); track d.key) {
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200"
                                [title]="formatParamKey(d.key) + ': ' + d.value">
                            <strong class="mr-1">{{ d.key }}:</strong> {{ d.value }}
                          </span>
                        }
                      </div>
                    }
                  </td>
                  <td class="py-3.5 px-4 font-mono text-slate-600">
                    <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">Usuario #{{ item.usuarioSolicitanteId }}</span>
                  </td>
                  <td class="py-3.5 px-4 text-slate-700 max-w-xs truncate" [title]="item.motivo || item.justificacion || ''">
                    {{ item.motivo || item.justificacion || 'Sin motivo especificado' }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          [ngClass]="{
                            'bg-amber-50 text-amber-700 border border-amber-200': item.estado === 'PENDIENTE',
                            'bg-emerald-50 text-emerald-700 border border-emerald-200': item.estado === 'APROBADA',
                            'bg-rose-50 text-rose-700 border border-rose-200': item.estado === 'RECHAZADA'
                          }">
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                            [ngClass]="{
                              'bg-amber-500': item.estado === 'PENDIENTE',
                              'bg-emerald-500': item.estado === 'APROBADA',
                              'bg-rose-500': item.estado === 'RECHAZADA'
                            }"></span>
                      {{ item.estado }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                    @if (item.vigenciaDias) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200"
                            [title]="item.fechaCaducidad ? ('Caduca: ' + (item.fechaCaducidad | date:'dd/MM/yyyy')) : ''">
                        <span class="material-symbols-outlined text-[13px]">timer</span>
                        {{ item.vigenciaDias }} días
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        <span class="material-symbols-outlined text-[13px]">all_inclusive</span>
                        Permanente
                      </span>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-slate-600 max-w-xs">
                    @if (item.comentarioResolucion) {
                      <div class="flex items-start gap-1 text-[11px] text-slate-600">
                        <span class="material-symbols-outlined text-[14px] text-slate-400 shrink-0 mt-0.5">comment</span>
                        <span class="truncate" [title]="item.comentarioResolucion">{{ item.comentarioResolucion }}</span>
                      </div>
                    } @else {
                      <span class="text-slate-400 text-[11px]">-</span>
                    }
                  </td>
                  <td class="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {{ item.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <!-- Administrador o Auditor pueden evaluar -->
                    @if (authService.isAdmin() || authService.isAuditor()) {
                      @if (item.estado === 'PENDIENTE') {
                        <button (click)="openResolucionModal(item)"
                                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors">
                          <span class="material-symbols-outlined text-[15px]">edit_note</span>
                          <span>Evaluar</span>
                        </button>
                      } @else {
                        <button (click)="openDetallesModal(item)"
                                class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-[11px] transition-colors">
                          <span class="material-symbols-outlined text-[13px]">visibility</span>
                          <span>Ver Resuelta</span>
                        </button>
                      }
                    } @else {
                      @if (hasDetalles(item)) {
                        <button (click)="openDetallesModal(item)"
                                class="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline">
                          Ver Parámetros
                        </button>
                      } @else {
                        <span class="text-slate-400 font-mono text-[11px]">-</span>
                      }
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="py-8 text-center text-slate-400 text-xs">
                    No se encontraron solicitudes.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL 1: NUEVA SOLICITUD DE ACCESO                             -->
      <!-- ============================================================== -->
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

              <!-- Seleccionar Plataforma -->
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

              <!-- ======================================================== -->
              <!-- CAMPOS ESPECÍFICOS DINÁMICOS DEL SERVICIO SELECCIONADO   -->
              <!-- ======================================================== -->
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

              <!-- Vigencia del Acceso -->
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

              <!-- Motivo General -->
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

      <!-- ============================================================== -->
      <!-- MODAL 2: RESOLUCIÓN CON COMENTARIO (ADMIN / AUDITOR)            -->
      <!-- ============================================================== -->
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
              <!-- Info Summary -->
              <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p><strong>Plataforma:</strong> {{ selectedSolicitud.plataforma }}</p>
                <p><strong>Solicitante:</strong> Usuario #{{ selectedSolicitud.usuarioSolicitanteId }}</p>
                <p><strong>Motivo:</strong> {{ selectedSolicitud.motivo || selectedSolicitud.justificacion }}</p>
                <p><strong>Vigencia:</strong> {{ selectedSolicitud.vigenciaDias ? (selectedSolicitud.vigenciaDias + ' días') : 'Permanente' }}</p>
              </div>

              <!-- Parámetros Técnicos Específicos -->
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

              <!-- Action Selector -->
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

              <!-- Comentario Formal Obligatorio -->
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

      <!-- ============================================================== -->
      <!-- MODAL 3: VER DETALLES DE SOLICITUD                             -->
      <!-- ============================================================== -->
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

  // Modal Crear
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

  // Modal Resolución
  showResolucionModal = false;
  showDetallesModal = false;
  selectedSolicitud: Solicitud | null = null;
  resolucionAccion: 'APROBADA' | 'RECHAZADA' = 'APROBADA';
  resolucionComentario = '';
  resolucionError = '';

  ngOnInit(): void {
    this.loadSolicitudes();
    this.loadPlataformas();
  }

  loadSolicitudes(): void {
    const session = this.authService.getUserSession();
    // Confidencialidad: Solicitante solo ve sus solicitudes; Admin y Auditor ven todas
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

        // Comprobar si vino con parámetro ?plataforma=... desde Catálogo
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
