import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActionType } from '../types';
import { ACTION_COLORS } from '../constants';

interface ActionKeyProps {
  action: ActionType;
  count: number;
  onClick: () => void;
  disabled: boolean;
  shortcut?: string;
  variant?: 'default' | 'compact';
}

const ActionKey: React.FC<ActionKeyProps> = ({ action, count, onClick, disabled, shortcut, variant = 'default' }) => {
  const [active, setActive] = useState(false);
  const color = ACTION_COLORS[action];
  const timeoutRef = useRef<number | null>(null);
  const sizing = variant === 'compact' 
    ? {
        container: 'p-4 h-36 lg:h-40',
        actionLabel: 'text-lg',
        countText: 'text-4xl',
        icon: 'text-2xl'
      }
    : {
        container: 'p-8 h-52 lg:h-64',
        actionLabel: 'text-2xl',
        countText: 'text-7xl',
        icon: 'text-4xl'
      };

  // Memoized handler to process both click and keyboard events safely
  const handlePress = useCallback(() => {
    if (disabled) return;
    
    // Reset existing timeout to allow rapid tapping
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setActive(true);
    onClick();
    
    // Haptic feedback
    if (navigator.vibrate) {
        try { navigator.vibrate(20); } catch(e) {}
    }

    // Reset visual state after short delay
    timeoutRef.current = window.setTimeout(() => setActive(false), 150);
  }, [disabled, onClick]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Global Keyboard Listener
  useEffect(() => {
    if (!shortcut || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        // Match the specific key, e.g., "1", "2"
        if (e.key === shortcut) {
            handlePress();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, disabled, handlePress]);

  return (
    <button
      onClick={handlePress}
      disabled={disabled}
      className={`
        relative overflow-hidden flex flex-col justify-between w-full text-left rounded-2xl select-none touch-manipulation ${sizing.container}
        ${disabled 
          ? 'opacity-30 cursor-not-allowed bg-zinc-900 border border-white/5 grayscale' 
          : 'tactile-btn group hover:border-white/20'
        }
        ${active ? 'is-pressed brightness-125' : ''}
      `}
      style={{
        borderBottomColor: !disabled ? color : undefined,
        borderBottomWidth: !disabled ? '8px' : '1px',
      }}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start w-full relative z-10 pointer-events-none">
        <span 
          className={`${sizing.actionLabel} font-black uppercase tracking-widest transition-colors`}
          style={{ color: !disabled ? color : '#52525b' }}
        >
          {action}
        </span>
        
        {/* Shortcut Badge */}
        {shortcut && !disabled && (
          <div className={`text-xs font-mono border w-7 h-7 flex items-center justify-center rounded-lg shadow-sm transition-colors ${active ? 'bg-white text-black border-white' : 'text-zinc-400 border-white/10 bg-black/40'}`}>
            {shortcut}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between relative z-10 mt-auto pointer-events-none">
        <span 
            className={`font-mono ${sizing.countText} font-black leading-none transition-colors duration-75 ${active ? 'text-white' : 'text-zinc-100'}`}
            style={{ textShadow: active ? `0 0 20px ${color}` : 'none' }}
        >
          {count.toString().padStart(2, '0')}
        </span>
        
        {/* Action Icon / Letter */}
        <span className={`${sizing.icon} font-black opacity-10 group-hover:opacity-20 transition-opacity`} style={{ color: color }}>
             {action.charAt(0)}
        </span>
      </div>

      {/* Glossy Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50"></div>

      {/* Active State Glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-75"
        style={{ 
          background: `radial-gradient(circle at center, ${color}40 0%, transparent 70%)`,
          opacity: active ? 1 : 0 
        }} 
      />
      
      {/* Flash Overlay */}
      <div 
        className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-75"
        style={{ 
          opacity: active ? 0.1 : 0 
        }} 
      />
    </button>
  );
};

export default ActionKey;