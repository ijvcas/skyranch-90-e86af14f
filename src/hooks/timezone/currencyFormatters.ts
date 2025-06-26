
import type { Currency } from './types';

const currencyMap = {
  'EUR': { code: 'EUR', locale: 'es-ES' },
  'USD': { code: 'USD', locale: 'en-US' },
  'COP': { code: 'COP', locale: 'es-CO' },
  'MXN': { code: 'MXN', locale: 'es-MX' }
} as const;

export const formatCurrency = (amount: number, currency: Currency): string => {
  try {
    const currencyInfo = currencyMap[currency] || currencyMap.EUR;

    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `€${amount.toLocaleString()}`;
  }
};
