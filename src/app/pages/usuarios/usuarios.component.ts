import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/api.service';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, DatePipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent implements OnInit {
  private api = inject(ApiService);
  usuarios: Usuario[] = [];
  editing: Usuario | null = null;
  nome = '';
  email = '';
  password = '';
  error = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.usuarios().subscribe({
      next: (rows) => (this.usuarios = rows),
      error: (err) => (this.error = err.error?.message || 'Erro ao carregar usuários'),
    });
  }

  save(): void {
    this.error = '';
    this.success = '';
    const payload = {
      nome: this.nome || undefined,
      email: this.email,
      password: this.password,
    };
    if (this.editing) {
      const body: { nome?: string; email: string; password?: string } = {
        nome: this.nome || undefined,
        email: this.email,
      };
      if (this.password) body.password = this.password;
      this.api.atualizarUsuario(this.editing.id, body).subscribe({
        next: () => {
          this.success = 'Usuário atualizado';
          this.cancel();
          this.load();
        },
        error: (err) => (this.error = err.error?.message || 'Erro ao atualizar usuário'),
      });
    } else {
      if (!this.password) {
        this.error = 'Senha é obrigatória';
        return;
      }
      this.api.criarUsuario(payload).subscribe({
        next: () => {
          this.success = 'Usuário criado';
          this.cancel();
          this.load();
        },
        error: (err) => (this.error = err.error?.message || 'Erro ao criar usuário'),
      });
    }
  }

  edit(item: Usuario): void {
    this.editing = item;
    this.nome = item.nome || '';
    this.email = item.email;
    this.password = '';
    this.error = '';
    this.success = '';
  }

  remove(item: Usuario): void {
    if (!confirm(`Excluir usuário ${item.email}?`)) return;
    this.api.excluirUsuario(item.id).subscribe({
      next: () => {
        this.success = 'Usuário excluído';
        this.load();
      },
      error: (err) => (this.error = err.error?.message || 'Erro ao excluir usuário'),
    });
  }

  cancel(): void {
    this.editing = null;
    this.nome = '';
    this.email = '';
    this.password = '';
  }
}
