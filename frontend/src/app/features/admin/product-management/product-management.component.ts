import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-top animate-fade-in-up">
        <div>
          <a routerLink="/admin" class="back-link">← Painel Admin</a>
          <h1 class="page-title">🏷️ Gestão de Produtos</h1>
        </div>
        <button class="btn btn-primary" (click)="showForm = !showForm">
          {{ showForm ? '✕ Fechar' : '+ Novo Produto' }}
        </button>
      </div>

      <!-- Formulário -->
      <div *ngIf="showForm" class="form-card glass animate-fade-in-up">
        <h3 style="margin-bottom: 18px; font-weight: 700;">
          {{ editingId ? '✏️ Editar Produto' : '➕ Novo Produto' }}
        </h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Nome</label>
            <input class="input" [(ngModel)]="form.name" placeholder="Ex: Coca-Cola 350ml">
          </div>
          <div class="form-group">
            <label>Preço (R$)</label>
            <input class="input" type="number" step="0.01" [(ngModel)]="form.price" placeholder="5.00">
          </div>
          <div class="form-group">
            <label>Estoque</label>
            <input class="input" type="number" [(ngModel)]="form.stock" placeholder="10">
          </div>
          <div class="form-group">
            <label>Ativo</label>
            <select class="input" [(ngModel)]="form.active">
              <option [ngValue]="true">Sim ✅</option>
              <option [ngValue]="false">Não ❌</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" (click)="salvar()">
            {{ editingId ? '💾 Salvar' : '➕ Criar' }}
          </button>
          <button class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
        </div>
      </div>

      <!-- Tabela -->
      <div class="table-wrapper glass animate-fade-in-up" style="margin-top: 24px;">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td><span style="color: var(--color-text-muted);">#{{ p.id }}</span></td>
              <td><strong>{{ p.name }}</strong></td>
              <td style="color: var(--color-primary); font-weight: 700;">R$ {{ p.price.toFixed(2) }}</td>
              <td>
                <span [style.color]="p.stock <= 3 ? 'var(--color-amber)' : 'var(--color-text)'">
                  {{ p.stock }} un.
                </span>
              </td>
              <td>
                <span class="badge" [class]="p.active ? 'badge badge-active' : 'badge badge-inactive'">
                  {{ p.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="editar(p)">✏️</button>
                  <button class="btn btn-sm" [class]="p.active ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-primary'"
                          (click)="toggleAtivo(p)">
                    {{ p.active ? '🚫' : '✅' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="products.length === 0" style="text-align: center; padding: 40px; color: var(--color-text-muted);">
          Nenhum produto cadastrado
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

    .form-card {
      padding: 28px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
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
    }
  `]
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  showForm = false;
  editingId: number | null = null;
  form: Partial<Product> = { name: '', price: 0, stock: 0, active: true };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.apiService.getAdminProducts().subscribe({
      next: (products: Product[]) => this.products = products
    });
  }

  salvar(): void {
    if (this.editingId) {
      this.apiService.updateProduct(this.editingId, this.form).subscribe({
        next: () => {
          this.carregarProdutos();
          this.cancelar();
        }
      });
    } else {
      this.apiService.createProduct(this.form).subscribe({
        next: () => {
          this.carregarProdutos();
          this.cancelar();
        }
      });
    }
  }

  editar(product: Product): void {
    this.editingId = product.id;
    this.form = { ...product };
    this.showForm = true;
  }

  toggleAtivo(product: Product): void {
    this.apiService.updateProduct(product.id, { ...product, active: !product.active }).subscribe({
      next: () => this.carregarProdutos()
    });
  }

  cancelar(): void {
    this.showForm = false;
    this.editingId = null;
    this.form = { name: '', price: 0, stock: 0, active: true };
  }
}
