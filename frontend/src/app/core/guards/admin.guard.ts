import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Redireciona para o login de admin em vez de usar prompt
    router.navigate(['/admin/login']);
    return false;
};
