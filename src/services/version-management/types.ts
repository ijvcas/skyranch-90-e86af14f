
export interface UnifiedVersionInfo {
  version: string;
  buildNumber: number;
  versionType: 'major' | 'minor' | 'patch';
  releaseDate: string;
  notes: string;
  publishedBy?: string;
}

export interface VersionHistory {
  id: string;
  version: string;
  buildNumber: number;
  versionType: 'major' | 'minor' | 'patch';
  releaseDate: string;
  notes: string;
  publishedBy?: string;
  isCurrent: boolean;
}

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}
