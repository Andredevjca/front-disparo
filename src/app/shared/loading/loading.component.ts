import { Component, inject } from '@angular/core';
import { ServicoCarregamento } from '../../services/carregamento.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    @if (servicoCarregamento.carregando()) {
      <div class="loading-overlay" aria-busy="true" aria-live="polite">
        <div class="spinner" role="progressbar" aria-label="Carregando"></div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(20, 20, 30, 0.35);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
    }
    .spinner {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 4px solid rgba(37, 211, 102, 0.2);
      border-top-color: #25d366;
      border-right-color: #25d366;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingComponent {
  readonly servicoCarregamento = inject(ServicoCarregamento);
}
