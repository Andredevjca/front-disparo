import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { EnvioDetalhe } from '../../core/models';

@Component({
  selector: 'app-historico',
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.scss',
})
export class HistoricoComponent implements OnInit {
  private api = inject(ApiService);

  rows: EnvioDetalhe[] = [];
  page = 1;
  perPage = 50;
  total = 0;

  status = '';
  telefone = '';
  nome = '';
  instancia = '';
  de = '';
  ate = '';
  selected: EnvioDetalhe | null = null;
  carregando = false;
  perPageOptions = [20, 50, 100, 200];
  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ENVIADO', label: 'Enviado' },
    { value: 'ERRO', label: 'Erro' },
    { value: 'ENVIANDO', label: 'Enviando' },
    { value: 'PENDENTE', label: 'Pendente' },
  ];

  ngOnInit(): void {
    this.search();
  }

  search(pagina = 1): void {
    this.page = pagina;
    this.carregando = true;
    this.api
      .historico({
        page: this.page,
        perPage: this.perPage,
        status: this.status,
        telefone: this.telefone,
        nome: this.nome,
        instancia: this.instancia,
        de: this.de,
        ate: this.ate,
      })
      .subscribe({
        next: (res) => {
          this.rows = res.rows;
          this.page = res.page;
          this.perPage = res.perPage;
          this.total = res.total;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
        },
      });
  }

  mudarPagina(p: number): void {
    if (p < 1) return;
    const max = this.totalPaginas();
    if (max && p > max) return;
    this.search(p);
  }

  totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total / this.perPage));
  }

  statusBadge(v: string): string {
    if (v === 'ENVIADO') return 'ok';
    if (v === 'ERRO') return 'err';
    if (v === 'ENVIANDO' || v === 'PENDENTE') return 'warn';
    return '';
  }

  statusText(v: string): string {
    switch (v) {
      case 'ENVIADO':
        return 'Enviado';
      case 'ERRO':
        return 'Erro';
      case 'ENVIANDO':
        return 'Enviando';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return v;
    }
  }

  when(row: EnvioDetalhe): string {
    const value = row.enviado_em || row.created_at;
    const date = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('pt-BR');
  }

  tipo(value?: string): string {
    return value === 'MASSA' ? 'Massa' : 'Unitário';
  }

  limpar(): void {
    this.status = '';
    this.telefone = '';
    this.nome = '';
    this.instancia = '';
    this.de = '';
    this.ate = '';
    this.search(1);
  }
}
