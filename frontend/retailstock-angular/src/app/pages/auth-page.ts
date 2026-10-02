import { Component, signal } from '@angular/core';
import { AuthBrandPanel } from '../components/auth/auth-brand-panel';
import { LoginForm } from '../components/auth/login-form';
import { RegisterForm } from '../components/auth/register-form';

@Component({
  selector: 'app-auth-page',
  imports: [AuthBrandPanel, LoginForm, RegisterForm],
  template: `
    <div class="grid min-h-screen bg-slate-50 lg:grid-cols-2 font-sans text-slate-800">
      <app-auth-brand-panel />

      <div class="flex items-center justify-center px-4 py-10 sm:px-8 relative overflow-hidden">
        <!-- Subtle background pattern/blob -->
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>
        
        <div class="panel w-full max-w-md p-8 md:p-10 relative z-10 shadow-xl shadow-slate-200/50">
          <div class="mb-8">
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">
              {{ mode() === 'login' ? 'Welcome back' : 'Create your account' }}
            </h2>
            <p class="mt-2 text-sm text-slate-500 font-medium">
              {{
                mode() === 'login'
                  ? 'Sign in to manage your inventory.'
                  : 'Fill in your details to get started.'
              }}
            </p>
          </div>

          @if (mode() === 'login') {
            <app-login-form [notice]="notice()" (switchMode)="switchMode('register')" />
          } @else {
            <app-register-form (registered)="handleRegistered()" (switchMode)="switchMode('login')" />
          }
        </div>
      </div>
    </div>
  `,
})
export class AuthPage {
  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly notice = signal('');

  protected handleRegistered() {
    this.notice.set('Account created successfully. Please sign in.');
    this.mode.set('login');
  }

  protected switchMode(next: 'login' | 'register') {
    this.notice.set('');
    this.mode.set(next);
  }
}
