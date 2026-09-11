import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServicoCarregamento {
  private readonly contador = signal(0);
  readonly carregando = computed(() => this.contador() > 0);
  mostrar(): void { this.contador.update((valor) => valor + 1); }
  ocultar(): void { this.contador.update((valor) => Math.max(0, valor - 1)); }
  redefinir(): void { this.contador.set(0); }
}
