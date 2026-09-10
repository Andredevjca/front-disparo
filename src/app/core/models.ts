export type WhatsAppAccount = {
  state: 'open' | 'connecting' | 'close' | 'unknown';
  connected: boolean;
  instance: string;
  number: string | null;
  profileName: string | null;
  qrcode: string | null;
};

export type WhatsAppSummary = {
  contas: WhatsAppAccount[];
  connected: number;
  total: number;
  number: string | null;
};

export type Template = {
  id: number;
  nome: string;
  mensagem: string;
};

export type EnvioDetalhe = {
  id: number;
  envio_id: number;
  grupo_importacao_id?: number | null;
  usuario_id?: number | null;
  nome: string | null;
  telefone: string;
  mensagem: string;
  status: 'PENDENTE' | 'ENVIANDO' | 'ENVIADO' | 'ERRO';
  erro: string | null;
  evolution_id: string | null;
  created_at: string;
  enviado_em: string | null;
  tipo?: 'UNITARIO' | 'MASSA';
  template_nome?: string | null;
  instancia?: string | null;
  numero_origem?: string | null;
  envio_origem?: string | null;
};

export type HistoricoPaginado = {
  page: number;
  perPage: number;
  total: number;
  rows: EnvioDetalhe[];
};

export type Envio = {
  id: number;
  tipo: string;
  template_nome: string | null;
  intervalo_ms: number | null;
  total: number;
  enviados: number;
  erros: number;
  pendentes: number;
  status: string;
  instancia?: string | null;
  numero_origem?: string | null;
};

export type Usuario = {
  id: number;
  nome: string | null;
  email: string;
  role: string;
  created_at: string;
};

export type GrupoImportacao = {
  id: number;
  usuario_id: number;
  nome: string | null;
  arquivo_nome: string | null;
  total_linhas: number;
  validos: number;
  invalidos: number;
  duplicados: number;
  created_at: string;
};

export type StatusValidacaoContato = 'VALIDO' | 'INVALIDO' | 'DUPLICADO';

export type ContatoImportado = {
  id: number;
  grupo_id: number;
  nome: string | null;
  email: string | null;
  telefone_normalizado: string | null;
  telefone_original: string | null;
  dados: Record<string, unknown> | null;
  status_validacao: StatusValidacaoContato;
  created_at: string;
};

export type ImportarPlanilhaResponse = {
  grupo_id: number;
  total: number;
  validos: number;
  invalidos: number;
  duplicados: number;
};

export type GrupoDetalhePaginado = {
  grupo: GrupoImportacao;
  contatos: ContatoImportado[];
  page: number;
  perPage: number;
  total: number;
};
