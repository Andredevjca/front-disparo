import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ServicoConfig } from '../services/config.service';

export const interceptorApi: HttpInterceptorFn = (requisicao, proximo) => {
  const urlApi = inject(ServicoConfig).obterUrlApi();
  if (!urlApi || !requisicao.url.startsWith('/api/')) return proximo(requisicao);

  return proximo(requisicao.clone({ url: `${urlApi}${requisicao.url}` }));
};
