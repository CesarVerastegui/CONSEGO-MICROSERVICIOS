import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlataformaService } from '../../services/plataforma.service';
import { AuthService } from '../../services/auth.service';
import { Plataforma, CampoPersonalizado } from '../../models/plataforma.models';

@Component({
  selector: 'app-plataformas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Servicios y Plataformas</h1>
          <p class="text-sm text-slate-500 mt-1">
            Administra los servicios disponibles y define parámetros específicos dinámicos para cada uno.
          </p>
        </div>

        @if (authService.isAdmin()) {
          <button (click)="openCreateModal()"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">add</span>
            <span>Nuevo Servicio / Plataforma</span>
          </button>
        }
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-surface-card p-4 rounded-xl border border-border-default shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button (click)="selectedCategory = 'TODAS'"
                  [ngClass]="selectedCategory === 'TODAS' ? 'bg-primary-midnight text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Todas ({{ plataformas.length }})
          </button>
          <button (click)="selectedCategory = 'Cloud & Infraestructura'"
                  [ngClass]="selectedCategory === 'Cloud & Infraestructura' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Cloud & Infraestructura
          </button>
          <button (click)="selectedCategory = 'Seguridad & Redes'"
                  [ngClass]="selectedCategory === 'Seguridad & Redes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Seguridad & Redes
          </button>
          <button (click)="selectedCategory = 'DevOps & CI/CD'"
                  [ngClass]="selectedCategory === 'DevOps & CI/CD' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            DevOps & CI/CD
          </button>
          <button (click)="selectedCategory = 'Base de Datos'"
                  [ngClass]="selectedCategory === 'Base de Datos' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            Base de Datos
          </button>
          <button (click)="selectedCategory = 'SaaS Empresarial'"
                  [ngClass]="selectedCategory === 'SaaS Empresarial' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0">
            SaaS Empresarial
          </button>
        </div>

        <div class="relative w-full md:w-64">
          <span class="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Buscar por nombre o descripción..."
                 class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
        </div>
      </div>

      <!-- PLATFORMS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (item of filteredPlataformas; track item.id) {
          <div class="bg-surface-card rounded-xl border border-border-default shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <!-- Top Row: Icon, Title & Criticality -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[22px]">{{ item.icono || 'cloud' }}</span>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <!-- Criticality Badge -->
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-rose-100 text-rose-800 border border-rose-200': item.criticidad === 'CRITICA',
                          'bg-amber-100 text-amber-800 border border-amber-200': item.criticidad === 'ALTA',
                          'bg-blue-100 text-blue-800 border border-blue-200': item.criticidad === 'MEDIA',
                          'bg-slate-100 text-slate-700 border border-slate-200': item.criticidad === 'BAJA'
                        }">
                    {{ item.criticidad }}
                  </span>
                  <!-- Active status -->
                  <span class="text-[11px] flex items-center gap-1"
                        [ngClass]="item.activa ? 'text-emerald-600' : 'text-slate-400'">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="item.activa ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                    {{ item.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>
              </div>

              <!-- Name & Category -->
              <h3 class="font-bold text-base text-slate-900 leading-snug">{{ item.nombre }}</h3>
              <p class="text-xs text-blue-600 font-medium mt-0.5">{{ item.categoria }}</p>

              <!-- Description -->
              <p class="text-xs text-slate-600 mt-2.5 line-clamp-2">
                {{ item.descripcion || 'Sin descripción disponible.' }}
              </p>

              <!-- Dynamic Fields Badge List -->
              @if (item.camposPersonalizados && item.camposPersonalizados.length > 0) {
                <div class="mt-3.5 pt-3 border-t border-slate-100">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1.5">
                    <span class="material-symbols-outlined text-[14px] text-blue-500">tune</span>
                    Parámetros requeridos ({{ item.camposPersonalizados.length }}):
                  </span>
                  <div class="flex flex-wrap gap-1">
                    @for (c of item.camposPersonalizados; track c.id) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                            [title]="'Tipo: ' + c.tipo + (c.placeholder ? ' | ' + c.placeholder : '')">
                        {{ c.etiqueta }}
                        @if (c.requerido) { <span class="text-rose-500 ml-0.5 font-bold">*</span> }
                      </span>
                    }
                  </div>
                </div>
              } @else {
                <div class="mt-3.5 pt-3 border-t border-slate-100">
                  <span class="text-[11px] text-slate-400 italic flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">info</span>
                    Sin parámetros técnicos específicos
                  </span>
                </div>
              }
            </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
              <span class="text-[11px] font-mono text-slate-400">ID: #{{ item.id }}</span>

              <div class="flex items-center gap-2">
                @if (authService.isAdmin()) {
                  <!-- Edit Platform Button -->
                  <button (click)="openEditModal(item)"
                          title="Editar plataforma y parámetros"
                          class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs transition-colors">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </button>

                  <!-- Toggle Active Status -->
                  <button (click)="toggleEstado(item)"
                          [title]="item.activa ? 'Desactivar plataforma' : 'Activar plataforma'"
                          class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs transition-colors">
                    <span class="material-symbols-outlined text-[16px]">{{ item.activa ? 'toggle_on' : 'toggle_off' }}</span>
                  </button>
                }

                <!-- Solicitar Acceso Button -->
                <button (click)="solicitarAcceso(item)"
                        [disabled]="!item.activa"
                        class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center gap-1 disabled:opacity-40 shadow-xs">
                  <span class="material-symbols-outlined text-[14px]">send</span>
                  <span>Solicitar</span>
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-12 text-center text-slate-400 text-xs">
            No se encontraron plataformas o servicios registrados.
          </div>
        }
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: CREAR / EDITAR PLATAFORMA & CAMPOS DINÁMICOS             -->
      <!-- ============================================================== -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sky-400">{{ isEditing ? 'edit_note' : 'add_box' }}</span>
                <h3 class="font-bold text-base">{{ isEditing ? 'Editar Servicio / Plataforma' : 'Nuevo Servicio / Plataforma' }}</h3>
              </div>
              <button (click)="showModal = false" class="text-slate-400 hover:text-white">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form (ngSubmit)="onSavePlataforma()" class="p-6 space-y-4 overflow-y-auto">
              @if (modalError) {
                <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {{ modalError }}
                </div>
              }

              <!-- Nombre -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Servicio o Plataforma</label>
                <input type="text" [(ngModel)]="currentPlat.nombre" name="nombre" required
                       placeholder="Ej: AWS Cloud, VPN Corporativa, Jira, Oracle DB..."
                       class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
              </div>

              <!-- Categoría y Criticidad -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                  <select [(ngModel)]="currentPlat.categoria" name="categoria" required
                          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="Cloud & Infraestructura">Cloud & Infraestructura</option>
                    <option value="Seguridad & Redes">Seguridad & Redes</option>
                    <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                    <option value="Base de Datos">Base de Datos</option>
                    <option value="SaaS Empresarial">SaaS Empresarial</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Criticidad</label>
                  <select [(ngModel)]="currentPlat.criticidad" name="criticidad" required
                          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="CRITICA">Crítica</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
              </div>

              <!-- Icono y Descripción -->
              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-1">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Icono Material</label>
                  <input type="text" [(ngModel)]="currentPlat.icono" name="icono"
                         placeholder="cloud, vpn_key, terminal..."
                         class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs">
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
                  <input type="text" [(ngModel)]="currentPlat.descripcion" name="descripcion"
                         placeholder="Breve propósito de acceso a este servicio..."
                         class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                </div>
              </div>

              <!-- ======================================================== -->
              <!-- GESTOR DE PARÁMETROS DINÁMICOS (SCHEMALESS)               -->
              <!-- ======================================================== -->
              <div class="pt-3 border-t border-slate-200">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px] text-blue-600">tune</span>
                      Parámetros Específicos Requeridos
                    </h4>
                    <p class="text-[11px] text-slate-500">
                      Define qué datos técnicos se le solicitarán al usuario al pedir acceso a este servicio.
                    </p>
                  </div>
                </div>

                <!-- Plantillas Rápidas -->
                <div class="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span class="text-[10px] text-slate-400 font-medium">Plantillas:</span>
                  <button type="button" (click)="applyTemplate('aws')"
                          class="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors">
                    + AWS (Rol, Región, Ambiente)
                  </button>
                  <button type="button" (click)="applyTemplate('vpn')"
                          class="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors">
                    + VPN (IP Host, Puerto, Segmento)
                  </button>
                  <button type="button" (click)="applyTemplate('db')"
                          class="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors">
                    + BD (Schema, Privilegios)
                  </button>
                </div>

                <!-- Lista de Campos Configurados -->
                <div class="space-y-2 mb-3">
                  @for (campo of currentPlat.camposPersonalizados; track campo.id; let idx = $index) {
                    <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div class="flex items-center gap-2">
                        <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                          {{ idx + 1 }}
                        </span>
                        <div>
                          <div class="font-semibold text-slate-800">
                            {{ campo.etiqueta }}
                            @if (campo.requerido) { <span class="text-rose-500 font-bold">*</span> }
                          </div>
                          <div class="text-[10px] font-mono text-slate-500">
                            ID: {{ campo.id }} | Tipo: {{ campo.tipo }} {{ campo.placeholder ? '| Ej: ' + campo.placeholder : '' }}
                          </div>
                        </div>
                      </div>
                      <button type="button" (click)="removeCampo(idx)"
                              class="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                              title="Eliminar campo">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  } @empty {
                    <div class="p-3 text-center rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs">
                      No hay campos específicos definidos aún. El usuario solo completará el motivo general.
                    </div>
                  }
                </div>

                <!-- Formulario para Agregar Nuevo Campo -->
                <div class="p-3 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                  <div class="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">add_circle</span>
                    <span>Agregar Nuevo Campo Técnico</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-600 mb-0.5">Etiqueta del Campo *</label>
                      <input type="text" [(ngModel)]="newCampo.etiqueta" name="newCampoEtiqueta"
                             placeholder="ej. IP de Host o Rol IAM"
                             class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white">
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-600 mb-0.5">Tipo de Control</label>
                      <select [(ngModel)]="newCampo.tipo" name="newCampoTipo"
                              class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white">
                        <option value="text">Texto simple</option>
                        <option value="select">Menú desplegable</option>
                        <option value="textarea">Área de texto</option>
                        <option value="number">Número</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-600 mb-0.5">Texto de Ayuda / Placeholder</label>
                      <input type="text" [(ngModel)]="newCampo.placeholder" name="newCampoPlaceholder"
                             placeholder="ej. 10.200.4.15"
                             class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white">
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-600 mb-0.5">Opciones (si es desplegable, separadas por coma)</label>
                      <input type="text" [(ngModel)]="newCampoOpcionesStr" name="newCampoOpciones"
                             placeholder="ej. Desarrollo, Staging, Producción"
                             class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white">
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-1">
                    <label class="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" [(ngModel)]="newCampo.requerido" name="newCampoRequerido"
                             class="rounded text-blue-600">
                      <span>Campo Obligatorio</span>
                    </label>

                    <button type="button" (click)="addCampo()"
                            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors">
                      <span class="material-symbols-outlined text-[14px]">add</span>
                      <span>Agregar Campo</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer Modal Actions -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button type="button" (click)="showModal = false"
                        class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="isSubmitting"
                        class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <span class="material-symbols-outlined text-[16px]">save</span>
                  <span>{{ isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Plataforma') }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class PlataformasComponent implements OnInit {
  private readonly plataformaService = inject(PlataformaService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  plataformas: Plataforma[] = [];
  selectedCategory = 'TODAS';
  searchQuery = '';

  showModal = false;
  isEditing = false;
  isSubmitting = false;
  modalError = '';

  currentPlat: Plataforma = {
    nombre: '',
    categoria: 'Cloud & Infraestructura',
    criticidad: 'ALTA',
    descripcion: '',
    icono: 'cloud',
    activa: true,
    camposPersonalizados: []
  };

  // Buffer para agregar un nuevo campo dinámico
  newCampo: CampoPersonalizado = {
    id: '',
    etiqueta: '',
    tipo: 'text',
    placeholder: '',
    requerido: true,
    opciones: []
  };
  newCampoOpcionesStr = '';

  ngOnInit(): void {
    this.loadPlataformas();
  }

  loadPlataformas(): void {
    this.plataformaService.getPlataformas().subscribe({
      next: (data) => this.plataformas = data,
      error: (err) => console.error('Error al cargar plataformas', err)
    });
  }

  get filteredPlataformas(): Plataforma[] {
    return this.plataformas.filter(p => {
      const matchCat = this.selectedCategory === 'TODAS' || p.categoria === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentPlat = {
      nombre: '',
      categoria: 'Cloud & Infraestructura',
      criticidad: 'ALTA',
      descripcion: '',
      icono: 'cloud',
      activa: true,
      camposPersonalizados: []
    };
    this.resetNewCampo();
    this.modalError = '';
    this.showModal = true;
  }

  openEditModal(plat: Plataforma): void {
    this.isEditing = true;
    this.currentPlat = JSON.parse(JSON.stringify(plat));
    if (!this.currentPlat.camposPersonalizados) {
      this.currentPlat.camposPersonalizados = [];
    }
    this.resetNewCampo();
    this.modalError = '';
    this.showModal = true;
  }

  resetNewCampo(): void {
    this.newCampo = {
      id: '',
      etiqueta: '',
      tipo: 'text',
      placeholder: '',
      requerido: true,
      opciones: []
    };
    this.newCampoOpcionesStr = '';
  }

  addCampo(): void {
    if (!this.newCampo.etiqueta.trim()) {
      return;
    }
    const idGenerado = this.newCampo.etiqueta
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || ('campo_' + Date.now());

    let opciones: string[] | undefined = undefined;
    if (this.newCampo.tipo === 'select' && this.newCampoOpcionesStr.trim()) {
      opciones = this.newCampoOpcionesStr.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (!this.currentPlat.camposPersonalizados) {
      this.currentPlat.camposPersonalizados = [];
    }

    this.currentPlat.camposPersonalizados.push({
      id: idGenerado,
      etiqueta: this.newCampo.etiqueta.trim(),
      tipo: this.newCampo.tipo,
      placeholder: this.newCampo.placeholder?.trim() || '',
      requerido: this.newCampo.requerido,
      opciones: opciones
    });

    this.resetNewCampo();
  }

  removeCampo(index: number): void {
    if (this.currentPlat.camposPersonalizados) {
      this.currentPlat.camposPersonalizados.splice(index, 1);
    }
  }

  applyTemplate(type: 'aws' | 'vpn' | 'db'): void {
    if (!this.currentPlat.camposPersonalizados) {
      this.currentPlat.camposPersonalizados = [];
    }
    if (type === 'aws') {
      this.currentPlat.camposPersonalizados.push(
        { id: 'recurso_rol', etiqueta: 'Recurso / Rol IAM', tipo: 'text', placeholder: 'arn:aws:iam::... o bucket', requerido: true },
        { id: 'region_aws', etiqueta: 'Región AWS', tipo: 'select', opciones: ['us-east-1 (N. Virginia)', 'us-west-2 (Oregon)', 'sa-east-1 (São Paulo)'], requerido: true },
        { id: 'ambiente', etiqueta: 'Ambiente', tipo: 'select', opciones: ['Desarrollo', 'Staging', 'Producción'], requerido: true }
      );
    } else if (type === 'vpn') {
      this.currentPlat.camposPersonalizados.push(
        { id: 'ip_host', etiqueta: 'Dirección IP / Host', tipo: 'text', placeholder: '10.200.4.15 o subred', requerido: true },
        { id: 'puerto_servicio', etiqueta: 'Puerto / Protocolo', tipo: 'text', placeholder: 'SSH 22, HTTPS 443', requerido: true },
        { id: 'segmento_red', etiqueta: 'Segmento de Red', tipo: 'select', opciones: ['Red Interna Corporativa', 'Zona DMZ Servidores'], requerido: true }
      );
    } else if (type === 'db') {
      this.currentPlat.camposPersonalizados.push(
        { id: 'esquema_bd', etiqueta: 'Esquema / Base de Datos', tipo: 'text', placeholder: 'PROD_SCHEMA_ORDERS', requerido: true },
        { id: 'tipo_privilegio', etiqueta: 'Privilegios SQL', tipo: 'select', opciones: ['Solo Lectura (SELECT)', 'Escritura (DML)', 'DBA (DDL)'], requerido: true }
      );
    }
  }

  onSavePlataforma(): void {
    if (!this.currentPlat.nombre.trim()) {
      this.modalError = 'El nombre de la plataforma es obligatorio.';
      return;
    }

    this.isSubmitting = true;
    this.modalError = '';

    const obs = (this.isEditing && this.currentPlat.id)
      ? this.plataformaService.actualizarPlataforma(this.currentPlat.id, this.currentPlat)
      : this.plataformaService.crearPlataforma(this.currentPlat);

    obs.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showModal = false;
        this.loadPlataformas();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.modalError = err?.error?.message || 'Error al guardar la plataforma.';
      }
    });
  }

  toggleEstado(plat: Plataforma): void {
    if (!plat.id) return;
    this.plataformaService.toggleEstado(plat.id, !plat.activa).subscribe({
      next: (updated) => {
        plat.activa = updated.activa;
      },
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }

  solicitarAcceso(plat: Plataforma): void {
    this.router.navigate(['/solicitudes'], { queryParams: { plataforma: plat.nombre } });
  }
}
