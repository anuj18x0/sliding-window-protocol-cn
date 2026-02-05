# Sliding Window Protocol Visualizer

An educational, black-and-white interactive lab for understanding how reliable data transfer works. The app walks through three classic sliding window protocols and lets you experiment with network conditions, packet loss, and recovery strategies in real time.

## Table of Contents

1. [Protocols Covered](#protocols-covered)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Using the Visualizer](#using-the-visualizer)
5. [Application Layout](#application-layout)
6. [Architecture](#architecture)
7. [Tech Stack](#tech-stack)
8. [Further Ideas](#further-ideas)

## Protocols Covered

- **Stop-and-Wait** – one packet in flight; sender pauses until the ACK returns.
- **Go-Back-N** – windowed sending; any lost packet forces retransmission of that packet and everything after it.
- **Selective Repeat** – windowed sending with per-packet acknowledgements and buffering of out-of-order data.

Each protocol ships with detailed, narrative explanations of every event so beginners can follow the story.

## Feature Highlights

- **Monochrome Interface** – calm black/white palette that keeps the focus on motion and story.
- **Dynamic Animations** – eased packet travel, loss explosions, and sender/receiver status updates.
- **Storytelling Explanations** – plain-language event summaries with Lucide icons instead of emojis.
- **Interactive Network Settings**
  - Loss probability slider (0–50%).
  - Total packet count (4–12).
  - Window size (1–6).
  - “Randomize Loss Pattern” to generate new scenarios instantly.
- **Performance Metrics Dashboard**
  - Efficiency (delivered vs sent).
  - Throughput (delivered packets per simulation step).
  - Retransmission count.
  - Loss count and ACKs received.
- **Sequence Diagram View** – live sequence diagram with export-to-PNG support (via `html2canvas`).
- **Logs Panel** – chronological event stream with active-step highlighting.
- **Protocol Comparison Modal** – run Go-Back-N and Selective Repeat side by side on the same loss pattern.
- **Export** – download the current sequence diagram as a PNG for coursework or reports.

## Quick Start

```bash
# install dependencies
npm install

# start the development server
npm run dev

# optional: type-check
npm run lint
```

Visit **http://localhost:3000** once the dev server is up.

## Using the Visualizer

1. **Choose a Protocol** – Stop-and-Wait, Go-Back-N, or Selective Repeat via the top-right toggle.
2. **Configure the Network** *(left sidebar)* – adjust loss probability, packet count, and window size. Randomize the loss pattern if you need a new scenario.
3. **Control Playback** *(bottom center)* – Start, Pause, Reset, and adjust speed (slow, medium, fast).
4. **Watch the Story** – follow the sender/receiver visuals, channel animations, and the explanation card.
5. **Dive into Details** *(right sidebar tabs)*:
   - **Logs** – textual timeline of every event.
   - **Stats** – performance metrics updated live.
   - **Seq** – sequence diagram; export via the PNG button.
6. **Compare Protocols** – press **Compare** in the header to open the modal that runs Go-Back-N vs Selective Repeat simultaneously with synchronized metrics.

> **Tip:** The simulation auto-pauses at the end. Press Reset after tweaking network settings to regenerate state using the latest configuration.

## Application Layout

```
app/
├── components/
│   ├── Channel.tsx          # Cable, packet animations, network icons
│   ├── ComparisonView.tsx   # Side-by-side protocol comparison modal
│   ├── Controls.tsx         # Playback controls + speed selection
│   ├── Explanation.tsx      # Storytelling event card with progress bar
│   ├── Logs.tsx             # Event log panel
│   ├── Metrics.tsx          # Performance metrics dashboard
│   ├── NetworkSettings.tsx  # Loss rate, packet count, window size sliders
│   ├── Packet.tsx           # Visual representation + animation logic
│   ├── ProtocolToggle.tsx   # Protocol selector
│   ├── Receiver.tsx         # Receiver window + buffer display
│   ├── Sender.tsx           # Sender window visualization
│   └── SequenceDiagram.tsx  # Live diagram + PNG export
├── protocols/
│   ├── stopAndWait.ts
│   ├── goBackN.ts
│   ├── selectiveRepeat.ts
│   └── types.ts             # Shared protocol types
├── globals.css              # Monochrome theme + Tailwind layers
├── layout.tsx               # Root layout and font registration
└── page.tsx                 # App state orchestration and layout
```

## Architecture

- **State Management** – Local React state orchestrates the simulation, referencing protocol-specific event generators.
- **Protocol Engines** – Each protocol file exports a `create<State>` factory producing a deterministic event list for the configured packet count, window size, and loss pattern.
- **Animation Loop** – `page.tsx` drives animations via `requestAnimationFrame` for packets and `setTimeout` pacing between events.
- **Metrics & Logs** – Metrics derive from the processed subset of events; logs persist the chronological history for playback.
- **Sequence Diagram** – Mirrors the processed events onto a sender/receiver timeline with export capability.
- **Comparison Modal** – Rehydrates two separate simulations (Go-Back-N and Selective Repeat) and steps them in lockstep for live comparison.

## Tech Stack

- **Framework** – Next.js 14 (App Router)
- **Language** – TypeScript
- **Styling** – Tailwind CSS with a custom monochrome theme
- **Icons** – `lucide-react`
- **Fonts** – Inter, Space Grotesk, JetBrains Mono via `next/font`
- **Export Utility** – `html2canvas` for PNG sequence diagrams

## Further Ideas

- Manual packet loss injection (click a packet while it travels to drop it).
- Classroom mode: instructor vs student scores based on efficiency.
- Generate printable summaries (PDF) combining metrics, logs, and the exported diagram.
- Accessibility pass (keyboard-native controls, narration).

---

Designed for calm storytelling, clear signal flow, and quick comparisons between the major sliding window strategies.
