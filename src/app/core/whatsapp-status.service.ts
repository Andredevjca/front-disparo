import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import { WhatsAppAccount, WhatsAppSummary } from './models';

@Injectable({ providedIn: 'root' })
export class WhatsappStatusService {
  readonly summary = signal<WhatsAppSummary | null>(null);
  readonly contas = computed(() => this.summary()?.contas || []);
  readonly conectadas = computed(() => this.contas().filter((item) => item.connected));
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private api: ApiService) {}

  start(): void {
    this.refresh();
    this.stop();
    this.timer = setInterval(() => this.refresh(), 4000);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  refresh(): void {
    this.api.status().subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => this.summary.set({ contas: [], connected: 0, total: 0, number: null }),
    });
  }

  label(account: WhatsAppAccount): string {
    if (account.number) return account.number;
    if (account.profileName) return account.profileName;
    return account.instance;
  }
}
