'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Sender, 
  Receiver, 
  Channel, 
  Controls, 
  Explanation, 
  ProtocolToggle, 
  Logs,
  Metrics,
  NetworkSettings,
  SequenceDiagram,
  ComparisonView,
} from './components';
import {
  ProtocolType,
  SimulationState,
  SimulationEvent,
  createStopAndWaitState,
  createGoBackNState,
  createSelectiveRepeatState,
} from './protocols';
import { createFlowControlState } from './protocols/flowControl';
import { GitCompare, BarChart3, Activity } from 'lucide-react';

interface ChannelPacket {
  id: number;
  type: 'data' | 'ack';
  progress: number;
  isLost: boolean;
}

function generateLossPattern(totalPackets: number, lossRate: number): number[] {
  const pattern: number[] = [];
  for (let i = 0; i < totalPackets; i++) {
    if (Math.random() * 100 < lossRate) {
      pattern.push(i);
    }
  }
  return pattern.length > 0 ? pattern : [];
}

function createInitialState(
  protocol: ProtocolType, 
  totalPackets: number, 
  windowSize: number, 
  lossPattern: number[]
): SimulationState {
  switch (protocol) {
    case 'go-back-n':
      return createGoBackNState(totalPackets, windowSize, lossPattern);
    case 'selective-repeat':
      return createSelectiveRepeatState(totalPackets, windowSize, lossPattern);
    case 'flow-control':
      return createFlowControlState(totalPackets, windowSize, lossPattern);
    default:
      return createGoBackNState(totalPackets, windowSize, lossPattern);
  }
}

