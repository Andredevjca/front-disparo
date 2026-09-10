import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { WhatsappStatusService } from '../../core/whatsapp-status.service';
import { Template } from '../../core/models';
import { interpolate } from '../../core/interpolate';

@Component({
  selector: 'app-enviar',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './enviar.component.html',
  styleUrl: './enviar.component.scss',
})
export class EnviarComponent implements OnInit {
  private api = inject(ApiService);
  readonly wa = inject(WhatsappStatusService);
  templates: Template[] = [];
  telefone = '';
  nome = '';
  templateId: number | null = null;
  instance = '';
  mensagem = '';
  loading = false;
  result: { status: string; erro: string | null; telefone: string } | null = null;

  ngOnInit(): void {
    const first = this.wa.conectadas()[0];
    if (first) this.instance = first.instance;
    this.api.templates().subscribe((rows) => {
      this.templates = rows;
      const saved = Number(sessionStorage.getItem('templateId') || 0);
      if (saved) {
        this.templateId = saved;
        sessionStorage.removeItem('templateId');
        this.onTemplate();
      }
    });
  }

  onTemplate(): void {
    const item = this.templates.find((t) => t.id === this.templateId);
    this.mensagem = item?.mensagem || this.mensagem;
  }

  finalMessage(): string {
    return interpolate(this.mensagem, { nome: this.nome, telefone: this.telefone });
  }

  send(): void {
    this.loading = true;
    this.result = null;
    const item = this.templates.find((t) => t.id === this.templateId);
    this.api
      .sendUnitario({
        telefone: this.telefone,
        nome: this.nome,
        mensagem: this.mensagem,
        templateId: this.templateId,
        templateNome: item?.nome,
        instance: this.instance,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.result = res;
        },
        error: (err) => {
          this.loading = false;
          this.result = { status: 'ERRO', erro: err.error?.message || 'Erro no envio', telefone: this.telefone };
        },
      });
  }
}
