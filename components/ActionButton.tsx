
import React, { useState, useEffect } from 'react';
import { ActionType } from '../types';
import { ACTION_GRADIENTS } from '../constants';

interface ActionButtonProps {
  action: ActionType;
  count: number;
  onClick: () => void;
  disabled: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, count, onClick, disabled }) => {
  const gradient = ACTION_GRADIENTS[action];
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (isPressed) {
      const timer = setTimeout(() => setIsPressed(false), 80);
      return () => clearTimeout(timer);
    }
  }, [isPressed]);

  const handleInteraction = () => {
    if (disabled) return;
    setIsPressed(true);
    onClick();
  };

  return (
    <button
      onClick={handleInteraction}
      disabled={disabled}
      className={`relative group flex flex-col items-center justify-center h-28 rounded-2xl transition-all duration-150 overflow-visible border ${
        disabled 
          ? 'bg-zinc-900/40 border-white/5 opacity-40 cursor-not-allowed grayscale' 
          : `bg-zinc-900 border-white/10 hover:border-white/30 hover:shadow-lg ${isPressed ? 'scale-95 bg-zinc-800' : 'hover:bg-zinc-800/80 active:scale-95'}`
      }`}
    >
      {/* Subtle Color Accent Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.05] rounded-2xl transition-opacity group-hover:opacity-[0.1]`} />
      
      {/* Left Accent Bar */}
      <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-gradient-to-b ${gradient} opacity-80`} />

      {/* Modern Counter - Integrated top-right */}
      <div 
        className={`absolute top-2 right-2 px-2.5 py-0.5 min-w-[24px] rounded-lg text-white font-black text-xs shadow-md bg-gradient-to-br ${gradient} transition-all duration-300 z-20 ${
          count > 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {count}
      </div>

      {/* Button Content */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${disabled ? 'text-zinc-700' : 'text-zinc-500'}`}>
          {action}
        </span>
        <span className={`text-lg font-black tracking-tight transition-all ${disabled ? 'text-zinc-800' : 'text-white'}`}>
          {action.toUpperCase()}
        </span>
      </div>

      {/* Pulse effect on click */}
      {isPressed && (
        <div className={`absolute inset-0 bg-white opacity-10 rounded-2xl animate-pulse pointer-events-none`} />
      )}
    </button>
  );
};

export default ActionButton;
