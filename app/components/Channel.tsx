'use client';

import React from 'react';
import { AnimatingPacket } from './Packet';
import { Monitor, Server, Wifi, WifiOff } from 'lucide-react';

interface ChannelPacket {
  id: number;
  type: 'data' | 'ack';
  progress: number;
  isLost: boolean;
}

interface ChannelProps {
  packets: ChannelPacket[];
}

export function Channel({ packets }: ChannelProps) {
  const hasPacket = packets.length > 0;
  const isLostPacket = packets.some(p => p.isLost);

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-2 min-w-[280px]">
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col items-center">
            <Monitor className="w-8 h-8 text-black" />
            <span className="text-xs text-gray-600 mt-1">Client</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            {isLostPacket ? (
              <WifiOff className="w-5 h-5 text-black animate-pulse" />
            ) : hasPacket ? (
              <Wifi className="w-5 h-5 text-black animate-pulse" />
            ) : (
              <Wifi className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <Server className="w-8 h-8 text-black" />
            <span className="text-xs text-gray-600 mt-1">Server</span>
          </div>
        </div>
        
        <div className="relative w-full h-20 bg-white border-2 border-black rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gray-300 relative">
              <div 
                className={`absolute inset-0 h-full transition-all duration-300 ${
                  hasPacket ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            </div>
          </div>
          
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-black" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-black" />
          
          {!hasPacket && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-500 bg-white px-2 py-1">
                Waiting for transmission...
              </span>
            </div>
          )}
          
          {packets.map((packet, index) => (
            <AnimatingPacket
              key={`${packet.type}-${packet.id}-${index}`}
              id={packet.id}
              type={packet.type}
              progress={packet.progress}
              isLost={packet.isLost}
            />
          ))}
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>← Sending</span>
          <span>Receiving →</span>
        </div>
      </div>
    </div>
  );
}
