import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service';

const SKIP_PATTERNS = [
  '/api/whatsapp/status',
  '/api/whatsapp/contas',
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  const skip = SKIP_PATTERNS.some((p) => req.url.includes(p));
  if (!skip) loading.show();
  return next(req).pipe(
    finalize(() => {
      if (!skip) loading.hide();
    }),
  );
};
