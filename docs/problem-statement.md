# Impact of Latency on File Sharing Performance (SMB vs. Other Protocols)

## TL;DR
**Latency Slows Transfers**

High network latency (RTT) forces idle wait times, reducing throughput—especially in chatty file-sharing protocols.

**Chatty Protocol Overhead**

SMB’s small request–acknowledgement cycles cause many round trips, magnifying delay on WAN links.

**Large Windows Help**

Larger packet windows & pipelining mitigate latency impact. (See algorithm and comparison table.)

## How Latency Limits Throughput

Latency (network delay) can significantly degrade file transfer speeds even when bandwidth is plentiful. In a high-latency network, the sender often spends time waiting for acknowledgements before sending more data. This idle wait reduces effective throughput. The bandwidth–delay product (BDP) concept illustrates this: it’s the amount of data that can fill the network “pipe” in one round-trip. If a protocol can’t keep at least the BDP’s worth of data in flight (due to small windows or chatty handshakes), the link won’t be fully utilised, and throughput falls below the raw bandwidth. In essence, throughput ≈ (effective window size) / RTT. For example, a 64 KB window with 33 ms RTT yields a max of only ~15.5 Mbps throughput – far below the capacity of a fast link. Modern protocols use larger, dynamic windows to better fill the pipe, but not all file-sharing methods manage this equally well. [1](https://cordero.me/tcp-throughput-calculations/)

## SMB: A “Chatty” Protocol on WANs

Server Message Block (SMB) is known as a chatty protocol, meaning it performs many sequential request–response exchanges. Classic SMB (CIFS/SMB1) would often send a small chunk of data then wait for an acknowledgement before proceeding to the next chunk. Each chunk incurs a full round-trip delay. On a high-RTT link, these delays accumulate, dramatically slowing the transfer. Even with improvements in SMB2 and SMB3 (larger reads/writes and request pipelining), SMB can still be sensitive to latency because it wasn’t originally designed for high-latency environments. Microsoft’s SMB is optimised for LAN speeds; across a WAN even slight delays can cause noticeable slowdowns. For example, in one test adding just 5 ms of latency cut SMB throughput from ~500 Mbps down to ~400 Mbps. In another case, a 5 MB file that opens in ~45 seconds over a 20 ms RTT took over 4 minutes over a 90 ms RTT. This happens because the protocol issues numerous small read/write commands (often hundreds for a single file transfer) and each entails an exchange with the server. One mode of SMB file writing literally follows a send → wait → send → wait pattern, which is fine on a LAN but highly inefficient over a WAN. The result is that a file copy over SMB could take many times longer on a high-latency link than on a low-latency link, even if bandwidth is the same. [2](https://www.networktcpip.com/post/optimizing-smb-performance-over-ipsec-tunnels-with-fortigate-and-cloudflare-ztna) [3](https://forums.gentoo.org/viewtopic-t-1161992.html)

Modern SMB2/SMB3 mitigate this with features like request pipelining (compounding) and larger default block sizes (e.g. 512 KB or 1 MB reads/writes instead of 64 KB) to send more data before waiting. SMB3 can also use multiple parallel TCP connections (SMB Multichannel) to improve throughput. These enhancements greatly reduce latency overhead compared to SMB1. However, if SMB’s credit/window settings aren’t large enough to cover the BDP, the throughput will still be limited by the round-trip delay. In other words, if the protocol stops to wait too often, high RTT will hurt performance.

## Estimating Download Time – An Algorithm

To estimate effective download time for a file transfer, consider both raw bandwidth and latency-induced overhead:

Baseline transfer time – First calculate how long the transfer would take on the given bandwidth with no latency overhead. For a file of size S (in bits) over a link of bandwidth B (bits/s), this ideal time is Tbase = S / B. For example, a 2 GB file (≈16×10^9 bits) on a 500 Mbps link has Tbase ≈ 32 s (since 16e9/5e8 = 32).

Protocol in-flight capacity – Determine how much data the protocol can have “in flight” per round trip. This depends on the protocol’s window / pipelining. For instance:
– A non-pipelined protocol sending one 64 KB block per RTT has in-flight = 64 KB per RTT.
– A protocol that allows, say, 8 simultaneous 128 KB requests would have in-flight = 8×128 KB = 1,024 KB per RTT.
– Effectively, in_flight = min(protocol_window, S) (for large files the window is the limiting factor).

Round trips required – Estimate the number of RTT cycles needed: N = ceil(S / in_flight). This is how many round-trip acknowledgements the sender will wait for during the transfer. (If the protocol fully pipelines the transfer, N might be close to 1; if it stops-and-waits each chunk, N will be large.)

Latency overhead – Each cycle adds one full RTT of waiting time where bandwidth isn’t used. Total latency penalty ≈ N × RTT. (If the pipeline/window covers the entire transfer, N≈1 and latency overhead is negligible; if not, this could be a substantial addition.)

Total effective download time – Sum the baseline data transfer time and the latency overhead: Ttotal ≈ Tbase + N × RTT. In other words, download time ≈ file_size / bandwidth + (number_of_round_trips × latency).

Another way to look at it: if the protocol’s window is smaller than the bandwidth–delay product, the achievable throughput will be limited to (window_size / RTT) rather than the raw link speed. In that case, Ttotal can be directly found by file_size / throughput. For example, if a protocol can only send 1 MB per RTT and RTT is 50 ms, it caps at 1 MB/0.05 s = 20 MB/s (~160 Mbps). Transferring 2 GB at that rate would take ~100 s. [4](https://cordero.me/tcp-throughput-calculations/)

## Protocol Comparison: 2 GB over 500 Mbps, 8 ms vs 55 ms RTT

To illustrate, here are approximate download times for a 2 GB file over a 500 Mb/s link. We compare a low-latency scenario (8 ms RTT, akin to a regional network) versus a higher-latency scenario (55 ms RTT, e.g. cross-country). The protocols vary in how well they cope with latency:

* SMB2: Second-generation SMB (from Windows Vista/7 era) improved over SMB1 with larger block sizes and some pipelining, but it may still not fully utilize a high-bandwidth link on high RTT if default credit limits are low. It might send a few requests at once, then wait for replies. This can severely lengthen transfer time as RTT grows (a “stop-and-wait” pattern).
* SMB3: Newer SMB (Windows 8+), supporting even larger windows and features like multi-channel. It handles latency better than SMB2 when properly used, keeping more data in flight. Still, if not using multi-channel or if encryption/signing is enabled, latency can have an impact. (SMB’s security features can introduce extra round trips too, e.g. signing every packet.)
* NFS: The Network File System (e.g. NFSv3/NFSv4) typically reads/writes in chunks (often 64 KB to 1 MB) over TCP. Depending on client settings, it may pipeline several operations. A well-tuned NFS (with large read-ahead and nconnect multiple TCP streams) can mitigate latency, but default settings might serialize many operations, hurting throughput over long RTT. NFS benefits from pipelining; small default read-ahead (e.g. 128 KB) might not be enough to saturate fast links. [5](https://honnef.co/notes/20230128011632-nfs_sequential_read_performance/)
* FTP: Traditional FTP uses TCP for data transport. Being a simple bulk transfer, it relies on TCP’s own window scaling to keep the pipe full. Modern TCP/IP stacks will auto-tune to large windows (often several MBs), so FTP can usually achieve near line-rate even with high latency (as long as the application isn’t artificially chunking the file). FTP has very little inherent protocol overhead. [6](https://stackoverflow.com/questions/8849240/why-when-i-transfer-a-file-through-sftp-it-takes-longer-than-ftp)
* SFTP: Secure FTP (FTP over SSH) adds encryption and runs within an SSH session. It introduces additional handshaking and a second layer of flow control on top of TCP. By default, SFTP’s internal window may be limited (e.g. ~2 MB, effectively ~1.2 MB in stock OpenSSH). On high-latency links, an untuned SFTP often cannot fully use a fast link, leading to much longer transfer times than FTP (due to small windows and extra encryption overhead). [7](https://stackoverflow.com/questions/8849240/why-when-i-transfer-a-file-through-sftp-it-takes-longer-than-ftp)
* HTTP: Downloading a file over HTTP (or HTTPS) also uses TCP under the hood. Like FTP, it benefits from large TCP windows and efficient congestion control. A single large file download via HTTP/HTTPS should perform similarly to FTP in terms of throughput. (HTTP/2 or HTTP/3 protocols mostly affect how multiple small objects are handled; for one big file, the effect of latency is minimal beyond the initial request handshake.)

The table below compares estimated download times under 8 ms vs 55 ms RTT for each protocol. All assume a 2 GB (gigabyte) file on a 500 Mb/s link, with typical default settings:

| Protocol | ~Download Time @ 8 ms | RTT~Download |

Time @ 55 ms RTTSMB2~33 seconds~110 secondsSMB3~33 seconds~60 secondsNFS~33 seconds~80 secondsFTP~32–34 seconds~34 secondsSFTP~33 seconds~90 secondsHTTP~32–34 seconds~34 seconds

| Protocol | ~Download Time @ 8 ms RTT | ~Download Time @ 55 ms RTT |
| - | - | - |
| SMB2 | ~33 seconds | ~110 seconds
| SMB3 | ~33 seconds | ~60 seconds |
| NFS | ~33 seconds | ~80 seconds |
| FTP | ~32–34 seconds | ~34 seconds |
| SFTP | ~33 seconds | ~90 seconds |
| HTTP | ~32–34 seconds | ~34 seconds|

Note: All times are rounded estimates. 8 ms RTT is low enough that even chatty protocols approach the 32 s theoretical minimum (limited only by bandwidth). By 55 ms RTT, differences emerge: protocols with more round trips or smaller windows (SMB2, SFTP, etc.) suffer significant slowdowns, whereas those that keep the pipe full (FTP, HTTP) remain close to the baseline transfer time.

As shown, high latency can multiply the effective download time for chatty protocols. For instance, SMB2 might take on the order of 3–4× longer at 55 ms vs a low-latency case. In contrast, FTP and HTTP are largely bandwidth-bound rather than latency-bound – they maintain ~500 Mb/s throughput in both scenarios by using large TCP windows (thanks to window scaling and aggressive buffering).

## Conclusion
In summary, network latency can be a major bottleneck for file sharing performance when the protocol requires frequent acknowledgements or has limited in-flight data. SMB is a prime example where multiple round-trip exchanges per file operation lead to poor throughput on high-latency links. Other protocols like NFS and SFTP also see degraded performance if not tuned, due to similar request-response patterns or flow control limits. On the other hand, streaming protocols (FTP, HTTP) with large sliding windows fare much better, as they can fill the bandwidth–delay product and avoid idle time. To improve performance over WANs, one can choose protocols or settings that allow larger packet windows and pipelining – effectively reducing the impact of each millisecond of latency. Techniques such as increasing SMB credits, enabling NFS read-ahead and parallel connections, or using dedicated acceleration tools can help. Ultimately, to maximise throughput, the goal is to send as much data as possible per round trip, minimising how often the transfer must stop and wait. By accounting for latency in our calculations (using the algorithm above) and optimising protocol behaviour accordingly, we can approach the theoretical bandwidth limit even on long-distance networks.