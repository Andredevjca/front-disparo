import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Envio,
  EnvioDetalhe,
  GrupoDetalhePaginado,
  GrupoImportacao,
  HistoricoPaginado,
  ImportarPlanilhaResponse,
  Template,
  Usuario,
  WhatsAppAccount,
  WhatsAppSummary,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  status() {
    return this.http.get<WhatsAppSummary>('/api/whatsapp/status');
  }

  contas() {
    return this.http.get<WhatsAppAccount[]>('/api/whatsapp/contas');
  }

  criarConta(nome: string) {
    return this.http.post<WhatsAppAccount>('/api/whatsapp/contas', { nome });
  }

  connect(instance: string) {
    return this.http.post<WhatsAppAccount>(`/api/whatsapp/contas/${encodeURIComponent(instance)}/connect`, {});
  }

  disconnect(instance: string) {
    return this.http.post<{ ok: boolean }>(`/api/whatsapp/contas/${encodeURIComponent(instance)}/disconnect`, {});
  }

  removerConta(instance: string) {
    return this.http.delete(`/api/whatsapp/contas/${encodeURIComponent(instance)}`);
  }

  templates() {
    return this.http.get<Template[]>('/api/modelos');
  }

  saveTemplate(body: { id?: number; nome: string; mensagem: string }) {
    if (body.id) return this.http.put<Template>(`/api/modelos/${body.id}`, body);
    return this.http.post<Template>('/api/modelos', body);
  }

  deleteTemplate(id: number) {
    return this.http.delete(`/api/modelos/${id}`);
  }

  sendUnitario(body: {
    telefone: string;
    nome: string;
    mensagem: string;
    templateId?: number | null;
    templateNome?: string | null;
    instance: string;
  }) {
    return this.http.post<{ status: string; telefone: string; mensagem: string; erro: string | null }>('/api/envios/unitario', body);
  }

  startMassa(body: {
    templateId?: number | null;
    templateNome?: string | null;
    mensagem: string;
    intervaloMs: number;
    instance: string;
    contatos: Array<{ nome: string; telefone: string; dados: Record<string, string> }>;
  }) {
    return this.http.post<{ id: number }>('/api/envios/massa', body);
  }

  massa(id: number) {
    return this.http.get<{ envio: Envio; detalhes: EnvioDetalhe[] }>(`/api/envios/massa/${id}`);
  }

  pararMassa(id: number) {
    return this.http.post(`/api/envios/massa/${id}/parar`, {});
  }

  historico(filters: {
    page?: number;
    perPage?: number;
    status?: string;
    telefone?: string;
    nome?: string;
    instancia?: string;
    grupoImportacaoId?: number | null;
    de?: string;
    ate?: string;
  }) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      params = params.set(key, String(value));
    });
    return this.http.get<HistoricoPaginado>('/api/historico', { params });
  }

  usuarios() {
    return this.http.get<Usuario[]>('/api/usuarios');
  }

  criarUsuario(body: { nome?: string; email: string; password: string }) {
    return this.http.post<Usuario>('/api/usuarios', body);
  }

  atualizarUsuario(id: number, body: { nome?: string; email: string; password?: string }) {
    return this.http.put<Usuario>(`/api/usuarios/${id}`, body);
  }

  excluirUsuario(id: number) {
    return this.http.delete(`/api/usuarios/${id}`);
  }

  importarPlanilha(arquivo: File, nome?: string) {
    const fd = new FormData();
    fd.append('arquivo', arquivo);
    if (nome) fd.append('nome', nome);
    return this.http.post<ImportarPlanilhaResponse>('/api/importacoes/importar', fd);
  }

  grupos() {
    return this.http.get<GrupoImportacao[]>('/api/importacoes');
  }

  grupoDetalhe(id: number, page = 1, perPage = 20, busca = '') {
    let params = new HttpParams();
    params = params.set('page', String(page));
    params = params.set('perPage', String(perPage));
    if (busca) params = params.set('busca', busca);
    return this.http.get<GrupoDetalhePaginado>(`/api/importacoes/${id}`, { params });
  }

  excluirGrupo(id: number) {
    return this.http.delete(`/api/importacoes/${id}`);
  }

  enviarMassaPorGrupo(
    grupoId: number,
    body: {
      templateId?: number | null;
      templateNome?: string | null;
      mensagem?: string | null;
      intervaloMs?: number | null;
      instance?: string;
    },
  ) {
    return this.http.post<{ id: number }>(`/api/importacoes/${grupoId}/enviar`, body);
  }
}
