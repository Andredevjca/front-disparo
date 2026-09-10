import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(message: string, description?: string): void {
    toast.success(message, { description });
  }

  error(message: string, description?: string): void {
    toast.error(message, { description });
  }

  warning(message: string, description?: string): void {
    toast.warning(message, { description });
  }

  info(message: string, description?: string): void {
    toast.info(message, { description });
  }

  fromHttpError(error: unknown, fallback = 'Falha na operação'): void {
    const description = this.extractMessage(error);
    this.error('Erro', description || fallback);
  }

  private extractMessage(error: unknown): string | undefined {
    if (!error) return undefined;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    const obj = error as { [k: string]: unknown };
    const msg =
      (obj['error'] as { [k: string]: unknown } | null)?.['message'] ??
      obj['message'] ??
      ((obj['error'] as { [k: string]: unknown } | null)?.['response'] as { [k: string]: unknown } | null)?.['message'];
    if (msg == null) return undefined;
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
}
