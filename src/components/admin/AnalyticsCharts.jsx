import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, Area 
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

const formatStatusLabel = (status) => {
  const labels = {
    RECEIVED: 'Received',
    ESCROW: 'Escrow',
    UNDER_REVIEW: 'Under Review',
    INVESTIGATING: 'Investigating',
    ACTION_TAKEN: 'Action Taken',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    RETRACTED_BY_REPORTER: 'Retracted'
  };
  return labels[status] || status.replace(/_/g, ' ');
};

const formatTierLabel = (tier) => {
  const labels = {
    HIGH: 'High Credibility',
    MEDIUM: 'Medium Credibility',
    LOW: 'Low Credibility'
  };
  return labels[tier] || tier.replace(/_/g, ' ');
};

const CustomLegend = ({ payload, formatLabel, colors, activeTag, onActiveTagChange }) => {
  if (!payload) return null;

  const handleLabelClick = (rawValue) => {
    if (onActiveTagChange) {
      if (activeTag === rawValue) {
        onActiveTagChange(null);
      } else {
        onActiveTagChange(rawValue);
      }
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 mt-6 px-3 select-none">
      {payload.map((entry, index) => {
        const rawValue = entry.value;
        const color = colors[rawValue] || entry.color || '#94a3b8';
        const label = formatLabel ? formatLabel(rawValue) : rawValue;
        const count = entry.payload?.count ?? entry.payload?.value ?? 0;
        const isClicked = activeTag === rawValue;
        
        return (
          <button 
            key={`legend-item-${index}`} 
            type="button"
            onClick={() => handleLabelClick(rawValue)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all active:scale-95 cursor-pointer shadow-sm ${
              isClicked 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-extrabold ring-1 ring-indigo-500' 
                : 'border-slate-200 bg-slate-50/80 text-slate-600 font-black hover:bg-slate-100/90 hover:border-slate-300'
            } text-[10px]`}
          >
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm border border-black/5" 
              style={{ backgroundColor: color }} 
            />
            <span className="tracking-wide uppercase">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // If there is more than 1 item in the payload, it represents the dual-axis trend line chart
    if (payload.length > 1) {
      return (
        <div className="bg-white border text-left border-slate-200 py-3 px-4 rounded-xl shadow-lg font-sans min-w-[180px]">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pb-1.5 border-b border-slate-100">
            {label || 'Incident Trend'}
          </p>
          <div className="space-y-1.5">
            {payload.map((item, index) => {
              const name = item.name === 'count' ? 'Daily Count' :
                           item.name === 'rollingAvg' ? '3-Day Average' :
                           item.name === 'cumulative' ? 'Cumulative Total' :
                           item.name;
              const color = item.color || '#4f46e5';
              return (
                <div key={index} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    {name}:
                  </span>
                  <span className="font-extrabold text-slate-800">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const dataPoint = payload[0];
    
    // Dynamic color resolution based on active Recharts payload or fallback constants
    let metricColor = dataPoint.color || dataPoint.payload?.fill || dataPoint.fill || '#4f46e5';
    
    if (dataPoint.payload?.status && STATUS_COLORS[dataPoint.payload.status]) {
      metricColor = STATUS_COLORS[dataPoint.payload.status];
    } else if (dataPoint.payload?.tier && TIER_COLORS[dataPoint.payload.tier]) {
      metricColor = TIER_COLORS[dataPoint.payload.tier];
    }

    // For CategoryBarChart, show ONLY the metric count in a clean non-breaking circular/pill container
    if (dataPoint.payload?.category) {
      return (
        <div className="bg-indigo-600 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-lg border border-indigo-700 whitespace-nowrap flex items-center justify-center min-w-[36px] text-center transition-all duration-300">
          {dataPoint.value}
        </div>
      );
    }

    return (
      <div className="bg-white border text-left border-slate-200 py-3 px-4 rounded-xl shadow-lg font-sans">
        <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1.5">
          {label || dataPoint.name || 'Category'}
        </p>
        <p className="text-sm font-extrabold" style={{ color: metricColor }}>
          Metric Count: {dataPoint.value}
        </p>
      </div>
    );
  }
  return null;
};

export const CategoryBarChart = ({ data = [] }) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format labels for Recharts safely handling deep nested counts safely.
  const formattedData = data.map(d => ({
    ...d,
    label: formatCategory(d.category || d.label)
  }));

  const activeItem = formattedData[activeIndex];

  return (
    <div className="relative" style={{ width: '100%', height: 350 }}>
      {activeItem && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-[90%] sm:w-fit min-w-[220px] bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-xl shadow-lg flex items-center justify-center animate-in slide-in-from-top-2 duration-300 z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/5 bg-indigo-500 transition-colors duration-300" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 transition-all duration-300 text-center">
              {activeItem.label}
            </span>
          </div>
        </div>
      )}

      {formattedData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACTED</div>
      ) : (
        <ResponsiveContainer>
          <BarChart 
            data={formattedData} 
            layout="vertical" 
            margin={{ top: 40, right: 30, left: 10, bottom: 5 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedLabel = state.activePayload[0].payload.label;
                const idx = formattedData.findIndex(d => d.label === clickedLabel);
                if (idx !== -1) setActiveIndex(idx);
              } else if (state && state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} fontWeight={700} stroke="#94a3b8" />
            <YAxis 
              type="category" 
              dataKey="label" 
              width={isMobile ? 80 : 130} 
              tickLine={false} 
              axisLine={false} 
              stroke="#64748b" 
              tick={(props) => {
                const { x, y, payload } = props;
                const index = formattedData.findIndex(d => d.label === payload.value);
                const isActive = activeIndex === index;
                const truncatedText = isMobile 
                  ? (payload.value.length > 14 ? payload.value.slice(0, 11) + '...' : payload.value)
                  : (payload.value.length > 22 ? payload.value.slice(0, 19) + '...' : payload.value);
                
                return (
                  <g 
                    transform={`translate(${x},${y})`} 
                    className="cursor-pointer" 
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                  >
                    <rect x={-(isMobile ? 80 : 130)} y={-15} width={isMobile ? 80 : 130} height={30} fill="transparent" />
                    <text
                      x={-6}
                      y={3}
                      textAnchor="end"
                      fill={isActive ? '#4f46e5' : '#64748b'}
                      fontWeight={isActive ? 900 : 600}
                      fontSize={isMobile ? 8 : 9}
                      className="transition-all duration-300 select-none"
                    >
                      {truncatedText}
                    </text>
                  </g>
                );
              }}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{fill: '#f8fafc', cursor: 'pointer'}} 
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ 
                transition: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                zIndex: 1000
              }}
            />
            <Bar 
              dataKey="count" 
              radius={[0, 6, 6, 0]} 
              barSize={20}
              className="cursor-pointer"
              background={(props) => {
                const { x, y, width, height, index } = props;
                const isActive = activeIndex === index;
                const offset = isMobile ? 80 : 130;
                return (
                  <rect 
                    x={x - offset - 10} 
                    y={y - 6} 
                    width={width + offset + 20} 
                    height={height + 12} 
                    fill="transparent"
                    rx={6}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                    className="cursor-pointer transition-colors duration-300"
                  />
                );
              }}
            >
              {formattedData.map((entry, index) => {
                const isActive = activeIndex === index;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isActive ? '#4f46e5' : '#e2e8f0'}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const StatusPieChart = ({ data = [] }) => {
  const [activeTag, setActiveTag] = React.useState(null);

  return (
    <div className="relative" style={{ width: '100%', height: 350 }}>
      {activeTag && (() => {
        const item = data.find(d => d.status === activeTag);
        if (!item) return null;
        const color = STATUS_COLORS[activeTag] || '#cbd5e1';
        const label = formatStatusLabel(activeTag);
        
        return (
          <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <CustomTooltip 
              active={true} 
              payload={[{
                name: label,
                value: item.count,
                color: color,
                payload: item
              }]} 
              label={label} 
            />
          </div>
        );
      })()}

      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACTED</div>
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
              {data.map((entry, index) => {
                const isFaded = activeTag && entry.status !== activeTag;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status] || '#cbd5e1'} 
                    style={{
                      transition: 'all 0.3s ease',
                      opacity: isFaded ? 0.3 : 1,
                      filter: (activeTag === entry.status) ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.15))' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                );
              })}
            </Pie>
            {!activeTag && <Tooltip content={<CustomTooltip />} />}
            <Legend content={<CustomLegend formatLabel={formatStatusLabel} colors={STATUS_COLORS} activeTag={activeTag} onActiveTagChange={setActiveTag} />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const TierPieChart = ({ data = [] }) => {
  const [activeTag, setActiveTag] = React.useState(null);

  return (
    <div className="relative" style={{ width: '100%', height: 350 }}>
      {activeTag && (() => {
        const item = data.find(d => d.tier === activeTag);
        if (!item) return null;
        const color = TIER_COLORS[activeTag] || '#cbd5e1';
        const label = formatTierLabel(activeTag);
        
        return (
          <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <CustomTooltip 
              active={true} 
              payload={[{
                name: label,
                value: item.count,
                color: color,
                payload: item
              }]} 
              label={label} 
            />
          </div>
        );
      })()}

      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACTED</div>
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
              nameKey="tier"
              stroke="none"
            >
              {data.map((entry, index) => {
                const isFaded = activeTag && entry.tier !== activeTag;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={TIER_COLORS[entry.tier] || '#94a3b8'} 
                    style={{
                      transition: 'all 0.3s ease',
                      opacity: isFaded ? 0.3 : 1,
                      filter: (activeTag === entry.tier) ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.15))' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                );
              })}
            </Pie>
            {!activeTag && <Tooltip content={<CustomTooltip />} />}
            <Legend content={<CustomLegend formatLabel={formatTierLabel} colors={TIER_COLORS} activeTag={activeTag} onActiveTagChange={setActiveTag} />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const DailyTrendLine = ({ data = [] }) => {
  const [activeTag, setActiveTag] = React.useState(null);

  // Add details: compute rolling 3-day average and cumulative total trends
  const detailedData = data.map((d, index) => {
    let cumulative = 0;
    for (let i = 0; i <= index; i++) {
      cumulative += data[i].count || 0;
    }

    let sum = 0;
    let count = 0;
    for (let i = Math.max(0, index - 2); i <= index; i++) {
      sum += data[i].count || 0;
      count++;
    }
    const rollingAvg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;

    return {
      ...d,
      count: d.count || 0,
      cumulative,
      rollingAvg
    };
  });

  return (
    <div className="relative" style={{ width: '100%', height: 350 }}>
      {activeTag && (() => {
        const latestData = detailedData[detailedData.length - 1];
        const val = latestData ? latestData[activeTag] : 0;
        const color = activeTag === 'count' ? '#6366f1' : activeTag === 'rollingAvg' ? '#8b5cf6' : '#10b981';
        const label = activeTag === 'count' ? 'Daily Count' : activeTag === 'rollingAvg' ? '3-Day Average' : 'Cumulative Total';
        
        return (
          <div className="absolute top-0 left-[50%] -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <CustomTooltip 
              active={true} 
              payload={[{
                name: label,
                value: val,
                color: color,
                payload: latestData
              }]} 
              label={`${label} (Latest)`} 
            />
          </div>
        );
      })()}

      {detailedData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 font-mono tracking-widest">NO STATISTICAL BLOCKS EXTRACTED</div>
      ) : (
        <ResponsiveContainer>
          <ComposedChart data={detailedData} margin={{ top: 75, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} fontWeight={800} stroke="#94a3b8" />
            <YAxis yAxisId="left" allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} fontWeight={800} stroke="#6366f1" />
            <YAxis yAxisId="right" orientation="right" allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} fontWeight={800} stroke="#10b981" />
            
            {!activeTag && <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} position={{ y: 0 }} />}
            <Legend content={<CustomLegend formatLabel={(val) => val === 'count' ? 'Daily Count' : val === 'rollingAvg' ? '3-Day Average' : 'Cumulative Total'} colors={{ count: '#6366f1', rollingAvg: '#8b5cf6', cumulative: '#10b981' }} activeTag={activeTag} onActiveTagChange={setActiveTag} />} />
            
            <Area 
              yAxisId="right" 
              type="monotone" 
              name="cumulative" 
              dataKey="cumulative" 
              fill="#d1fae5" 
              stroke="#10b981" 
              strokeWidth={2}
              style={{
                transition: 'all 0.3s ease',
                opacity: (activeTag && activeTag !== 'cumulative') ? 0.2 : 1,
                cursor: 'pointer'
              }}
            />
            <Bar 
              yAxisId="left" 
              name="count" 
              dataKey="count" 
              fill="#818cf8" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
              style={{
                transition: 'all 0.3s ease',
                opacity: (activeTag && activeTag !== 'count') ? 0.2 : 1,
                cursor: 'pointer'
              }}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              name="rollingAvg" 
              dataKey="rollingAvg" 
              stroke="#4f46e5" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} 
              style={{
                transition: 'all 0.3s ease',
                opacity: (activeTag && activeTag !== 'rollingAvg') ? 0.2 : 1,
                cursor: 'pointer'
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
