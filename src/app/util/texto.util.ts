export function interpolar(modelo: string, dados: Record<string, unknown>): string {
  const mapa = new Map<string, string>();
  for (const [chave, valor] of Object.entries(dados || {})) if (valor !== undefined && valor !== null) mapa.set(normalizar(chave), String(valor));
  return (modelo || '').replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, bruto: string) => { const chave = normalizar(bruto); return mapa.has(chave) ? mapa.get(chave)! : `{{${bruto.trim()}}}`; });
}
export function normalizar(valor: string): string { return (valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
export function detectarColuna(cabecalhos: string[], apelidos: string[]): string | null { const desejados = apelidos.map(normalizar); return cabecalhos.find((cabecalho) => desejados.includes(normalizar(cabecalho))) || null; }
