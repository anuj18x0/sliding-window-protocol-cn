'use client';

import React, { useEffect, useRef } from 'react';
import { SimulationEvent } from '../protocols/types';
import { Send, Download, CheckCircle, XCircle, Clock, Package, ArrowRight } from 'lucide-react';

interface LogsProps {
  events: SimulationEvent[];
  currentEventId?: string;
}

function getEventIcon(type: string) {
  const iconClass = "w-4 h-4 text-black";
  switch (type) {
    case 'send':
      return <Send className={iconClass} />;
    case 'receive':
      return <Download className={iconClass} />;
    case 'ack-send':
      return <Send className={iconClass} />;
    case 'ack-receive':
      return <CheckCircle className={iconClass} />;
    case 'loss':
      return <XCircle className={iconClass} />;
    case 'timeout':
      return <Clock className={iconClass} />;
    case 'buffer':
      return <Package className={iconClass} />;
    case 'window-slide':
      return <ArrowRight className={iconClass} />;
    default:
      return <Send className={iconClass} />;
  }
}

function getEventStyle(type: string) {
  switch (type) {
    case 'loss':
    case 'timeout':
      return 'border-l-4 border-l-black bg-gray-100';
    case 'ack-send':
    case 'ack-receive':
      return 'border-l-4 border-l-gray-400 bg-gray-50';
    default:
      return 'border-l-4 border-l-gray-600 bg-white';
  }
}

export function Logs({ events, currentEventId }: LogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="w-72 flex flex-col bg-gray-50 border-l border-gray-200 flex-shrink-0">
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700">
          Event Logs
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {events.length} events recorded
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {events.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No events yet.<br />Press Start to begin.
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`
                  p-2 text-xs border-l-4 rounded-r
                  transition-all duration-200
                  ${getEventStyle(event.type)}
                  ${currentEventId === event.id ? 'ring-2 ring-black ring-offset-1' : ''}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getEventIcon(event.type)}
                  <span className="font-mono font-bold">#{index + 1}</span>
                  <span className="text-gray-600 capitalize">
                    {event.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  Packet <span className="font-mono font-bold">{event.packetId}</span>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
