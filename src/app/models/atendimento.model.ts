export type ContatoWhatsApp = {
  id: number;
  instancia: string;
  telefone: string;
  nome?: string | null;
  nome_whatsapp?: string | null;
  foto_url?: string | null;
  ultimo_acesso?: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversa = {
  id: number;
  contato_whatsapp_id?: number | null;
  usuario_id?: number | null;
  instancia: string;
  telefone: string;
  ultima_mensagem?: string | null;
  ultima_mensagem_em?: string | null;
  mensagens_nao_lidas: number;
  status: 'ABERTA' | 'FECHADA';
  nome?: string | null;
  nome_whatsapp?: string | null;
  foto_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type ConversaDetalhe = {
  conversa: Conversa;
  contato?: ContatoWhatsApp | null;
};

export type ConversaPaginada = {
  page: number;
  perPage: number;
  total: number;
  rows: Conversa[];
};

export type Mensagem = {
  id: number;
  conversa_id: number;
  usuario_id?: number | null;
  envio_detalhe_id?: number | null;
  evolution_id?: string | null;
  telefone: string;
  instancia: string;
  tipo: 'TEXTO' | 'IMAGEM' | 'AUDIO' | 'VIDEO' | 'DOCUMENTO' | 'OUTRO';
  direcao: 'RECEBIDA' | 'ENVIADA';
  conteudo?: string | null;
  status: 'PENDENTE' | 'ENVIADA' | 'ENTREGUE' | 'LIDA' | 'ERRO';
  data_mensagem?: string | null;
  created_at: string;
  erro?: string | null;
};

export type MensagemPaginada = {
  page: number;
  perPage: number;
  total: number;
  rows: Mensagem[];
  tem_mais_antigas: boolean;
};

export type EnviarMensagemAtendimentoRequest = {
  texto: string;
};

export type SincroniaStatus = {
  status: 'PENDENTE' | 'DISPARADO' | 'EM_ANDAMENTO' | 'OK' | 'ERRO';
  iniciado_em?: string | null;
  finalizado_em?: string | null;
  total_contatos: number;
  total_conversas: number;
  total_mensagens: number;
  erro?: string | null;
  conversas_com_erro?: number;
};
