import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const SILENT_PATTERNS = [
  '/api/auth/fazer-login',
  '/api/whatsapp/status',
  '/api/whatsapp/contas',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const token = auth.token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  const silent = SILENT_PATTERNS.some((p) => req.url.includes(p));
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/fazer-login')) {
        auth.logout();
      } else if (!silent) {
        const msg = extract(error);
        toast.error('Erro na requisição', msg || 'Não foi possível concluir a operação');
      }
      return throwError(() => error);
    }),
  );
};

function extract(error: HttpErrorResponse): string | undefined {
  const body = (error.error ?? {}) as { [k: string]: unknown };
  const msg =
    body['message'] ??
    (body['response'] as { [k: string]: unknown } | null)?.['message'] ??
    body['error'];
  if (msg == null) return error.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) {
    const flat = msg.flat(Infinity).filter((x) => typeof x === 'string');
    return flat.length ? (flat as string[]).join('; ') : undefined;
  }
  try {
    return JSON.stringify(msg);
  } catch {
    return undefined;
  }
}
