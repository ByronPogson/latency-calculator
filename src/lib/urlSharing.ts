import type { Scenario, ProtocolId, FileSizeUnit } from '@/types/scenario';

// Compact format for URL encoding
interface CompactScenario {
  n: string;           // name
  v: number;           // fileSizeValue
  u: FileSizeUnit;     // fileSizeUnit
  b: number;           // bandwidthMbps
  l: number;           // latencyMs
  p: ProtocolId;       // protocolId
}

function toCompact(scenario: Scenario): CompactScenario {
  return {
    n: scenario.name,
    v: scenario.fileSizeValue,
    u: scenario.fileSizeUnit,
    b: scenario.bandwidthMbps,
    l: scenario.latencyMs,
    p: scenario.protocolId,
  };
}

function fromCompact(compact: CompactScenario, id: string): Scenario {
  return {
    id,
    name: compact.n,
    fileSizeValue: compact.v,
    fileSizeUnit: compact.u,
    bandwidthMbps: compact.b,
    latencyMs: compact.l,
    protocolId: compact.p,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// URL-safe base64 encoding
function toUrlSafeBase64(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromUrlSafeBase64(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

export function encodeScenarios(scenarios: Scenario[]): string {
  if (scenarios.length === 0) return '';
  
  const compact = scenarios.map(toCompact);
  const json = JSON.stringify(compact);
  return toUrlSafeBase64(json);
}

export function decodeScenarios(encoded: string): Scenario[] | null {
  if (!encoded) return null;
  
  try {
    const json = fromUrlSafeBase64(encoded);
    const compact: CompactScenario[] = JSON.parse(json);
    
    if (!Array.isArray(compact)) return null;
    
    return compact.map((c) => fromCompact(c, generateId()));
  } catch {
    return null;
  }
}

export function buildShareUrl(scenarios: Scenario[]): string {
  const encoded = encodeScenarios(scenarios);
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  if (encoded) {
    url.searchParams.set('s', encoded);
  }
  return url.toString();
}

export function getEncodedFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('s');
}

export function clearUrlParam(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('s');
  window.history.replaceState({}, '', url.toString());
}
