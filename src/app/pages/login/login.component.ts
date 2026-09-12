import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ServicoAutenticacao } from '../../services/autenticacao.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private autenticacao = inject(ServicoAutenticacao);
  private roteador = inject(Router);
  private clienteHttp = inject(HttpClient);
  email = '';
  senha = '';
  erro = '';
  carregando = false;

  mostrarCriacao = false;
  nomeInicial = '';
  emailInicial = 'admin@admin.com';
  senhaInicial = 'admin';
  erroInicial = '';
  carregandoInicial = false;
  sucessoInicial = '';

  entrar(): void {
    this.carregando = true;
    this.erro = '';
    this.autenticacao.entrar(this.email, this.senha).subscribe({
      next: () => this.roteador.navigateByUrl('/enviar'),
      error: (erro) => {
        this.carregando = false;
        this.erro = erro.error?.message || 'Não foi possível entrar';
      },
    });
  }

  alternarCriacao(): void {
    this.mostrarCriacao = !this.mostrarCriacao;
    this.erroInicial = '';
    this.sucessoInicial = '';
  }

  criarUsuarioInicial(): void {
    this.carregandoInicial = true;
    this.erroInicial = '';
    this.sucessoInicial = '';
    const dados: { nome?: string; email: string; password: string } = { email: this.emailInicial, password: this.senhaInicial };
    if (this.nomeInicial) dados.nome = this.nomeInicial;
    this.clienteHttp.post('/api/usuarios', dados).subscribe({
      next: () => {
        this.carregandoInicial = false;
        this.sucessoInicial = 'Conta criada! Preencha os campos abaixo e entre.';
        this.email = this.emailInicial;
        this.senha = this.senhaInicial;
        this.mostrarCriacao = false;
      },
      error: (erro) => {
        this.carregandoInicial = false;
        this.erroInicial = erro.error?.message || 'Não foi possível criar a conta';
      },
    });
  }
}
