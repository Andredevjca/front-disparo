import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario, DadosUsuario, DadosAtualizacaoUsuario } from '../models/usuario.model';


@Injectable({ providedIn: 'root' })
export class ServicoUsuarios {
  constructor(private http: HttpClient) {}
  listar() { return this.http.get<Usuario[]>('/api/usuarios'); }
  criar(dados: DadosUsuario) { return this.http.post<Usuario>('/api/usuarios', dados); }
  atualizar(id: number, dados: DadosAtualizacaoUsuario) { return this.http.put<Usuario>(`/api/usuarios/${id}`, dados); }
  excluir(id: number) { return this.http.delete(`/api/usuarios/${id}`); }
}
