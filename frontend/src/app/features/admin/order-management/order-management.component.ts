import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-top animate-fade-in-up">
        <div>
          <a routerLink="/admin" class="back-link">← Painel Admin</a>
          <h1 class="page-title">📋 Gestão de Pedidos</h1>
        </div>
        <div class="filters">
          <button class="btn btn-sm"
                  [class]="filtroAtual === '' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary'"
                  (click)="filtrar('')">Todos</button>
          <button class="btn btn-sm"
                  [class]="filtroAtual === 'PENDING' ? 'btn btn-sm btn-amber' : 'btn btn-sm btn-secondary'"
                  (click)="filtrar('PENDING')">⏳ Pendentes</button>
          <button class="btn btn-sm"
                  [class]="filtroAtual === 'PAID' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary'"
                  (click)="filtrar('PAID')">✅ Pagos</button>
        </div>
      </div>

      <div class="table-wrapper glass animate-fade-in-up">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Produto</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td><span style="color: var(--color-text-muted);">#{{ order.id }}</span></td>
              <td><strong>{{ order.productName }}</strong></td>
              <td style="color: var(--color-primary); font-weight: 700;">R$ {{ order.productPrice.toFixed(2) }}</td>
              <td>
                <span class="badge" [class]="'badge badge-' + order.status.toLowerCase()">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td style="font-size: 0.8rem; color: var(--color-text-muted);">{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button *ngIf="order.status === 'PENDING'"
                          class="btn btn-sm btn-primary"
                          (click)="marcarComoPago(order.id)">
                    💰 Pago
                  </button>
                  <button *ngIf="order.status === 'PAID'"
                          class="btn btn-sm btn-amber"
                          (click)="liberar(order.id)">
                    🔓 Liberar
                  </button>
                  <span *ngIf="order.status === 'RELEASED'"
                        style="font-size: 0.8rem; color: var(--color-text-muted);">
                    Concluído ✔
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="orders.length === 0" style="text-align: center; padding: 40px; color: var(--color-text-muted);">
          {{ filtroAtual ? 'Nenhum pedido com status ' + filtroAtual : 'Nenhum pedido registrado' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .back-link {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      transition: color var(--transition-fast);
      display: inline-block;
      margin-bottom: 4px;
    }

    .back-link:hover {
      color: var(--color-primary);
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 800;
    }

    .filters {
      display: flex;
      gap: 8px;
    }

    .action-buttons {
      display: flex;
      gap: 6px;
    }

    @media (max-width: 768px) {
      .page-top {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-title {
        font-size: 1.3rem;
      }

      .filters {
        width: 100%;
      }

      .filters .btn {
        flex: 1;
      }
    }
  `]
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  filtroAtual = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.apiService.getAdminOrders(this.filtroAtual || undefined).subscribe({
      next: (orders: Order[]) => this.orders = orders
    });
  }

  filtrar(status: string): void {
    this.filtroAtual = status;
    this.carregarPedidos();
  }

  marcarComoPago(id: number): void {
    this.apiService.updateOrderStatus(id, 'PAID').subscribe({
      next: () => this.carregarPedidos()
    });
  }

  liberar(id: number): void {
    this.apiService.updateOrderStatus(id, 'RELEASED').subscribe({
      next: () => this.carregarPedidos()
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return '⏳ Pendente';
      case 'PAID': return '✅ Pago';
      case 'RELEASED': return '🔓 Liberado';
      default: return status;
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('pt-BR');
  }
}
