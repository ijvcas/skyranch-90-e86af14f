
import { useState, useEffect } from 'react';

interface TimezoneHook {
  timezone: string;
  setTimezone: (tz: string) => void;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
}

export const useTimezone = (): TimezoneHook => {
  const [timezone, setTimezoneState] = useState<string>(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem('selectedTimezone');
    return saved || 'America/Lima';
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

  // Load timezone from both sources on mount
  useEffect(() => {
    const savedTimezone = localStorage.getItem('selectedTimezone');
    const savedSettings = localStorage.getItem('appSettings');
    
    let timezoneToUse = timezone;
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.system?.timezone) {
          timezoneToUse = settings.system.timezone;
        }
      } catch (error) {
        console.error('Error parsing app settings:', error);
      }
    } else if (savedTimezone) {
      timezoneToUse = savedTimezone;
    }
    
    if (timezoneToUse !== timezone) {
      console.log('🕒 Loading timezone from storage:', timezoneToUse);
      setTimezoneState(timezoneToUse);
    }
  }, []);

  return {
    timezone,
    setTimezone,
    formatDate,
    formatDateTime
  };
};
