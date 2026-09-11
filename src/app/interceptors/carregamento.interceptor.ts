import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ServicoCarregamento } from '../services/carregamento.service';

const ROTAS_IGNORADAS = ['/api/whatsapp/status', '/api/whatsapp/contas'];
export const interceptorCarregamento: HttpInterceptorFn = (requisicao, proximo) => { const carregamento = inject(ServicoCarregamento); const ignorar = ROTAS_IGNORADAS.some((rota) => requisicao.url.includes(rota)); if (!ignorar) carregamento.mostrar(); return proximo(requisicao).pipe(finalize(() => { if (!ignorar) carregamento.ocultar(); })); };
