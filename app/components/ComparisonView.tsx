'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationEvent, SimulationState } from '../protocols/types';
import { createGoBackNState } from '../protocols/goBackN';
import { createSelectiveRepeatState } from '../protocols/selectiveRepeat';
import { Play, Pause, RotateCcw, GitCompare } from 'lucide-react';

interface ComparisonViewProps {
  totalPackets: number;
  windowSize: number;
  lossPattern: number[];
  speed: number;
  isOpen: boolean;
  onClose: () => void;
}

interface SimulationInstance {
  state: SimulationState;
  currentIndex: number;
  metrics: {
    packetsSent: number;
    packetsDelivered: number;
    retransmissions: number;
  };
}

function calculateMetrics(events: SimulationEvent[], currentIndex: number) {
  const processedEvents = events.slice(0, currentIndex + 1);
  let packetsSent = 0;
  let packetsDelivered = 0;
  let retransmissions = 0;
  const sentPackets = new Set<number>();
  const deliveredPackets = new Set<number>();

  for (const event of processedEvents) {
    if (event.type === 'send') {
      if (sentPackets.has(event.packetId)) {
        retransmissions++;
      } else {
        sentPackets.add(event.packetId);
      }
      packetsSent++;
    } else if (event.type === 'receive') {
      if (!deliveredPackets.has(event.packetId)) {
        deliveredPackets.add(event.packetId);
        packetsDelivered++;
      }
    }
  }

  return { packetsSent, packetsDelivered, retransmissions };
}

export function ComparisonView({
  totalPackets,
  windowSize,
  lossPattern,
  speed,
  isOpen,
  onClose,
}: ComparisonViewProps) {
  const [goBackN, setGoBackN] = useState<SimulationInstance | null>(null);
  const [selectiveRepeat, setSelectiveRepeat] = useState<SimulationInstance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const initSimulations = useCallback(() => {
    const gbnState = createGoBackNState(totalPackets, windowSize, lossPattern);
    const srState = createSelectiveRepeatState(totalPackets, windowSize, lossPattern);

    setGoBackN({
      state: gbnState,
      currentIndex: -1,
      metrics: { packetsSent: 0, packetsDelivered: 0, retransmissions: 0 },
    });

    setSelectiveRepeat({
      state: srState,
      currentIndex: -1,
      metrics: { packetsSent: 0, packetsDelivered: 0, retransmissions: 0 },
    });

    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [totalPackets, windowSize, lossPattern]);

  useEffect(() => {
    if (isOpen) {
      initSimulations();
    }
  }, [isOpen, initSimulations]);

  const runComparison = useCallback(async () => {
    if (!goBackN || !selectiveRepeat) return;

    isPlayingRef.current = true;
    setIsPlaying(true);

    let gbnIndex = goBackN.currentIndex;
    let srIndex = selectiveRepeat.currentIndex;

    const gbnEvents = goBackN.state.events;
    const srEvents = selectiveRepeat.state.events;

    while (isPlayingRef.current && (gbnIndex < gbnEvents.length - 1 || srIndex < srEvents.length - 1)) {
      await new Promise((resolve) => setTimeout(resolve, speed / 2));

      if (!isPlayingRef.current) break;

      if (gbnIndex < gbnEvents.length - 1) {
        gbnIndex++;
        setGoBackN((prev) => prev ? {
          ...prev,
          currentIndex: gbnIndex,
          metrics: calculateMetrics(gbnEvents, gbnIndex),
        } : null);
      }

      if (srIndex < srEvents.length - 1) {
        srIndex++;
        setSelectiveRepeat((prev) => prev ? {
          ...prev,
          currentIndex: srIndex,
          metrics: calculateMetrics(srEvents, srIndex),
        } : null);
      }
    }

    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [goBackN, selectiveRepeat, speed]);

  const handlePlayPause = () => {
    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      runComparison();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-black w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            <h2 className="text-lg font-bold">Protocol Comparison</h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 border-2 border-black hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-black text-white hover:bg-gray-800"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Run Comparison'}
            </button>
            <button
              onClick={initSimulations}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-4">
              <h3 className="text-center font-bold mb-4 pb-2 border-b border-gray-200">
                Go-Back-N
              </h3>
              {goBackN && (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Progress</div>
                    <div className="text-2xl font-mono font-bold">
                      {goBackN.currentIndex + 1} / {goBackN.state.events.length}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-300"
                      style={{
                        width: `${((goBackN.currentIndex + 1) / goBackN.state.events.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border border-gray-300 p-2">
                      <div className="text-xs text-gray-500">Sent</div>
                      <div className="text-lg font-bold font-mono">{goBackN.metrics.packetsSent}</div>
                    </div>
                    <div className="border border-gray-300 p-2">
                      <div className="text-xs text-gray-500">Delivered</div>
                      <div className="text-lg font-bold font-mono">{goBackN.metrics.packetsDelivered}</div>
                    </div>
                    <div className="border border-gray-300 p-2">
                      <div className="text-xs text-gray-500">Retrans</div>
                      <div className="text-lg font-bold font-mono">{goBackN.metrics.retransmissions}</div>
                    </div>
                  </div>
                  {goBackN.currentIndex >= 0 && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 border border-gray-200">
                      {goBackN.state.events[goBackN.currentIndex]?.explanation.slice(0, 100)}...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-2 border-black p-4">
              <h3 className="text-center font-bold mb-4 pb-2 border-b border-gray-200">
                Selective Repeat
              </h3>
              {selectiveRepeat && (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Progress</div>
                    <div className="text-2xl font-mono font-bold">
                      {selectiveRepeat.currentIndex + 1} / {selectiveRepeat.state.events.length}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-300"
                      style={{
                        width: `${((selectiveRepeat.currentIndex + 1) / selectiveRepeat.state.events.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border border-gray-300 p-2">
                      <div className="text-xs text-gray-500">Sent</div>
                      <div className="text-lg font-bold font-mono">{selectiveRepeat.metrics.packetsSent}</div>
                    </div>
                    <div className="border border-gray-300 p-2">
                      <div className="text-xs text-gray-500">Delivered</div>
                      <div className="text-lg font-bold font-mono">{selectiveRepeat.metrics.packetsDelivered}</div>
                    </div>
                    <div className="border border-gray-300 p-2">
                      <div className="text-xs text-gray-500">Retrans</div>
                      <div className="text-lg font-bold font-mono">{selectiveRepeat.metrics.retransmissions}</div>
                    </div>
                  </div>
                  {selectiveRepeat.currentIndex >= 0 && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 border border-gray-200">
                      {selectiveRepeat.state.events[selectiveRepeat.currentIndex]?.explanation.slice(0, 100)}...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {goBackN && selectiveRepeat && goBackN.currentIndex >= 0 && selectiveRepeat.currentIndex >= 0 && (
            <div className="mt-4 p-4 border-2 border-black bg-gray-50">
              <h4 className="font-bold mb-2">Comparison Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Steps (GBN): </span>
                  <span className="font-mono font-bold">{goBackN.state.events.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Steps (SR): </span>
                  <span className="font-mono font-bold">{selectiveRepeat.state.events.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Efficiency (GBN): </span>
                  <span className="font-mono font-bold">
                    {goBackN.metrics.packetsSent > 0
                      ? ((goBackN.metrics.packetsDelivered / goBackN.metrics.packetsSent) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Efficiency (SR): </span>
                  <span className="font-mono font-bold">
                    {selectiveRepeat.metrics.packetsSent > 0
                      ? ((selectiveRepeat.metrics.packetsDelivered / selectiveRepeat.metrics.packetsSent) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
