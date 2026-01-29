import type { Scenario, TransferResult, FileSizeUnit } from '@/types/scenario';
import { getProtocol } from './protocols';

// Use decimal units to match problem statement (2 GB = 2,000,000,000 bytes)
const SIZE_MULTIPLIERS: Record<FileSizeUnit, number> = {
  KB: 1000,
  MB: 1000 * 1000,
  GB: 1000 * 1000 * 1000,
};

export function fileSizeToBytes(value: number, unit: FileSizeUnit): number {
  return value * SIZE_MULTIPLIERS[unit];
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1000 * 1000 * 1000) {
    return `${(bytes / (1000 * 1000 * 1000)).toFixed(2)} GB`;
  }
  if (bytes >= 1000 * 1000) {
    return `${(bytes / (1000 * 1000)).toFixed(2)} MB`;
  }
  if (bytes >= 1000) {
    return `${(bytes / 1000).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

export function formatTime(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    return `${hours}h ${mins}m ${secs}s`;
  }
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  }
  return `${seconds.toFixed(1)}s`;
}

/**
 * Calculate transfer time using the throughput-limited model from the problem statement:
 * 
 * If protocol window < bandwidth-delay product (BDP), throughput is limited to:
 *   effective_throughput = window_size / RTT
 * 
 * Otherwise, throughput = raw bandwidth
 * 
 * Total time = file_size / effective_throughput
 * 
 * We also decompose this into "base time" (at full bandwidth) + "latency overhead"
 * for visualization purposes.
 */
export function calculateTransfer(scenario: Scenario): TransferResult {
  const protocol = getProtocol(scenario.protocolId);
  const fileSizeBytes = fileSizeToBytes(scenario.fileSizeValue, scenario.fileSizeUnit);
  const fileSizeBits = fileSizeBytes * 8;
  
  // Bandwidth per user in bits per second
  const bandwidthPerUserBps = (scenario.bandwidthMbps * 1_000_000) / scenario.concurrentUsers;
  
  // RTT in seconds
  const rttSeconds = scenario.latencyMs / 1000;
  
  // Bandwidth-delay product (BDP) - max data in flight at full bandwidth
  const bdpBytes = (bandwidthPerUserBps / 8) * rttSeconds;
  
  // Protocol window throughput (bytes per second)
  // This is the max throughput if window-limited: window_size / RTT
  const windowThroughputBps = rttSeconds > 0 
    ? (protocol.windowSizeBytes * 8) / rttSeconds 
    : Infinity;
  
  // Effective throughput is the minimum of bandwidth and window-limited throughput
  const effectiveThroughputBps = Math.min(bandwidthPerUserBps, windowThroughputBps);
  
  // Is this transfer bandwidth-limited or window-limited?
  const isWindowLimited = protocol.windowSizeBytes < bdpBytes;
  
  // Total transfer time
  const totalTime = fileSizeBits / effectiveThroughputBps;
  
  // Base transfer time (what it would be at full bandwidth with no latency)
  const baseTransferTime = fileSizeBits / bandwidthPerUserBps;
  
  // Latency overhead is the difference (time lost due to window limitation)
  const latencyOverhead = totalTime - baseTransferTime;
  
  // Round trips (for display/explanation purposes)
  const roundTrips = Math.ceil(fileSizeBytes / protocol.windowSizeBytes);
  
  // Effective throughput in Mbps
  const effectiveThroughputMbps = effectiveThroughputBps / 1_000_000;
  
  return {
    baseTransferTime,
    latencyOverhead: Math.max(0, latencyOverhead), // Ensure non-negative
    totalTime,
    effectiveThroughputMbps,
    roundTrips,
    fileSizeBytes,
    isWindowLimited,
    bdpBytes,
  };
}

export interface CalculationStep {
  label: string;
  formula: string;
  value: string;
}

export function getCalculationBreakdown(scenario: Scenario, result: TransferResult): CalculationStep[] {
  const protocol = getProtocol(scenario.protocolId);
  const bandwidthPerUser = scenario.bandwidthMbps / scenario.concurrentUsers;
  const rttSeconds = scenario.latencyMs / 1000;
  
  // Window-limited throughput
  const windowThroughputMbps = rttSeconds > 0
    ? (protocol.windowSizeBytes * 8) / rttSeconds / 1_000_000
    : Infinity;
  
  const steps: CalculationStep[] = [
    {
      label: 'File Size',
      formula: `${scenario.fileSizeValue} ${scenario.fileSizeUnit}`,
      value: formatBytes(result.fileSizeBytes),
    },
    {
      label: 'Raw Bandwidth',
      formula: `${scenario.bandwidthMbps} Mbps ÷ ${scenario.concurrentUsers} user${scenario.concurrentUsers > 1 ? 's' : ''}`,
      value: `${bandwidthPerUser.toFixed(0)} Mbps`,
    },
    {
      label: 'Bandwidth-Delay Product',
      formula: `${bandwidthPerUser} Mbps × ${scenario.latencyMs} ms`,
      value: formatBytes(result.bdpBytes),
    },
    {
      label: 'Protocol Window',
      formula: `${protocol.name}`,
      value: formatBytes(protocol.windowSizeBytes),
    },
  ];

  if (result.isWindowLimited) {
    steps.push({
      label: 'Window-Limited Throughput',
      formula: `${formatBytes(protocol.windowSizeBytes)} ÷ ${scenario.latencyMs} ms`,
      value: `${windowThroughputMbps.toFixed(0)} Mbps`,
    });
    steps.push({
      label: 'Bottleneck',
      formula: `Window (${formatBytes(protocol.windowSizeBytes)}) < BDP (${formatBytes(result.bdpBytes)})`,
      value: 'Window-limited',
    });
  } else {
    steps.push({
      label: 'Bottleneck',
      formula: `Window (${formatBytes(protocol.windowSizeBytes)}) ≥ BDP (${formatBytes(result.bdpBytes)})`,
      value: 'Bandwidth-limited',
    });
  }

  steps.push({
    label: 'Effective Throughput',
    formula: result.isWindowLimited 
      ? `min(${bandwidthPerUser} Mbps, ${windowThroughputMbps.toFixed(0)} Mbps)`
      : `${bandwidthPerUser} Mbps (full bandwidth)`,
    value: `${result.effectiveThroughputMbps.toFixed(0)} Mbps`,
  });

  steps.push({
    label: 'Total Transfer Time',
    formula: `${formatBytes(result.fileSizeBytes)} ÷ ${result.effectiveThroughputMbps.toFixed(0)} Mbps`,
    value: formatTime(result.totalTime),
  });

  return steps;
}
