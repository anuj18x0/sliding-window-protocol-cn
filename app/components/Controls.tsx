'use client';

import React from 'react';
import { Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isComplete: boolean;
}

const speedOptions = [
  { value: 1000, label: 'Fast' },
  { value: 2000, label: 'Normal' },
  { value: 3000, label: 'Slow' },
];

export function Controls({
  isPlaying,
  onStart,
  onPause,
  onReset,
  speed,
  onSpeedChange,
  isComplete,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4 px-6 border-t-2 border-black bg-white flex-shrink-0">
      {!isPlaying ? (
        <button
          onClick={onStart}
          disabled={isComplete}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          {isComplete ? 'Complete' : 'Start'}
        </button>
      ) : (
        <button
          onClick={onPause}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black border-2 border-black font-medium hover:bg-gray-100 transition-colors"
        >
          <Pause className="w-4 h-4" />
          Pause
        </button>
      )}
      
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 bg-white text-black border-2 border-black font-medium hover:bg-gray-100 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>

      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm text-gray-600">Speed:</span>
        <div className="relative">
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="appearance-none bg-white border-2 border-black px-4 py-2 pr-8 font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
          >
            {speedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
