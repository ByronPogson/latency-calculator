import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PROTOCOL_LIST } from '@/lib/protocols';

export function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Understanding Latency's Impact
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Learn how network latency affects file transfer performance across different protocols
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TL;DR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Latency Slows Transfers</h3>
            <p className="text-muted-foreground">
              High network latency (RTT) forces idle wait times, reducing throughput—especially
              in "chatty" file-sharing protocols.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Chatty Protocol Overhead</h3>
            <p className="text-muted-foreground">
              SMB's small request–acknowledgement cycles cause many round trips, magnifying delay
              on WAN links.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Large Windows Help</h3>
            <p className="text-muted-foreground">
              Larger packet windows & pipelining mitigate latency impact.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Latency Limits Throughput</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Latency (network delay) can significantly degrade file transfer speeds even when
            bandwidth is plentiful. In a high-latency network, the sender often spends time
            waiting for acknowledgements before sending more data. This idle wait reduces
            effective throughput.
          </p>
          <p>
            The <strong>bandwidth–delay product (BDP)</strong> concept illustrates this: it's the
            amount of data that can fill the network "pipe" in one round-trip. If a protocol can't
            keep at least the BDP's worth of data in flight (due to small windows or chatty
            handshakes), the link won't be fully utilized, and throughput falls below the raw
            bandwidth.
          </p>
          <p>
            In essence: <code className="bg-muted px-1.5 py-0.5 rounded">throughput ≈ window_size / RTT</code>
          </p>
          <p>
            For example, a 64 KB window with 33 ms RTT yields a max of only ~15.5 Mbps
            throughput—far below the capacity of a fast link.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This calculator estimates download time by considering both raw bandwidth and
            latency-induced overhead:
          </p>

          <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2">
            <p><strong>1. Base Transfer Time</strong></p>
            <p className="pl-4">baseTime = (fileSize × 8) / (bandwidth / users)</p>

            <p className="mt-4"><strong>2. Round Trips Required</strong></p>
            <p className="pl-4">roundTrips = ⌈fileSize / protocolWindowSize⌉</p>

            <p className="mt-4"><strong>3. Latency Overhead</strong></p>
            <p className="pl-4">overhead = roundTrips × latency</p>

            <p className="mt-4"><strong>4. Total Transfer Time</strong></p>
            <p className="pl-4">totalTime = baseTime + overhead</p>
          </div>

          <p className="text-sm text-muted-foreground">
            The key insight: protocols with smaller window sizes require more round trips,
            and each round trip adds one full RTT of waiting time where bandwidth isn't used.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Protocol Characteristics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocol</TableHead>
                <TableHead>Window Size</TableHead>
                <TableHead>Latency Sensitivity</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROTOCOL_LIST.map((protocol) => (
                <TableRow key={protocol.id}>
                  <TableCell className="font-medium">{protocol.name}</TableCell>
                  <TableCell>
                    {protocol.windowSizeBytes >= 1024 * 1024
                      ? `${protocol.windowSizeBytes / (1024 * 1024)} MB`
                      : `${protocol.windowSizeBytes / 1024} KB`}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        protocol.latencySensitivity === 'High'
                          ? 'text-red-600'
                          : protocol.latencySensitivity === 'Low'
                            ? 'text-green-600'
                            : 'text-yellow-600'
                      }
                    >
                      {protocol.latencySensitivity}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {protocol.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example: 2 GB File over 500 Mbps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Comparing estimated download times at low latency (8 ms) vs high latency (55 ms):
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocol</TableHead>
                <TableHead className="text-right">8 ms RTT</TableHead>
                <TableHead className="text-right">55 ms RTT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>SMB2</TableCell>
                <TableCell className="text-right">~33 seconds</TableCell>
                <TableCell className="text-right text-red-600">~110 seconds</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SMB3</TableCell>
                <TableCell className="text-right">~33 seconds</TableCell>
                <TableCell className="text-right">~60 seconds</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>NFS</TableCell>
                <TableCell className="text-right">~33 seconds</TableCell>
                <TableCell className="text-right">~80 seconds</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>FTP</TableCell>
                <TableCell className="text-right">~32–34 seconds</TableCell>
                <TableCell className="text-right text-green-600">~34 seconds</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SFTP</TableCell>
                <TableCell className="text-right">~33 seconds</TableCell>
                <TableCell className="text-right">~90 seconds</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>HTTP</TableCell>
                <TableCell className="text-right">~32–34 seconds</TableCell>
                <TableCell className="text-right text-green-600">~34 seconds</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            At 8 ms RTT, all protocols approach the theoretical minimum of ~32 seconds. At 55 ms
            RTT, chatty protocols (SMB2, SFTP) take 3–4× longer, while streaming protocols
            (FTP, HTTP) remain near baseline.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conclusion</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Network latency can be a major bottleneck for file sharing performance when the
            protocol requires frequent acknowledgements or has limited in-flight data. SMB is a
            prime example where multiple round-trip exchanges per file operation lead to poor
            throughput on high-latency links.
          </p>
          <p>
            To maximize throughput, the goal is to send as much data as possible per round trip,
            minimizing how often the transfer must stop and wait. Techniques such as increasing
            SMB credits, enabling NFS read-ahead and parallel connections, or using dedicated
            acceleration tools can help.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
