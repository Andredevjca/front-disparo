import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'disparo_token';
  readonly email = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (this.token()) this.email.set(localStorage.getItem('disparo_email'));
  }

  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; email: string }>('/api/auth/fazer-login', { email, password }).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem('disparo_email', res.email);
        this.email.set(res.email);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('disparo_email');
    this.email.set(null);
    void this.router.navigate(['/login']);
  }
}
