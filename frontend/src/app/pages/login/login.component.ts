import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <!-- Card Container -->
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10">
        
        <!-- Brand Header -->
        <div class="flex flex-col items-center text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-3">
            <span class="material-symbols-outlined text-[28px]">security</span>
          </div>
          <h1 class="font-bold text-2xl text-slate-900 tracking-tight">CONSEGO</h1>
          <p class="text-xs text-slate-500 mt-1">Control, Seguridad y Gobernanza</p>
        </div>

        <!-- Form Title -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-slate-900">Iniciar Sesión</h2>
          <p class="text-xs text-slate-500 mt-1">Ingresa tus credenciales para acceder a la plataforma.</p>
        </div>

        <!-- Login Error Message -->
        @if (loginError) {
          <div class="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span class="material-symbols-outlined text-base shrink-0">error</span>
            <span>{{ loginError }}</span>
          </div>
        }

        <!-- Login Form -->
        <form (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Usuario o Correo Electrónico</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">alternate_email</span>
              <input type="text"
                     name="loginUsername"
                     [(ngModel)]="loginData.username"
                     required
                     placeholder="ej. admin o usuario@empresa.com"
                     class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">lock</span>
              <input [type]="showLoginPass ? 'text' : 'password'"
                     name="loginPassword"
                     [(ngModel)]="loginData.password"
                     required
                     placeholder="••••••••"
                     class="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all">
              <button type="button" (click)="showLoginPass = !showLoginPass"
                      class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                <span class="material-symbols-outlined text-[18px]">{{ showLoginPass ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" [(ngModel)]="rememberMe" name="remember" class="rounded border-slate-300 text-blue-600">
              <span>Recordar sesión</span>
            </label>
          </div>

          <button type="submit"
                  [disabled]="isLoadingLogin"
                  class="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            @if (isLoadingLogin) {
              <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Iniciando sesión...</span>
            } @else {
              <span class="material-symbols-outlined text-[18px]">login</span>
              <span>Iniciar Sesión</span>
            }
          </button>
        </form>

        <!-- Divider & Register Callout -->
        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <p class="text-xs text-slate-500 mb-3">¿Aún no tienes una cuenta?</p>
          <a routerLink="/register"
             class="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors">
            <span class="material-symbols-outlined text-[16px]">person_add</span>
            <span>Crear una cuenta</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginData: AuthRequest = { username: '', password: '' };
  rememberMe = true;
  showLoginPass = false;

  isLoadingLogin = false;
  loginError = '';

  onLogin(): void {
    if (!this.loginData.username || !this.loginData.password) {
      this.loginError = 'Por favor ingresa tu usuario o correo electrónico y contraseña.';
      return;
    }

    this.isLoadingLogin = true;
    this.loginError = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoadingLogin = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoadingLogin = false;
        this.loginError = err?.error?.mensaje || 'Usuario o contraseña incorrectos.';
      }
    });
  }
}
