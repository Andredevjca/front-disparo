import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DadosDisparoMassa, DetalheEnvio, DetalheGrupoPaginado, Envio, GrupoImportacao, RespostaDisparoMassa, RespostaImportacao } from '../models/massa.model';

@Injectable({ providedIn: 'root' })
export class ServicoMassa {
  constructor(private http: HttpClient) {}
  importar(arquivo: File, nome?: string) { const formulario = new FormData(); formulario.append('arquivo', arquivo); if (nome) formulario.append('nome', nome); return this.http.post<RespostaImportacao>('/api/importacoes/importar', formulario); }
  listarGrupos() { return this.http.get<GrupoImportacao[]>('/api/importacoes'); }
  obterGrupo(id: number, pagina = 1, itensPorPagina = 20, busca = '') { let parametros = new HttpParams().set('page', String(pagina)).set('perPage', String(itensPorPagina)); if (busca) parametros = parametros.set('busca', busca); return this.http.get<DetalheGrupoPaginado>(`/api/importacoes/${id}`, { params: parametros }); }
  excluirGrupo(id: number) { return this.http.delete(`/api/importacoes/${id}`); }
  iniciar(id: number, dados: DadosDisparoMassa) { return this.http.post<RespostaDisparoMassa>(`/api/importacoes/${id}/enviar`, { templateId: dados.idModelo, templateNome: dados.nomeModelo, mensagem: dados.mensagem, imagem: dados.imagem, usarImagemTemplate: false, intervaloMs: dados.intervaloMs, instance: dados.instancia }); }
  obterEnvio(id: number) { return this.http.get<{ envio: Envio; detalhes: DetalheEnvio[] }>(`/api/envios/massa/${id}`); }
  parar(id: number) { return this.http.post(`/api/envios/massa/${id}/parar`, {}); }
}
