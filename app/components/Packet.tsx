'use client';

import React from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
interface PacketProps {
  id: number;
  type: 'data' | 'ack';
  status: 'pending' | 'sent' | 'in-transit' | 'received' | 'acked' | 'lost' | 'buffered';
  isAnimating?: boolean;
}

export function Packet({ id, type, status }: PacketProps) {
  const getStyle = () => {
    if (status === 'lost') return 'bg-black text-white line-through';
    if (status === 'acked' || status === 'received') return 'bg-black text-white';
    if (status === 'in-transit' || status === 'sent') return 'bg-gray-700 text-white';
    if (status === 'buffered') return 'bg-gray-400 text-white';
    return 'bg-white text-black';
  };

  return (
    <div
      className={`
        flex items-center justify-center
        w-10 h-10 
        border-2 border-black
        font-mono text-sm font-bold
        transition-all duration-300
        ${getStyle()}
      `}
    >
      {type === 'ack' ? `A${id}` : id}
    </div>
  );
}

interface AnimatingPacketProps {
  id: number;
  type: 'data' | 'ack';
  progress: number;
  isLost: boolean;
}

export function AnimatingPacket({ id, type, progress, isLost }: AnimatingPacketProps) {
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easedProgress = easeOutCubic(progress);
  
  const getStyles = () => {
    if (isLost) {
      return {
        bg: 'bg-white',
        border: 'border-black border-dashed',
        text: 'text-black'
      };
    }
    if (type === 'ack') {
      return {
        bg: 'bg-gray-200',
        border: 'border-black',
        text: 'text-black'
      };
    }
    return {
      bg: 'bg-black',
      border: 'border-black',
      text: 'text-white'
    };
  };

  const styles = getStyles();
  
  const opacity = isLost && progress > 0.5 ? 1 - (progress - 0.5) * 2 : 1;
  const scale = isLost && progress > 0.5 ? 1 + (progress - 0.5) * 0.3 : 1;
  const rotation = isLost ? progress * 30 : 0;

  return (
    <div
      className={`
        absolute
        flex flex-col items-center justify-center
        w-14 h-14 
        rounded-lg
        border-2 ${styles.border}
        ${styles.bg}
        ${styles.text}
        shadow-lg
        transition-shadow duration-200
      `}
      style={{
        left: type === 'data' 
          ? `calc(${easedProgress * 85 + 5}%)` 
          : `calc(${(1 - easedProgress) * 85 + 5}%)`,
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
      }}
    >
      {isLost ? (
        <XCircle className="w-5 h-5 mb-0.5" />
      ) : type === 'ack' ? (
        <CheckCircle className="w-5 h-5 mb-0.5" />
      ) : (
        <Mail className="w-5 h-5 mb-0.5" />
      )}
      <span className="font-mono text-xs font-bold">
        {type === 'ack' ? `ACK ${id}` : `PKT ${id}`}
      </span>
    </div>
  );
}
