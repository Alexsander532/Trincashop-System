import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./features/products/product-list/product-list.component')
                .then(m => m.ProductListComponent),
        title: 'TrincaShop – Produtos'
    },
    {
        path: 'pedido/:id',
        loadComponent: () =>
            import('./features/orders/order-confirm/order-confirm.component')
                .then(m => m.OrderConfirmComponent),
        title: 'TrincaShop – Pedido'
    },
    {
        path: 'admin/login',
        loadComponent: () =>
            import('./features/admin/login/login.component')
                .then(m => m.LoginComponent),
        title: 'TrincaShop – Login Admin'
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/admin/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent),
                title: 'TrincaShop – Admin'
            },
            {
                path: 'produtos',
                loadComponent: () =>
                    import('./features/admin/product-management/product-management.component')
                        .then(m => m.ProductManagementComponent),
                title: 'TrincaShop – Gestão de Produtos'
            },
            {
                path: 'pedidos',
                loadComponent: () =>
                    import('./features/admin/order-management/order-management.component')
                        .then(m => m.OrderManagementComponent),
                title: 'TrincaShop – Gestão de Pedidos'
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
