export type ProtocolId = 'smb2' | 'smb3' | 'nfs' | 'ftp' | 'sftp' | 'http';

export type FileSizeUnit = 'KB' | 'MB' | 'GB';

export interface Protocol {
  id: ProtocolId;
  name: string;
  windowSizeBytes: number;
  description: string;
  latencySensitivity: 'Low' | 'Medium' | 'Medium-High' | 'High';
}

export interface Scenario {
  id: string;
  name: string;
  fileSizeValue: number;
  fileSizeUnit: FileSizeUnit;
  bandwidthMbps: number;
  latencyMs: number;
  protocolId: ProtocolId;
  concurrentUsers: number;
}

export interface TransferResult {
  baseTransferTime: number;
  latencyOverhead: number;
  totalTime: number;
  effectiveThroughputMbps: number;
  roundTrips: number;
  fileSizeBytes: number;
  isWindowLimited: boolean;
  bdpBytes: number;
}

export interface ScenarioWithResult extends Scenario {
  result: TransferResult;
}
