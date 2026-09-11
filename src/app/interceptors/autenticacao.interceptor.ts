import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ServicoAutenticacao } from '../services/autenticacao.service';
import { ServicoNotificacao } from '../services/notificacao.service';

const ROTAS_SILENCIOSAS = ['/api/auth/fazer-login', '/api/whatsapp/status', '/api/whatsapp/contas'];
export const interceptorAutenticacao: HttpInterceptorFn = (requisicao, proximo) => {
  const autenticacao = inject(ServicoAutenticacao); const notificacao = inject(ServicoNotificacao); const token = autenticacao.obterToken();
  const requisicaoAutenticada = token ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : requisicao;
  const silenciosa = ROTAS_SILENCIOSAS.some((rota) => requisicao.url.includes(rota));
  return proximo(requisicaoAutenticada).pipe(catchError((erro: HttpErrorResponse) => {
    if (erro.status === 401 && !requisicao.url.includes('/api/auth/fazer-login')) autenticacao.sair();
    else if (!silenciosa) notificacao.erro('Erro na requisição', extrairMensagem(erro) || 'Não foi possível concluir a operação');
    return throwError(() => erro);
  }));
};
function extrairMensagem(erro: HttpErrorResponse): string | undefined { const corpo = (erro.error ?? {}) as Record<string, unknown>; const mensagem = corpo['message'] ?? (corpo['response'] as Record<string, unknown> | null)?.['message'] ?? corpo['error']; if (mensagem == null) return erro.message; if (typeof mensagem === 'string') return mensagem; if (Array.isArray(mensagem)) { const textos = mensagem.flat(Infinity).filter((item) => typeof item === 'string'); return textos.length ? (textos as string[]).join('; ') : undefined; } try { return JSON.stringify(mensagem); } catch { return undefined; } }
