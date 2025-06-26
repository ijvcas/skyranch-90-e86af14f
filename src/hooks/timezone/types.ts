
export interface TimezoneHook {
  timezone: string;
  setTimezone: (tz: string) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  formatDateInput: (date: string) => string;
  parseDateInput: (input: string) => string;
  formatCurrency: (amount: number) => string;
}

export type DateFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
export type Currency = 'EUR' | 'USD' | 'COP' | 'MXN';
