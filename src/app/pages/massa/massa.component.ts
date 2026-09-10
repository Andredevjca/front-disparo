import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';
import { WhatsappStatusService } from '../../core/whatsapp-status.service';
import {
  ContatoImportado,
  Envio,
  EnvioDetalhe,
  GrupoDetalhePaginado,
  GrupoImportacao,
  Template,
} from '../../core/models';
import { interpolate } from '../../core/interpolate';

type Step = 'grupos' | 'importar' | 'detalhe' | 'run';

@Component({
  selector: 'app-massa',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './massa.component.html',
  styleUrl: './massa.component.scss',
})
export class MassaComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  readonly wa = inject(WhatsappStatusService);

  instance = '';
  step: Step = 'grupos';
  dragging = false;
  erro: string | null = null;
  carregando = false;

  grupos: GrupoImportacao[] = [];
  grupoSelecionado: GrupoImportacao | null = null;
  detalhe: GrupoDetalhePaginado | null = null;
  page = 1;
  perPage = 20;
  busca = '';

  importarNome = '';
  arquivoSelecionado: File | null = null;
  importando = false;

  templates: Template[] = [];
  templateId: number | null = null;
  mensagem = '';
  intervalo = 3000;
  customIntervalo = 3000;
  intervals = [1000, 3000, 5000, 10000, 15000, 30000];

  jobId: number | null = null;
  envio: Envio | null = null;
  detalhes: EnvioDetalhe[] = [];
  pausedMessage = '';
  private poll: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const first = this.wa.conectadas()[0];
    if (first) this.instance = first.instance;
    this.api.templates().subscribe((rows) => (this.templates = rows));
    this.carregarGrupos();
  }

  ngOnDestroy(): void {
    if (this.poll) clearInterval(this.poll);
  }

  carregarGrupos(): void {
    this.api.grupos().subscribe({
      next: (rows) => {
        this.grupos = rows;
      },
      error: (err) => (this.erro = err?.error?.message || 'Falha ao carregar grupos'),
    });
  }

  irParaImportar(): void {
    this.erro = null;
    this.arquivoSelecionado = null;
    this.step = 'importar';
  }

  cancelarImportar(): void {
    this.importarNome = '';
    this.arquivoSelecionado = null;
    this.erro = null;
    this.step = 'grupos';
  }

  pick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.selecionarArquivo(file);
    input.value = '';
  }

  drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.selecionarArquivo(file);
  }

  selecionarArquivo(file: File): void {
    this.erro = null;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      this.erro = 'Formato não suportado. Use CSV ou XLSX.';
      this.arquivoSelecionado = null;
      return;
    }
    this.arquivoSelecionado = file;
  }

  limparArquivo(): void {
    this.arquivoSelecionado = null;
    this.erro = null;
  }

  confirmarImportar(): void {
    if (!this.arquivoSelecionado) {
      this.erro = 'Selecione uma planilha primeiro.';
      return;
    }
    this.uploadFile(this.arquivoSelecionado);
  }

  uploadFile(file: File): void {
    this.erro = null;
    this.importando = true;
    this.api.importarPlanilha(file, this.importarNome || undefined).subscribe({
      next: () => {
        this.importando = false;
        this.importarNome = '';
        this.arquivoSelecionado = null;
        this.carregarGrupos();
        this.step = 'grupos';
      },
      error: (err) => {
        this.importando = false;
        this.erro = err?.error?.message || 'Falha ao importar planilha';
      },
    });
  }

  abrirGrupo(g: GrupoImportacao): void {
    this.grupoSelecionado = g;
    this.page = 1;
    this.busca = '';
    this.carregarDetalhe();
    this.step = 'detalhe';
  }

  excluirGrupo(g: GrupoImportacao): void {
    if (!confirm(`Excluir grupo "${g.nome || g.arquivo_nome || g.id}" e todos os contatos?`)) return;
    this.api.excluirGrupo(g.id).subscribe({
      next: () => {
        if (this.grupoSelecionado?.id === g.id) {
          this.grupoSelecionado = null;
          this.detalhe = null;
        }
        this.carregarGrupos();
      },
      error: (err) => (this.erro = err?.error?.message || 'Falha ao excluir grupo'),
    });
  }

  mudarPagina(p: number): void {
    if (p < 1) return;
    const max = this.totalPaginas();
    if (max && p > max) return;
    this.page = p;
    this.carregarDetalhe();
  }

  buscar(): void {
    this.page = 1;
    this.carregarDetalhe();
  }

  totalPaginas(): number {
    if (!this.detalhe) return 0;
    return Math.max(1, Math.ceil(this.detalhe.total / this.detalhe.perPage));
  }

  carregarDetalhe(): void {
    if (!this.grupoSelecionado) return;
    this.carregando = true;
    this.api.grupoDetalhe(this.grupoSelecionado.id, this.page, this.perPage, this.busca).subscribe({
      next: (d) => {
        this.detalhe = d;
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err?.error?.message || 'Falha ao carregar detalhe';
      },
    });
  }

  selectedTemplate(): Template | undefined {
    return this.templates.find((t) => t.id === this.templateId);
  }

  onTemplate(): void {
    this.mensagem = this.selectedTemplate()?.mensagem || this.mensagem;
  }

  preview(): string {
    if (!this.detalhe) return interpolate(this.mensagem, {});
    const primeiroValido = this.detalhe.contatos.find((c) => c.status_validacao === 'VALIDO');
    if (!primeiroValido) return interpolate(this.mensagem, {});
    const dados: Record<string, unknown> = {
      ...(primeiroValido.dados || {}),
      nome: primeiroValido.nome || '',
      email: primeiroValido.email || '',
      telefone: primeiroValido.telefone_normalizado || primeiroValido.telefone_original || '',
    };
    return interpolate(this.mensagem, dados);
  }

  private primeiroContatoValido(): ContatoImportado | null {
    if (!this.detalhe) return null;
    return this.detalhe.contatos.find((c) => c.status_validacao === 'VALIDO') || null;
  }

  iniciarDisparo(): void {
    if (!this.grupoSelecionado) return;
    const intervaloMs = this.intervalo === 0 ? this.customIntervalo : this.intervalo;
    this.erro = null;
    this.api
      .enviarMassaPorGrupo(this.grupoSelecionado.id, {
        templateId: this.templateId,
        templateNome: this.selectedTemplate()?.nome,
        mensagem: this.mensagem || null,
        intervaloMs: intervaloMs || null,
        instance: this.instance,
      })
      .subscribe({
        next: ({ id }) => {
          this.jobId = id;
          this.step = 'run';
          this.poll = setInterval(() => this.refresh(), 1500);
          this.refresh();
        },
        error: (err) => (this.erro = err?.error?.message || 'Falha ao iniciar disparo'),
      });
  }

  stop(): void {
    if (!this.jobId) return;
    this.api.pararMassa(this.jobId).subscribe(() => this.refresh());
  }

  refresh(): void {
    if (!this.jobId) return;
    this.api.massa(this.jobId).subscribe({
      next: ({ envio, detalhes }) => {
        this.envio = envio;
        this.detalhes = detalhes;
        if (envio.status === 'PAUSADO') {
          this.pausedMessage = 'WhatsApp desconectado. O disparo foi pausado.';
        }
        if (['CONCLUIDO', 'PARADO', 'PAUSADO'].includes(envio.status) && this.poll) {
          clearInterval(this.poll);
          this.poll = null;
        }
      },
    });
  }

  hour(value: string | null): string {
    if (!value) return '-';
    try {
      const date = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
      if (Number.isNaN(date.getTime())) return value.slice(11, 19);
      return date.toLocaleTimeString('pt-BR');
    } catch {
      return value;
    }
  }

  statusBadge(v: string): string {
    if (v === 'VALIDO') return 'ok';
    if (v === 'INVALIDO') return 'err';
    if (v === 'DUPLICADO') return 'dup';
    return '';
  }

  statusText(v: string): string {
    if (v === 'VALIDO') return 'Válido';
    if (v === 'INVALIDO') return 'Inválido';
    if (v === 'DUPLICADO') return 'Duplicado';
    return v;
  }

  dadosExtras(c: ContatoImportado): Array<[string, unknown]> {
    if (!c.dados) return [];
    return Object.entries(c.dados).filter(([k]) => !['nome', 'email', 'telefone'].includes(k.toLowerCase()));
  }
}
