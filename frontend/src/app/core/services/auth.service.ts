import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
    token: string;
    refreshToken: string;
    email: string;
    nome: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly baseUrl = `${environment.apiUrl}/auth`;
    private readonly TOKEN_KEY = 'trincashop_admin_token';
    private readonly REFRESH_TOKEN_KEY = 'trincashop_admin_refresh';
    private readonly USER_KEY = 'trincashop_admin_user';

    constructor(private http: HttpClient) { }

    login(credentials: { email: string; password: string }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
            tap(response => {
                if (response && response.token) {
                    localStorage.setItem(this.TOKEN_KEY, response.token);
                    if (response.refreshToken) {
                        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
                    }
                    localStorage.setItem(this.USER_KEY, JSON.stringify({ nome: response.nome, email: response.email }));
                }
            })
        );
    }

    logout(): void {
        const token = this.getToken();
        if (token) {
            // Tenta avisar ao backend para invalidar o token
            this.http.post(`${this.baseUrl}/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).subscribe({
                next: () => this.clearStorage(),
                error: () => this.clearStorage()
            });
        } else {
            this.clearStorage();
        }
    }

    private clearStorage(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // JWT simples validation based on payload
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp;
            if (expiry && (Math.floor((new Date).getTime() / 1000)) >= expiry) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    getUser(): { nome: string; email: string } | null {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }
}
