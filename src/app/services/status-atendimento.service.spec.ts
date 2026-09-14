import { fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ServicoStatusAtendimento } from './status-atendimento.service';
import { ServicoAtendimento } from './atendimento.service';
import { MensagemPaginada } from '../models/atendimento.model';

describe('Atualização do atendimento', () => {
  it('aguarda resposta lenta e cancela consultas ao sair', fakeAsync(() => {
    const response = new Subject<MensagemPaginada>();
    const api = jasmine.createSpyObj<ServicoAtendimento>('api', ['listarMensagens']);
    api.listarMensagens.and.returnValue(response);
    const status = new ServicoStatusAtendimento(api);
    status.abrirConversa(1);
    tick(12000);
    expect(api.listarMensagens).toHaveBeenCalledTimes(1);
    response.next({ rows: [], total: 0, tem_mais_antigas: false, page: 1, perPage: 50 });
    response.complete();
    tick(3000);
    expect(api.listarMensagens).toHaveBeenCalledTimes(2);
    status.fecharConversa();
    tick(6000);
    expect(api.listarMensagens).toHaveBeenCalledTimes(2);
  }));

  it('descarta resposta da conversa anterior ao trocar de cliente', fakeAsync(() => {
    const first = new Subject<MensagemPaginada>();
    const second = new Subject<MensagemPaginada>();
    const api = jasmine.createSpyObj<ServicoAtendimento>('api', ['listarMensagens']);
    api.listarMensagens.and.returnValues(first, second);
    const status = new ServicoStatusAtendimento(api);
    status.abrirConversa(1); tick(0);
    status.abrirConversa(2); tick(0);
    first.next({ rows: [], total: 999, tem_mais_antigas: true, page: 1, perPage: 50 });
    expect(status.totalMensagens()).toBe(0);
    second.next({ rows: [], total: 2, tem_mais_antigas: true, page: 1, perPage: 50 });
    expect(status.totalMensagens()).toBe(2);
    status.fecharConversa();
  }));
});
