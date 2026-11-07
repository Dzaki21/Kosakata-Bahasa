import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { RatingDistribution } from '../../hooks/useStats';

interface RetentionChartProps {
  statusDistribution: { name: string; value: number; color: string }[];
  ratingDistribution: RatingDistribution[];
}

export const RetentionChart: React.FC<RetentionChartProps> = ({
  statusDistribution,
  ratingDistribution,
}) => {
  const totalVocab = statusDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Distribusi Penguasaan Kosakata
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Status kemajuan memori jangka panjang
        </p>
      </div>

      <div className="h-44 w-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusDistribution}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-xl p-2 shadow-xl border border-slate-700">
                      <p className="font-semibold">{item.name}</p>
                      <p>{item.value} kata ({totalVocab > 0 ? Math.round((item.value / totalVocab) * 100) : 0}%)</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totalVocab}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase">
            Total Kata
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        {statusDistribution.map(item => (
          <div key={item.name} className="flex flex-col items-center">
            <div className="flex items-center space-x-1 mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

