import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <!-- Loading -->
      <div *ngIf="loading" class="confirm-card glass animate-fade-in" style="text-align:center; padding: 60px;">
        <div class="spinner"></div>
        <p style="margin-top: 16px; color: var(--color-text-muted)">Carregando pedido...</p>
      </div>

      <!-- Order Details -->
      <div *ngIf="!loading && order" class="confirm-card glass animate-fade-in-up">

        <div class="status-indicator" [class]="'status-indicator status-' + order.status.toLowerCase()">
          <span class="status-icon">{{ getStatusIcon() }}</span>
          <span class="status-label">{{ getStatusLabel() }}</span>
        </div>

        <h1 class="confirm-title">Pedido #{{ order.id }}</h1>

        <div class="order-details">
          <div class="detail-row">
            <span class="detail-label">Produto</span>
            <span class="detail-value">{{ order.productName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Valor</span>
            <span class="detail-value price">R$ {{ order.productPrice.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="badge" [class]="'badge badge-' + order.status.toLowerCase()">
              {{ order.status }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Data</span>
            <span class="detail-value">{{ formatDate(order.createdAt) }}</span>
          </div>
        </div>

        <!-- Instruções de pagamento -->
        <div *ngIf="order.status === 'PENDING'" class="payment-info">
          <div class="pix-icon">📱</div>
          <h3>Pague via PIX</h3>
          <p>Envie <strong>R$ {{ order.productPrice.toFixed(2) }}</strong> para a chave PIX abaixo:</p>
          <div class="pix-key">
            <code>trincashop&#64;email.com</code>
            <button class="btn btn-sm btn-secondary" (click)="copyPix()">📋 Copiar</button>
          </div>
          <p class="pix-note">Após o pagamento, um administrador confirmará seu pedido.</p>
        </div>

        <!-- Pedido pago -->
        <div *ngIf="order.status === 'PAID'" class="success-info">
          <div class="success-icon">✅</div>
          <h3>Pagamento Confirmado!</h3>
          <p>Pode retirar seu produto na geladeira. Obrigado!</p>
        </div>

        <!-- Pedido cancelado -->
        <div *ngIf="order.status === 'CANCELLED'" class="success-info" style="background: var(--color-danger-glow); border-color: rgba(239, 68, 68, 0.2);">
          <div class="success-icon">❌</div>
          <h3 style="color: var(--color-danger)">Pedido Cancelado</h3>
          <p>Este pedido não pode mais ser processado.</p>
        </div>

        <!-- Observação psicológica -->
        <div class="security-notice">
          <span class="notice-icon">🔒</span>
          <p>Este pedido está registrado no sistema. Todas as transações são monitoradas para sua segurança.</p>
        </div>

        <a routerLink="/" class="btn btn-secondary" style="width: 100%; margin-top: 16px;">
          ← Voltar aos Produtos
        </a>
      </div>

      <!-- Error -->
      <div *ngIf="!loading && !order" class="confirm-card glass animate-fade-in" style="text-align:center;">
        <span style="font-size: 3rem;">❌</span>
        <h2 style="margin: 16px 0 8px;">Pedido não encontrado</h2>
        <p style="color: var(--color-text-muted); margin-bottom: 24px;">O pedido solicitado não existe ou foi removido.</p>
        <a routerLink="/" class="btn btn-primary">Voltar aos Produtos</a>
      </div>
    </div>
  `,
  styles: [`
    .confirm-card {
      max-width: 520px;
      margin: 0 auto;
      padding: 40px 32px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: var(--radius-xl);
      margin-bottom: 24px;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .status-pending {
      background: var(--color-amber-glow);
      color: var(--color-amber);
    }

    .status-paid {
      background: var(--color-success-glow);
      color: var(--color-success);
    }

    .status-released {
      background: var(--color-secondary-glow);
      color: var(--color-secondary-light);
    }

    .status-cancelled {
      background: var(--color-danger-glow);
      color: var(--color-danger);
    }

    .status-icon {
      font-size: 1.2rem;
    }

    .confirm-title {
      font-size: 1.8rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 28px;
      color: var(--color-text);
    }

    .order-details {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 28px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      background: var(--color-surface);
    }

    .detail-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text-muted);
    }

    .detail-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .detail-value.price {
      font-size: 1.1rem;
      color: var(--color-primary);
      font-weight: 800;
    }

    /* Payment Info */
    .payment-info {
      text-align: center;
      padding: 24px;
      background: var(--color-amber-glow);
      border: 1px solid rgba(245, 124, 0, 0.2);
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }

    .pix-icon {
      font-size: 2.5rem;
      margin-bottom: 8px;
    }

    .payment-info h3 {
      color: var(--color-amber);
      font-size: 1.1rem;
      margin-bottom: 8px;
    }

    .payment-info p {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    .pix-key {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: rgba(0, 0, 0, 0.05); /* Adaptado para light mode */
      padding: 12px 18px;
      border-radius: var(--radius-md);
      margin: 12px 0;
    }

    .pix-key code {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .pix-note {
      font-size: 0.8rem !important;
      color: var(--color-text-muted) !important;
      font-style: italic;
    }

    /* Success */
    .success-info {
      text-align: center;
      padding: 24px;
      background: var(--color-success-glow);
      border: 1px solid rgba(34, 197, 94, 0.15);
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }

    .success-icon {
      font-size: 2.5rem;
      margin-bottom: 8px;
    }

    .success-info h3 {
      color: var(--color-success);
      font-size: 1.1rem;
      margin-bottom: 8px;
    }

    .success-info p {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    /* Security notice */
    .security-notice {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 18px;
      background: rgba(0, 0, 0, 0.02); /* Adaptado para light mode */
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-bottom: 8px;
    }

    .notice-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .security-notice p {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    /* Spinner */
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .confirm-card {
        padding: 28px 20px;
      }

      .confirm-title {
        font-size: 1.4rem;
      }
    }
  `]
})
export class OrderConfirmComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getOrder(id).subscribe({
      next: (order: Order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusIcon(): string {
    if (!this.order) return '❓';
    switch (this.order.status) {
      case 'PENDING': return '⏳';
      case 'PAID': return '✅';
      case 'RELEASED': return '🔓';
      case 'CANCELLED': return '❌';
      default: return '❓';
    }
  }

  getStatusLabel(): string {
    if (!this.order) return '';
    switch (this.order.status) {
      case 'PENDING': return 'Aguardando Pagamento';
      case 'PAID': return 'Pagamento Confirmado';
      case 'RELEASED': return 'Produto Liberado';
      case 'CANCELLED': return 'Pedido Cancelado';
      default: return this.order.status;
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  copyPix(): void {
    navigator.clipboard.writeText('trincashop@email.com').then(() => {
      alert('✅ Chave PIX copiada!');
    });
  }
}
