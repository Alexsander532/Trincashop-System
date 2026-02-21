import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Order, OrderStats } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private readonly baseUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient) { }

    // ===== PRODUTOS (Público) =====

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.baseUrl}/products`);
    }

    // ===== PEDIDOS (Público) =====

    createOrder(productId: number): Observable<Order> {
        return this.http.post<Order>(`${this.baseUrl}/orders`, { productId });
    }

    getOrder(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
    }

    // ===== ADMIN - Produtos =====

    getAdminProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.baseUrl}/admin/products`);
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(`${this.baseUrl}/admin/products`, product);
    }

    updateProduct(id: number, product: Partial<Product>): Observable<Product> {
        return this.http.put<Product>(`${this.baseUrl}/admin/products/${id}`, product);
    }

    // ===== ADMIN - Pedidos =====

    getAdminOrders(status?: string): Observable<Order[]> {
        const params = status ? `?status=${status}` : '';
        return this.http.get<Order[]>(`${this.baseUrl}/admin/orders${params}`);
    }

    updateOrderStatus(id: number, status: string): Observable<Order> {
        return this.http.put<Order>(`${this.baseUrl}/admin/orders/${id}`, { status });
    }

    getOrderStats(): Observable<OrderStats> {
        return this.http.get<OrderStats>(`${this.baseUrl}/admin/orders/stats`);
    }
}
