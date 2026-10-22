import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthRequest } from '../../models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10 my-8">
        <div class="flex flex-col items-center text-center mb-6">
          <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-3">
            <span class="material-symbols-outlined text-[28px]">security</span>
          </div>
          <h1 class="font-bold text-2xl text-slate-900 tracking-tight">CONSEGO</h1>
          <p class="text-xs text-slate-500 mt-1">Control, Seguridad y Gobernanza</p>
        </div>
        <div class="mb-5">
          <h2 class="text-xl font-bold text-slate-900">Crear una Cuenta</h2>
          <p class="text-xs text-slate-500 mt-1">Solicita tu cuenta de acceso como Solicitante.</p>
        </div>
        <div class="mb-5 p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex gap-2.5">
          <span class="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">verified_user</span>
          <div class="text-[11px] leading-relaxed">
            <strong class="font-semibold text-amber-950">Flujo de Aprobación Obligatoria:</strong> Al registrarte, tu cuenta quedará en estado preliminar (pendiente de aprobación) hasta que un Administrador del sistema la valide y active.
          </div>
        </div>
        @if (registerSuccess) {
          <div class="mb-5 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3">
            <div class="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <span class="material-symbols-outlined text-xl">check_circle</span>
              <span>¡Registro Preliminar Exitoso!</span>
            </div>
            <p class="leading-relaxed text-emerald-800">
              {{ registerSuccess }}
            </p>
            <div class="p-3 bg-white/80 rounded-lg border border-emerald-100 text-[11px] text-emerald-900">
              <strong>Próximo paso:</strong> Comunícate con tu administrador para que active tu usuario desde la consola de gestión IAM.
            </div>
            <div class="pt-2">
              <a routerLink="/login"
                 class="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors">
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Ir al Inicio de Sesión</span>
              </a>
            </div>
          </div>
        }
        @if (registerError) {
          <div class="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span class="material-symbols-outlined text-base shrink-0">error</span>
            <span>{{ registerError }}</span>
          </div>
        }
        @if (!registerSuccess) {
          <form (ngSubmit)="onRegister()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Nombres <span class="text-rose-600">*</span></label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">badge</span>
                  <input type="text"
                         name="regNombres"
                         [(ngModel)]="registerData.nombres"
                         required
                         placeholder="ej. Juan Carlos"
                         class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Apellidos <span class="text-rose-600">*</span></label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">badge</span>
                  <input type="text"
                         name="regApellidos"
                         [(ngModel)]="registerData.apellidos"
                         required
                         placeholder="ej. Pérez Gómez"
                         class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico <span class="text-rose-600">*</span></label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">mail</span>
                <input type="email"
                       name="regCorreo"
                       [(ngModel)]="registerData.correo"
                       required
                       placeholder="usuario@empresa.com"
                       class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre de Usuario <span class="text-rose-600">*</span></label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">alternate_email</span>
                <input type="text"
                       name="regUsername"
                       [(ngModel)]="registerData.username"
                       required
                       placeholder="ej. jperez"
                       class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Contraseña <span class="text-rose-600">*</span></label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">key</span>
                  <input type="password"
                         name="regPassword"
                         [(ngModel)]="registerData.password"
                         required
                         placeholder="Mínimo 5 caracteres"
                         class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Confirmar <span class="text-rose-600">*</span></label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">lock_reset</span>
                  <input type="password"
                         name="regConfirmPassword"
                         [(ngModel)]="confirmPassword"
                         required
                         placeholder="Repite la contraseña"
                         class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
                </div>
              </div>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span class="text-slate-500">Rol asignado:</span>
              <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[11px]">
                Solicitante (Acceso preliminar)
              </span>
            </div>

            <button type="submit"
                    [disabled]="isLoadingRegister"
                    class="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              @if (isLoadingRegister) {
                <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Registrando solicitud...</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                <span>Enviar Registro Preliminar</span>
              }
            </button>
          </form>
        }
        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <p class="text-xs text-slate-500 mb-3">¿Ya tienes una cuenta admitida?</p>
          <a routerLink="/login"
             class="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors">
            <span class="material-symbols-outlined text-[16px]">login</span>
            <span>Iniciar Sesión</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerData: AuthRequest = {
    username: '',
    correo: '',
    nombres: '',
    apellidos: '',
    password: '',
    rol: 'Solicitante'
  };
  confirmPassword = '';

  isLoadingRegister = false;
  registerError = '';
  registerSuccess = '';

  onRegister(): void {
    if (!this.registerData.nombres?.trim() ||
        !this.registerData.apellidos?.trim() ||
        !this.registerData.correo?.trim() ||
        !this.registerData.username?.trim() ||
        !this.registerData.password) {
      this.registerError = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.registerError = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.registerData.password.length < 5) {
      this.registerError = 'La contraseña debe tener al menos 5 caracteres.';
      return;
    }

    this.isLoadingRegister = true;
    this.registerError = '';
    this.registerSuccess = '';

    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.isLoadingRegister = false;
        this.registerSuccess = res.mensaje || `Tu cuenta con usuario @${this.registerData.username} ha sido registrada preliminarmente. Un administrador debe activarla antes de que puedas iniciar sesión.`;
      },
      error: (err) => {
        this.isLoadingRegister = false;
        this.registerError = err?.error?.mensaje || err?.error?.message || 'Error al registrar usuario. Verifica que el usuario o correo no estén en uso.';
      }
    });
  }
}
