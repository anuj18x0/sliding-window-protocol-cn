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

export function generateSelectiveRepeatEvents(
  totalPackets: number,
  windowSize: number,
  lossPattern: number[]
): SimulationEvent[] {
  eventCounter = 0;
  const events: SimulationEvent[] = [];
  const lossSet = new Set(lossPattern);
  
  let senderBase = 0;
  let nextSeq = 0;
  let receiverExpected = 0;
  const receiverBuffer: number[] = [];
  const ackedPackets = new Set<number>();
  
  while (senderBase < totalPackets) {
    const windowEnd = Math.min(senderBase + windowSize, totalPackets);
    
    while (nextSeq < windowEnd) {
      const senderWindow: WindowState = { base: senderBase, nextSeq, size: windowSize };
      
      events.push(createEvent(
        'send',
        nextSeq,
        senderWindow,
        receiverExpected,
        receiverBuffer,
        `The sender launches Packet ${nextSeq} across the network! Selective Repeat allows multiple packets in flight (window: ${senderBase} to ${windowEnd - 1}). Unlike Go-Back-N, the receiver here is smarter about handling gaps.`
      ));
      
      nextSeq++;
    }
    
    let lostPacketId = -1;
    for (let i = senderBase; i < nextSeq; i++) {
      if (lossSet.has(i) && !ackedPackets.has(i)) {
        lostPacketId = i;
        lossSet.delete(i);
        break;
      }
    }
    
    if (lostPacketId !== -1) {
      events.push(createEvent(
        'loss',
        lostPacketId,
        { base: senderBase, nextSeq, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `Packet ${lostPacketId} got lost in the network! But here's the smart part — in Selective Repeat, other packets can still be accepted and stored. Nothing else gets wasted!`
      ));
      
      for (let i = senderBase; i < nextSeq; i++) {
        if (i === lostPacketId) continue;
        
        if (i === receiverExpected) {
          events.push(createEvent(
            'receive',
            i,
            { base: senderBase, nextSeq, size: windowSize },
            receiverExpected,
            receiverBuffer,
            `Packet ${i} arrived and it's exactly what the receiver was waiting for! This packet is processed immediately.`
          ));
          receiverExpected = i + 1;
          
          while (receiverBuffer.includes(receiverExpected)) {
            const idx = receiverBuffer.indexOf(receiverExpected);
            receiverBuffer.splice(idx, 1);
            receiverExpected++;
          }
        } else if (i > receiverExpected) {
          receiverBuffer.push(i);
          receiverBuffer.sort((a, b) => a - b);
          
          events.push(createEvent(
            'buffer',
            i,
            { base: senderBase, nextSeq, size: windowSize },
            receiverExpected,
            receiverBuffer,
            `Packet ${i} arrived out of order (expected ${receiverExpected}). But instead of throwing it away, the smart receiver stores it in a buffer! It will be used once the missing packet arrives.`
          ));
        }
        
        events.push(createEvent(
          'ack-send',
          i,
          { base: senderBase, nextSeq, size: windowSize },
          receiverExpected,
          receiverBuffer,
          `The receiver sends ACK ${i} to confirm this specific packet was received. Each packet gets its own acknowledgment!`
        ));
        
        ackedPackets.add(i);
      }
      
      events.push(createEvent(
        'timeout',
        lostPacketId,
        { base: senderBase, nextSeq, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `Timeout! The sender noticed Packet ${lostPacketId} was never acknowledged. Here's the beauty of Selective Repeat — only THIS packet needs to be resent, not everything after it!`
      ));
      
      events.push(createEvent(
        'send',
        lostPacketId,
        { base: senderBase, nextSeq, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `The sender selectively resends only Packet ${lostPacketId}. This saves bandwidth compared to Go-Back-N, which would resend everything!`
      ));
      
      if (lostPacketId === receiverExpected) {
        events.push(createEvent(
          'receive',
          lostPacketId,
          { base: senderBase, nextSeq, size: windowSize },
          receiverExpected,
          receiverBuffer,
          `The missing Packet ${lostPacketId} finally arrived! Now the receiver can combine it with the buffered packets and deliver everything in order.`
        ));
        receiverExpected = lostPacketId + 1;
        
        while (receiverBuffer.includes(receiverExpected)) {
          const idx = receiverBuffer.indexOf(receiverExpected);
          receiverBuffer.splice(idx, 1);
          receiverExpected++;
        }
      } else {
        receiverBuffer.push(lostPacketId);
        receiverBuffer.sort((a, b) => a - b);
        
        events.push(createEvent(
          'buffer',
          lostPacketId,
          { base: senderBase, nextSeq, size: windowSize },
          receiverExpected,
          receiverBuffer,
          `Packet ${lostPacketId} is buffered. The receiver is still waiting for an earlier packet before it can process everything in order.`
        ));
      }
      
      events.push(createEvent(
        'ack-send',
        lostPacketId,
        { base: senderBase, nextSeq, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `The receiver confirms: "Got Packet ${lostPacketId}!" This ACK travels back to tell the sender the retransmission worked.`
      ));
      
      ackedPackets.add(lostPacketId);
      
      while (ackedPackets.has(senderBase) && senderBase < totalPackets) {
        senderBase++;
      }
      
      events.push(createEvent(
        'window-slide',
        senderBase,
        { base: senderBase, nextSeq, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `The sender's window slides forward to Packet ${senderBase}. More packets can now be sent! The sliding window keeps data flowing efficiently.`
      ));
      
    } else {
      for (let i = senderBase; i < nextSeq; i++) {
        if (ackedPackets.has(i)) continue;
        
        events.push(createEvent(
          'receive',
          i,
          { base: senderBase, nextSeq, size: windowSize },
          receiverExpected,
          receiverBuffer,
          `Packet ${i} arrived safely at the receiver! The data is accepted and ready for the application to use.`
        ));
        
        if (i === receiverExpected) {
          receiverExpected = i + 1;
          while (receiverBuffer.includes(receiverExpected)) {
            const idx = receiverBuffer.indexOf(receiverExpected);
            receiverBuffer.splice(idx, 1);
            receiverExpected++;
          }
        }
        
        events.push(createEvent(
          'ack-send',
          i,
          { base: senderBase, nextSeq, size: windowSize },
          receiverExpected,
          receiverBuffer,
          `ACK ${i} is sent back to the sender. "Packet ${i} received successfully!"`
        ));
        
        ackedPackets.add(i);
      }
      
      for (let i = senderBase; i < nextSeq; i++) {
        events.push(createEvent(
          'ack-receive',
          i,
          { base: i + 1, nextSeq, size: windowSize },
          receiverExpected,
          receiverBuffer,
          `The sender got ACK ${i}! Confirmation received — this packet's journey is complete. The window can slide forward.`
        ));
      }
      
      senderBase = nextSeq;
    }
  }
  
  return events;
}

export function createSelectiveRepeatState(totalPackets: number, windowSize: number, lossPattern: number[]): SimulationState {
  return {
    protocol: 'selective-repeat',
    totalPackets,
    senderWindow: { base: 0, nextSeq: 0, size: windowSize },
    receiverWindow: { expected: 0, buffer: [] },
    packets: Array.from({ length: totalPackets }, (_, i) => ({ id: i, status: 'pending' })),
    events: generateSelectiveRepeatEvents(totalPackets, windowSize, lossPattern),
    currentEventIndex: -1,
    isComplete: false,
    lossPattern,
  };
}
