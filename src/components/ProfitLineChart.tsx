'use client';

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Lock } from 'lucide-react';
import { formatNaira } from '@/lib/formatters';

interface DataPoint {
  label: string;
  revenue: number;
  profit: number;
}

interface ProfitLineChartProps {
  data: DataPoint[];
  canViewProfit: boolean;
}

export const ProfitLineChart: React.FC<ProfitLineChartProps> = ({ data, canViewProfit }) => {
  const [activeTab, setActiveTab] = useState<'profit' | 'revenue'>('profit');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!canViewProfit) {
    return (
      <div className="p-8 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Profit Chart Restricted by Oga</div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your Oga has configured apprentice permissions to keep wholesale cost and profit margins private. You can still view sales quantity and waybills.
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No sales data recorded yet. Log daily transactions to see your profit line graph!
      </div>
    );
  }

  // Calculate SVG coordinates
  const values = activeTab === 'profit' ? data.map((d) => d.profit) : data.map((d) => d.revenue);
  const maxValue = Math.max(...values, 10000);
  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 25;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * (width - paddingX * 2);
    const val = activeTab === 'profit' ? d.profit : d.revenue;
    const y = height - paddingY - (val / maxValue) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="w-full bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Trade Performance Trend
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {activeTab === 'profit'
              ? formatNaira(data.reduce((acc, curr) => acc + curr.profit, 0)) + ' Net Profit'
              : formatNaira(data.reduce((acc, curr) => acc + curr.revenue, 0)) + ' Total Revenue'}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 dark:bg-navy-950 p-1 rounded-xl text-xs font-bold self-start">
          <button
            onClick={() => setActiveTab('profit')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'profit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Net Profit
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'revenue'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Revenue
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Area Fill */}
          <path
            d={areaD}
            fill={activeTab === 'profit' ? 'url(#profitGrad)' : 'url(#revGrad)'}
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={activeTab === 'profit' ? '#059669' : '#2563eb'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Dots */}
          {points.map((pt, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === i ? 6 : 4}
                fill={activeTab === 'profit' ? '#059669' : '#2563eb'}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all"
              />
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                className="fill-slate-400 font-mono"
              >
                {pt.data.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-xl shadow-xl text-xs font-mono font-bold pointer-events-none"
          >
            {points[hoverIndex].data.label}:{' '}
            {formatNaira(
              activeTab === 'profit'
                ? points[hoverIndex].data.profit
                : points[hoverIndex].data.revenue
            )}
          </div>
        )}
      </div>
    </div>
  );
};
