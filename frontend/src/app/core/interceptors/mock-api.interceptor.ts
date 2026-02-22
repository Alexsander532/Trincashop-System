import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

/**
 * Interceptor para simular o backend (Mock API) quando o app está na Vercel
 * ou quando o backend local não está disponível.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const { url, method } = req;

    // Só intercepta chamadas para o nosso "backend" (localhost:8080)
    if (!url.includes('localhost:8080/api')) {
        return next(req);
    }

    console.log(`[Mock API] Interceptando ${method} ${url}`);

    // ===== DADOS MOCKADOS =====
    const products = [
        { id: 1, name: 'Coca-Cola 350ml', price: 5.00, stock: 10, active: true, emoji: '🥤' },
        { id: 2, name: 'Água Mineral 500ml', price: 3.00, stock: 15, active: true, emoji: '💧' },
        { id: 3, name: 'Suco Del Valle 290ml', price: 4.50, stock: 8, active: true, emoji: '🧃' },
        { id: 4, name: 'Chocolate Bis', price: 3.50, stock: 12, active: true, emoji: '🍫' },
        { id: 5, name: 'Guaraná Antarctica 350ml', price: 4.50, stock: 10, active: true, emoji: '🥤' },
        { id: 6, name: 'Energético Monster 473ml', price: 9.00, stock: 5, active: true, emoji: '⚡' },
        { id: 7, name: 'Iogurte Danone', price: 4.00, stock: 6, active: true, emoji: '🍦' },
        { id: 8, name: 'Barra de Cereal', price: 2.50, stock: 20, active: true, emoji: '🌾' }
    ];

    const orders = [
        { id: 101, productName: 'Coca-Cola 350ml', totalValue: 5.00, status: 'PAID', createdAt: new Date().toISOString() },
        { id: 102, productName: 'Chocolate Bis', totalValue: 3.50, status: 'PENDING', createdAt: new Date().toISOString() }
    ];

    // ===== LÓGICA DE ROTEAMENTO MOCK =====

    // 1. Auth Login
    if (url.endsWith('/api/auth/login') && method === 'POST') {
        const { email, password } = req.body as any;
        if (email === 'admin@trincashop.com' && password === 'admin123') {
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cmluY2FzaG9wLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.dummy-sig';
            return of(new HttpResponse({
                status: 200,
                body: { token: mockToken, email, nome: 'Administrador Trinca' }
            })).pipe(delay(800));
        }
        return of(new HttpResponse({ status: 401, body: { erro: 'Credenciais inválidas' } }));
    }

    // 2. Public Products
    if (url.endsWith('/api/products') && method === 'GET') {
        return of(new HttpResponse({ status: 200, body: products })).pipe(delay(500));
    }

    // 3. Create Order
    if (url.endsWith('/api/orders') && method === 'POST') {
        const { productId } = req.body as any;
        const product = products.find(p => p.id === productId);
        return of(new HttpResponse({
            status: 200,
            body: {
                id: Math.floor(Math.random() * 9000) + 1000,
                productName: product?.name,
                productPrice: product?.price,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            }
        })).pipe(delay(1000));
    }

    // 4. Get Single Order (Página de confirmação)
    if (url.match(/\/api\/orders\/\d+$/) && method === 'GET') {
        const orderId = url.split('/').pop();
        return of(new HttpResponse({
            status: 200,
            body: {
                id: Number(orderId),
                productName: 'Coca-Cola 350ml',
                productPrice: 5.00,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            }
        })).pipe(delay(500));
    }

    // 5. Admin Stats
    if (url.endsWith('/api/admin/orders/stats') && method === 'GET') {
        return of(new HttpResponse({
            status: 200,
            body: { totalOrders: 42, pendingOrders: 5, paidOrders: 37, totalRevenue: 245.50 }
        })).pipe(delay(400));
    }

    // 5. Admin Products
    if (url.endsWith('/api/admin/products') && method === 'GET') {
        return of(new HttpResponse({ status: 200, body: products })).pipe(delay(500));
    }

    // 6. Admin Orders
    if (url.includes('/api/admin/orders') && !url.endsWith('/stats') && method === 'GET') {
        return of(new HttpResponse({ status: 200, body: orders })).pipe(delay(500));
    }

    // Padrão: deixa passar para o backend real se não casar com nada (embora em Vercel vá falhar se não houver backend)
    return next(req);
};
