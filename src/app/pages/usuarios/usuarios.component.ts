import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ServicoUsuarios } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, DatePipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent implements OnInit {
  private servicoUsuarios = inject(ServicoUsuarios);
  usuarios: Usuario[] = [];
  usuarioEmEdicao: Usuario | null = null;
  nome = '';
  email = '';
  senha = '';
  erro = '';
  sucesso = '';

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.servicoUsuarios.listar().subscribe({
      next: (usuarios) => (this.usuarios = usuarios),
      error: (erro) => (this.erro = erro.error?.message || 'Erro ao carregar usuários'),
    });
  }

  salvarUsuario(): void {
    this.erro = '';
    this.sucesso = '';
    const payload = {
      nome: this.nome || undefined,
      email: this.email,
      password: this.senha,
    };
    if (this.usuarioEmEdicao) {
      const body: { nome?: string; email: string; password?: string } = {
        nome: this.nome || undefined,
        email: this.email,
      };
      if (this.senha) body.password = this.senha;
      this.servicoUsuarios.atualizar(this.usuarioEmEdicao.id, body).subscribe({
        next: () => {
          this.sucesso = 'Usuário atualizado';
          this.cancelarEdicao();
          this.carregarUsuarios();
        },
        error: (erro) => (this.erro = erro.error?.message || 'Erro ao atualizar usuário'),
      });
    } else {
      if (!this.senha) {
        this.erro = 'Senha é obrigatória';
        return;
      }
      this.servicoUsuarios.criar(payload).subscribe({
        next: () => {
          this.sucesso = 'Usuário criado';
          this.cancelarEdicao();
          this.carregarUsuarios();
        },
        error: (erro) => (this.erro = erro.error?.message || 'Erro ao criar usuário'),
      });
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioEmEdicao = usuario;
    this.nome = usuario.nome || '';
    this.email = usuario.email;
    this.senha = '';
    this.erro = '';
    this.sucesso = '';
  }

  excluirUsuario(usuario: Usuario): void {
    if (!confirm(`Excluir usuário ${usuario.email}?`)) return;
    this.servicoUsuarios.excluir(usuario.id).subscribe({
      next: () => {
        this.sucesso = 'Usuário excluído';
        this.carregarUsuarios();
      },
      error: (erro) => (this.erro = erro.error?.message || 'Erro ao excluir usuário'),
    });
  }

  cancelarEdicao(): void {
    this.usuarioEmEdicao = null;
    this.nome = '';
    this.email = '';
    this.senha = '';
  }
}
