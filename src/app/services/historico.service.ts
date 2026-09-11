import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HistoricoPaginado } from '../models/historico.model';

@Injectable({ providedIn: 'root' })
export class ServicoHistorico {
  constructor(private http: HttpClient) {}
  listar(filtros: { page?: number; perPage?: number; status?: string; telefone?: string; nome?: string; instancia?: string; grupoImportacaoId?: number | null; de?: string; ate?: string; }) {
    let parametros = new HttpParams();
    Object.entries(filtros).forEach(([chave, valor]) => { if (valor !== undefined && valor !== null && valor !== '') parametros = parametros.set(chave, String(valor)); });
    return this.http.get<HistoricoPaginado>('/api/historico', { params: parametros });
  }
}
