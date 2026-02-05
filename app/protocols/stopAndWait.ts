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

export function generateStopAndWaitEvents(
  totalPackets: number,
  lossPattern: number[]
): SimulationEvent[] {
  eventCounter = 0;
  const events: SimulationEvent[] = [];
  const lossSet = new Set(lossPattern);
  
  let currentPacket = 0;
  let receiverExpected = 0;
  
  while (currentPacket < totalPackets) {
    const senderWindow: WindowState = { base: currentPacket, nextSeq: currentPacket, size: 1 };
    const isLost = lossSet.has(currentPacket) && !events.some(e => e.type === 'timeout' && e.packetId === currentPacket);
    
    events.push(createEvent(
      'send',
      currentPacket,
      senderWindow,
      receiverExpected,
      [],
      `The sender puts Packet ${currentPacket} on the network cable. Like sending a letter, it now travels through the internet toward the receiver. The sender stops and waits — it won't send anything else until it hears back.`
    ));
    
    if (isLost) {
      lossSet.delete(currentPacket);
      
      events.push(createEvent(
        'loss',
        currentPacket,
        senderWindow,
        receiverExpected,
        [],
        `Oh no! Packet ${currentPacket} got lost somewhere in the network! Maybe a router was overloaded, or a cable had interference. The receiver will never see this packet. The sender doesn't know this yet...`
      ));
      
      events.push(createEvent(
        'timeout',
        currentPacket,
        senderWindow,
        receiverExpected,
        [],
        `The sender has been waiting too long. "Something must have gone wrong," it thinks. Since no confirmation arrived, the sender decides to try again and resend Packet ${currentPacket}.`
      ));
    } else {
      events.push(createEvent(
        'receive',
        currentPacket,
        senderWindow,
        receiverExpected,
        [],
        `Success! The receiver got Packet ${currentPacket}! The data traveled safely through the network. Now the receiver needs to tell the sender that everything arrived okay.`
      ));
      
      receiverExpected = currentPacket + 1;
      
      events.push(createEvent(
        'ack-send',
        currentPacket,
        senderWindow,
        receiverExpected,
        [],
        `The receiver sends back an acknowledgment (ACK ${currentPacket}). This is like a "message received" confirmation — it travels back through the network to the sender.`
      ));
      
      events.push(createEvent(
        'ack-receive',
        currentPacket,
        { base: currentPacket + 1, nextSeq: currentPacket + 1, size: 1 },
        receiverExpected,
        [],
        `The sender received ACK ${currentPacket}! Great news — the packet was delivered successfully. Now the sender can confidently move on to send the next packet.`
      ));
      
      currentPacket++;
    }
  }
  
  return events;
}

export function createStopAndWaitState(totalPackets: number, lossPattern: number[]): SimulationState {
  return {
    protocol: 'stop-and-wait',
    totalPackets,
    senderWindow: { base: 0, nextSeq: 0, size: 1 },
    receiverWindow: { expected: 0, buffer: [] },
    packets: Array.from({ length: totalPackets }, (_, i) => ({ id: i, status: 'pending' })),
    events: generateStopAndWaitEvents(totalPackets, lossPattern),
    currentEventIndex: -1,
    isComplete: false,
    lossPattern,
  };
}
