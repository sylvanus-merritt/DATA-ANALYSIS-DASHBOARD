import React, { useState } from 'react';
import {
  OrderItem,
  CustomChartType,
  CustomDimension,
  CustomMetric,
  CustomSort,
} from '../types';
import { aggregateCustom, CustomAggregatedPoint } from '../utils/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Activity,
  Sliders,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';

interface CustomChartStudioProps {
  items: OrderItem[];
}

const PALETTE = [
  '#0f172a',
  '#2563eb',
  '#0d9488',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#059669',
  '#ea580c',
  '#4f46e5',
  '#0891b2',
  '#65a30d',
  '#475569',
];

export const CustomChartStudio: React.FC<CustomChartStudioProps> = ({ items }) => {
  const [chartType, setChartType] = useState<CustomChartType>('bar');
  const [dimension, setDimension] = useState<CustomDimension>('product');
  const [metric, setMetric] = useState<CustomMetric>('revenue');
  const [sort, setSort] = useState<CustomSort>('desc');
  const [topN, setTopN] = useState<number>(0); // 0 means all

  const data: CustomAggregatedPoint[] = aggregateCustom(items, dimension, metric, sort, topN);

  // Quick preset loader
  const applyPreset = (
    cType: CustomChartType,
    dim: CustomDimension,
    met: CustomMetric,
    s: CustomSort,
    n: number = 0
  ) => {
    setChartType(cType);
    setDimension(dim);
    setMetric(met);
    setSort(s);
    setTopN(n);
  };

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const dimensionLabels: Record<CustomDimension, string> = {
    product: 'Trouser Product Model',
    paymentMethod: 'Payment Method',
    dayOfWeek: 'Day of Week',
    weekLabel: 'Calendar Week',
    date: 'Exact Transaction Date',
    priceTier: 'Price Tier Segment',
  };

  const metricLabels: Record<CustomMetric, string> = {
    revenue: 'Total Revenue ($)',
    units: 'Units Sold (Qty)',
    orders: 'Unique Orders',
    avgPrice: 'Average Price / Item ($)',
  };

  return (
    <div className="space-y-6">
      {/* 1. Studio Header & Quick Visualization Presets */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Custom Visualization Studio</h3>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Dynamic Slice & Dice
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize chart types, dimensions, measures, and aggregations to explore data in any configuration.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Presets:</span>
            <button
              onClick={() => applyPreset('bar', 'product', 'revenue', 'desc', 8)}
              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
            >
              Top Products
            </button>
            <button
              onClick={() => applyPreset('donut', 'paymentMethod', 'revenue', 'desc')}
              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
            >
              Payment Mix
            </button>
            <button
              onClick={() => applyPreset('radar', 'dayOfWeek', 'revenue', 'chrono')}
              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
            >
              Day-of-Week Radar
            </button>
            <button
              onClick={() => applyPreset('line', 'weekLabel', 'revenue', 'chrono')}
              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
            >
              Weekly Trend
            </button>
            <button
              onClick={() => applyPreset('horizontal-bar', 'priceTier', 'units', 'desc')}
              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
            >
              Price Tier Volumes
            </button>
          </div>
        </div>

        {/* 2. Interactive Studio Controls Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 text-xs">
          
          {/* Chart Type Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">1. Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as CustomChartType)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="bar">Vertical Bar Chart</option>
              <option value="horizontal-bar">Horizontal Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="donut">Donut Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="radar">Radar / Polar Chart</option>
            </select>
          </div>

          {/* Dimension Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">2. Group By (Dimension)</label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as CustomDimension)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="product">Product Model</option>
              <option value="paymentMethod">Payment Method</option>
              <option value="dayOfWeek">Day of Week</option>
              <option value="weekLabel">Calendar Week</option>
              <option value="priceTier">Price Tier</option>
              <option value="date">Exact Date</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">3. Measure (Metric)</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as CustomMetric)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="revenue">Gross Revenue ($)</option>
              <option value="units">Units Sold (Count)</option>
              <option value="orders">Unique Orders (Count)</option>
              <option value="avgPrice">Average Price ($)</option>
            </select>
          </div>

          {/* Sort Order Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">4. Sort Order</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as CustomSort)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="desc">Highest to Lowest</option>
              <option value="asc">Lowest to Highest</option>
              <option value="alpha">Alphabetical (A–Z)</option>
              <option value="chrono">Chronological / Natural</option>
            </select>
          </div>

          {/* Limit / Top N */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">5. Result Limit</label>
            <select
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="0">All Items ({data.length})</option>
              <option value="5">Top 5 Items</option>
              <option value="8">Top 8 Items</option>
              <option value="10">Top 10 Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Chart Viewport */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-800">
              {metricLabels[metric]} by {dimensionLabels[dimension]}
            </span>
            <div className="text-[11px] text-slate-500 font-mono">
              Displaying {data.length} aggregated bars/slices · Metric Total:{' '}
              {metric === 'revenue' || metric === 'avgPrice'
                ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : `${totalValue.toLocaleString()} total`}
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No matching records for this query.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dimensionLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={dimension === 'product' || dimension === 'date' ? -35 : 0}
                    textAnchor={dimension === 'product' || dimension === 'date' ? 'end' : 'middle'}
                    interval={0}
                    height={dimension === 'product' || dimension === 'date' ? 60 : 30}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => (metric === 'revenue' || metric === 'avgPrice' ? `$${v}` : `${v}`)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CustomAggregatedPoint;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono space-y-0.5">
                            <div className="font-semibold text-slate-100">{item.dimensionLabel}</div>
                            <div className="text-emerald-400">{item.formattedValue}</div>
                            <div className="text-slate-400">
                              {item.revenue > 0 && `Revenue: $${item.revenue.toFixed(2)} · `}
                              {item.units} units · {item.orders} orders
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartType === 'horizontal-bar' ? (
                <BarChart
                  layout="vertical"
                  data={data}
                  margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => (metric === 'revenue' || metric === 'avgPrice' ? `$${v}` : `${v}`)}
                  />
                  <YAxis
                    dataKey="dimensionLabel"
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    width={120}
                    tickFormatter={(val) => (val.length > 18 ? `${val.substring(0, 16)}...` : val)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CustomAggregatedPoint;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono space-y-0.5">
                            <div className="font-semibold text-slate-100">{item.dimensionLabel}</div>
                            <div className="text-emerald-400">{item.formattedValue}</div>
                            <div className="text-slate-400">
                              {item.units} units · {item.orders} orders
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dimensionLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => (metric === 'revenue' || metric === 'avgPrice' ? `$${v}` : `${v}`)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CustomAggregatedPoint;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono">
                            <div className="font-semibold text-slate-100">{item.dimensionLabel}</div>
                            <div className="text-emerald-400">{item.formattedValue}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={{ fill: '#0f172a', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                  <defs>
                    <linearGradient id="customAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dimensionLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => (metric === 'revenue' || metric === 'avgPrice' ? `$${v}` : `${v}`)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CustomAggregatedPoint;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono">
                            <div className="font-semibold text-slate-100">{item.dimensionLabel}</div>
                            <div className="text-emerald-400">{item.formattedValue}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#customAreaGrad)"
                  />
                </AreaChart>
              ) : chartType === 'pie' || chartType === 'donut' ? (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="dimensionLabel"
                    cx="50%"
                    cy="50%"
                    innerRadius={chartType === 'donut' ? 60 : 0}
                    outerRadius={105}
                    paddingAngle={2}
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CustomAggregatedPoint;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono">
                            <div className="font-semibold text-slate-100">{item.dimensionLabel}</div>
                            <div className="text-emerald-400">{item.formattedValue}</div>
                            <div className="text-slate-400">
                              {((item.value / Math.max(1, totalValue)) * 100).toFixed(1)}% share
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              ) : chartType === 'radar' ? (
                <RadarChart cx="50%" cy="50%" outerRadius={95} data={data}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimensionLabel" tick={{ fontSize: 11, fill: '#475569' }} />
                  <PolarRadiusAxis
                    angle={30}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(v) => (metric === 'revenue' ? `$${v}` : `${v}`)}
                  />
                  <Radar
                    name={metricLabels[metric]}
                    dataKey="value"
                    stroke="#0f172a"
                    fill="#0f172a"
                    fillOpacity={0.25}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CustomAggregatedPoint;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono">
                            <div className="font-semibold text-slate-100">{item.dimensionLabel}</div>
                            <div className="text-emerald-400">{item.formattedValue}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              ) : null}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Aggregation Data Table Below Chart */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Aggregated Data Matrix
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            {data.length} grouped rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-semibold">{dimensionLabels[dimension]}</th>
                <th className="px-4 py-2.5 font-semibold text-right">Value</th>
                <th className="px-4 py-2.5 font-semibold text-right">Revenue ($)</th>
                <th className="px-4 py-2.5 font-semibold text-right">Units</th>
                <th className="px-4 py-2.5 font-semibold text-right">Orders</th>
                <th className="px-4 py-2.5 font-semibold text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {data.map((row, idx) => (
                <tr key={row.dimensionKey} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs"
                      style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                    />
                    <span>{row.dimensionLabel}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-slate-900 tabular-nums">
                    {row.formattedValue}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                    ${row.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                    {row.units}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                    {row.orders}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600 tabular-nums">
                    {totalValue > 0 ? ((row.value / totalValue) * 100).toFixed(1) : '0.0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
