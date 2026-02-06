import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { ActionType } from '../types';

interface MetricsChartProps {
  counts: Record<ActionType, number>;
  targets: Record<ActionType, number>;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ counts, targets }) => {
  const data = Object.keys(counts).map((key) => {
    const k = key as ActionType;
    return {
      name: k,
      Actual: counts[k],
      Target: targets[k],
      Variance: counts[k] - targets[k]
    };
  });

  return (
    <div className="w-full h-full rounded-2xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 25, right: 30, left: -20, bottom: 5 }}
          barGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={15}
            fontWeight={600}
            tickFormatter={(val) => val.toUpperCase()}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tickCount={5}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 15, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#fff',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ paddingBottom: '4px' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', paddingBottom: '25px', letterSpacing: '1px', fontWeight: 700 }} 
          />
          <Bar 
            dataKey="Actual" 
            name="Your Annotation" 
            fill="url(#colorActual)"
            radius={[6, 6, 0, 0]} 
            barSize={24}
          >
             <LabelList dataKey="Actual" position="top" fill="white" fontSize={11} fontWeight={800} offset={6} />
          </Bar>
          <Bar 
            dataKey="Target" 
            name="Ground Truth" 
            fill="#3f3f46" 
            radius={[6, 6, 0, 0]} 
            barSize={24}
          >
              <LabelList dataKey="Target" position="top" fill="#71717a" fontSize={11} fontWeight={800} offset={6} />
          </Bar>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={1}/>
              <stop offset="95%" stopColor="#991b1b" stopOpacity={1}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;