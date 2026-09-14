import { Component, OnInit, inject } from '@angular/core';
import { ImagemEnvio } from '../../models/imagem.model';
import { ImagemEnvioComponent } from '../../shared/imagem-envio/imagem-envio.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ServicoEnvio } from '../../services/envio.service';
import { ServicoModelos } from '../../services/modelos.service';
import { ServicoStatusWhatsApp } from '../../services/status-whatsapp.service';
import { ModeloMensagem } from '../../models/template.model';
import { interpolar } from '../../util/texto.util';
import { ResultadoEnvioUnitario } from '../../models/enviar.model';

@Component({
  selector: 'app-enviar',
  imports: [ImagemEnvioComponent, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './enviar.component.html',
  styleUrl: './enviar.component.scss',
})
export class EnviarComponent implements OnInit {
  private servicoEnvio = inject(ServicoEnvio);
  private servicoModelos = inject(ServicoModelos);
  readonly wa = inject(ServicoStatusWhatsApp);
  modelos: ModeloMensagem[] = [];
  telefone = '';
  nome = '';
  idModelo: number | null = null;
  instancia = '';
  imagem: ImagemEnvio | null = null;
  imagemPendente = false;
  mensagem = '';
  carregando = false;
  resultado: ResultadoEnvioUnitario | null = null;

  ngOnInit(): void {
    const primeiraConta = this.wa.conectadas()[0];
    if (primeiraConta) this.instancia = primeiraConta.instance;
    this.servicoModelos.listar().subscribe((rows) => {
      this.modelos = rows;
      const idSalvo = Number(sessionStorage.getItem('templateId') || 0);
      if (idSalvo) {
        this.idModelo = idSalvo;
        sessionStorage.removeItem('templateId');
        this.aoSelecionarModelo();
      }
    });
  }

  aoSelecionarModelo(): void {
    const modelo = this.modelos.find((item) => item.id === this.idModelo);
    this.mensagem = modelo?.mensagem || this.mensagem;
    this.imagem = modelo?.imagem || null;
    this.imagemPendente = false;
  }

  mensagemFinal(): string {
    return interpolar(this.mensagem, { nome: this.nome, telefone: this.telefone });
  }

  enviarMensagem(): void {
    if (this.carregando || this.imagemPendente || !this.instancia || !this.telefone.trim() || (!this.mensagem.trim() && !this.imagem)) return;
    this.carregando = true;
    this.resultado = null;
    const modelo = this.modelos.find((item) => item.id === this.idModelo);
    this.servicoEnvio
      .enviar({
        telefone: this.telefone,
        nome: this.nome,
        mensagem: this.mensagem,
        idModelo: this.idModelo,
        nomeModelo: modelo?.nome,
        instancia: this.instancia,
        imagem: this.imagem,
      })
      .subscribe({
        next: (resposta) => {
          this.carregando = false;
          this.resultado = resposta;
        },
        error: (erro) => {
          this.carregando = false;
          this.resultado = { status: 'ERRO', erro: erro.error?.message || 'Erro no envio', telefone: this.telefone };
        },
      });
  }
}
