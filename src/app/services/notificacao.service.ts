import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ServicoNotificacao {
  sucesso(mensagem: string, descricao?: string): void { toast.success(mensagem, { description: descricao }); }
  erro(mensagem: string, descricao?: string): void { toast.error(mensagem, { description: descricao }); }
  aviso(mensagem: string, descricao?: string): void { toast.warning(mensagem, { description: descricao }); }
  informacao(mensagem: string, descricao?: string): void { toast.info(mensagem, { description: descricao }); }
}
