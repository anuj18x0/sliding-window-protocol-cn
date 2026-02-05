'use client';

import React from 'react';
import { SimulationEvent } from '../protocols/types';
import { Send, Download, CheckCircle, XCircle, Clock, Package, ArrowRight, Mail, AlertTriangle } from 'lucide-react';

interface ExplanationProps {
  event: SimulationEvent | null;
  eventIndex: number;
  totalEvents: number;
}

function getEventConfig(type: string) {
  switch (type) {
    case 'send':
      return { icon: Send, label: 'Sending Data' };
    case 'receive':
      return { icon: Download, label: 'Data Received' };
    case 'ack-send':
      return { icon: Mail, label: 'Sending ACK' };
    case 'ack-receive':
      return { icon: CheckCircle, label: 'ACK Received' };
    case 'loss':
      return { icon: XCircle, label: 'Packet Lost!' };
    case 'timeout':
      return { icon: Clock, label: 'Timeout' };
    case 'buffer':
      return { icon: Package, label: 'Buffering' };
    case 'window-slide':
      return { icon: ArrowRight, label: 'Window Slide' };
    default:
      return { icon: AlertTriangle, label: 'Event' };
  }
}

export function Explanation({ event, eventIndex, totalEvents }: ExplanationProps) {
  const progress = totalEvents > 0 ? ((eventIndex + 1) / totalEvents) * 100 : 0;

  if (!event) {
    return (
      <div className="py-5 px-6 bg-white border-t-2 border-black flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Send className="w-6 h-6" />
            <p className="text-base">
              Press <span className="font-bold text-black">Start</span> to begin the simulation
            </p>
          </div>
        </div>
      </div>
    );
  }

  const config = getEventConfig(event.type);
  const Icon = config.icon;

  return (
    <div className="py-4 px-6 bg-white border-t-2 border-black flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-mono">{eventIndex + 1} / {totalEvents}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50">
          <div className="flex-shrink-0 p-2 rounded-full bg-white border-2 border-black">
            <Icon className="w-6 h-6 text-black" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wide text-black">
                {config.label}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-600 font-mono">
                Packet {event.packetId}
              </span>
            </div>
            <p className="text-base leading-relaxed text-gray-800" style={{ fontFamily: 'var(--font-inter)' }}>
              {event.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
