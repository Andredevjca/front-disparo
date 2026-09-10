import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/api.service';
import { WhatsappStatusService } from '../../core/whatsapp-status.service';
import { WhatsAppAccount } from '../../core/models';

@Component({
  selector: 'app-whatsapp',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.scss',
})
export class WhatsappComponent implements OnDestroy {
  private api = inject(ApiService);
  readonly wa = inject(WhatsappStatusService);
  nome = '';
  qrcode: string | null = null;
  connecting: string | null = null;
  error = '';
  loading = false;
  private poll: ReturnType<typeof setInterval> | null = null;

  add(): void {
    this.loading = true;
    this.error = '';
    this.api.criarConta(this.nome).subscribe({
      next: (account) => {
        this.loading = false;
        this.nome = '';
        this.wa.refresh();
        if (account.connected) return;
        if (account.qrcode) {
          this.apply(account);
          this.startPoll(account.instance);
          return;
        }
        this.connect(account);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Não foi possível criar a conta';
      },
    });
  }

  connect(account: WhatsAppAccount): void {
    this.loading = true;
    this.error = '';
    this.api.connect(account.instance).subscribe({
      next: (status) => {
        this.loading = false;
        this.apply(status);
        this.startPoll(account.instance);
        this.wa.refresh();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Falha ao conectar';
      },
    });
  }

  disconnect(account: WhatsAppAccount): void {
    this.api.disconnect(account.instance).subscribe({
      next: () => {
        if (this.connecting === account.instance) {
          this.qrcode = null;
          this.connecting = null;
          this.clearPoll();
        }
        this.wa.refresh();
      },
      error: (err) => (this.error = err.error?.message || 'Falha ao desconectar'),
    });
  }

  remove(account: WhatsAppAccount): void {
    this.api.removerConta(account.instance).subscribe({
      next: () => this.wa.refresh(),
      error: (err) => (this.error = err.error?.message || 'Falha ao remover'),
    });
  }

  ngOnDestroy(): void {
    this.clearPoll();
  }

  private apply(status: WhatsAppAccount): void {
    this.connecting = status.instance;
    this.qrcode = status.qrcode;
    if (status.connected) {
      this.qrcode = null;
      this.connecting = null;
      this.clearPoll();
    }
  }

  private startPoll(instance: string): void {
    this.clearPoll();
    let ticks = 0;
    this.poll = setInterval(() => {
      ticks += 1;
      if (ticks % 8 === 0) {
        this.api.connect(instance).subscribe({
          next: (status) => {
            if (status.qrcode && !status.connected) this.qrcode = status.qrcode;
          },
        });
      }
      this.api.contas().subscribe({
        next: (contas) => {
          const current = contas.find((item) => item.instance === instance);
          this.wa.refresh();
          if (current?.connected) {
            this.qrcode = null;
            this.connecting = null;
            this.clearPoll();
          }
        },
      });
    }, 2500);
  }

  private clearPoll(): void {
    if (this.poll) clearInterval(this.poll);
    this.poll = null;
  }
}
