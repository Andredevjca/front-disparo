import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImagemEnvio } from '../../models/imagem.model';

@Component({
  selector: 'app-imagem-envio',
  standalone: true,
  template: `
    <label>Imagem (opcional)
      <input type="file" accept="image/png,image/jpeg" [disabled]="disabled || lendo" (change)="selecionar($event)">
    </label>
    <small>PNG ou JPEG, até 5 MB. A mensagem será enviada como legenda.</small>
    @if (lendo) { <p role="status">Carregando imagem...</p> }
    @if (erro) { <p role="alert">{{ erro }}</p><button type="button" (click)="remover()">Cancelar imagem</button> }
    @if (preview) {
      <img [src]="preview" alt="Prévia da imagem que será enviada">
      <span>{{ nome }}</span>
      <button type="button" [disabled]="disabled" (click)="remover()">Remover imagem</button>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    label { display: flex; flex-direction: column; gap: 8px; }
    img { max-width: 100%; max-height: 240px; object-fit: contain; align-self: flex-start; border-radius: 8px; }
    small { color: #666; } p[role=alert] { color: #b42318; }
    button { align-self: flex-start; cursor: pointer; }
  `]
})
export class ImagemEnvioComponent {
  @Input() disabled = false;
  private atual: ImagemEnvio | null = null;
  private revisao = 0;
  @Input() set imagem(value: ImagemEnvio | null) {
    if (value === this.atual) return;
    this.revisao++;
    this.atual = value;
    this.preview = value ? 'data:' + value.mimeType + ';base64,' + value.base64 : '';
    this.nome = value?.nomeArquivo || '';
    this.erro = '';
    this.lendo = false;
  }
  @Output() imagemChange = new EventEmitter<ImagemEnvio | null>();
  @Output() pendenteChange = new EventEmitter<boolean>();
  preview = ''; nome = ''; erro = ''; lendo = false;

  remover(): void {
    this.revisao++;
    this.atual = null;
    this.lendo = false;
    this.preview = ''; this.nome = ''; this.erro = '';
    this.imagemChange.emit(null);
    this.pendenteChange.emit(false);
  }

  async selecionar(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file) return;
    const revisao = ++this.revisao;
    this.erro = '';
    if (!['image/png', 'image/jpeg'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
      this.erro = 'Selecione uma imagem PNG ou JPEG de até 5 MB.';
      this.pendenteChange.emit(true);
      return;
    }
    this.lendo = true; this.pendenteChange.emit(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Falha ao ler imagem'));
        reader.readAsDataURL(file);
      });
      await new Promise<void>((resolve, reject) => {
        const img = new Image(); img.onload = () => resolve(); img.onerror = () => reject(); img.src = data;
      });
      if (revisao !== this.revisao) return;
      this.preview = data; this.nome = file.name;
      this.atual = { base64: data.substring(data.indexOf(',') + 1), mimeType: file.type, nomeArquivo: file.name };
      this.imagemChange.emit(this.atual);
      this.pendenteChange.emit(false);
    } catch {
      if (revisao !== this.revisao) return;
      this.erro = 'Não foi possível ler a imagem. Selecione outro arquivo.';
    } finally { if (revisao === this.revisao) this.lendo = false; }
  }
}
