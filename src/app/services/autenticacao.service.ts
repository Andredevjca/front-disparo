import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServicoAutenticacao {
  private readonly chaveToken = 'disparo_token';
  readonly email = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private roteador: Router
  ) {
    if (this.obterToken()) this.email.set(localStorage.getItem('disparo_email'));
  }

  obterToken(): string | null { return localStorage.getItem(this.chaveToken); }

  entrar(email: string, senha: string) {
    const request = {
      email,
      password: senha,
    };
    return this.http.post<{ token: string }>('/api/auth/fazer-login', request).pipe(
      tap((resposta) => {
        localStorage.setItem(this.chaveToken, resposta.token);
        localStorage.setItem('disparo_email', email);
        this.email.set(email);
      }),
    );
  }

  sair(): void {
    localStorage.removeItem(this.chaveToken);
    localStorage.removeItem('disparo_email');
    this.email.set(null);
    void this.roteador.navigate(['/login']);
  }
}
