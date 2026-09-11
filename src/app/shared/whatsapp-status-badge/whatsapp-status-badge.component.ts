import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServicoStatusWhatsApp } from '../../services/status-whatsapp.service';

@Component({
  selector: 'app-whatsapp-status-badge',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      routerLink="/whatsapp"
      class="wa-badge"
      [class.connected]="possuiConexao()"
      [class.loading]="wa.resumo() === null"
      title="Gerenciar conexões WhatsApp"
      aria-label="Gerenciar conexões WhatsApp"
    >
      <span class="icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="wa-icon" width="26" height="26">
          <path
            fill="currentColor"
            d="M20.52 3.48A11.74 11.74 0 0 0 12.05 0C5.5 0 .19 5.3.19 11.85c0 2.09.55 4.13 1.59 5.92L0 24l6.4-1.68a11.85 11.85 0 0 0 5.65 1.45h.01c6.55 0 11.86-5.3 11.86-11.85 0-3.16-1.23-6.14-3.4-8.44zm-8.47 19.24h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.8 1 .99-3.7-.24-.38a9.82 9.82 0 0 1-1.5-5.29c0-5.46 4.45-9.9 9.92-9.9 2.64 0 5.13 1.03 7 2.9a9.87 9.87 0 0 1 2.9 7c0 5.45-4.45 9.89-9.96 9.96zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.63.07-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.2-.24-.59-.48-.5-.66-.51h-.56c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.06 2.87 1.21 3.08.15.2 2.08 3.17 5.05 4.45.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"
          />
        </svg>
        <span class="dot"></span>
      </span>
    </a>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      margin-left: auto;
    }
    .wa-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      text-decoration: none;
      transition: background 0.15s ease;
    }
    .wa-badge:hover {
      background: rgba(37, 211, 102, 0.08);
    }
    .icon-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .wa-icon {
      color: #9ca3af;
      transition: color 0.2s ease;
      display: block;
    }
    .connected .wa-icon {
      color: #25d366;
    }
    .dot {
      position: absolute;
      bottom: -1px;
      right: -2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #9ca3af;
      border: 2px solid #ffffff;
      transition: background 0.2s ease;
    }
    .connected .dot {
      background: #25d366;
      box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6);
      animation: pulse 2s infinite;
    }
    .loading .dot {
      background: #f59e0b;
    }
    @keyframes pulse {
      0%   { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.55); }
      70%  { box-shadow: 0 0 0 8px rgba(37, 211, 102, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
    }
  `],
})
export class WhatsappStatusBadgeComponent {
  readonly wa = inject(ServicoStatusWhatsApp);

  possuiConexao(): boolean {
    return (this.wa.resumo()?.connected ?? 0) > 0;
  }
}
