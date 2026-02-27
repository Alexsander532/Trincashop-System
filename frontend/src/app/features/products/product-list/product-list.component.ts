import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header animate-fade-in-up">
        <h1 class="page-title">
          <span class="title-emoji">🧊</span>
          Geladeira TrincaShop
        </h1>
        <p class="page-subtitle">Escolha seu produto e pague via PIX – rápido e seguro!</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="products-grid">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="card-product skeleton">
          <div class="skeleton-image"></div>
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
        </div>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!loading" class="products-grid">
        <div *ngFor="let product of products; let i = index"
             class="card-product animate-fade-in-up"
             [class]="'card-product animate-fade-in-up stagger-' + (i + 1)"
             [class.out-of-stock]="product.stock <= 0">

          <div class="product-emoji">{{ getProductEmoji(product.name) }}</div>

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-meta">
              <span class="product-price">R$ {{ product.price.toFixed(2) }}</span>
              <span class="product-stock" [class.low-stock]="product.stock <= 3">
                {{ product.stock > 0 ? product.stock + ' un.' : 'Esgotado' }}
              </span>
            </div>
          </div>

          <button class="btn btn-primary btn-buy"
                  [disabled]="product.stock <= 0 || processingId === product.id"
                  [class.processing]="processingId === product.id"
                  (click)="comprar(product)">
            <span *ngIf="processingId === product.id" class="loader-inline"></span>
            <span *ngIf="processingId !== product.id && product.stock > 0">🛒 Comprar</span>
            <span *ngIf="processingId !== product.id && product.stock <= 0">Esgotado</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && products.length === 0" class="empty-state animate-fade-in">
        <span class="empty-icon">📭</span>
        <p>Nenhum produto disponível no momento</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, var(--color-text), var(--color-primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .title-emoji {
      -webkit-text-fill-color: initial;
      margin-right: 8px;
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--color-text-secondary);
      font-weight: 400;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .card-product {
      background-color: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      cursor: default;
    }

    .card-product:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-border-hover);
    }

    .card-product:active {
      transform: translateY(-2px) scale(0.98);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card-product.out-of-stock {
      opacity: 0.5;
      filter: grayscale(0.5);
    }

    .product-emoji {
      font-size: 3.2rem;
      margin-bottom: 4px;
      transition: transform var(--transition-normal);
    }

    .card-product:hover .product-emoji {
      transform: scale(1.15) rotate(-5deg);
    }

    .product-info {
      width: 100%;
    }

    .product-name {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--color-primary); /* destaque do título */
    }

    .product-meta {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
    }

    .product-price {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--color-text); /* mudando de primary para text para não brigar com o título */
    }

    .product-stock {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      padding: 3px 10px;
      background: var(--color-bg);
      border-radius: 9999px;
    }

    .product-stock.low-stock {
      color: var(--color-amber);
      background: var(--color-amber-glow);
    }

    .btn-buy {
      width: 100%;
      margin-top: 4px;
    }

    .btn-buy:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn.processing {
      transform: scale(0.97);
    }

    .loader-inline {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Skeleton */
    .skeleton {
      padding: 28px 24px;
    }

    .skeleton-image {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(90deg, var(--color-surface), rgba(255,255,255,0.05), var(--color-surface));
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line {
      height: 14px;
      border-radius: 7px;
      background: linear-gradient(90deg, var(--color-surface), rgba(255,255,255,0.05), var(--color-surface));
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin: 8px auto 0;
    }

    .w-60 { width: 60%; }
    .w-40 { width: 40%; }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--color-text-muted);
    }

    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 1.6rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  processingId: number | null = null;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.apiService.getProducts().subscribe({
      next: (page) => {
        this.products = page.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  comprar(product: Product): void {
    if (this.processingId || product.stock <= 0) return;
    this.processingId = product.id;
    this.apiService.createOrder(product.id).subscribe({
      next: (order: any) => {
        this.router.navigate(['/pedido', order.id]);
      },
      error: (err: any) => {
        this.processingId = null;
        alert('Erro ao criar pedido: ' + (err.error?.erro || 'Tente novamente'));
      }
    });
  }

  getProductEmoji(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('coca') || lower.includes('guaraná')) return '🥤';
    if (lower.includes('água')) return '💧';
    if (lower.includes('suco')) return '🧃';
    if (lower.includes('chocolate') || lower.includes('bis')) return '🍫';
    if (lower.includes('energético') || lower.includes('monster')) return '⚡';
    if (lower.includes('iogurte')) return '🥛';
    if (lower.includes('barra') || lower.includes('cereal')) return '🥜';
    return '🧊';
  }
}
