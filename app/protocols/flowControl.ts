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
    id: `flow-${eventCounter++}`,
    type,
    packetId,
    timestamp: Date.now(),
    senderWindow: { ...senderWindow },
    receiverWindow: { expected: receiverExpected, buffer: [...receiverBuffer] },
    explanation,
  };
}

export function generateFlowControlEvents(
  totalPackets: number,
  windowSize: number
): SimulationEvent[] {
  eventCounter = 0;
  const events: SimulationEvent[] = [];
  
  let base = 0;
  let nextSeq = 0;
  let receiverExpected = 0;
  const receiverBuffer: number[] = [];
  
  while (receiverExpected < totalPackets) {
    const availableWindow = Math.min(windowSize - receiverBuffer.length, totalPackets - nextSeq);
    
    if (availableWindow > 0 && nextSeq < totalPackets) {
      const senderWindow: WindowState = { base, nextSeq, size: windowSize };
      
      events.push(createEvent(
        'send',
        nextSeq,
        senderWindow,
        receiverExpected,
        receiverBuffer,
        `The sender transmits Packet ${nextSeq}. The receiver's buffer can accept ${availableWindow} more packets right now. Flow control ensures we don't overwhelm the receiver.`
      ));
      
      receiverBuffer.push(nextSeq);
      
      const newAvailable = windowSize - receiverBuffer.length;
      
      events.push(createEvent(
        'receive',
        nextSeq,
        { base, nextSeq: nextSeq + 1, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `Packet ${nextSeq} arrived at the receiver and is stored in the buffer. Buffer now holds ${receiverBuffer.length}/${windowSize} packets. Available window: ${newAvailable}.`
      ));
      
      nextSeq++;
      
      if (newAvailable === 0 && nextSeq < totalPackets) {
        events.push(createEvent(
          'buffer',
          nextSeq - 1,
          { base, nextSeq, size: windowSize },
          receiverExpected,
          receiverBuffer,
          `The receiver's buffer is now full! The receiver advertises window size = 0. The sender must wait until the receiver processes some packets and frees up space.`
        ));
      }
    }
    
    if (receiverBuffer.length > 0 && (receiverBuffer.length >= windowSize || nextSeq >= totalPackets || receiverBuffer.length >= 2)) {
      const processedId = receiverBuffer.shift()!;
      receiverExpected = processedId + 1;
      base = receiverExpected;
      
      const newAvailable = windowSize - receiverBuffer.length;
      
      events.push(createEvent(
        'ack-send',
        processedId,
        { base, nextSeq, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `The receiver processes Packet ${processedId} and sends ACK. This frees up buffer space. The receiver now advertises window size = ${newAvailable}, telling the sender it can send more.`
      ));
      
      events.push(createEvent(
        'ack-receive',
        processedId,
        { base, nextSeq, size: windowSize },
        receiverExpected,
        receiverBuffer,
        `The sender receives ACK ${processedId}. The window slides forward! With ${newAvailable} slots available, the sender can continue transmitting. This is the "sliding" in Sliding Window.`
      ));
    }
  }
  
  return events;
}

export function createFlowControlState(
  totalPackets: number,
  windowSize: number,
  lossPattern: number[] = []
): SimulationState {
  return {
    protocol: 'flow-control',
    totalPackets,
    senderWindow: { base: 0, nextSeq: 0, size: windowSize },
    receiverWindow: { expected: 0, buffer: [] },
    packets: Array.from({ length: totalPackets }, (_, i) => ({ id: i, status: 'pending' })),
    events: generateFlowControlEvents(totalPackets, windowSize),
    currentEventIndex: -1,
    isComplete: false,
    lossPattern: [],
  };
}
