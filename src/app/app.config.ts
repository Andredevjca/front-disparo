import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { interceptorAutenticacao } from './interceptors/autenticacao.interceptor';
import { interceptorCarregamento } from './interceptors/carregamento.interceptor';
import { interceptorApi } from './interceptors/api.interceptor';
import { ServicoConfig } from './services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([interceptorApi, interceptorAutenticacao, interceptorCarregamento])),
    provideAppInitializer(() => inject(ServicoConfig).carregar()),
    provideAnimationsAsync(),
  ],
};


