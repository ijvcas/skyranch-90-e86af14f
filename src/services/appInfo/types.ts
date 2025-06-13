
export interface AppInfo {
  version: string;
  buildTime: string;
  lastChange: string;
  buildStatus: 'success' | 'building' | 'error';
  environment: 'development' | 'production';
  admin: string;
  description: string;
  gitCommit?: string;
  buildNumber?: string;
}

export interface SupportInfo {
  email: string;
  phone: string;
  hours: string;
}
