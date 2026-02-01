# Latency Calculator

As a born and raised sandgroper (i.e. from Perth, Western Australia) I often hear that latency doesn't matter, especially for downloads. That's not always the case. This web tool calculates how network latency theoretically impacts file transfer performance across different protocols.

## What it does

Compares transfer times for different file transfer protocols (SMB, NFS, FTP, HTTP, etc.) under varying network conditions. Shows how protocol window sizes and network latency affect actual throughput vs. theoretical bandwidth.

## Run locally

```bash
npm install
npm run dev
```

## Built with

- GitHub Copilot
- React + TypeScript
- Vite
- Tailwind CSS
- Recharts for visualization

---

Copyright 2026 [Byron Pogson](https://www.bpog.cloud/). [MIT License](./Licence).