
import type { ParsedVersion } from './types';

export class VersionUtils {
  static parseVersion(version: string): ParsedVersion {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  static incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string {
    const { major, minor, patch } = this.parseVersion(currentVersion);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  static getVersionCriteria(): Record<string, string> {
    return {
      patch: 'Correcciones de errores, mejoras menores, actualizaciones de seguridad',
      minor: 'Nuevas funcionalidades, mejoras significativas, cambios compatibles',
      major: 'Cambios importantes, funcionalidades principales, cambios incompatibles'
    };
  }

  static getIncrementSuggestion(currentVersion: string): 'major' | 'minor' | 'patch' {
    const { patch } = this.parseVersion(currentVersion);
    
    if (patch >= 50) return 'major';
    if (patch >= 10) return 'minor';
    
    return 'patch';
  }

  static canIncrementTo(currentVersion: string, type: 'major' | 'minor' | 'patch'): boolean {
    const { patch } = this.parseVersion(currentVersion);
    
    // Suggest minor increment when patch number gets high
    if (type === 'minor' && patch >= 10) return true;
    if (type === 'major' && patch >= 50) return true;
    
    return true; // Always allow any increment type
  }
}
