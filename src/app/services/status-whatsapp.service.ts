import { Injectable, computed, signal } from '@angular/core';
import { ServicoWhatsApp } from './whatsapp.service';
import { ContaWhatsApp, ResumoWhatsApp } from '../models/whatsapp.model';

@Injectable({ providedIn: 'root' })
export class ServicoStatusWhatsApp {
  readonly resumo = signal<ResumoWhatsApp | null>(null);
  readonly contas = computed(() => this.resumo()?.contas || []);
  readonly conectadas = computed(() => this.contas().filter((conta) => conta.connected));
  private temporizador: ReturnType<typeof setInterval> | null = null;

  constructor(private whatsapp: ServicoWhatsApp) {}
  iniciar(): void { this.atualizar(); this.parar(); this.temporizador = setInterval(() => this.atualizar(), 4000); }
  parar(): void { if (this.temporizador) clearInterval(this.temporizador); this.temporizador = null; }
  atualizar(): void {
    this.whatsapp.obterStatus().subscribe({
      next: (resumo) => this.resumo.set(resumo),
      error: () => this.resumo.set({ contas: [], connected: 0, total: 0, number: null }),
    });
  }
  obterRotulo(conta: ContaWhatsApp): string { return conta.number || conta.profileName || conta.instance; }
}
