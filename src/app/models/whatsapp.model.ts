export type ContaWhatsApp = { state: 'open' | 'connecting' | 'close' | 'unknown'; connected: boolean; instance: string; number: string | null; profileName: string | null; qrcode: string | null; };
export type ResumoWhatsApp = { contas: ContaWhatsApp[]; connected: number; total: number; number: string | null; };
