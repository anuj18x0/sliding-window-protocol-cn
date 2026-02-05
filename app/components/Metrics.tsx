'use client';

import React from 'react';
import { SimulationEvent } from '../protocols/types';
import { TrendingUp, RefreshCw, Clock, Zap } from 'lucide-react';

interface MetricsProps {
  events: SimulationEvent[];
  currentEventIndex: number;
  protocol: string;
}

interface MetricData {
  packetsSent: number;
  packetsDelivered: number;
  retransmissions: number;
  packetsLost: number;
  acksReceived: number;
  efficiency: number;
  throughput: number;
}

function calculateMetrics(events: SimulationEvent[], currentEventIndex: number): MetricData {
  const processedEvents = events.slice(0, currentEventIndex + 1);
  
  let packetsSent = 0;
  let packetsDelivered = 0;
  let retransmissions = 0;
  let packetsLost = 0;
  let acksReceived = 0;
  const sentPackets = new Set<number>();
  const deliveredPackets = new Set<number>();

  for (const event of processedEvents) {
    switch (event.type) {
      case 'send':
        if (sentPackets.has(event.packetId)) {
          retransmissions++;
        } else {
          sentPackets.add(event.packetId);
        }
        packetsSent++;
        break;
      case 'receive':
        if (!deliveredPackets.has(event.packetId)) {
          deliveredPackets.add(event.packetId);
          packetsDelivered++;
        }
        break;
      case 'loss':
        packetsLost++;
        break;
      case 'ack-receive':
        acksReceived++;
        break;
    }
  }

  const efficiency = packetsSent > 0 ? (packetsDelivered / packetsSent) * 100 : 0;
  const throughput = processedEvents.length > 0 ? (packetsDelivered / (currentEventIndex + 1)) * 100 : 0;

  return {
    packetsSent,
    packetsDelivered,
    retransmissions,
    packetsLost,
    acksReceived,
    efficiency,
    throughput,
  };
}

export function Metrics({ events, currentEventIndex, protocol }: MetricsProps) {
  const metrics = calculateMetrics(events, currentEventIndex);

  const metricItems = [
    {
      icon: Zap,
      label: 'Efficiency',
      value: `${metrics.efficiency.toFixed(1)}%`,
      sublabel: 'delivered / sent',
    },
    {
      icon: TrendingUp,
      label: 'Throughput',
      value: `${metrics.throughput.toFixed(1)}%`,
      sublabel: 'packets per step',
    },
    {
      icon: RefreshCw,
      label: 'Retransmissions',
      value: metrics.retransmissions.toString(),
      sublabel: 'packets resent',
    },
    {
      icon: Clock,
      label: 'Packets Lost',
      value: metrics.packetsLost.toString(),
      sublabel: 'in network',
    },
  ];

  return (
    <div className="border-2 border-black bg-white p-4">
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wide">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {metricItems.map((item) => (
          <div key={item.label} className="border border-gray-300 p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="w-4 h-4 text-black" />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
            <div className="text-xl font-bold font-mono">{item.value}</div>
            <div className="text-xs text-gray-500">{item.sublabel}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Sent: <span className="font-mono font-bold">{metrics.packetsSent}</span></span>
          <span className="text-gray-600">Delivered: <span className="font-mono font-bold">{metrics.packetsDelivered}</span></span>
          <span className="text-gray-600">ACKs: <span className="font-mono font-bold">{metrics.acksReceived}</span></span>
        </div>
      </div>
    </div>
  );
}
