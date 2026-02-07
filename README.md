# Sliding Window Protocol Visualizer

An educational visualization tool for understanding data link layer protocols and flow control mechanisms. Features four different protocols with step-by-step animations and plain-English explanations.

## Protocols

### 1. Stop-and-Wait (S&W)
The simplest protocol. Sender transmits one packet and waits for acknowledgment before sending the next. If ACK doesn't arrive (timeout), the packet is retransmitted.

### 2. Go-Back-N (GBN)
Uses a sliding window to send multiple packets. If a packet is lost, the receiver discards all subsequent packets, and the sender must retransmit from the lost packet onwards.

### 3. Selective Repeat (SR)
More efficient than Go-Back-N. The receiver buffers out-of-order packets and only requests retransmission of the specific lost packet.

### 4. Flow Control (FC)
Pure flow control without error handling. Demonstrates how receivers control transmission speed using advertised window size. No packet loss, no retransmissions — focuses purely on buffer management.

## Features

- **Black & white UI** — minimal, calm, educational
- **Step-by-step animations** — one packet at a time
- **Plain-English explanations** — no jargon
- **Network settings** — configurable loss rate, packet count, window size
- **Performance metrics** — efficiency, throughput, retransmissions
- **Sequence diagram** — visual timeline with PNG export
- **Protocol comparison** — side-by-side Go-Back-N vs Selective Repeat

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

## Controls

| Button | Action |
|--------|--------|
| **Start** | Begin automatic playback |
| **Pause** | Stop playback |
| **Step** | Advance one event (Flow Control only) |
| **Reset** | Return to initial state |
| **Speed** | Slow / Normal / Fast |

## Project Structure

```
app/
├── components/
│   ├── Sender.tsx          # ARQ protocol sender
│   ├── Receiver.tsx        # ARQ protocol receiver
│   ├── Channel.tsx         # Network channel animation
│   ├── Controls.tsx        # Playback controls
│   ├── Explanation.tsx     # Event explanations
│   ├── ProtocolToggle.tsx  # Protocol selector
│   ├── Logs.tsx            # Event log panel
│   ├── Metrics.tsx         # Performance metrics
│   ├── NetworkSettings.tsx # Configuration panel
│   ├── SequenceDiagram.tsx # Timeline visualization
│   ├── ComparisonView.tsx  # Side-by-side comparison
│   ├── FlowSender.tsx      # Flow control sender
│   ├── FlowReceiver.tsx    # Flow control receiver
│   ├── FlowChannel.tsx     # Flow control channel
│   ├── FlowControls.tsx    # Flow control playback
│   └── FlowExplanation.tsx # Flow control explanations
├── protocols/
│   ├── types.ts            # Shared type definitions
│   ├── stopAndWait.ts      # Stop-and-Wait logic
│   ├── goBackN.ts          # Go-Back-N logic
│   ├── selectiveRepeat.ts  # Selective Repeat logic
│   └── flowControl.ts      # Flow Control logic
├── globals.css             # Black & white theme
├── layout.tsx              # Fonts and metadata
└── page.tsx                # Main application
```

## Flow Control Mode

When you select **Flow Control**, the UI switches to a simplified view focused purely on receiver-controlled data flow:

- **No packet loss** — all packets arrive
- **No retransmissions** — no error recovery
- **Buffer visualization** — see packets fill the receiver buffer
- **Window size display** — watch advertised window change
- **Waiting state** — sender stops when buffer is full

This mode demonstrates the core concept:
> The receiver tells the sender how much data it can accept.

## Design Philosophy

- **Calm** — No flashy colors or distracting animations
- **Educational** — One idea at a time
- **Simple** — Understandable by beginners
- **Minimal** — Clean, focused interface
- **Premium** — Professional typography and spacing

## Tech Stack

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Lucide React** — Icons
- **html2canvas** — PNG export
- **Fonts** — Space Grotesk, Inter, JetBrains Mono

---

Built for Computer Networks coursework. Designed to be understood by anyone.
