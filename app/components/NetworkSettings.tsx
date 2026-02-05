'use client';

import React from 'react';
import { Sliders, Wifi, Clock, Shuffle } from 'lucide-react';

interface NetworkSettingsProps {
  lossRate: number;
  onLossRateChange: (rate: number) => void;
  totalPackets: number;
  onTotalPacketsChange: (count: number) => void;
  windowSize: number;
  onWindowSizeChange: (size: number) => void;
  onRandomizeLoss: () => void;
  disabled?: boolean;
}

export function NetworkSettings({
  lossRate,
  onLossRateChange,
  totalPackets,
  onTotalPacketsChange,
  windowSize,
  onWindowSizeChange,
  onRandomizeLoss,
  disabled = false,
}: NetworkSettingsProps) {
  return (
    <div className="border-2 border-black bg-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-4 h-4" />
        <h3 className="text-sm font-bold uppercase tracking-wide">Network Settings</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Loss Probability
            </label>
            <span className="text-xs font-mono font-bold">{lossRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={lossRate}
            onChange={(e) => onLossRateChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600">Total Packets</label>
            <span className="text-xs font-mono font-bold">{totalPackets}</span>
          </div>
          <input
            type="range"
            min="4"
            max="12"
            value={totalPackets}
            onChange={(e) => onTotalPacketsChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4</span>
            <span>12</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Window Size
            </label>
            <span className="text-xs font-mono font-bold">{windowSize}</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            value={windowSize}
            onChange={(e) => onWindowSizeChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>6</span>
          </div>
        </div>

        <button
          onClick={onRandomizeLoss}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Shuffle className="w-4 h-4" />
          Randomize Loss Pattern
        </button>
      </div>
    </div>
  );
}
