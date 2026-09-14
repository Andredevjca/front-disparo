import { Component, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-imagem-mensagem',
  standalone: true,
  template: `
    @if (url) {
      <a [href]="url" target="_blank" rel="noopener"><img [src]="url" alt="Imagem enviada na conversa"></a>
    } @else if (erro) {
      <button type="button" (click)="carregar()">Tentar carregar imagem novamente</button>
    } @else { <span>Carregando imagem…</span> }
  `,
  styles: [`
    :host { display: block; margin-bottom: 8px; }
    img { display: block; max-width: 100%; width: 300px; max-height: 360px; object-fit: contain; border-radius: 8px; }
    a { display: block; } button { cursor: pointer; }
  `]
})
export class ImagemMensagemComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) conversaId!: number;
  @Input({ required: true }) mensagemId!: number;
  private http = inject(HttpClient);
  private request?: Subscription;
  url = '';
  erro = false;
  ngOnChanges(): void { this.carregar(); }
  carregar(): void {
    this.limpar();
    this.erro = false;
    this.request = this.http.get(`/api/atendimento/conversas/${this.conversaId}/mensagens/${this.mensagemId}/imagem`, { responseType: 'blob' }).subscribe({
      next: blob => { this.url = URL.createObjectURL(blob); },
      error: () => { this.erro = true; }
    });
  }
  private limpar(): void {
    this.request?.unsubscribe();
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = '';
  }
  ngOnDestroy(): void { this.limpar(); }
}
