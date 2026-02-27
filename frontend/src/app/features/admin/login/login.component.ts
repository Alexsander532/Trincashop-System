import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card glass animate-fade-in-up">
        
        <div class="login-header">
          <img src="assets/logo.png" alt="TrincaShop Logo" class="login-logo">
          <h2>Acesso Restrito</h2>
          <p>Painel Administrativo</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" formControlName="email" class="form-control" placeholder="admin@trincashop.com" autocomplete="email">
            <small *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error-text">
              E-mail inválido
            </small>
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <div class="input-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" class="form-control" placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <small *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-text">
              Senha obrigatória
            </small>
          </div>

          <div *ngIf="error" class="error-alert">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid || loading" [class.processing]="loading">
            <span *ngIf="loading" class="loader-inline"></span>
            <span *ngIf="!loading">Entrar no Painel</span>
          </button>
          
          <div class="back-link">
            <a href="/">← Voltar para a loja</a>
          </div>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      /* Background animado da loja para context admin */
      background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(230, 57, 70, 0.05) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 50% at 80% 90%, rgba(37, 99, 235, 0.05) 0%, transparent 60%);
      background-color: var(--color-bg);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-logo {
      height: 64px;
      margin-bottom: 16px;
    }

    .login-header h2 {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 4px;
    }

    .login-header p {
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-text);
    }

    .form-control {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 1rem;
      transition: all var(--transition-fast);
      outline: none;
    }

    .form-control:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-glow);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper .form-control {
      padding-right: 44px;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      color: var(--color-text-secondary);
      transition: color var(--transition-fast);
    }

    .toggle-password:hover {
      color: var(--color-primary);
    }

    .error-text {
      color: var(--color-danger);
      font-size: 0.8rem;
      margin-top: 4px;
      display: block;
    }

    .error-alert {
      background: var(--color-danger-glow);
      color: var(--color-danger);
      padding: 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
      font-size: 0.9rem;
      text-align: center;
      font-weight: 500;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .btn-block {
      width: 100%;
      padding: 14px;
      font-size: 1rem;
    }

    .btn-block:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn.processing {
      transform: scale(0.98);
    }

    .loader-inline {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    .back-link {
      text-align: center;
      margin-top: 24px;
    }

    .back-link a {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .back-link a:hover {
      color: var(--color-primary);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.erro || 'Erro ao realizar login. Verifique suas credenciais.';
      }
    });
  }
}
