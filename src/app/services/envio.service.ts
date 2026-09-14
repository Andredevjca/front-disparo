import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DadosEnvioUnitario, ResultadoEnvioUnitario } from '../models/enviar.model';

@Injectable({ providedIn: 'root' })
export class ServicoEnvio {
  constructor(
    private http: HttpClient
  ) {}

  enviar(body: DadosEnvioUnitario) {
    const request = {
      telefone: body.telefone,
      nome: body.nome,
      mensagem: body.mensagem,
      imagem: body.imagem,
      usarImagemTemplate: false,
      templateId: body.idModelo,
      templateNome: body.nomeModelo,
      instance: body.instancia,
    };
    return this.http.post<ResultadoEnvioUnitario>('/api/envios/unitario', request);
  }
}
