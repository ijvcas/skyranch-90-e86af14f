
export const loadFromStorage = (key: string, defaultValue: string): string => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const updateAppSettings = (key: string, value: string): void => {
  try {
    const currentSettings = localStorage.getItem('appSettings');
    if (currentSettings) {
      const settings = JSON.parse(currentSettings);
      if (!settings.system) settings.system = {};
      settings.system[key] = value;
      localStorage.setItem('appSettings', JSON.stringify(settings));
      console.log(`📱 Updated app settings ${key}:`, value);
    }
  } catch (error) {
    console.error(`Error updating app settings ${key}:`, error);
  }
};

export const loadSettingsFromStorage = () => {
  const savedSettings = localStorage.getItem('appSettings');
  let settings = { timezone: null, dateFormat: null, currency: null };
  
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      settings = {
        timezone: parsed.system?.timezone || null,
        dateFormat: parsed.system?.dateFormat || null,
        currency: parsed.system?.currency || null
      };
    } catch (error) {
      console.error('Error parsing app settings:', error);
    }
  }
  
  return {
    timezone: settings.timezone || loadFromStorage('selectedTimezone', 'Europe/Madrid'),
    dateFormat: settings.dateFormat || loadFromStorage('selectedDateFormat', 'dd/mm/yyyy'),
    currency: settings.currency || loadFromStorage('selectedCurrency', 'EUR')
  };
};
