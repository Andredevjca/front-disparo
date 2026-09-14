import { Injectable, signal } from '@angular/core';
import { EMPTY, Subscription, catchError, exhaustMap, timer } from 'rxjs';
import { ServicoAtendimento } from './atendimento.service';
import { Mensagem } from '../models/atendimento.model';

function ordenar(a: Mensagem, b: Mensagem): number {
  const da = Date.parse(a.data_mensagem || a.created_at);
  const db = Date.parse(b.data_mensagem || b.created_at);
  return (da - db || a.id - b.id);
}

@Injectable({ providedIn: 'root' })
export class ServicoStatusAtendimento {
  readonly conversas = signal<import('../models/atendimento.model').Conversa[]>([]);
  readonly totalConversas = signal(0);
  readonly mensagensConversaAberta = signal<Mensagem[]>([]);
  readonly totalMensagens = signal(0);
  readonly temMaisAntigas = signal(false);
  private lista?: Subscription;
  private mensagens?: Subscription;
  private antigas?: Subscription;
  private busca = '';
  private conversaId: number | null = null;
  private pagina = 1;
  private carregandoAntigas = false;

  constructor(private atendimento: ServicoAtendimento) {}

  iniciarLista(busca = ''): void {
    this.busca = busca;
    this.pararLista();
    this.lista = timer(0, 5000).pipe(
      exhaustMap(() => this.atendimento.listarConversas({ busca: this.busca, page: 1, perPage: 200 }).pipe(catchError(() => EMPTY)))
    ).subscribe(res => {
      const rows = res.rows || [];
      if (JSON.stringify(rows) !== JSON.stringify(this.conversas())) this.conversas.set(rows);
      this.totalConversas.set(res.total || 0);
    });
  }
  pararLista(): void { this.lista?.unsubscribe(); }
  atualizarLista(): void { this.iniciarLista(this.busca); }

  abrirConversa(id: number): void {
    this.fecharConversa();
    this.conversaId = id;
    this.pagina = 1;
    this.mensagens = timer(0, 3000).pipe(
      exhaustMap(() => this.atendimento.listarMensagens(id, { page: 1, perPage: 50 }).pipe(catchError(() => EMPTY)))
    ).subscribe(res => {
      if (id !== this.conversaId) return;
      this.mesclar(res.rows || []);
      this.totalMensagens.set(res.total || 0);
      this.temMaisAntigas.set(this.mensagensConversaAberta().length < this.totalMensagens());
    });
  }
  pararMensagens(): void { this.mensagens?.unsubscribe(); }
  fecharConversa(): void {
    this.pararMensagens();
    this.antigas?.unsubscribe();
    this.carregandoAntigas = false;
    this.conversaId = null;
    this.mensagensConversaAberta.set([]);
    this.totalMensagens.set(0);
    this.temMaisAntigas.set(false);
  }
  carregarMaisAntigas(): void {
    const id = this.conversaId;
    if (!id || this.carregandoAntigas || !this.temMaisAntigas()) return;
    this.carregandoAntigas = true;
    const page = this.pagina + 1;
    this.antigas = this.atendimento.listarMensagens(id, { page, perPage: 50 }).subscribe({
      next: res => {
        if (id !== this.conversaId) return;
        this.mesclar(res.rows || []);
        this.pagina = page;
        this.totalMensagens.set(res.total || 0);
        this.temMaisAntigas.set(!!res.tem_mais_antigas);
        this.carregandoAntigas = false;
      },
      error: () => { this.carregandoAntigas = false; }
    });
  }
  adicionarMensagemLocal(m: Mensagem): void {
    if (m.conversa_id === this.conversaId) this.mesclar([m]);
  }
  private mesclar(novas: Mensagem[]): void {
    const atuais = this.mensagensConversaAberta();
    const mapa = new Map(atuais.map(m => [m.id, m]));
    novas.forEach(m => mapa.set(m.id, m));
    const todas = Array.from(mapa.values()).sort(ordenar);
    if (JSON.stringify(todas) !== JSON.stringify(atuais)) this.mensagensConversaAberta.set(todas);
  }
}
