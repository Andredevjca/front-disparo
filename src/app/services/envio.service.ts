import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DadosEnvioUnitario, ResultadoEnvioUnitario } from '../models/enviar.model';

@Injectable({ providedIn: 'root' })
export class ServicoEnvio {
  constructor(private http: HttpClient) {}
  enviar(body: DadosEnvioUnitario) {
    return this.http.post<ResultadoEnvioUnitario>('/api/envios/unitario', {
      telefone: body.telefone, nome: body.nome, mensagem: body.mensagem,
      templateId: body.idModelo, templateNome: body.nomeModelo, instance: body.instancia,
    });
  }
}
