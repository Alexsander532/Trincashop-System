import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- GLOBAL HEADER DA LOJA -->
    <header class="app-header" *ngIf="!isAdminRoute">
      <div class="container header-content">
        <a routerLink="/" class="logo">
          <img src="assets/logo.png" alt="TrincaShop Logo" class="logo-img">
        </a>
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Produtos</a>
          <a routerLink="/admin" routerLinkActive="active">Admin</a>
          <button class="theme-toggle" (click)="toggleTheme()" title="Alternar tema">
            {{ isDarkMode ? '☀️ Claro' : '🌙 Escuro' }}
          </button>
        </nav>
      </div>
    </header>

    <!-- ADMIN TOPBAR (Somente dentro do Admin e Autorizado) -->
    <header class="admin-topbar" *ngIf="isAdminRoute && isAdminAuthenticated && !isLoginRoute">
      <div class="container header-content">
        <a routerLink="/admin" class="logo">
          <img src="assets/logo.png" alt="TrincaShop Admin" class="logo-img" style="height: 36px;">
          <span class="admin-badge">ADMIN</span>
        </a>
        <nav class="nav-links">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
          <a routerLink="/admin/produtos" routerLinkActive="active">Produtos</a>
          <a routerLink="/admin/pedidos" routerLinkActive="active">Pedidos</a>
          
          <button class="theme-toggle" (click)="toggleTheme()" title="Alternar tema">
            {{ isDarkMode ? '☀️ Claro' : '🌙 Escuro' }}
          </button>
          
          <button class="btn btn-sm btn-secondary" style="margin-left: 12px;" (click)="logout()">
            🚪 Sair
          </button>
        </nav>
      </div>
    </header>

    <div class="anti-theft-banner" *ngIf="!isAdminRoute">
      <div class="banner-track">
        <span class="banner-msg">👀 Câmeras ativas • Cada produto é rastreado</span>
        <span class="banner-msg">🔒 Sistema de segurança inteligente</span>
        <span class="banner-msg">⚡ Pagamento rápido e seguro via PIX</span>
        <span class="banner-msg">👀 Estamos te observando</span>
        <span class="banner-msg">🔒 Todos os pedidos são registrados</span>
        <span class="banner-msg">⚡ Compre com facilidade, pague com PIX</span>
      </div>
    </div>

    <main [class.admin-main]="isAdminRoute">
      <router-outlet />
    </main>

    <footer class="app-footer" *ngIf="!isAdminRoute">
      <div class="container footer-content">
        <p>© 2026 TrincaShop – Sistema de Segurança para Geladeira Inteligente</p>
      </div>
    </footer>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 14, 23, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--color-border);
    }

    [data-theme="light"] .app-header {
      background: rgba(255, 255, 255, 0.85);
    }

    .admin-topbar {
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }

    .admin-badge {
      background: var(--color-primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 10px;
      letter-spacing: 1px;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.3rem;
      font-weight: 800;
      transition: all var(--transition-normal);
    }

    .logo:hover {
      transform: scale(1.03);
    }

    .logo-img {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-links a {
      padding: 8px 14px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      border-radius: var(--radius-md);
      transition: all var(--transition-normal);
      white-space: nowrap;
    }

    .nav-links a:hover {
      color: var(--color-text);
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-links a.active {
      color: var(--color-secondary-light);
      background: var(--color-secondary-glow);
    }

    .theme-toggle {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 6px 10px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all var(--transition-normal);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 4px;
      white-space: nowrap;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--color-text-muted);
    }

    /* Banner anti-furto */
    .anti-theft-banner {
      background: linear-gradient(90deg, var(--color-primary-dark), var(--color-secondary-dark), var(--color-primary-dark));
      overflow: hidden;
      padding: 6px 0;
      position: relative;
    }

    .banner-track {
      display: flex;
      gap: 60px;
      animation: scrollBanner 30s linear infinite;
      white-space: nowrap;
    }

    .banner-msg {
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }

    @keyframes scrollBanner {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    main {
      min-height: calc(100vh - 64px - 60px);
      padding: 40px 0;
      position: relative;
      z-index: 1;
    }
    
    main.admin-main {
      padding: 0; /* Pages like Login control their own padding */
    }

    .app-footer {
      border-top: 1px solid var(--color-border);
      padding: 20px 0;
    }

    .footer-content {
      text-align: center;
    }

    .footer-content p {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    @media (max-width: 900px) {
      .header-content {
        padding: 8px 0;
        height: auto;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }
      
      .admin-topbar .header-content {
        justify-content: center;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
      }

      .nav-links a {
        padding: 6px 10px;
        font-size: 0.8rem;
      }
      
      .theme-toggle {
        padding: 4px 8px;
      }
      
      .btn-sm {
        padding: 6px 10px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isDarkMode = true;
  isAdminRoute = false;
  isLoginRoute = false;
  isAdminAuthenticated = false;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.urlAfterRedirects.startsWith('/admin');
      this.isLoginRoute = event.urlAfterRedirects.startsWith('/admin/login');
      this.isAdminAuthenticated = this.authService.isAuthenticated();
    });
  }

  ngOnInit() {
    this.isAdminAuthenticated = this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}
