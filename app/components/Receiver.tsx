'use client';

import React from 'react';

interface ReceiverProps {
  expected: number;
  buffer: number[];
  totalPackets: number;
  protocol: string;
}

export function Receiver({ expected, buffer, totalPackets, protocol }: ReceiverProps) {
  const receivedPackets = Array.from({ length: expected }, (_, i) => i);
  
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Receiver
      </h2>
      
      <div className="border-2 border-black p-4 bg-white">
        <div className="text-xs text-gray-600 mb-3 text-center">
          Expecting: Packet {expected}
        </div>
        
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1.5 text-center">Received</div>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px] min-h-[36px]">
            {receivedPackets.length === 0 ? (
              <div className="text-gray-300 text-xs">None yet</div>
            ) : (
              receivedPackets.map((id) => (
                <div
                  key={id}
                  className="w-8 h-8 flex items-center justify-center border-2 border-black bg-black text-white font-mono text-xs font-bold"
                >
                  {id}
                </div>
              ))
            )}
          </div>
        </div>
        
        {protocol === 'selective-repeat' && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1.5 text-center">Buffer</div>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px] min-h-[36px]">
              {buffer.length === 0 ? (
                <div className="text-gray-300 text-xs">Empty</div>
              ) : (
                buffer.map((id) => (
                  <div
                    key={id}
                    className="w-8 h-8 flex items-center justify-center border-2 border-gray-500 bg-gray-400 text-white font-mono text-xs font-bold"
                  >
                    {id}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-black border border-black"></div>
          <span>Received</span>
        </div>
        {protocol === 'selective-repeat' && (
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-gray-400 border border-gray-500"></div>
            <span>Buffered</span>
          </div>
        )}
      </div>
    </div>
  );
}
