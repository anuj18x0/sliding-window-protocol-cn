export type ProtocolType = 'stop-and-wait' | 'go-back-n' | 'selective-repeat';

export type EventType = 
  | 'send' 
  | 'receive' 
  | 'ack-send' 
  | 'ack-receive' 
  | 'loss' 
  | 'timeout' 
  | 'buffer' 
  | 'window-slide';

export interface PacketState {
  id: number;
  status: 'pending' | 'sent' | 'in-transit' | 'received' | 'acked' | 'lost' | 'buffered';
}

export interface WindowState {
  base: number;
  nextSeq: number;
  size: number;
}

export interface SimulationEvent {
  id: string;
  type: EventType;
  packetId: number;
  timestamp: number;
  senderWindow: WindowState;
  receiverWindow: { expected: number; buffer: number[] };
  explanation: string;
}

export interface SimulationState {
  protocol: ProtocolType;
  totalPackets: number;
  senderWindow: WindowState;
  receiverWindow: { expected: number; buffer: number[] };
  packets: PacketState[];
  events: SimulationEvent[];
  currentEventIndex: number;
  isComplete: boolean;
  lossPattern: number[];
}

export interface AnimatingPacket {
  id: number;
  type: 'data' | 'ack';
  progress: number;
  isLost: boolean;
}
