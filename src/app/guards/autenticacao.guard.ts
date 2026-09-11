import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServicoAutenticacao } from '../services/autenticacao.service';

export const guardaAutenticacao: CanActivateFn = () => {
  const autenticacao = inject(ServicoAutenticacao);
  const roteador = inject(Router);
  return autenticacao.obterToken() ? true : roteador.parseUrl('/login');
};
