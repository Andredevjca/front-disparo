import { Component, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServicoAtendimento } from '../../services/atendimento.service';
import { ServicoStatusAtendimento } from '../../services/status-atendimento.service';
import { ServicoNotificacao } from '../../services/notificacao.service';
import { Conversa, Mensagem, SincroniaStatus } from '../../models/atendimento.model';

@Component({
  selector: 'app-atendimento',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './atendimento.component.html',
  styleUrl: './atendimento.component.scss',
})
export class AtendimentoComponent implements OnInit, OnDestroy {
  private atendimento = inject(ServicoAtendimento);
  private statusAtendimento = inject(ServicoStatusAtendimento);
  private notificacao = inject(ServicoNotificacao);

  busca = signal('');
  textoDigitado = '';
  enviando = false;
  conversaSelecionadaId = signal<number | null>(null);
  rolarParaFimPending = false;
  private qtdMsgsAnterior = 0;

  sincronia = signal<SincroniaStatus>({
    status: 'PENDENTE',
    total_contatos: 0,
    total_conversas: 0,
    total_mensagens: 0,
  });
  sincroniaBloqueiaBotao = false;
  private pollingHandle: number | null = null;

  get conversas() { return this.statusAtendimento.conversas(); }
  get totalConversas() { return this.statusAtendimento.totalConversas(); }
  get mensagens() { return this.statusAtendimento.mensagensConversaAberta(); }
  get temMaisAntigas() { return this.statusAtendimento.temMaisAntigas(); }
  get conversaSelecionada(): Conversa | null {
    const id = this.conversaSelecionadaId();
    if (!id) return null;
    return this.conversas.find((c) => c.id === id) || null;
  }

  private readonly rolarQuandoMudar = effect(() => {
    const qtd = this.mensagens.length;
    const idSel = this.conversaSelecionadaId();
    if (idSel == null) { this.qtdMsgsAnterior = 0; return; }
    if (qtd !== this.qtdMsgsAnterior) {
      this.qtdMsgsAnterior = qtd;
      this.rolarParaFimPending = true;
      setTimeout(() => this.rolarParaFim(), 30);
    }
  });

  ngOnInit(): void {
    this.statusAtendimento.iniciarLista('');
    this.atualizarStatusSincronia(true);
    this.iniciarPolling();
  }

  ngOnDestroy(): void {
    this.statusAtendimento.pararLista();
    this.statusAtendimento.fecharConversa();
    this.pararPolling();
  }

  pararPolling(): void {
    if (this.pollingHandle != null) {
      window.clearInterval(this.pollingHandle);
      this.pollingHandle = null;
    }
  }

  atualizarStatusSincronia(aposAtualizacaoDispararSeNecessario = false): void {
    this.atendimento.obterStatusSincronia().subscribe({
      next: (s) => {
        this.sincronia.set(s);
        if (s.status === 'PENDENTE' && aposAtualizacaoDispararSeNecessario) {
          this.dispararSincronia(false);
        }
        this.ajustarIntervaloPolling();
      },
      error: () => {},
    });
  }

  iniciarPolling(): void {
    if (this.pollingHandle != null) return;
    this.pollingHandle = window.setInterval(() => this.atualizarStatusSincronia(false), 8000);
  }

  private ajustarIntervaloPolling(): void {
    const s = this.sincronia()?.status;
    const rapido = s === 'EM_ANDAMENTO' || s === 'DISPARADO';
    const novoIntervalo = rapido ? 2500 : 8000;
    const atual = this.pollingHandle;
    if (atual != null) {
      window.clearInterval(atual);
      this.pollingHandle = window.setInterval(() => this.atualizarStatusSincronia(false), novoIntervalo);
    }
  }

  dispararSincronia(forcar: boolean): void {
    if (this.sincroniaBloqueiaBotao) return;
    this.sincroniaBloqueiaBotao = true;
    this.atendimento.dispararSincronia(forcar).subscribe({
      next: (r: any) => {
        this.sincronia.update((s) => ({
          ...s,
          status: (r?.status as any) ?? 'DISPARADO',
          iniciado_em: r?.iniciado_em ?? s.iniciado_em ?? new Date().toISOString(),
        }));
        this.iniciarPolling();
        setTimeout(() => this.atualizarStatusSincronia(false), 1500);
        this.sincroniaBloqueiaBotao = false;
        this.notificacao.sucesso(
          forcar ? 'Sincronia forçada disparada' : 'Sincronia disparada',
          'Buscando histórico e mensagens recebidas...',
        );
        setTimeout(() => this.statusAtendimento.atualizarLista(), 3000);
      },
      error: (err) => {
        this.sincroniaBloqueiaBotao = false;
        const msg = (err?.error as any)?.erro ?? 'Não foi possível iniciar a sincronia';
        this.notificacao.erro('Erro na sincronia', msg);
      },
    });
  }

  textoStatusSincronia(): string {
    const s = this.sincronia();
    const c = s.total_contatos ?? 0;
    const cv = s.total_conversas ?? 0;
    const m = s.total_mensagens ?? 0;
    switch (s.status) {
      case 'PENDENTE':
        return 'Sincronia pendente';
      case 'DISPARADO':
        return 'Preparando sincronia...';
      case 'EM_ANDAMENTO':
        return `Sincronizando · ${c} contatos · ${cv} conversas · ${m} msg`;
      case 'OK':
        return `Sincronizado · ${c} contatos · ${cv} conversas · ${m} msg`;
      case 'ERRO':
        return `Erro na sincronia · ${s.erro ?? 'tente novamente'}`;
      default:
        return '';
    }
  }

