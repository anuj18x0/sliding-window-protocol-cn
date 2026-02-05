import { SimulationEvent, SimulationState, WindowState } from './types';

let eventCounter = 0;

function createEvent(
  type: SimulationEvent['type'],
  packetId: number,
  senderWindow: WindowState,
  receiverExpected: number,
  receiverBuffer: number[],
  explanation: string
): SimulationEvent {
  return {
    id: `event-${eventCounter++}`,
    type,
    packetId,
    timestamp: Date.now(),
    senderWindow: { ...senderWindow },
    receiverWindow: { expected: receiverExpected, buffer: [...receiverBuffer] },
    explanation,
  };
}

export function generateGoBackNEvents(
  totalPackets: number,
  windowSize: number,
  lossPattern: number[]
): SimulationEvent[] {
  eventCounter = 0;
  const events: SimulationEvent[] = [];
  const lossSet = new Set(lossPattern);
  
  let base = 0;
  let nextSeq = 0;
  let receiverExpected = 0;
  
  while (base < totalPackets) {
    const windowEnd = Math.min(base + windowSize, totalPackets);
    
    while (nextSeq < windowEnd) {
      const senderWindow: WindowState = { base, nextSeq, size: windowSize };
      
      events.push(createEvent(
        'send',
        nextSeq,
        senderWindow,
        receiverExpected,
        [],
        `The sender fires off Packet ${nextSeq} into the network! With Go-Back-N, we can send multiple packets without waiting. The window currently allows packets ${base} to ${windowEnd - 1} to be "in flight" at once.`
      ));
      
      nextSeq++;
    }
    
    let lostPacketId = -1;
    for (let i = base; i < nextSeq; i++) {
      if (lossSet.has(i)) {
        lostPacketId = i;
        lossSet.delete(i);
        break;
      }
    }
    
    if (lostPacketId !== -1) {
      events.push(createEvent(
        'loss',
        lostPacketId,
        { base, nextSeq, size: windowSize },
        receiverExpected,
        [],
        `Disaster! Packet ${lostPacketId} vanished in the network! This creates a gap in the sequence. In Go-Back-N, this is a big problem — the receiver is very strict about order.`
      ));
      
      for (let i = base; i < lostPacketId; i++) {
        events.push(createEvent(
          'receive',
          i,
          { base, nextSeq, size: windowSize },
          receiverExpected,
          [],
          `The receiver successfully got Packet ${i}. This one arrived in the correct order, so it's accepted and processed.`
        ));
        receiverExpected = i + 1;
        
        events.push(createEvent(
          'ack-send',
          i,
          { base, nextSeq, size: windowSize },
          receiverExpected,
          [],
          `The receiver sends ACK ${i} back to the sender, confirming this packet was received correctly.`
        ));
      }
      
      for (let i = lostPacketId + 1; i < nextSeq; i++) {
        events.push(createEvent(
          'receive',
          i,
          { base, nextSeq, size: windowSize },
          receiverExpected,
          [],
          `Packet ${i} arrived, but the receiver expected Packet ${receiverExpected} first! In Go-Back-N, out-of-order packets are thrown away. This packet is discarded — what a waste!`
        ));
      }
      
      events.push(createEvent(
        'timeout',
        lostPacketId,
        { base, nextSeq, size: windowSize },
        receiverExpected,
        [],
        `Timeout! The sender never got ACK for Packet ${lostPacketId}. Now it must "Go Back" to packet ${lostPacketId} and resend everything from there. This is why it's called Go-Back-N!`
      ));
      
      base = lostPacketId;
      nextSeq = lostPacketId;
      
    } else {
      for (let i = base; i < nextSeq; i++) {
        events.push(createEvent(
          'receive',
          i,
          { base, nextSeq, size: windowSize },
          receiverExpected,
          [],
          `Perfect! Packet ${i} arrived at the receiver in the correct order. The data is accepted and ready for processing.`
        ));
        receiverExpected = i + 1;
        
        events.push(createEvent(
          'ack-send',
          i,
          { base, nextSeq, size: windowSize },
          receiverExpected,
          [],
          `The receiver sends ACK ${i} back through the network to confirm successful delivery.`
        ));
      }
      
      for (let i = base; i < nextSeq; i++) {
        events.push(createEvent(
          'ack-receive',
          i,
          { base: i + 1, nextSeq, size: windowSize },
          receiverExpected,
          [],
          `ACK ${i} received! The sender's window slides forward — it can now send new packets. This is the "sliding" in Sliding Window!`
        ));
      }
      
      base = nextSeq;
    }
  }
  
  return events;
}

export function createGoBackNState(totalPackets: number, windowSize: number, lossPattern: number[]): SimulationState {
  return {
    protocol: 'go-back-n',
    totalPackets,
    senderWindow: { base: 0, nextSeq: 0, size: windowSize },
    receiverWindow: { expected: 0, buffer: [] },
    packets: Array.from({ length: totalPackets }, (_, i) => ({ id: i, status: 'pending' })),
    events: generateGoBackNEvents(totalPackets, windowSize, lossPattern),
    currentEventIndex: -1,
    isComplete: false,
    lossPattern,
  };
}
