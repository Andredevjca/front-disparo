export type ResultadoEnvioUnitario = { status: string; telefone: string; mensagem?: string; erro: string | null; };
import { ImagemEnvio } from './imagem.model';
export type DadosEnvioUnitario = { imagem?: ImagemEnvio | null; telefone: string; nome: string; mensagem: string; idModelo?: number | null; nomeModelo?: string | null; instancia: string; };
