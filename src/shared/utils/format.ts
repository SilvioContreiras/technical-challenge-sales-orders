import { format, parseISO } from 'date-fns';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Formats an ISO date/datetime as `dd/MM/yyyy`. */
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd/MM/yyyy');
}

/** Formats an ISO datetime as `dd/MM/yyyy HH:mm`. */
export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd/MM/yyyy HH:mm');
}

/** Formats a CNPJ document string (14 digits) as `00.000.000/0000-00`. */
export function formatDocument(document: string): string {
  if (document.length !== 14) return document;
  return document.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
