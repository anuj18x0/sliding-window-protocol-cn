'use client';

import React, { useRef } from 'react';
import { SimulationEvent } from '../protocols/types';
import { Download } from 'lucide-react';

interface SequenceDiagramProps {
  events: SimulationEvent[];
  currentEventIndex: number;
}

export function SequenceDiagram({ events, currentEventIndex }: SequenceDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const processedEvents = events.slice(0, currentEventIndex + 1);

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'send':
        return { arrow: '→', color: 'bg-black', direction: 'right' };
      case 'receive':
        return { arrow: '→', color: 'bg-black', direction: 'right' };
      case 'ack-send':
        return { arrow: '←', color: 'bg-gray-500', direction: 'left' };
      case 'ack-receive':
        return { arrow: '←', color: 'bg-gray-500', direction: 'left' };
      case 'loss':
        return { arrow: '✕', color: 'bg-white border-2 border-black border-dashed', direction: 'right' };
      case 'timeout':
        return { arrow: '⟳', color: 'bg-gray-300', direction: 'none' };
      case 'buffer':
        return { arrow: '▣', color: 'bg-gray-400', direction: 'right' };
      case 'window-slide':
        return { arrow: '»', color: 'bg-gray-200', direction: 'none' };
      default:
        return { arrow: '→', color: 'bg-gray-300', direction: 'right' };
    }
  };

  const exportAsPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `sequence-diagram-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="border-2 border-black bg-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-bold uppercase tracking-wide">Sequence Diagram</h3>
        <button
          onClick={exportAsPNG}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-black hover:bg-gray-100 transition-colors"
        >
          <Download className="w-3 h-3" />
          Export PNG
        </button>
      </div>

      <div ref={diagramRef} className="p-4 bg-white">
        <div className="flex justify-between mb-4 px-4">
          <div className="text-center">
            <div className="w-16 h-8 border-2 border-black flex items-center justify-center text-xs font-bold">
              SENDER
            </div>
            <div className="w-px h-full bg-black mx-auto" style={{ minHeight: `${Math.max(processedEvents.length * 32, 100)}px` }}></div>
          </div>
          <div className="text-center">
            <div className="w-16 h-8 border-2 border-black flex items-center justify-center text-xs font-bold">
              RECEIVER
            </div>
            <div className="w-px h-full bg-black mx-auto" style={{ minHeight: `${Math.max(processedEvents.length * 32, 100)}px` }}></div>
          </div>
        </div>

        <div className="relative" style={{ minHeight: `${Math.max(processedEvents.length * 32, 100)}px` }}>
          <div className="absolute left-[32px] top-0 bottom-0 w-px bg-gray-300"></div>
          <div className="absolute right-[32px] top-0 bottom-0 w-px bg-gray-300"></div>

          {processedEvents.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              Start simulation to see diagram
            </div>
          ) : (
            <div className="space-y-1">
              {processedEvents.map((event, index) => {
                const style = getEventStyle(event.type);
                const isRightDirection = style.direction === 'right';
                const isLeftDirection = style.direction === 'left';

                return (
                  <div
                    key={event.id}
                    className="flex items-center h-7 relative"
                  >
                    <div className="absolute left-0 text-xs text-gray-400 font-mono w-6">
                      {index + 1}
                    </div>

                    {style.direction === 'none' ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className={`px-2 py-0.5 text-xs ${style.color} rounded`}>
                          {event.type === 'timeout' ? `Timeout P${event.packetId}` : `Slide`}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center px-8">
                        <div className={`flex-1 flex items-center ${isLeftDirection ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8"></div>
                          <div className={`flex-1 h-px ${event.type === 'loss' ? 'border-t-2 border-dashed border-black' : 'bg-black'} relative`}>
                            <div 
                              className={`absolute ${isRightDirection ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 text-xs`}
                            >
                              {isRightDirection ? '→' : '←'}
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 -top-3 text-xs font-mono bg-white px-1">
                              {event.type === 'loss' ? `P${event.packetId} ✕` : 
                               event.type.includes('ack') ? `ACK${event.packetId}` : `P${event.packetId}`}
                            </div>
                          </div>
                          <div className="w-8"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
