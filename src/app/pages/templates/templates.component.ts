import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/api.service';
import { Template } from '../../core/models';
import { interpolate } from '../../core/interpolate';

@Component({
  selector: 'app-templates',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
})
export class TemplatesComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  templates: Template[] = [];
  editing: Template | null = null;
  nome = '';
  mensagem = 'Olá {{nome}},\n\nIdentificamos uma pendência no valor de R$ {{valor}}.\n\nVencimento: {{vencimento}}.\n\nEntre em contato conosco para mais informações.';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.templates().subscribe((rows) => (this.templates = rows));
  }

  preview(): string {
    return interpolate(this.mensagem, {
      nome: 'João',
      telefone: '5585999999999',
      cpf: '000.000.000-00',
      valor: '250,00',
      vencimento: '10/09/2026',
    });
  }

  save(): void {
    this.api.saveTemplate({ id: this.editing?.id, nome: this.nome, mensagem: this.mensagem }).subscribe(() => {
      this.cancel();
      this.load();
    });
  }

  edit(item: Template): void {
    this.editing = item;
    this.nome = item.nome;
    this.mensagem = item.mensagem;
  }

  remove(item: Template): void {
    this.api.deleteTemplate(item.id).subscribe(() => this.load());
  }

  use(item: Template): void {
    sessionStorage.setItem('templateId', String(item.id));
    void this.router.navigate(['/enviar']);
  }

  cancel(): void {
    this.editing = null;
    this.nome = '';
    this.mensagem =
      'Olá {{nome}},\n\nIdentificamos uma pendência no valor de R$ {{valor}}.\n\nVencimento: {{vencimento}}.\n\nEntre em contato conosco para mais informações.';
  }
}
