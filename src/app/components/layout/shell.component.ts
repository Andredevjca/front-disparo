import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ServicoAutenticacao } from '../../services/autenticacao.service';
import { ServicoStatusWhatsApp } from '../../services/status-whatsapp.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { WhatsappStatusBadgeComponent } from '../../shared/whatsapp-status-badge/whatsapp-status-badge.component';

@Component({ selector: 'app-shell', imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, NgxSonnerToaster, LoadingComponent, WhatsappStatusBadgeComponent], templateUrl: './shell.component.html', styleUrl: './shell.component.scss' })
export class ShellComponent implements OnInit, OnDestroy {
  readonly autenticacao = inject(ServicoAutenticacao); readonly whatsapp = inject(ServicoStatusWhatsApp); private readonly chaveMenu = 'disparo_nav_collapsed'; menuAberto = false; menuRecolhido = localStorage.getItem(this.chaveMenu) === '1';
  ngOnInit(): void { this.whatsapp.iniciar(); }
  ngOnDestroy(): void { this.whatsapp.parar(); }
  alternarMenu(): void { this.menuRecolhido = !this.menuRecolhido; localStorage.setItem(this.chaveMenu, this.menuRecolhido ? '1' : '0'); if (this.menuRecolhido) this.menuAberto = false; }
  rotuloStatus(): string { const quantidade = this.whatsapp.resumo()?.connected || 0; if (quantidade === 0) return 'Desconectado'; if (quantidade === 1) return '1 conta conectada'; return `${quantidade} contas conectadas`; }
  classeStatus(): string { const quantidade = this.whatsapp.resumo()?.connected || 0; if (!this.whatsapp.resumo()) return 'warn'; return quantidade > 0 ? 'ok' : 'err'; }
  numerosConectados(): string { return this.whatsapp.conectadas().map((conta) => conta.number || conta.instance).join(' · '); }
}
