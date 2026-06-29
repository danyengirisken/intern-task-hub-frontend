import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, MenuDto, UserDto } from './models';

const TOKEN_KEY = 'ith_token';
const USER_KEY = 'ith_user';
const MENUS_KEY = 'ith_menus';

/**
 * Kimlik doğrulama servisi: login isteği atar, token ve kullanıcı bilgisini
 * localStorage'da saklar ve oturum durumunu sorgular.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  /** Backend'e login isteği atar; başarılı olursa oturumu saklar. */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/api/auth/login`, request)
      .pipe(tap((response) => this.storeSession(response)));
  }

  /** Oturumu temizler ve login ekranına yönlendirir. */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(MENUS_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): UserDto | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  }

  getMenus(): MenuDto[] {
    const raw = localStorage.getItem(MENUS_KEY);
    return raw ? (JSON.parse(raw) as MenuDto[]) : [];
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(MENUS_KEY, JSON.stringify(response.menus));
  }
}
