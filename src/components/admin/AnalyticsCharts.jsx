import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { formatCategory } from '../../utils/formatters';

const TIER_COLORS = {
  HIGH: '#34d399',   // emerald-400
  MEDIUM: '#fbbf24', // amber-400
  LOW: '#f87171'     // red-400
};

const STATUS_COLORS = {
  RECEIVED: '#94a3b8',
  ESCROW: '#fcd34d',
  UNDER_REVIEW: '#60a5fa',
  INVESTIGATING: '#c084fc',
  ACTION_TAKEN: '#fb923c',
  RESOLVED: '#4ade80',
  CLOSED: '#94a3b8',
  RETRACTED_BY_REPORTER: '#fca5a5'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border text-left border-slate-200 py-3 px-4 rounded-xl shadow-lg font-sans">
        <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-sm font-extrabold text-indigo-600">Metric Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const CategoryBarChart = ({ data = [] }) => {
  // Format labels for Recharts safely handling deep nested counts safely.
  const formattedData = data.map(d => ({
    ...d,
    label: formatCategory(d.category || d.label)
  }));

  return (
    <div style={{ width: '100%', height: 350 }}>
      {formattedData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACED</div>
      ) : (
        <ResponsiveContainer>
          <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} fontWeight={700} stroke="#94a3b8" />
            <YAxis type="category" dataKey="label" width={160} fontSize={10} tickLine={false} axisLine={false} fontWeight={800} stroke="#64748b" />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
            <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const StatusPieChart = ({ data = [] }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACED</div>
      ) : (
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="count"
              nameKey="status"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#cbd5e1'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const TierPieChart = ({ data = [] }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACED</div>
      ) : (
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              outerRadius={100}
              dataKey="count"
              nameKey="tier"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.tier] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const DailyTrendLine = ({ data = [] }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACED</div>
      ) : (
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} fontWeight={800} stroke="#94a3b8" />
            <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} fontWeight={800} stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '3 3' }} />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 5, strokeWidth: 3, fill: '#fff' }} activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }} animationDuration={1500} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
