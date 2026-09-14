import { Component, OnInit, inject } from '@angular/core';
import { ImagemEnvio } from '../../models/imagem.model';
import { ImagemEnvioComponent } from '../../shared/imagem-envio/imagem-envio.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ServicoModelos } from '../../services/modelos.service';
import { ModeloMensagem } from '../../models/template.model';
import { interpolar } from '../../util/texto.util';

@Component({
  selector: 'app-templates',
  imports: [ImagemEnvioComponent, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
})
export class TemplatesComponent implements OnInit {
  private servicoModelos = inject(ServicoModelos);
  private router = inject(Router);
  modelos: ModeloMensagem[] = [];
  modeloEmEdicao: ModeloMensagem | null = null;
  imagem: ImagemEnvio | null = null;
  imagemPendente = false;
  salvando = false;
  erro = '';
  nome = '';
  mensagem = 'Olá {{nome}},\n\nIdentificamos uma pendência no valor de R$ {{valor}}.\n\nVencimento: {{vencimento}}.\n\nEntre em contato conosco para mais informações.';

  ngOnInit(): void {
    this.carregarModelos();
  }

  carregarModelos(): void {
    this.servicoModelos.listar().subscribe((modelos) => (this.modelos = modelos));
  }

  visualizarMensagem(): string {
    return interpolar(this.mensagem, {
      nome: 'João',
      telefone: '5585999999999',
      cpf: '000.000.000-00',
      valor: '250,00',
      vencimento: '10/09/2026',
    });
  }

  salvarModelo(): void {
    if (this.salvando || this.imagemPendente || !this.nome.trim() || !this.mensagem.trim()) return;
    this.salvando = true;
    this.erro = '';
    this.servicoModelos.salvar({ id: this.modeloEmEdicao?.id, nome: this.nome, mensagem: this.mensagem, imagem: this.imagem }).subscribe({
      next: () => {
        this.salvando = false;
        this.cancelarEdicao();
        this.carregarModelos();
      },
      error: (err) => {
        this.salvando = false;
        this.erro = err?.error?.message || 'Não foi possível salvar o template.';
      }
    });
  }

  editarModelo(modelo: ModeloMensagem): void {
    if (this.salvando) return;
    this.imagem = modelo.imagem || null;
    this.imagemPendente = false;
    this.erro = '';
    this.modeloEmEdicao = modelo;
    this.nome = modelo.nome;
    this.mensagem = modelo.mensagem;
  }

  excluirModelo(modelo: ModeloMensagem): void {
    this.servicoModelos.excluir(modelo.id).subscribe(() => this.carregarModelos());
  }

  usarModelo(modelo: ModeloMensagem): void {
    sessionStorage.setItem('templateId', String(modelo.id));
    void this.router.navigate(['/enviar']);
  }

  cancelarEdicao(): void {
    if (this.salvando) return;
    this.imagem = null;
    this.imagemPendente = false;
    this.erro = '';
    this.modeloEmEdicao = null;
    this.nome = '';
    this.mensagem =
      'Olá {{nome}},\n\nIdentificamos uma pendência no valor de R$ {{valor}}.\n\nVencimento: {{vencimento}}.\n\nEntre em contato conosco para mais informações.';
  }
}
