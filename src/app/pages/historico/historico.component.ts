import { Component, OnInit, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ServicoHistorico } from '../../services/historico.service';
import { DetalheEnvio } from '../../models/historico.model';

@Component({
  selector: 'app-historico',
  imports: [CommonModule, FormsModule, NgbModalModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.scss',
})
export class HistoricoComponent implements OnInit {
  private servicoHistorico = inject(ServicoHistorico);
  private modalService = inject(NgbModal);

  registros: DetalheEnvio[] = [];
  pagina = 1;
  itensPorPagina = 50;
  totalRegistros = 0;

  status = '';
  telefone = '';
  nome = '';
  instancia = '';
  de = '';
  ate = '';
  registroSelecionado: DetalheEnvio | null = null;
  carregando = false;
  opcoesItensPorPagina = [20, 50, 100, 200];
  opcoesStatus = [
    { value: '', label: 'Todos' },
    { value: 'ENVIADO', label: 'Enviado' },
    { value: 'ERRO', label: 'Erro' },
    { value: 'ENVIANDO', label: 'Enviando' },
    { value: 'PENDENTE', label: 'Pendente' },
  ];

  ngOnInit(): void {
    this.buscarRegistros();
  }

  buscarRegistros(pagina = 1): void {
    this.pagina = pagina;
    this.carregando = true;
    this.servicoHistorico
      .listar({
        page: this.pagina,
        perPage: this.itensPorPagina,
        status: this.status,
        telefone: this.telefone,
        nome: this.nome,
        instancia: this.instancia,
        de: this.de,
        ate: this.ate,
      })
      .subscribe({
        next: (resposta) => {
          this.registros = resposta.rows;
          this.pagina = resposta.page;
          this.itensPorPagina = resposta.perPage;
          this.totalRegistros = resposta.total;
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
    this.buscarRegistros(p);
  }

  abrirDetalhes(registro: DetalheEnvio, conteudo: TemplateRef<unknown>): void {
    this.registroSelecionado = registro;
    this.modalService.open(conteudo, {
      ariaLabelledBy: 'modal-detalhes-envio-titulo',
      centered: true,
      scrollable: true,
      size: 'lg',
      windowClass: 'historico-modal',
      backdropClass: 'historico-modal-backdrop',
    }).result.finally(() => {
      this.registroSelecionado = null;
    });
  }

  totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.itensPorPagina));
  }

  classeStatus(status: string): string {
    if (status === 'ENVIADO') return 'ok';
    if (status === 'ERRO') return 'err';
    if (status === 'ENVIANDO' || status === 'PENDENTE') return 'warn';
    return '';
  }

  textoStatus(status: string): string {
    switch (status) {
      case 'ENVIADO':
        return 'Enviado';
      case 'ERRO':
        return 'Erro';
      case 'ENVIANDO':
        return 'Enviando';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return status;
    }
  }

  formatarData(registro: DetalheEnvio): string {
    const valor = registro.enviado_em || registro.created_at;
    const data = new Date(valor.includes('T') ? valor : valor.replace(' ', 'T') + 'Z');
    if (Number.isNaN(data.getTime())) return valor;
    return data.toLocaleString('pt-BR');
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
    this.buscarRegistros(1);
  }
}
