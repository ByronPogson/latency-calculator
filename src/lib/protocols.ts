import type { Protocol, ProtocolId } from '@/types/scenario';

// Window sizes calibrated using throughput-limited model to match problem statement
// Model: effective_throughput = min(bandwidth, window_size / RTT)
// Reference: 2GB file, 500 Mbps, comparing 8ms vs 55ms RTT
//
// At 8ms RTT, BDP = 500 Mbps × 0.008s = 0.5 MB
// All protocol windows > 0.5 MB → all achieve ~32s (bandwidth-limited)
//
// At 55ms RTT, BDP = 500 Mbps × 0.055s = 3.44 MB  
// Protocols with window < BDP become throughput-limited
export const PROTOCOLS: Record<ProtocolId, Protocol> = {
  smb2: {
    id: 'smb2',
    name: 'SMB2',
    windowSizeBytes: 1.0 * 1024 * 1024, // 1 MB - gives ~110s at 55ms RTT
    description: 'Limited credits, stop-and-wait pattern',
    latencySensitivity: 'High',
  },
  smb3: {
    id: 'smb3',
    name: 'SMB3',
    windowSizeBytes: 1.84 * 1024 * 1024, // 1.84 MB - gives ~60s at 55ms RTT
    description: 'Improved pipelining, larger credits',
    latencySensitivity: 'Medium',
  },
  nfs: {
    id: 'nfs',
    name: 'NFS',
    windowSizeBytes: 1.375 * 1024 * 1024, // 1.375 MB - gives ~80s at 55ms RTT
    description: 'Chunk-based, depends on read-ahead settings',
    latencySensitivity: 'Medium-High',
  },
  ftp: {
    id: 'ftp',
    name: 'FTP',
    windowSizeBytes: 64 * 1024 * 1024, // 64 MB - always bandwidth-limited
    description: 'Streaming transfer, TCP window scaling',
    latencySensitivity: 'Low',
  },
  sftp: {
    id: 'sftp',
    name: 'SFTP',
    windowSizeBytes: 1.22 * 1024 * 1024, // 1.22 MB - gives ~90s at 55ms RTT
    description: 'SSH channel flow control (~1.2 MB window)',
    latencySensitivity: 'High',
  },
  http: {
    id: 'http',
    name: 'HTTP/HTTPS',
    windowSizeBytes: 64 * 1024 * 1024, // 64 MB - always bandwidth-limited
    description: 'Streaming transfer, TCP window scaling',
    latencySensitivity: 'Low',
  },
};

export const PROTOCOL_LIST = Object.values(PROTOCOLS);

export function getProtocol(id: ProtocolId): Protocol {
  return PROTOCOLS[id];
}
