'use client';

import React from 'react';
import { WindowState } from '../protocols/types';

interface SenderProps {
  window: WindowState;
  totalPackets: number;
}

export function Sender({ window, totalPackets }: SenderProps) {
  const packets = Array.from({ length: totalPackets }, (_, i) => i);
  
  const getPacketStyle = (packetId: number) => {
    const isInWindow = packetId >= window.base && packetId < window.base + window.size;
    const isSent = packetId < window.nextSeq;
    const isAcked = packetId < window.base;
    
    if (isAcked) return 'bg-black text-white border-black';
    if (isSent && isInWindow) return 'bg-gray-600 text-white border-gray-700';
    if (isInWindow) return 'bg-white text-black border-black';
    return 'bg-gray-100 text-gray-400 border-gray-300';
  };

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Sender
      </h2>
      
      <div className="border-2 border-black p-4 bg-white">
        <div className="text-xs text-gray-600 mb-3 text-center">
          Window: {window.base} → {window.base + window.size - 1}
        </div>
        
        <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px]">
          {packets.map((id) => (
            <div
              key={id}
              className={`
                w-8 h-8 
                flex items-center justify-center
                border-2 
                font-mono text-xs font-bold
                transition-all duration-300
                ${getPacketStyle(id)}
              `}
            >
              {id}
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Base: <span className="font-mono font-bold text-black">{window.base}</span></span>
            <span>Next: <span className="font-mono font-bold text-black">{window.nextSeq}</span></span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-black border border-black"></div>
          <span>Acked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-gray-600 border border-gray-700"></div>
          <span>Sent</span>
        </div>
      </div>
    </div>
  );
}
