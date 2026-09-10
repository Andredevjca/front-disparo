export function interpolate(template: string, data: Record<string, unknown>): string {
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined || value === null) continue;
    map.set(normalize(key), String(value));
  }
  return (template || '').replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, raw: string) => {
    const key = normalize(raw);
    return map.has(key) ? map.get(key)! : `{{${raw.trim()}}}`;
  });
}

export function normalize(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function detectColumn(headers: string[], aliases: string[]): string | null {
  const wanted = aliases.map(normalize);
  for (const header of headers) {
    if (wanted.includes(normalize(header))) return header;
  }
  return null;
}
