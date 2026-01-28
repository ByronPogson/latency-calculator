# Copilot Instructions for latency-calc

## Project Overview

A React calculator app for comparing file transfer scenarios across different network protocols. Users create named scenarios with configurable bandwidth, latency, protocol, and concurrent users. Results display in a summary table and stacked bar chart showing transfer time components (base transfer vs latency overhead).

## Tech Stack

- **Framework:** Vite + React + TypeScript
- **UI Components:** shadcn/ui (Radix primitives + Tailwind CSS)
- **Styling:** Tailwind CSS

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run preview      # Preview production build
```

## Architecture

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Input, Select, etc.)
│   ├── ScenarioForm.tsx # Form for adding/editing scenarios
│   ├── ScenarioTable.tsx# Summary table of all scenarios
│   └── ComparisonChart.tsx # Stacked bar chart visualization
├── lib/
│   ├── calculator.ts    # Transfer time calculation logic
│   └── protocols.ts     # Protocol definitions and characteristics
├── hooks/
│   └── useScenarios.ts  # Scenario state management
└── types/
    └── scenario.ts      # TypeScript interfaces
```

## Data Model

```typescript
interface Scenario {
  id: string;
  name: string;
  bandwidthMbps: number;
  latencyMs: number;
  protocol: Protocol;
  concurrentUsers: number;
}

interface TransferResult {
  baseTransferTime: number;    // Time at full bandwidth (seconds)
  latencyOverhead: number;     // Additional time from round trips (seconds)
  totalTime: number;
  effectiveThroughputMbps: number;
}
```

## Key Concepts

### Bandwidth-Delay Product (BDP)

The amount of data that can "fill" a network pipe in one round-trip. If a protocol can't keep at least BDP worth of data in flight, throughput falls below raw bandwidth.

**Formula:** `throughput ≈ window_size / RTT`

### Transfer Time Algorithm

```
Total time = (file_size / bandwidth) + (round_trips × RTT)
```

Where:
- `round_trips = ceil(file_size / in_flight_capacity)`
- `in_flight_capacity` depends on protocol window/pipelining settings

### Protocol Characteristics

| Protocol | Behavior | Latency Sensitivity |
|----------|----------|---------------------|
| SMB2 | Small windows, stop-and-wait pattern | High |
| SMB3 | Larger windows, multi-channel support | Medium |
| NFS | Chunk-based, depends on read-ahead settings | Medium-High |
| FTP | Simple bulk transfer, relies on TCP windows | Low |
| SFTP | SSH layer adds flow control overhead (~2MB window) | High |
| HTTP | Large TCP windows, minimal protocol overhead | Low |

## Calculation Logic

### Core Formula

```typescript
const baseTime = fileSizeBits / (bandwidthMbps * 1_000_000 / concurrentUsers);
const roundTrips = Math.ceil(fileSizeBytes / protocol.windowSize);
const latencyOverhead = roundTrips * (latencyMs / 1000);
const totalTime = baseTime + latencyOverhead;
```

### Protocol Window Sizes (defaults)

| Protocol | Window Size | Notes |
|----------|-------------|-------|
| SMB2 | 64 KB | Stop-and-wait pattern |
| SMB3 | 1 MB | Improved pipelining |
| NFS | 256 KB | Depends on read-ahead |
| FTP | 4 MB+ | TCP auto-tuning |
| SFTP | 2 MB | SSH layer overhead |
| HTTP | 4 MB+ | TCP auto-tuning |

## Chart Requirements

The comparison chart should be a **stacked horizontal bar chart** where each scenario shows:
- Base transfer time (bandwidth-limited portion)
- Latency overhead (protocol round-trip delays)

This visualization makes it clear why chatty protocols suffer at high latency.
