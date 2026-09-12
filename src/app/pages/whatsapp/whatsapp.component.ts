import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ServicoWhatsApp } from '../../services/whatsapp.service';
import { ServicoStatusWhatsApp } from '../../services/status-whatsapp.service';
import { ContaWhatsApp } from '../../models/whatsapp.model';

@Component({
  selector: 'app-whatsapp',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.scss',
})
export class WhatsappComponent implements OnDestroy {
  private servicoWhatsApp = inject(ServicoWhatsApp);
  readonly wa = inject(ServicoStatusWhatsApp);
  nome = '';
  qrcode: string | null = null;
  conectando: string | null = null;
  erro = '';
  carregando = false;
  private temporizador: ReturnType<typeof setInterval> | null = null;

  adicionarConta(): void {
    this.carregando = true;
    this.erro = '';
    this.servicoWhatsApp.criarConta(this.nome).subscribe({
      next: (conta) => {
        this.carregando = false;
        this.nome = '';
        this.wa.atualizar();
        if (conta.connected) return;
        if (conta.qrcode) {
          this.aplicarStatus(conta);
          this.iniciarMonitoramento(conta.instance);
          return;
        }
        this.conectarConta(conta);
      },
      error: (erro) => {
        this.carregando = false;
        this.erro = erro.error?.message || 'Não foi possível criar a conta';
      },
    });
  }

  conectarConta(conta: ContaWhatsApp): void {
    this.carregando = true;
    this.erro = '';
    this.servicoWhatsApp.conectar(conta.instance).subscribe({
      next: (status) => {
        this.carregando = false;
        this.aplicarStatus(status);
        this.iniciarMonitoramento(conta.instance);
        this.wa.atualizar();
      },
      error: (erro) => {
        this.carregando = false;
        this.erro = erro.error?.message || 'Falha ao conectar';
      },
    });
  }

  desconectarConta(conta: ContaWhatsApp): void {
    this.servicoWhatsApp.desconectar(conta.instance).subscribe({
      next: () => {
        if (this.conectando === conta.instance) {
          this.qrcode = null;
          this.conectando = null;
          this.limparMonitoramento();
        }
        this.wa.atualizar();
      },
      error: (erro) => (this.erro = erro.error?.message || 'Falha ao desconectar'),
    });
  }

  removerConta(conta: ContaWhatsApp): void {
    this.servicoWhatsApp.excluirConta(conta.instance).subscribe({
      next: () => this.wa.atualizar(),
      error: (erro) => (this.erro = erro.error?.message || 'Falha ao remover'),
    });
  }

  ngOnDestroy(): void {
    this.limparMonitoramento();
  }

  private aplicarStatus(status: ContaWhatsApp): void {
    this.conectando = status.instance;
    this.qrcode = status.qrcode;
    if (status.connected) {
      this.qrcode = null;
      this.conectando = null;
      this.limparMonitoramento();
    }
  }

  private iniciarMonitoramento(instancia: string): void {
    this.limparMonitoramento();
    let ciclos = 0;
    this.temporizador = setInterval(() => {
      ciclos += 1;
      if (ciclos % 8 === 0) {
        this.servicoWhatsApp.conectar(instancia).subscribe({
          next: (status) => {
            if (status.qrcode && !status.connected) this.qrcode = status.qrcode;
          },
        });
      }
      this.servicoWhatsApp.listarContas().subscribe({
        next: (contas) => {
          const contaAtual = contas.find((conta) => conta.instance === instancia);
          this.wa.atualizar();
          if (contaAtual?.connected) {
            this.qrcode = null;
            this.conectando = null;
            this.limparMonitoramento();
          }
        },
      });
    }, 2500);
  }

  private limparMonitoramento(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = null;
  }
}
