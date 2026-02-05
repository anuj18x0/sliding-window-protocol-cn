'use client';

import React from 'react';
import { ProtocolType } from '../protocols/types';

interface ProtocolToggleProps {
  selected: ProtocolType;
  onChange: (protocol: ProtocolType) => void;
}

const protocols: { id: ProtocolType; label: string; shortLabel: string }[] = [
  { id: 'stop-and-wait', label: 'Stop-and-Wait', shortLabel: 'S&W' },
  { id: 'go-back-n', label: 'Go-Back-N', shortLabel: 'GBN' },
  { id: 'selective-repeat', label: 'Selective Repeat', shortLabel: 'SR' },
];

export function ProtocolToggle({ selected, onChange }: ProtocolToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 border-2 border-black">
      {protocols.map((protocol) => (
        <button
          key={protocol.id}
          onClick={() => onChange(protocol.id)}
          className={`
            px-6 py-3 
            font-medium text-base
            transition-all duration-200
            ${
              selected === protocol.id
                ? 'bg-black text-white'
                : 'bg-transparent text-black hover:bg-gray-200'
            }
          `}
        >
          <span className="hidden sm:inline">{protocol.label}</span>
          <span className="sm:hidden">{protocol.shortLabel}</span>
        </button>
      ))}
    </div>
  );
}
