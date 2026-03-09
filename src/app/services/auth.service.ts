import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/auth';
  private tokenKey = 'token';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // LOGIN
  login(username: string, password: string) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, {
        username,
        password,
      })
      .pipe(tap((res) => this.setToken(res.token)));
  }

  // LOGOUT
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  // SET TOKEN
  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  // GET TOKEN
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // CHECK IF TOKEN EXPIRED
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // GET USER INFO FROM TOKEN
  getUser(): { username: string; role: string } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { username: payload.username, role: payload.role };
    } catch {
      return null;
    }
  }
}
