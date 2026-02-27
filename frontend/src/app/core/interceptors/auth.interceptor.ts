import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    let authReq = req;
    // Intercepta todas as requisições para a API (exceto endpoints públicos de auth)
    if (token && req.url.includes('/api/') && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/refresh')) {
        authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expirado, removido da base ou assinatura inválida
                authService.logout();
                router.navigate(['/admin/login']);
            } else if (error.status === 429) {
                // Rate Limiting excedido
                alert('Você fez muitas requisições recentemente. Por favor, aguarde alguns instantes e tente novamente.');
            }
            return throwError(() => error);
        })
    );
};
