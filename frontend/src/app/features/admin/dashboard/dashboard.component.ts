import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { OrderStats } from '../../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="admin-header animate-fade-in-up">
        <h1 class="admin-title">📊 Painel Administrativo</h1>
        <p class="admin-subtitle">Gerencie produtos e pedidos da TrincaShop</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card glass animate-fade-in-up stagger-1">
          <div class="stat-icon" style="background: var(--color-secondary-glow); color: var(--color-secondary);">📦</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalPedidos }}</span>
            <span class="stat-label">Total de Pedidos</span>
          </div>
        </div>

        <div class="stat-card glass animate-fade-in-up stagger-2">
          <div class="stat-icon" style="background: var(--color-amber-glow); color: var(--color-amber);">⏳</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pedidosPendentes }}</span>
            <span class="stat-label">Pendentes</span>
          </div>
        </div>

        <div class="stat-card glass animate-fade-in-up stagger-3">
          <div class="stat-icon" style="background: var(--color-success-glow); color: var(--color-success);">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pedidosPagos }}</span>
            <span class="stat-label">Pagos</span>
          </div>
        </div>

        <div class="stat-card glass animate-fade-in-up stagger-4">
          <div class="stat-icon" style="background: var(--color-primary-glow); color: var(--color-primary);">💰</div>
          <div class="stat-info">
            <span class="stat-value">R$ {{ stats.totalArrecadado.toFixed(2) }}</span>
            <span class="stat-label">Arrecadado</span>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links animate-fade-in-up stagger-5">
        <a routerLink="/admin/produtos" class="quick-link glass">
          <span class="ql-icon">🏷️</span>
          <span class="ql-text">
            <strong>Gestão de Produtos</strong>
            <small>Adicionar, editar e desativar produtos</small>
          </span>
          <span class="ql-arrow">→</span>
        </a>
        <a routerLink="/admin/pedidos" class="quick-link glass">
          <span class="ql-icon">📋</span>
          <span class="ql-text">
            <strong>Gestão de Pedidos</strong>
            <small>Visualizar e atualizar status dos pedidos</small>
          </span>
          <span class="ql-arrow">→</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .admin-header {
      margin-bottom: 40px;
    }

    .admin-title {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .admin-subtitle {
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 24px;
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      font-size: 1.4rem;
      flex-shrink: 0;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--color-text);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 500;
      margin-top: 2px;
    }

    .quick-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .quick-link {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 22px 24px;
      transition: all var(--transition-normal);
      cursor: pointer;
    }

    .quick-link:hover {
      transform: translateX(4px);
      border-color: var(--color-primary);
    }

    .ql-icon {
      font-size: 1.8rem;
      flex-shrink: 0;
    }

    .ql-text {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .ql-text strong {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .ql-text small {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    .ql-arrow {
      font-size: 1.2rem;
      color: var(--color-text-muted);
      transition: all var(--transition-normal);
    }

    .quick-link:hover .ql-arrow {
      color: var(--color-primary);
      transform: translateX(4px);
    }

    @media (max-width: 768px) {
      .admin-title {
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .stat-card {
        flex-direction: column;
        text-align: center;
        padding: 18px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: OrderStats | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getOrderStats().subscribe({
      next: (stats: OrderStats) => this.stats = stats,
      error: () => {
        this.stats = { totalPedidos: 0, pedidosPendentes: 0, pedidosPagos: 0, totalArrecadado: 0 };
      }
    });
  }
}
