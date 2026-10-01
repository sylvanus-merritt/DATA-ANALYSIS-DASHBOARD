import React, { useState } from 'react';
import { OrderItem } from '../types';
import {
  calculateDailyTrend,
  calculateDayOfWeekData,
  DayOfWeekData,
  DailyTrendPoint,
} from '../utils/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Calendar as CalendarIcon, Clock, TrendingUp, Sun, Moon } from 'lucide-react';

interface TemporalViewProps {
  items: OrderItem[];
}

export const TemporalView: React.FC<TemporalViewProps> = ({ items }) => {
  const [dayMetric, setDayMetric] = useState<'revenue' | 'orders' | 'units'>('revenue');

  const dailyTrend = calculateDailyTrend(items);
  const dayOfWeekData = calculateDayOfWeekData(items);

  // Group by week for week-over-week analysis
  const weekMap = new Map<string, { week: string; revenue: number; units: number; orders: Set<string> }>();
  for (const it of items) {
    if (!weekMap.has(it.weekLabel)) {
      weekMap.set(it.weekLabel, { week: it.weekLabel, revenue: 0, units: 0, orders: new Set() });
    }
    const curr = weekMap.get(it.weekLabel)!;
    curr.revenue += it.price;
    curr.units += 1;
    curr.orders.add(it.orderNumber);
  }

  const weeklyData = Array.from(weekMap.values()).map((w) => ({
    week: w.week,
    revenue: w.revenue,
    units: w.units,
    orders: w.orders.size,
    aov: w.orders.size > 0 ? w.revenue / w.orders.size : 0,
  }));

  // Weekday vs Weekend aggregation
  let weekdayRev = 0;
  let weekdayUnits = 0;
  let weekendRev = 0;
  let weekendUnits = 0;

  for (const d of dayOfWeekData) {
    if (d.day === 'Saturday' || d.day === 'Sunday') {
      weekendRev += d.revenue;
      weekendUnits += d.units;
    } else {
      weekdayRev += d.revenue;
      weekdayUnits += d.units;
    }
  }

  // Max daily revenue for heatmap normalization
  const maxDayRevenue = Math.max(...dailyTrend.map((d) => d.revenue), 1);

  // Heatmap intensity helper
  const getIntensityClass = (rev: number) => {
    if (rev === 0) return 'bg-slate-100 text-slate-400';
    const ratio = rev / maxDayRevenue;
    if (ratio < 0.25) return 'bg-slate-200 text-slate-700';
    if (ratio < 0.5) return 'bg-slate-400 text-white';
    if (ratio < 0.75) return 'bg-slate-700 text-white';
    return 'bg-slate-900 text-white font-bold';
  };

  return (
    <div className="space-y-6">
      {/* 1. Day of Week Pattern Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Day of Week Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Day-of-Week Purchasing Velocity</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of retail transactions across days of the week
              </p>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
              <button
                onClick={() => setDayMetric('revenue')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                  dayMetric === 'revenue'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revenue ($)
              </button>
              <button
                onClick={() => setDayMetric('orders')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                  dayMetric === 'orders'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setDayMetric('units')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                  dayMetric === 'units'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Units
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortDay"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => (dayMetric === 'revenue' ? `$${val}` : `${val}`)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DayOfWeekData;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono space-y-0.5">
                          <div className="font-semibold text-slate-100">{data.day}</div>
                          <div className="text-emerald-400">Total: ${data.revenue.toFixed(2)}</div>
                          <div className="text-slate-300">
                            {data.orders} orders · {data.units} items
                          </div>
                          <div className="text-slate-400">{data.share.toFixed(1)}% of total revenue</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={dayMetric}
                  fill="#0f172a"
                  radius={[4, 4, 0, 0]}
                >
                  {dayOfWeekData.map((entry) => {
                    const isWeekend = entry.day === 'Saturday' || entry.day === 'Sunday';
                    return <Cell key={entry.day} fill={isWeekend ? '#2563eb' : '#0f172a'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900" />
                <span>Weekdays (Mon–Fri)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                <span>Weekends (Sat–Sun)</span>
              </span>
            </div>
            <span>Peak day: <strong>{dayOfWeekData.reduce((a, b) => (b.revenue > a.revenue ? b : a)).day}</strong></span>
          </div>
        </div>

        {/* Weekday vs Weekend Split & Snapshot (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Weekday vs. Weekend Share
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-800">Weekdays (5 Days)</span>
                  <span className="font-mono text-slate-900 font-semibold tabular-nums">
                    ${weekdayRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-900 h-full rounded-full"
                    style={{ width: `${(weekdayRev / (weekdayRev + weekendRev || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>{weekdayUnits} items sold</span>
                  <span>{((weekdayRev / (weekdayRev + weekendRev || 1)) * 100).toFixed(1)}% share</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-800">Weekends (2 Days)</span>
                  <span className="font-mono text-slate-900 font-semibold tabular-nums">
                    ${weekendRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(weekendRev / (weekdayRev + weekendRev || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>{weekendUnits} items sold</span>
                  <span>{((weekendRev / (weekdayRev + weekendRev || 1)) * 100).toFixed(1)}% share</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div>Weekday avg / day: <strong className="font-mono">${(weekdayRev / 5 / 8).toFixed(2)}</strong></div>
              <div>Weekend avg / day: <strong className="font-mono">${(weekendRev / 2 / 8).toFixed(2)}</strong></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Temporal Insights
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Steady consistent buying velocity across entire 54-day recording window with no zero-volume gaps.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Multi-item orders occur across both weekday professional orders and weekend shopping bursts.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Calendar Density Matrix (Heatmap) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Daily Sales Density Calendar Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Heatmap of all 54 dates (Aug 15 – Oct 7, 2025). Darker blocks represent higher dollar volume.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Low ($0–$100)</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-xs bg-slate-200" />
              <span className="w-3.5 h-3.5 rounded-xs bg-slate-400" />
              <span className="w-3.5 h-3.5 rounded-xs bg-slate-700" />
              <span className="w-3.5 h-3.5 rounded-xs bg-slate-900" />
            </div>
            <span>High (&gt;$300)</span>
          </div>
        </div>

        {/* Heatmap Grid of Days */}
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-2 pt-4">
          {dailyTrend.map((day) => (
            <div
              key={day.date}
              className={`p-2.5 rounded-md border border-slate-200/50 flex flex-col justify-between transition-transform hover:scale-105 cursor-pointer ${getIntensityClass(
                day.revenue
              )}`}
              title={`${day.date} (${day.formattedDate}): $${day.revenue.toFixed(2)} (${day.units} units, ${day.orders} orders)`}
            >
              <div className="text-[10px] uppercase font-mono opacity-80">
                {day.formattedDate}
              </div>
              <div className="text-xs font-mono font-bold mt-1 tabular-nums">
                ${day.revenue.toFixed(0)}
              </div>
              <div className="text-[10px] opacity-75 font-mono">
                {day.units} {day.units === 1 ? 'item' : 'items'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Week-Over-Week Trend */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h3 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100">
          Weekly Run-Rate Comparison
        </h3>

        <div className="h-56 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as (typeof weeklyData)[0];
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono space-y-0.5">
                        <div className="font-semibold text-slate-100">{data.week}</div>
                        <div className="text-emerald-400">Total Revenue: ${data.revenue.toFixed(2)}</div>
                        <div className="text-slate-300">
                          {data.orders} orders · {data.units} items
                        </div>
                        <div className="text-slate-400">Weekly AOV: ${data.aov.toFixed(2)}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
