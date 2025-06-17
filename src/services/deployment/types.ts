
export interface DeploymentVersion {
  version: string;
  buildNumber: number;
  deploymentUrl: string;
  deploymentNumber: number;
  lastDeploymentTime: string;
  deploymentId: string;
  lastChange: string;
}

export interface DeploymentInfo {
  url: string;
  number: number;
  timestamp: string;
  id: string;
}

export interface DeploymentDetectionResult {
  isNewDeployment: boolean;
  currentDeployment: DeploymentInfo;
  reason?: string;
}
