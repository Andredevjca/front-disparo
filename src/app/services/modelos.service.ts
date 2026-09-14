import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModeloMensagem } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class ServicoModelos {
  constructor(private http: HttpClient) {}
  listar() { return this.http.get<ModeloMensagem[]>('/api/modelos'); }
  salvar(dados: { id?: number; nome: string; mensagem: string; imagem?: ModeloMensagem['imagem'] }) {
    return dados.id ? this.http.put<ModeloMensagem>(`/api/modelos/${dados.id}`, dados) : this.http.post<ModeloMensagem>('/api/modelos', dados);
  }
  excluir(id: number) { return this.http.delete(`/api/modelos/${id}`); }
}
