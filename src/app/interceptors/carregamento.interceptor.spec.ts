import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { interceptorCarregamento } from './carregamento.interceptor';
import { ServicoCarregamento } from '../services/carregamento.service';

describe('Loading do atendimento', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    provideHttpClient(withInterceptors([interceptorCarregamento])), provideHttpClientTesting()
  ] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('não mostra loading nas consultas, imagens ou envio de resposta', () => {
    const http = TestBed.inject(HttpClient);
    const mock = TestBed.inject(HttpTestingController);
    const loading = TestBed.inject(ServicoCarregamento);
    for (const url of ['/api/atendimento/conversas', '/api/atendimento/conversas/1/mensagens', '/api/atendimento/conversas/1/mensagens/2/imagem', '/api/atendimento/sincronizar/status']) {
      http.get(url).subscribe();
      expect(loading.carregando()).toBeFalse();
      mock.expectOne(url).flush({});
    }
    http.post('/api/atendimento/conversas/1/mensagens', { texto: 'Resposta' }).subscribe();
    expect(loading.carregando()).toBeFalse();
    mock.expectOne('/api/atendimento/conversas/1/mensagens').flush({});
  });

  it('mostra loading nos dois botões de sincronização e encerra inclusive em erro', () => {
    const http = TestBed.inject(HttpClient);
    const mock = TestBed.inject(HttpTestingController);
    const loading = TestBed.inject(ServicoCarregamento);
    for (const force of [false, true]) {
      const url = '/api/atendimento/sincronizar?forcar=' + force;
      http.post(url, {}).subscribe({ error: () => {} });
      expect(loading.carregando()).toBeTrue();
      mock.expectOne(url).flush({}, { status: 500, statusText: 'Error' });
      expect(loading.carregando()).toBeFalse();
    }
  });
});
