
import { useState, useEffect } from 'react';

interface TimezoneHook {
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

export const useTimezone = (): TimezoneHook => {
  const [timezone, setTimezoneState] = useState<string>(() => {
    // Load from localStorage or use Madrid as default
    const saved = localStorage.getItem('selectedTimezone');
    return saved || 'Europe/Madrid';
  });

  const [dateFormat, setDateFormatState] = useState<string>(() => {
    // Load from localStorage or use dd/mm/yyyy as default
    const saved = localStorage.getItem('selectedDateFormat');
    return saved || 'dd/mm/yyyy';
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    // Load from localStorage or use EUR as default
    const saved = localStorage.getItem('selectedCurrency');
    return saved || 'EUR';
  });

  const setTimezone = (tz: string) => {
    console.log('🕒 Setting timezone to:', tz);
    setTimezoneState(tz);
    localStorage.setItem('selectedTimezone', tz);
    
    // Also update the app settings for consistency
    const currentSettings = localStorage.getItem('appSettings');
    if (currentSettings) {
      try {
        const settings = JSON.parse(currentSettings);
        settings.system.timezone = tz;
        localStorage.setItem('appSettings', JSON.stringify(settings));
        console.log('🕒 Updated app settings timezone:', tz);
      } catch (error) {
        console.error('Error updating app settings timezone:', error);
      }
    }
  };

  const setDateFormat = (format: string) => {
    console.log('📅 Setting date format to:', format);
    setDateFormatState(format);
    localStorage.setItem('selectedDateFormat', format);
    
    // Also update the app settings for consistency
    const currentSettings = localStorage.getItem('appSettings');
    if (currentSettings) {
      try {
        const settings = JSON.parse(currentSettings);
        if (!settings.system) settings.system = {};
        settings.system.dateFormat = format;
        localStorage.setItem('appSettings', JSON.stringify(settings));
        console.log('📅 Updated app settings date format:', format);
      } catch (error) {
        console.error('Error updating app settings date format:', error);
      }
    }
  };

  const setCurrency = (curr: string) => {
    console.log('💰 Setting currency to:', curr);
    setCurrencyState(curr);
    localStorage.setItem('selectedCurrency', curr);
    
    // Also update the app settings for consistency
    const currentSettings = localStorage.getItem('appSettings');
    if (currentSettings) {
      try {
        const settings = JSON.parse(currentSettings);
        if (!settings.system) settings.system = {};
        settings.system.currency = curr;
        localStorage.setItem('appSettings', JSON.stringify(settings));
        console.log('💰 Updated app settings currency:', curr);
      } catch (error) {
        console.error('Error updating app settings currency:', error);
      }
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('es-ES', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const formatDateTime = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('es-ES', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Fecha inválida';
    }
  };

  const formatDateInput = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      switch (dateFormat) {
        case 'dd/mm/yyyy':
          return `${day}/${month}/${year}`;
        case 'mm/dd/yyyy':
          return `${month}/${day}/${year}`;
        case 'yyyy-mm-dd':
          return `${year}-${month}-${day}`;
        default:
          return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error('Error formatting date input:', error);
      return dateString;
    }
  };

  const parseDateInput = (input: string): string => {
    if (!input || input.length < 8) return '';
    
    try {
      let day: number, month: number, year: number;
      
      if (dateFormat === 'yyyy-mm-dd') {
        const parts = input.split('-');
        if (parts.length !== 3) return '';
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      } else {
        const parts = input.split('/');
        if (parts.length !== 3) return '';
        
        if (dateFormat === 'dd/mm/yyyy') {
          day = parseInt(parts[0]);
          month = parseInt(parts[1]);
          year = parseInt(parts[2]);
        } else { // mm/dd/yyyy
          month = parseInt(parts[0]);
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      }
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
      if (day < 1 || day > 31 || month < 1 || month > 12) return '';
      
      const date = new Date(year, month - 1, day);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error parsing date input:', error);
      return '';
    }
  };

  const formatCurrency = (amount: number): string => {
    try {
      const currencyMap = {
        'EUR': { code: 'EUR', locale: 'es-ES' },
        'USD': { code: 'USD', locale: 'en-US' },
        'COP': { code: 'COP', locale: 'es-CO' },
        'MXN': { code: 'MXN', locale: 'es-MX' }
      };

      const currencyInfo = currencyMap[currency as keyof typeof currencyMap] || currencyMap.EUR;

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

  // Load settings on mount
  useEffect(() => {
    const savedTimezone = localStorage.getItem('selectedTimezone');
    const savedDateFormat = localStorage.getItem('selectedDateFormat');
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedSettings = localStorage.getItem('appSettings');
    
    let timezoneToUse = timezone;
    let dateFormatToUse = dateFormat;
    let currencyToUse = currency;
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.system?.timezone) {
          timezoneToUse = settings.system.timezone;
        }
        if (settings.system?.dateFormat) {
          dateFormatToUse = settings.system.dateFormat;
        }
        if (settings.system?.currency) {
          currencyToUse = settings.system.currency;
        }
      } catch (error) {
        console.error('Error parsing app settings:', error);
      }
    } else {
      if (savedTimezone) timezoneToUse = savedTimezone;
      if (savedDateFormat) dateFormatToUse = savedDateFormat;
      if (savedCurrency) currencyToUse = savedCurrency;
    }
    
    if (timezoneToUse !== timezone) {
      console.log('🕒 Loading timezone from storage:', timezoneToUse);
      setTimezoneState(timezoneToUse);
    }
    
    if (dateFormatToUse !== dateFormat) {
      console.log('📅 Loading date format from storage:', dateFormatToUse);
      setDateFormatState(dateFormatToUse);
    }

    if (currencyToUse !== currency) {
      console.log('💰 Loading currency from storage:', currencyToUse);
      setCurrencyState(currencyToUse);
    }
  }, []);

  return {
    timezone,
    setTimezone,
    dateFormat,
    setDateFormat,
    currency,
    setCurrency,
    formatDate,
    formatDateTime,
    formatDateInput,
    parseDateInput,
    formatCurrency
  };
};
