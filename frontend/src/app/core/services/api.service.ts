import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Order, OrderStats } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface PageResponse<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private readonly baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ===== PRODUTOS (Público) =====

    getProducts(page = 0, size = 20): Observable<PageResponse<Product>> {
        return this.http.get<PageResponse<Product>>(`${this.baseUrl}/products?page=${page}&size=${size}`);
    }

    // ===== PEDIDOS (Público) =====

    createOrder(productId: number): Observable<Order> {
        return this.http.post<Order>(`${this.baseUrl}/orders`, { productId });
    }

    getOrder(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
    }

    // ===== ADMIN - Produtos =====

    getAdminProducts(page = 0, size = 20): Observable<PageResponse<Product>> {
        return this.http.get<PageResponse<Product>>(`${this.baseUrl}/admin/products?page=${page}&size=${size}`);
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(`${this.baseUrl}/admin/products`, product);
    }

    updateProduct(id: number, product: Partial<Product>): Observable<Product> {
        return this.http.put<Product>(`${this.baseUrl}/admin/products/${id}`, product);
    }

    // ===== ADMIN - Pedidos =====

    getAdminOrders(status?: string, page = 0, size = 20): Observable<PageResponse<Order>> {
        const statusParam = status ? `&status=${status}` : '';
        return this.http.get<PageResponse<Order>>(`${this.baseUrl}/admin/orders?page=${page}&size=${size}${statusParam}`);
    }

    updateOrderStatus(id: number, status: string): Observable<Order> {
        return this.http.put<Order>(`${this.baseUrl}/admin/orders/${id}`, { status });
    }

    getOrderStats(): Observable<OrderStats> {
        return this.http.get<OrderStats>(`${this.baseUrl}/admin/orders/stats`);
    }
}
