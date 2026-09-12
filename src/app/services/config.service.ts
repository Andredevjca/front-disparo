import { Injectable } from '@angular/core';

interface ConfiguracaoAplicacao {
  apiUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ServicoConfig {
  private urlApi = '';

  async carregar(): Promise<void> {
    const resposta = await fetch('config.json', { cache: 'no-store' });
    if (!resposta.ok) throw new Error(`Não foi possível carregar config.json (${resposta.status})`);

    const configuracao = (await resposta.json()) as ConfiguracaoAplicacao;
    this.urlApi = (configuracao.apiUrl || '').replace(/\/$/, '');
  }

  obterUrlApi(): string {
    return this.urlApi;
  }
}