  sincroniaConcluida(): boolean {
    const s = this.sincronia()?.status;
    return s === 'OK' || s === 'ERRO';
  }

  textoListaVazia(): string {
    const s = this.sincronia()?.status;
    if (s === 'EM_ANDAMENTO' || s === 'DISPARADO' || s === 'PENDENTE') {
      return 'Sincronizando conversas...';
    }
    return 'Ainda nenhuma conversa disponível.';
  }

  subTextoListaVazia(): string {
    const s = this.sincronia()?.status;
    if (s === 'EM_ANDAMENTO' || s === 'DISPARADO') {
      return 'As conversas do WhatsApp aparecerão em breve.';
    }
    if (s === 'PENDENTE') {
      return 'Clique no botão de sincronia para buscar as conversas do WhatsApp.';
    }
    if (s === 'ERRO') {
      return 'A sincronia terminou com erro. Tente novamente.';
    }
    return 'Novas mensagens recebidas aparecerão aqui.';
  }

  textoSemMensagens(): string {
    if (this.sincroniaConcluida()) {
      return 'Nenhuma mensagem disponível no histórico.';
    }
    return 'Envie a primeira mensagem';
  }

  aoAlterarBusca(): void {
    this.statusAtendimento.iniciarLista(this.busca() || '');
  }

  selecionarConversa(c: Conversa): void {
    this.conversaSelecionadaId.set(c.id);
    this.statusAtendimento.abrirConversa(c.id);
    this.atendimento.marcarComoLida(c.id).subscribe({
      error: () => {},
    });
    this.rolarParaFimPending = true;
    setTimeout(() => this.rolarParaFim(), 50);
  }

  carregarMaisAntigas(): void {
    this.statusAtendimento.carregarMaisAntigas();
  }

  enviarMensagem(): void {
    const id = this.conversaSelecionadaId();
    if (!id) return;
    const texto = this.textoDigitado.trim();
    if (!texto) return;
    this.enviando = true;
    this.atendimento.enviarMensagem(id, texto).subscribe({
      next: (m: Mensagem) => {
        this.textoDigitado = '';
        this.statusAtendimento.adicionarMensagemLocal(m);
        this.statusAtendimento.atualizarLista();
        this.enviando = false;
        this.rolarParaFimPending = true;
        setTimeout(() => this.rolarParaFim(), 20);
      },
      error: (err) => {
        this.enviando = false;
        const msg = (err?.error as any)?.erro || 'Não foi possível enviar a mensagem';
        this.notificacao.erro('Erro no envio', msg);
      },
    });
  }

  enviarComEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.enviarMensagem();
    }
  }

  rolarParaFim(): void {
    const el = document.querySelector('.atendimento-mensagens');
    if (el) el.scrollTop = el.scrollHeight;
  }

  aoRolarListaMensagens(e: Event): void {
    const el = e.target as HTMLElement;
    if (!el) return;
    if (el.scrollTop < 40 && this.temMaisAntigas) {
      this.carregarMaisAntigas();
    }
  }

  avatarLetra(nome?: string | null, telefone?: string | null): string {
    const texto = (nome || telefone || '?').trim();
    if (!texto) return '?';
    return texto[0].toUpperCase();
  }

  formatarHora(msg: Mensagem): string {
    const raw = msg.data_mensagem || msg.created_at;
    if (!raw) return '';
    const data = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z');
    if (Number.isNaN(data.getTime())) {
      const local = new Date(raw);
      if (!Number.isNaN(local.getTime())) data.setTime(local.getTime());
      else return raw;
    }
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatarHoraConversa(c: Conversa): string {
    const raw = c.ultima_mensagem_em || c.updated_at || c.created_at;
    if (!raw) return '';
    const data = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T') + 'Z');
    if (Number.isNaN(data.getTime())) {
      const local = new Date(raw);
      if (!Number.isNaN(local.getTime())) data.setTime(local.getTime());
      else return '';
    }
    const agora = new Date();
    const mesmoDia =
      data.getFullYear() === agora.getFullYear() &&
      data.getMonth() === agora.getMonth() &&
      data.getDate() === agora.getDate();
    if (mesmoDia) return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const ontem = new Date(agora);
    ontem.setDate(agora.getDate() - 1);
    const ehOntem =
      data.getFullYear() === ontem.getFullYear() &&
      data.getMonth() === ontem.getMonth() &&
      data.getDate() === ontem.getDate();
    if (ehOntem) return 'Ontem';
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  rotuloStatus(msg: Mensagem): string {
    switch (msg.status) {
      case 'LIDA':
        return '✓✓';
      case 'ENTREGUE':
        return '✓✓';
      case 'ENVIADA':
        return '✓';
      case 'ERRO':
        return '✗';
      case 'PENDENTE':
        return '⋯';
      default:
        return '';
    }
  }

  classeStatusMensagem(msg: Mensagem): string {
    switch (msg.status) {
      case 'LIDA':
        return 's-lida';
      case 'ENTREGUE':
        return 's-entregue';
      case 'ENVIADA':
        return 's-enviada';
      case 'ERRO':
        return 's-erro';
      case 'PENDENTE':
        return 's-pendente';
      default:
        return '';
    }
  }

  nomeConversa(c: Conversa): string {
    return c.nome_whatsapp || c.nome || c.telefone;
  }

  subNomeConversa(c: Conversa): string | null {
    const temNome = !!c.nome_whatsapp || !!c.nome;
    return temNome ? c.telefone : null;
  }
}
