import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ContatoWhatsApp,
  ConversaDetalhe,
  ConversaPaginada,
  Mensagem,
  MensagemPaginada,
  SincroniaStatus,
} from '../models/atendimento.model';

@Injectable({ providedIn: 'root' })
export class ServicoAtendimento {
  constructor(private http: HttpClient) {}

  listarConversas(params: { busca?: string; page?: number; perPage?: number }) {
    const url = new URLSearchParams();
    if (params.busca) url.set('busca', params.busca);
    if (params.page) url.set('page', String(params.page));
    if (params.perPage) url.set('perPage', String(params.perPage));
    const query = url.toString();
    return this.http.get<ConversaPaginada>(`/api/atendimento/conversas${query ? `?${query}` : ''}`);
  }

  obterConversa(id: number) {
    return this.http.get<ConversaDetalhe>(`/api/atendimento/conversas/${id}`);
  }

  listarMensagens(id: number, params: { page?: number; perPage?: number }) {
    const url = new URLSearchParams();
    if (params.page) url.set('page', String(params.page));
    if (params.perPage) url.set('perPage', String(params.perPage));
    const query = url.toString();
    return this.http.get<MensagemPaginada>(`/api/atendimento/conversas/${id}/mensagens${query ? `?${query}` : ''}`);
  }

  enviarMensagem(id: number, texto: string) {
    return this.http.post<Mensagem>(`/api/atendimento/conversas/${id}/mensagens`, { texto });
  }

  marcarComoLida(id: number) {
    return this.http.post<{ ok: boolean }>(`/api/atendimento/conversas/${id}/ler`, {});
  }

  listarContatos(busca?: string) {
    const url = new URLSearchParams();
    if (busca) url.set('busca', busca);
    const query = url.toString();
    return this.http.get<ContatoWhatsApp[]>(`/api/atendimento/contatos${query ? `?${query}` : ''}`);
  }

  dispararSincronia(forcar = false, instancia?: string) {
    const params = new URLSearchParams();
    params.set('forcar', String(forcar));
    return this.http.post<{ status: string; iniciado_em?: string }>(
      `/api/atendimento/sincronizar?${params.toString()}`,
      instancia ? { instancia } : {},
    );
  }

  obterStatusSincronia() {
    return this.http.get<SincroniaStatus>(`/api/atendimento/sincronizar/status`);
  }
}
