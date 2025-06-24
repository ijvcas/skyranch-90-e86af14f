
export { UnifiedVersionManager } from './unifiedVersionManager';
export { VersionUtils } from './versionUtils';
export { VersionStorage } from './versionStorage';
export { VersionHistoryManager } from './versionHistoryManager';
export type { UnifiedVersionInfo, VersionHistory, ParsedVersion } from './types';

// Create and export the singleton instance
import { UnifiedVersionManager } from './unifiedVersionManager';
export const unifiedVersionManager = new UnifiedVersionManager();
