import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ServicoCarregamento } from '../services/carregamento.service';

const ROTAS_IGNORADAS = ['/api/whatsapp/status', '/api/whatsapp/contas'];
export const interceptorCarregamento: HttpInterceptorFn = (requisicao, proximo) => {
  const carregamento = inject(ServicoCarregamento);
  const path = requisicao.url.split('?')[0];
  const atendimento = path.includes('/api/atendimento/');
  const sincroniaManual = requisicao.method === 'POST' && path.endsWith('/api/atendimento/sincronizar');
  const ignorar = (atendimento && !sincroniaManual) || ROTAS_IGNORADAS.some((rota) => path.includes(rota));
  if (!ignorar) carregamento.mostrar();
  return proximo(requisicao).pipe(finalize(() => { if (!ignorar) carregamento.ocultar(); }));
};
