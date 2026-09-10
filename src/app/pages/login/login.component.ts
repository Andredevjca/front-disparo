import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  email = '';
  password = '';
  error = '';
  loading = false;

  showSeed = false;
  seedNome = '';
  seedEmail = 'admin@admin.com';
  seedPassword = 'admin';
  seedError = '';
  seedLoading = false;
  seedSuccess = '';

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/enviar'),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Não foi possível entrar';
      },
    });
  }

  toggleSeed(): void {
    this.showSeed = !this.showSeed;
    this.seedError = '';
    this.seedSuccess = '';
  }

  criarPrimeiraConta(): void {
    this.seedLoading = true;
    this.seedError = '';
    this.seedSuccess = '';
    const body: { nome?: string; email: string; password: string } = { email: this.seedEmail, password: this.seedPassword };
    if (this.seedNome) body.nome = this.seedNome;
    this.http.post('/api/usuarios', body).subscribe({
      next: () => {
      this.seedLoading = false;
        this.seedSuccess = 'Conta criada! Preencha os campos abaixo e entre.';
        this.email = this.seedEmail;
        this.password = this.seedPassword;
        this.showSeed = false;
      },
      error: (err) => {
        this.seedLoading = false;
        this.seedError = err.error?.message || 'Não foi possível criar a conta';
      },
    });
  }
}