export default function Home() {
  const [protocol, setProtocol] = useState<ProtocolType>('go-back-n');
  const [totalPackets, setTotalPackets] = useState(6);
  const [windowSize, setWindowSize] = useState(4);
  const [lossRate, setLossRate] = useState(20);
  const [lossPattern, setLossPattern] = useState<number[]>([2]);
  const [state, setState] = useState<SimulationState>(() => 
    createInitialState('go-back-n', 6, 4, [2])
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [channelPackets, setChannelPackets] = useState<ChannelPacket[]>([]);
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent | null>(null);
  const [logs, setLogs] = useState<SimulationEvent[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'diagram'>('logs');
  
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const currentIndexRef = useRef(-1);

  const isFlowControl = protocol === 'flow-control';

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleProtocolChange = useCallback((newProtocol: ProtocolType) => {
    cleanup();
    setProtocol(newProtocol);
    setState(createInitialState(newProtocol, totalPackets, windowSize, lossPattern));
    setIsPlaying(false);
    setChannelPackets([]);
    setCurrentEvent(null);
    setLogs([]);
    setIsAnimating(false);
    currentIndexRef.current = -1;
  }, [cleanup, totalPackets, windowSize, lossPattern]);

  const animatePacket = useCallback((
    packetId: number,
    type: 'data' | 'ack',
    isLost: boolean
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = speed * 0.6;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setChannelPackets([{ id: packetId, type, progress, isLost }]);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setChannelPackets([]);
          resolve();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    });
  }, [speed]);

  const processEvent = useCallback(async (event: SimulationEvent): Promise<void> => {
    setCurrentEvent(event);
    setLogs(prev => [...prev, event]);

    const needsAnimation = ['send', 'ack-send'].includes(event.type);
    const isLoss = event.type === 'loss';

    if (needsAnimation) {
      const type = event.type === 'send' ? 'data' : 'ack';
      await animatePacket(event.packetId, type, false);
    } else if (isLoss) {
      await animatePacket(event.packetId, 'data', true);
    } else {
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, speed * 0.3);
      });
    }
  }, [animatePacket, speed]);

  const runSimulation = useCallback(async () => {
    const events = state.events;
    
    while (currentIndexRef.current < events.length - 1 && isPlayingRef.current) {
      currentIndexRef.current++;
      const event = events[currentIndexRef.current];
      
      setState(prev => ({
        ...prev,
        currentEventIndex: currentIndexRef.current,
        senderWindow: event.senderWindow,
        receiverWindow: event.receiverWindow,
        isComplete: currentIndexRef.current >= events.length - 1,
      }));

      setIsAnimating(true);
      await processEvent(event);
      setIsAnimating(false);

      if (currentIndexRef.current >= events.length - 1) {
        setIsPlaying(false);
        setState(prev => ({ ...prev, isComplete: true }));
        break;
      }

      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, speed * 0.2);
      });
    }
  }, [state.events, processEvent, speed]);

  useEffect(() => {
    if (isPlaying && !isAnimating) {
      runSimulation();
    }
  }, [isPlaying]);

  const handleStart = useCallback(() => {
    if (state.isComplete) return;
    setIsPlaying(true);
  }, [state.isComplete]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    cleanup();
  }, [cleanup]);

  const handleReset = useCallback(() => {
    cleanup();
    setIsPlaying(false);
    setState(createInitialState(protocol, totalPackets, windowSize, lossPattern));
    setChannelPackets([]);
    setCurrentEvent(null);
    setLogs([]);
    setIsAnimating(false);
    currentIndexRef.current = -1;
  }, [protocol, cleanup, totalPackets, windowSize, lossPattern]);

  const handleLossRateChange = (rate: number) => {
    setLossRate(rate);
    const newPattern = generateLossPattern(totalPackets, rate);
    setLossPattern(newPattern);
  };

  const handleTotalPacketsChange = (count: number) => {
    setTotalPackets(count);
    const newPattern = generateLossPattern(count, lossRate);
    setLossPattern(newPattern);
  };

  const handleWindowSizeChange = (size: number) => {
    setWindowSize(size);
  };

  const handleRandomizeLoss = () => {
    const newPattern = generateLossPattern(totalPackets, lossRate);
    setLossPattern(newPattern);
    setState(createInitialState(protocol, totalPackets, windowSize, newPattern));
    setLogs([]);
    setCurrentEvent(null);
    currentIndexRef.current = -1;
  };

  const isSimulationActive = isPlaying || state.currentEventIndex >= 0;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <header className="py-3 px-6 border-b-2 border-black flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 
              className="text-xl md:text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {isFlowControl ? 'Flow Control using Sliding Window' : 'Sliding Window Protocol Visualizer'}
            </h1>
            <p className="text-xs text-gray-600">
              {isFlowControl ? 'How receivers control data speed' : 'How computers send data reliably'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isFlowControl && (
              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border-2 border-black hover:bg-gray-100 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                Compare
              </button>
            )}
            <ProtocolToggle selected={protocol} onChange={handleProtocolChange} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex min-h-0">
        <div className="w-56 border-r-2 border-black p-3 flex flex-col gap-3 overflow-y-auto flex-shrink-0">
          <NetworkSettings
            lossRate={lossRate}
            onLossRateChange={handleLossRateChange}
            totalPackets={totalPackets}
            onTotalPacketsChange={handleTotalPacketsChange}
            windowSize={windowSize}
            onWindowSizeChange={handleWindowSizeChange}
            onRandomizeLoss={handleRandomizeLoss}
            disabled={isSimulationActive}
            isFlowControl={isFlowControl}
          />
          
          {!isFlowControl && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 border border-gray-200">
              <div className="font-bold mb-1">Loss Pattern:</div>
              <div className="font-mono">
                {lossPattern.length > 0 ? lossPattern.join(', ') : 'None'}
              </div>
            </div>
          )}
          
          {isFlowControl && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 border border-gray-200">
              <div className="font-bold mb-1">Flow Control Mode</div>
              <div>No packet loss. Receiver controls transmission speed via advertised window.</div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full max-w-3xl flex items-center justify-between gap-2">
              <Sender
                window={state.senderWindow}
                totalPackets={totalPackets}
              />
              
              <Channel packets={channelPackets} />
              
              <Receiver
                expected={state.receiverWindow.expected}
                buffer={state.receiverWindow.buffer}
                totalPackets={totalPackets}
                protocol={protocol}
              />
            </div>
          </div>

          <Explanation
            event={currentEvent}
            eventIndex={state.currentEventIndex}
            totalEvents={state.events.length}
          />

          <Controls
            isPlaying={isPlaying}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={setSpeed}
            isComplete={state.isComplete}
          />
        </div>

        <div className="w-72 border-l-2 border-black flex flex-col flex-shrink-0">
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === 'logs' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              Logs
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors border-l border-gray-300 ${
                activeTab === 'metrics' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-3 h-3 inline mr-1" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors border-l border-gray-300 ${
                activeTab === 'diagram' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <Activity className="w-3 h-3 inline mr-1" />
              Seq
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {activeTab === 'logs' && (
              <Logs events={logs} currentEventId={currentEvent?.id} />
            )}
            {activeTab === 'metrics' && (
              <div className="p-3 overflow-y-auto h-full">
                <Metrics
                  events={state.events}
                  currentEventIndex={state.currentEventIndex}
                  protocol={protocol}
                />
              </div>
            )}
            {activeTab === 'diagram' && (
              <div className="p-3 overflow-y-auto h-full">
                <SequenceDiagram
                  events={state.events}
                  currentEventIndex={state.currentEventIndex}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {!isFlowControl && (
        <ComparisonView
          totalPackets={totalPackets}
          windowSize={windowSize}
          lossPattern={lossPattern}
          speed={speed}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
