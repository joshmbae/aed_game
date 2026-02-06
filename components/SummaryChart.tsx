
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ActionType } from '../types';

interface SummaryChartProps {
  counts: Record<ActionType, number>;
  targets: Record<ActionType, number>;
}

const SummaryChart: React.FC<SummaryChartProps> = ({ counts, targets }) => {
  const data = Object.keys(counts).map((key) => ({
    name: key.toUpperCase(),
    Captured: counts[key as ActionType],
    Baseline: targets[key as ActionType],
  }));

  return (
    <div className="h-[1000px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          barGap={12}
        >
          <defs>
            <linearGradient id="capturedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
              <stop offset="100%" stopColor="#991b1b" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" stopOpacity={1}/>
              <stop offset="100%" stopColor="#1e293b" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={11}
            fontWeight={900}
            tickLine={false}
            axisLine={false}
            dy={20}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10}
            fontWeight={800}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              padding: '12px 16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="rect"
            iconSize={14}
            wrapperStyle={{ paddingBottom: '40px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}
          />
          <Bar 
            name="CAPTURED" 
            dataKey="Captured" 
            fill="url(#capturedGradient)" 
            radius={[8, 8, 0, 0]} 
            barSize={40}
            animationDuration={1500}
          />
          <Bar 
            name="BASELINE" 
            dataKey="Baseline" 
            fill="url(#baselineGradient)" 
            radius={[8, 8, 0, 0]} 
            barSize={40}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryChart;
