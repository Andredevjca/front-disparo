import { Injectable, signal } from '@angular/core';
import { ServicoAtendimento } from './atendimento.service';
import { Conversa, ConversaPaginada, Mensagem } from '../models/atendimento.model';

function compararDataMsg(a: Mensagem, b: Mensagem): number {
  const sa = a.data_mensagem || a.created_at || '';
  const sb = b.data_mensagem || b.created_at || '';
  const da = new Date(sa.includes('T') ? sa : sa.replace(' ', 'T') + 'Z').getTime();
  const db = new Date(sb.includes('T') ? sb : sb.replace(' ', 'T') + 'Z').getTime();
  const na = Number.isNaN(da) ? (a.id || 0) : da;
  const nb = Number.isNaN(db) ? (b.id || 0) : db;
  return na - nb;
}

@Injectable({ providedIn: 'root' })
export class ServicoStatusAtendimento {
  readonly conversas = signal<Conversa[]>([]);
  readonly totalConversas = signal<number>(0);
  readonly mensagensConversaAberta = signal<Mensagem[]>([]);
  readonly totalMensagens = signal<number>(0);
  readonly temMaisAntigas = signal<boolean>(false);

  private tempoLista: ReturnType<typeof setInterval> | null = null;
  private tempoMensagens: ReturnType<typeof setInterval> | null = null;
  private buscaAtual = signal<string>('');
  private conversaAbertaId = signal<number | null>(null);
  private ultimaPaginaMensagens = signal<number>(1);
  private reqIdMensagens = 0;
  private reqIdLista = 0;

  constructor(private atendimento: ServicoAtendimento) {}

  iniciarLista(busca = ''): void {
    this.buscaAtual.set(busca);
    this.pararLista();
    this.atualizarLista();
    this.tempoLista = setInterval(() => this.atualizarLista(), 3000);
  }

  pararLista(): void {
    if (this.tempoLista) clearInterval(this.tempoLista);
    this.tempoLista = null;
  }

  atualizarLista(): void {
    const busca = this.buscaAtual();
    const meuId = ++this.reqIdLista;
    this.atendimento.listarConversas({ busca, page: 1, perPage: 200 }).subscribe({
      next: (paginado: ConversaPaginada) => {
        if (meuId !== this.reqIdLista) return;

        const novas = paginado.rows || [];
        const antigas = this.conversas();
        const totalNovo = paginado.total || 0;

        const temDiferenca = (() => {
          if (totalNovo !== this.totalConversas()) return true;
          if (novas.length !== antigas.length) return true;
          for (let i = 0; i < novas.length; i++) {
            const a = antigas[i];
            const n = novas[i];
            if (!a || !n) return true;
            if (a.id !== n.id) return true;
            if (a.mensagens_nao_lidas !== n.mensagens_nao_lidas) return true;
            if (a.ultima_mensagem !== n.ultima_mensagem) return true;
            if (a.ultima_mensagem_em !== n.ultima_mensagem_em) return true;
            if (a.updated_at !== n.updated_at) return true;
          }
          return false;
        })();

        if (temDiferenca) {
          this.conversas.set(novas);
          this.totalConversas.set(totalNovo);
        }
      },
      error: () => {
        // NÃO apaga a lista atual em caso de erro transitório
      },
    });
  }

  abrirConversa(id: number): void {
    this.conversaAbertaId.set(id);
    this.ultimaPaginaMensagens.set(1);
    this.pararMensagens();
    this.reqIdMensagens = 0;
    this.atualizarMensagens(true);
    this.tempoMensagens = setInterval(() => this.atualizarMensagens(false), 1500);
  }

  pararMensagens(): void {
    if (this.tempoMensagens) clearInterval(this.tempoMensagens);
    this.tempoMensagens = null;
  }

  fecharConversa(): void {
    this.pararMensagens();
    this.conversaAbertaId.set(null);
    this.mensagensConversaAberta.set([]);
    this.totalMensagens.set(0);
    this.temMaisAntigas.set(false);
  }

  atualizarMensagens(resetar: boolean): void {
    const id = this.conversaAbertaId();
    if (!id) return;
    const meuId = ++this.reqIdMensagens;
    this.atendimento.listarMensagens(id, { page: 1, perPage: 50 }).subscribe({
      next: (res) => {
        if (meuId !== this.reqIdMensagens) return;

        const totalNovo = res.total || 0;
        const temMaisAntigasNovo = !!res.tem_mais_antigas;
        const novas = res.rows || [];

        if (!resetar && this.mensagensConversaAberta().length > 0) {
          const antigas = this.mensagensConversaAberta();
          if (totalNovo === this.totalMensagens() &&
              temMaisAntigasNovo === this.temMaisAntigas() &&
              antigas.length === novas.length) {
            let igual = true;
            for (let i = 0; i < novas.length; i++) {
              const a = antigas[i];
              const n = novas[i];
              if (!a || !n) { igual = false; break; }
              if (a.id !== n.id || a.status !== n.status || a.conteudo !== n.conteudo) {
                igual = false; break;
              }
            }
            if (igual) return;
          }

          const antigas2 = this.mensagensConversaAberta();
          const mapa = new Map<number, Mensagem>();
          antigas2.forEach((m) => mapa.set(m.id, m));
          novas.forEach((m) => mapa.set(m.id, m));
          const todas = Array.from(mapa.values()).sort(compararDataMsg);
          this.mensagensConversaAberta.set(todas);
        } else {
          this.mensagensConversaAberta.set([...novas].sort(compararDataMsg));
        }

        this.totalMensagens.set(totalNovo);
        this.temMaisAntigas.set(temMaisAntigasNovo);
        this.ultimaPaginaMensagens.set(1);
      },
      error: () => {
        // MESMO se resetar=true, NÃO apaga o array atual
        // Evita o cenário "primeira request falhou e o chat fica vazio"
      },
    });
  }

  carregarMaisAntigas(): void {
    const id = this.conversaAbertaId();
    if (!id) return;
    const proxima = this.ultimaPaginaMensagens() + 1;
    this.atendimento.listarMensagens(id, { page: proxima, perPage: 50 }).subscribe({
      next: (res) => {
        const novas = res.rows || [];
        if (novas.length === 0) { this.temMaisAntigas.set(false); return; }
        const atuais = this.mensagensConversaAberta();
        const mapa = new Map<number, Mensagem>();
        [...novas, ...atuais].forEach((m) => mapa.set(m.id, m));
        const todas = Array.from(mapa.values()).sort(compararDataMsg);
        this.mensagensConversaAberta.set(todas);
        this.temMaisAntigas.set(!!res.tem_mais_antigas);
        this.ultimaPaginaMensagens.set(proxima);
      },
      error: () => {
        // Não altera nada em erro
      },
    });
  }

  adicionarMensagemLocal(m: Mensagem): void {
    const atuais = this.mensagensConversaAberta();
    const mapa = new Map<number, Mensagem>();
    [...atuais, m].forEach((x) => mapa.set(x.id, x));
    const todas = Array.from(mapa.values()).sort(compararDataMsg);
    this.mensagensConversaAberta.set(todas);
  }
}
