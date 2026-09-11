import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContaWhatsApp, ResumoWhatsApp } from '../models/whatsapp.model';

@Injectable({ providedIn: 'root' })
export class ServicoWhatsApp {
  constructor(private http: HttpClient) {}
  obterStatus() { return this.http.get<ResumoWhatsApp>('/api/whatsapp/status'); }
  listarContas() { return this.http.get<ContaWhatsApp[]>('/api/whatsapp/contas'); }
  criarConta(nome: string) { return this.http.post<ContaWhatsApp>('/api/whatsapp/contas', { nome }); }
  conectar(instancia: string) { return this.http.post<ContaWhatsApp>(`/api/whatsapp/contas/${encodeURIComponent(instancia)}/connect`, {}); }
  desconectar(instancia: string) { return this.http.post<{ ok: boolean }>(`/api/whatsapp/contas/${encodeURIComponent(instancia)}/disconnect`, {}); }
  excluirConta(instancia: string) { return this.http.delete(`/api/whatsapp/contas/${encodeURIComponent(instancia)}`); }
}
