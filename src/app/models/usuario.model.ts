export type Usuario = { id: number; nome: string | null; email: string; role: string; created_at: string; };
export type DadosUsuario = { nome?: string; email: string; password: string; };
export type DadosAtualizacaoUsuario = { nome?: string; email: string; password?: string; };
