import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgxSonnerToaster } from 'ngx-sonner';
import { AuthService } from '../core/auth.service';
import { WhatsappStatusService } from '../core/whatsapp-status.service';
import { LoadingComponent } from '../shared/loading/loading.component';
import { WhatsappStatusBadgeComponent } from '../shared/whatsapp-status-badge/whatsapp-status-badge.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    NgxSonnerToaster,
    LoadingComponent,
    WhatsappStatusBadgeComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly wa = inject(WhatsappStatusService);
  private readonly collapseKey = 'disparo_nav_collapsed';
  menuOpen = false;
  collapsed = localStorage.getItem(this.collapseKey) === '1';

  ngOnInit(): void {
    this.wa.start();
  }

  ngOnDestroy(): void {
    this.wa.stop();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem(this.collapseKey, this.collapsed ? '1' : '0');
    if (this.collapsed) this.menuOpen = false;
  }

  label(): string {
    const n = this.wa.summary()?.connected || 0;
    if (n === 0) return 'Desconectado';
    if (n === 1) return '1 conta conectada';
    return `${n} contas conectadas`;
  }

  tone(): string {
    const n = this.wa.summary()?.connected || 0;
    if (!this.wa.summary()) return 'warn';
    return n > 0 ? 'ok' : 'err';
  }

  numbers(): string {
    return this.wa.conectadas().map((item) => item.number || item.instance).join(' · ');
  }
}
