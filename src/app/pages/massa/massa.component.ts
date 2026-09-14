import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagemEnvio } from '../../models/imagem.model';
import { ImagemEnvioComponent } from '../../shared/imagem-envio/imagem-envio.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ServicoMassa } from '../../services/massa.service';
import { ServicoModelos } from '../../services/modelos.service';
import { ServicoStatusWhatsApp } from '../../services/status-whatsapp.service';
import {
  ContatoImportado,
  Envio,
  DetalheEnvio,
  DetalheGrupoPaginado,
  GrupoImportacao,
} from '../../models/massa.model';
import { ModeloMensagem } from '../../models/template.model';
import { interpolar } from '../../util/texto.util';

type Etapa = 'grupos' | 'importar' | 'detalhe' | 'run';

@Component({
  selector: 'app-massa',
  imports: [ImagemEnvioComponent,
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
  private servicoMassa = inject(ServicoMassa);
  private servicoModelos = inject(ServicoModelos);
  readonly wa = inject(ServicoStatusWhatsApp);

  instancia = '';
  etapa: Etapa = 'grupos';
  arrastando = false;
  erro: string | null = null;
  carregando = false;

  grupos: GrupoImportacao[] = [];
  grupoSelecionado: GrupoImportacao | null = null;
  detalhe: DetalheGrupoPaginado | null = null;
  pagina = 1;
  itensPorPagina = 20;
  busca = '';

  nomeImportacao = '';
  arquivoSelecionado: File | null = null;
  importando = false;

  modelos: ModeloMensagem[] = [];
  idModelo: number | null = null;
  imagem: ImagemEnvio | null = null;
  imagemPendente = false;
  mensagem = '';
  intervalo = 3000;
  intervaloPersonalizado = 3000;
  opcoesIntervalo = [1000, 3000, 5000, 10000, 15000, 30000];

  idDisparo: number | null = null;
  envio: Envio | null = null;
  detalhes: DetalheEnvio[] = [];
  mensagemPausado = '';
  private temporizador: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const primeiraConta = this.wa.conectadas()[0];
    if (primeiraConta) this.instancia = primeiraConta.instance;
    this.servicoModelos.listar().subscribe((modelos) => (this.modelos = modelos));
    this.carregarGrupos();
  }

  ngOnDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  carregarGrupos(): void {
    this.servicoMassa.listarGrupos().subscribe({
      next: (grupos) => {
        this.grupos = grupos;
      },
      error: (err) => (this.erro = err?.error?.message || 'Falha ao carregar grupos'),
    });
  }

  irParaImportar(): void {
    this.erro = null;
    this.arquivoSelecionado = null;
    this.etapa = 'importar';
  }

  cancelarImportar(): void {
    this.nomeImportacao = '';
    this.arquivoSelecionado = null;
    this.erro = null;
    this.etapa = 'grupos';
  }

  selecionarArquivoNoCampo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (arquivo) this.selecionarArquivo(arquivo);
    input.value = '';
  }

  soltarArquivo(event: DragEvent): void {
    event.preventDefault();
    this.arrastando = false;
    const arquivo = event.dataTransfer?.files?.[0];
    if (arquivo) this.selecionarArquivo(arquivo);
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
    this.importarArquivo(this.arquivoSelecionado);
  }

  importarArquivo(arquivo: File): void {
    this.erro = null;
    this.importando = true;
    this.servicoMassa.importar(arquivo, this.nomeImportacao || undefined).subscribe({
      next: () => {
        this.importando = false;
        this.nomeImportacao = '';
        this.arquivoSelecionado = null;
        this.carregarGrupos();
        this.etapa = 'grupos';
      },
      error: (err) => {
        this.importando = false;
        this.erro = err?.error?.message || 'Falha ao importar planilha';
      },
    });
  }

  abrirGrupo(g: GrupoImportacao): void {
    this.imagem = this.modeloSelecionado()?.imagem || null;
    this.imagemPendente = false;
    this.grupoSelecionado = g;
    this.pagina = 1;
    this.busca = '';
    this.carregarDetalhe();
    this.etapa = 'detalhe';
  }

  excluirGrupo(g: GrupoImportacao): void {
    if (!confirm(`Excluir grupo "${g.nome || g.arquivo_nome || g.id}" e todos os contatos?`)) return;
    this.servicoMassa.excluirGrupo(g.id).subscribe({
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
    this.pagina = p;
    this.carregarDetalhe();
  }

  buscar(): void {
    this.pagina = 1;
    this.carregarDetalhe();
  }

  totalPaginas(): number {
    if (!this.detalhe) return 0;
    return Math.max(1, Math.ceil(this.detalhe.total / this.detalhe.perPage));
  }

  carregarDetalhe(): void {
    if (!this.grupoSelecionado) return;
    this.carregando = true;
    this.servicoMassa.obterGrupo(this.grupoSelecionado.id, this.pagina, this.itensPorPagina, this.busca).subscribe({
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

  modeloSelecionado(): ModeloMensagem | undefined {
    return this.modelos.find((modelo) => modelo.id === this.idModelo);
  }

  aoSelecionarModelo(): void {
    this.mensagem = this.modeloSelecionado()?.mensagem || this.mensagem;
    this.imagem = this.modeloSelecionado()?.imagem || null;
    this.imagemPendente = false;
  }

  visualizarMensagem(): string {
    if (!this.detalhe) return interpolar(this.mensagem, {});
    const primeiroValido = this.detalhe.contatos.find((c) => c.status_validacao === 'VALIDO');
    if (!primeiroValido) return interpolar(this.mensagem, {});
    const dados: Record<string, unknown> = {
      ...(primeiroValido.dados || {}),
      nome: primeiroValido.nome || '',
      email: primeiroValido.email || '',
      telefone: primeiroValido.telefone_normalizado || primeiroValido.telefone_original || '',
    };
    return interpolar(this.mensagem, dados);
  }

  private primeiroContatoValido(): ContatoImportado | null {
    if (!this.detalhe) return null;
    return this.detalhe.contatos.find((c) => c.status_validacao === 'VALIDO') || null;
  }

  iniciarDisparo(): void {
    if (this.carregando || this.imagemPendente || !this.instancia || (!this.mensagem.trim() && !this.imagem)) return;
    if (!this.grupoSelecionado) return;
    const intervaloMs = this.intervalo === 0 ? this.intervaloPersonalizado : this.intervalo;
    this.erro = null;
    this.carregando = true;
    this.servicoMassa
      .iniciar(this.grupoSelecionado.id, {
        idModelo: this.idModelo,
        nomeModelo: this.modeloSelecionado()?.nome,
        mensagem: this.mensagem || null,
        intervaloMs: intervaloMs || null,
        instancia: this.instancia,
        imagem: this.imagem,
      })
      .subscribe({
        next: ({ id }) => {
          this.carregando = false;
          this.idDisparo = id;
          this.etapa = 'run';
          this.temporizador = setInterval(() => this.atualizarDisparo(), 1500);
          this.atualizarDisparo();
        },
        error: (err) => { this.carregando = false; this.erro = err?.error?.message || 'Falha ao iniciar disparo'; },
      });
  }

  pararDisparo(): void {
    if (!this.idDisparo) return;
    this.servicoMassa.parar(this.idDisparo).subscribe(() => this.atualizarDisparo());
  }

  atualizarDisparo(): void {
    if (!this.idDisparo) return;
    this.servicoMassa.obterEnvio(this.idDisparo).subscribe({
      next: ({ envio, detalhes }) => {
        this.envio = envio;
        this.detalhes = detalhes;
        if (envio.status === 'PAUSADO') {
          this.mensagemPausado = 'WhatsApp desconectado. O disparo foi pausado.';
        }
        if (['CONCLUIDO', 'PARADO', 'PAUSADO'].includes(envio.status) && this.temporizador) {
          clearInterval(this.temporizador);
          this.temporizador = null;
        }
      },
    });
  }

  formatarHora(valor: string | null): string {
    if (!valor) return '-';
    try {
      const data = new Date(valor.includes('T') ? valor : valor.replace(' ', 'T') + 'Z');
      if (Number.isNaN(data.getTime())) return valor.slice(11, 19);
      return data.toLocaleTimeString('pt-BR');
    } catch {
      return valor;
    }
  }

  classeStatus(status: string): string {
    if (status === 'VALIDO') return 'ok';
    if (status === 'INVALIDO') return 'err';
    if (status === 'DUPLICADO') return 'dup';
    return '';
  }

  textoStatus(status: string): string {
    if (status === 'VALIDO') return 'Válido';
    if (status === 'INVALIDO') return 'Inválido';
    if (status === 'DUPLICADO') return 'Duplicado';
    return status;
  }

  dadosExtras(c: ContatoImportado): Array<[string, unknown]> {
    if (!c.dados) return [];
    return Object.entries(c.dados).filter(([k]) => !['nome', 'email', 'telefone'].includes(k.toLowerCase()));
  }
}
