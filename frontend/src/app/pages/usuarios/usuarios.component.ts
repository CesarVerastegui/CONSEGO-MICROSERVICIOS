import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserResponse, AuthRequest } from '../../models/auth.models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p class="text-sm text-slate-500 mt-1">Control de admisión, trazabilidad de altas y roles institucionales.</p>
        </div>

        <button (click)="openCreateModal()"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all">
          <span class="material-symbols-outlined text-[18px]">person_add</span>
          <span>Nuevo Usuario</span>
        </button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div class="p-4 rounded-xl bg-surface-card border border-border-default shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase">Total Usuarios</p>
          <p class="text-2xl font-bold text-slate-900 font-mono mt-1">{{ users.length }}</p>
        </div>
        <div class="p-4 rounded-xl bg-surface-card border border-amber-300 shadow-sm bg-amber-50/40">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-amber-800 uppercase">Pendientes</p>
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </div>
          <p class="text-2xl font-bold text-amber-700 font-mono mt-1">{{ countStatus('PENDIENTE') }}</p>
        </div>
        <div class="p-4 rounded-xl bg-surface-card border border-emerald-200 shadow-sm">
          <p class="text-xs font-semibold text-emerald-700 uppercase">Aprobados</p>
          <p class="text-2xl font-bold text-emerald-600 font-mono mt-1">{{ countStatus('APROBADA') }}</p>
        </div>
        <div class="p-4 rounded-xl bg-surface-card border border-rose-200 shadow-sm">
          <p class="text-xs font-semibold text-rose-700 uppercase">Rechazados</p>
          <p class="text-2xl font-bold text-rose-600 font-mono mt-1">{{ countStatus('RECHAZADA') }}</p>
        </div>
        <div class="p-4 rounded-xl bg-surface-card border border-purple-200 shadow-sm col-span-2 sm:col-span-1">
          <p class="text-xs font-semibold text-purple-700 uppercase">Privilegiados</p>
          <p class="text-2xl font-bold text-purple-600 font-mono mt-1">{{ countPrivileged() }}</p>
        </div>
      </div>
      <div class="bg-surface-card rounded-xl border border-border-default shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-slate-900">Listado de Usuarios</h2>
            @if (countStatus('PENDIENTE') > 0) {
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                {{ countStatus('PENDIENTE') }} por admitir
              </span>
            }
          </div>

          <div class="relative w-full sm:w-72">
            <span class="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">search</span>
            <input type="text"
                   [(ngModel)]="searchQuery"
                   placeholder="Buscar por nombre, usuario o correo..."
                   class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Usuario y Nombre</th>
                <th class="py-3 px-4">Correo Electrónico</th>
                <th class="py-3 px-4">Rol</th>
                <th class="py-3 px-4">Admisión / Estado</th>
                <th class="py-3 px-4">Fechas</th>
                <th class="py-3 px-4 text-center">Cambiar Rol</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (user of filteredUsers; track user.id) {
                <tr class="hover:bg-slate-50/80 transition-colors"
                    [class.bg-amber-50]="user.estadoAdmision === 'PENDIENTE'"
                    [class.bg-rose-50]="user.estadoAdmision === 'RECHAZADA'">
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-900">#{{ user.id }}</td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {{ user.username[0] }}
                      </div>
                      <div>
                        <div class="font-semibold text-slate-900">{{ user.username }}</div>
                        <div class="text-[11px] text-slate-500">
                          {{ (user.nombres || '') + ' ' + (user.apellidos || '') | slice:0:30 }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {{ user.correo || '-' }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          [ngClass]="{
                            'bg-amber-100 text-amber-800 border border-amber-300': user.rol.toLowerCase() === 'admin',
                            'bg-purple-100 text-purple-800 border border-purple-300': user.rol.toLowerCase() === 'auditor',
                            'bg-cyan-100 text-cyan-800 border border-cyan-300': user.rol.toLowerCase() === 'solicitante'
                          }">
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                            [ngClass]="{
                              'bg-amber-500': user.rol.toLowerCase() === 'admin',
                              'bg-purple-500': user.rol.toLowerCase() === 'auditor',
                              'bg-cyan-500': user.rol.toLowerCase() === 'solicitante'
                            }"></span>
                      {{ user.rol }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
                    @if (user.estadoAdmision === 'APROBADA' || (!user.estadoAdmision && user.activo)) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Aprobado ({{ user.activo ? 'Activo' : 'Inactivo' }})
                      </span>
                    } @else if (user.estadoAdmision === 'RECHAZADA') {
                      <div>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-300">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Rechazado
                        </span>
                        @if (user.motivoRechazo) {
                          <div class="text-[10px] text-rose-600 truncate max-w-[150px] mt-0.5" [title]="user.motivoRechazo">
                            {{ user.motivoRechazo }}
                          </div>
                        }
                      </div>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pendiente
                      </span>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                    <div>Reg: {{ user.fechaRegistro ? (user.fechaRegistro | date:'dd/MM/yy HH:mm') : 'Inicial' }}</div>
                    @if (user.fechaAprobacion) {
                      <div class="text-[10px] text-emerald-700">Apr: {{ user.fechaAprobacion | date:'dd/MM/yy HH:mm' }}</div>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <div class="inline-flex rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                      <button (click)="changeRole(user, 'Solicitante')"
                              [disabled]="user.rol === 'Solicitante'"
                              [ngClass]="user.rol === 'Solicitante' ? 'bg-slate-200 text-slate-800 font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'"
                              class="px-2 py-1 text-[11px] border-r border-slate-200 transition-colors">
                        Solicitante
                      </button>
                      <button (click)="changeRole(user, 'Auditor')"
                              [disabled]="user.rol === 'Auditor'"
                              [ngClass]="user.rol === 'Auditor' ? 'bg-purple-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'"
                              class="px-2 py-1 text-[11px] border-r border-slate-200 transition-colors">
                        Auditor
                      </button>
                      <button (click)="changeRole(user, 'Admin')"
                              [disabled]="user.rol === 'Admin'"
                              [ngClass]="user.rol === 'Admin' ? 'bg-amber-500 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'"
                              class="px-2 py-1 text-[11px] transition-colors">
                        Admin
                      </button>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    @if (user.estadoAdmision === 'PENDIENTE') {
                      <div class="inline-flex items-center gap-1.5">
                        <button (click)="onAprobar(user)"
                                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors">
                          <span class="material-symbols-outlined text-[15px]">check</span>
                          <span>Aprobar</span>
                        </button>
                        <button (click)="openRechazarModal(user)"
                                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors">
                          <span class="material-symbols-outlined text-[15px]">close</span>
                          <span>Rechazar</span>
                        </button>
                      </div>
                    } @else if (user.estadoAdmision === 'RECHAZADA') {
                      <button (click)="onAprobar(user)"
                              class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold transition-colors">
                        Reconsiderar
                      </button>
                    } @else {
                      <button (click)="toggleUserStatus(user)"
                              class="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors">
                        {{ user.activo ? 'Desactivar' : 'Activar' }}
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-8 text-center text-slate-400 text-xs">
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      @if (showCreateModal) {
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div class="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-400">person_add</span>
                <h3 class="font-bold text-base">Crear Usuario en el Sistema</h3>
              </div>
              <button (click)="showCreateModal = false" class="text-slate-400 hover:text-white">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form (ngSubmit)="onCreateUser()" class="p-6 space-y-4">
              @if (createError) {
                <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {{ createError }}
                </div>
              }
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nombres <span class="text-rose-600">*</span></label>
                  <input type="text" [(ngModel)]="newUser.nombres" name="nombres" required
                         placeholder="ej. Ana María"
                         class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Apellidos <span class="text-rose-600">*</span></label>
                  <input type="text" [(ngModel)]="newUser.apellidos" name="apellidos" required
                         placeholder="ej. Silva Castro"
                         class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico <span class="text-rose-600">*</span></label>
                <input type="email" [(ngModel)]="newUser.correo" name="correo" required
                       placeholder="usuario@empresa.com"
                       class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre de Usuario <span class="text-rose-600">*</span></label>
                  <input type="text" [(ngModel)]="newUser.username" name="username" required
                         placeholder="ej. asilva"
                         class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Contraseña <span class="text-rose-600">*</span></label>
                  <input type="password" [(ngModel)]="newUser.password" name="password" required
                         placeholder="••••••••"
                         class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Rol Inicial</label>
                <select [(ngModel)]="newUser.rol" name="rol" required
                        class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                  <option value="Solicitante">Solicitante</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" (click)="showCreateModal = false"
                        class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="isSubmitting"
                        class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <span class="material-symbols-outlined text-[16px]">save</span>
                  <span>{{ isSubmitting ? 'Guardando...' : 'Guardar y Activar' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      @if (showRechazoModal && userToReject) {
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div class="p-5 bg-rose-600 text-white flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined">block</span>
                <h3 class="font-bold text-base">Rechazar Solicitud de Cuenta</h3>
              </div>
              <button (click)="closeRechazoModal()" class="text-rose-200 hover:text-white">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <p class="text-xs text-slate-600">
                Estás rechazando la admisión de <strong>&#64;{{ userToReject.username }}</strong> ({{ userToReject.correo }}). Indica el motivo formal para que quede registrado en auditoría.
              </p>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo del Rechazo <span class="text-rose-600">*</span>
                </label>
                <textarea [(ngModel)]="motivoRechazo"
                          rows="3"
                          placeholder="ej. Correo no corporativo o falta de autorización de gerencia..."
                          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"></textarea>
              </div>

              @if (rechazoError) {
                <div class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {{ rechazoError }}
                </div>
              }

              <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" (click)="closeRechazoModal()"
                        class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="button"
                        (click)="submitRechazo()"
                        [disabled]="isSubmitting || !motivoRechazo.trim()"
                        class="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <span class="material-symbols-outlined text-[16px]">cancel</span>
                  <span>{{ isSubmitting ? 'Procesando...' : 'Confirmar Rechazo' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UsuariosComponent implements OnInit {
  private readonly authService = inject(AuthService);

  users: UserResponse[] = [];
  searchQuery = '';

  showCreateModal = false;
  isSubmitting = false;
  createError = '';

  showRechazoModal = false;
  userToReject: UserResponse | null = null;
  motivoRechazo = '';
  rechazoError = '';

  newUser: AuthRequest = {
    username: '',
    correo: '',
    nombres: '',
    apellidos: '',
    password: '',
    rol: 'Solicitante'
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error al listar usuarios', err)
    });
  }

  get filteredUsers(): UserResponse[] {
    return this.users.filter(u => {
      const q = this.searchQuery.toLowerCase().trim();
      if (!q) return true;
      const fullName = `${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase();
      return (
        u.username.toLowerCase().includes(q) ||
        (u.correo && u.correo.toLowerCase().includes(q)) ||
        fullName.includes(q) ||
        u.rol.toLowerCase().includes(q) ||
        (u.estadoAdmision && u.estadoAdmision.toLowerCase().includes(q))
      );
    });
  }

  countStatus(status: string): number {
    return this.users.filter(u => {
      if (status === 'APROBADA') {
        return u.estadoAdmision === 'APROBADA' || (!u.estadoAdmision && u.activo);
      }
      return u.estadoAdmision === status;
    }).length;
  }

  countPrivileged(): number {
    return this.users.filter(u => {
      const r = u.rol.toLowerCase();
      return r === 'admin' || r === 'auditor';
    }).length;
  }

  openCreateModal(): void {
    this.newUser = {
      username: '',
      correo: '',
      nombres: '',
      apellidos: '',
      password: '',
      rol: 'Solicitante'
    };
    this.createError = '';
    this.showCreateModal = true;
  }

  onCreateUser(): void {
    if (!this.newUser.username?.trim() ||
        !this.newUser.correo?.trim() ||
        !this.newUser.nombres?.trim() ||
        !this.newUser.apellidos?.trim() ||
        !this.newUser.password) {
      this.createError = 'Todos los campos son obligatorios.';
      return;
    }

    this.isSubmitting = true;
    this.createError = '';

    this.authService.createUserAdmin(this.newUser).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showCreateModal = false;
        this.loadUsers();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.createError = err?.error?.message || err?.error?.mensaje || 'Error al crear usuario.';
      }
    });
  }

  onAprobar(user: UserResponse): void {
    this.authService.aprobarUsuario(user.id).subscribe({
      next: (res) => {
        user.activo = res.activo;
        user.estadoAdmision = res.estadoAdmision;
        user.fechaAprobacion = res.fechaAprobacion;
        user.motivoRechazo = undefined;
      },
      error: (err) => console.error('Error al aprobar usuario', err)
    });
  }

  openRechazarModal(user: UserResponse): void {
    this.userToReject = user;
    this.motivoRechazo = '';
    this.rechazoError = '';
    this.showRechazoModal = true;
  }

  closeRechazoModal(): void {
    this.showRechazoModal = false;
    this.userToReject = null;
    this.motivoRechazo = '';
  }

  submitRechazo(): void {
    if (!this.userToReject || !this.motivoRechazo.trim()) {
      this.rechazoError = 'Por favor ingresa un motivo para el rechazo.';
      return;
    }

    this.isSubmitting = true;
    this.rechazoError = '';

    this.authService.rechazarUsuario(this.userToReject.id, this.motivoRechazo.trim()).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (this.userToReject) {
          this.userToReject.activo = res.activo;
          this.userToReject.estadoAdmision = res.estadoAdmision;
          this.userToReject.motivoRechazo = res.motivoRechazo;
        }
        this.closeRechazoModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.rechazoError = err?.error?.mensaje || 'Error al rechazar usuario.';
      }
    });
  }

  changeRole(user: UserResponse, nuevoRol: string): void {
    this.authService.updateUserRole(user.id, nuevoRol).subscribe({
      next: (updated) => {
        user.rol = updated.rol;
      },
      error: (err) => console.error('Error al cambiar rol', err)
    });
  }

  toggleUserStatus(user: UserResponse): void {
    this.authService.updateUserStatus(user.id, !user.activo).subscribe({
      next: (updated) => {
        user.activo = updated.activo;
        if (updated.estadoAdmision) user.estadoAdmision = updated.estadoAdmision;
      },
      error: (err) => console.error('Error al actualizar estado', err)
    });
  }
}
