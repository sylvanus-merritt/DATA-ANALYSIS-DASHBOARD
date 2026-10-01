import React, { useState } from 'react';
import { OrderItem } from '../types';
import {
  KPISummary,
  calculateDailyTrend,
  calculatePaymentBreakdown,
  calculateProductPerformance,
} from '../utils/analytics';
import { KPICards } from './KPICards';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { ArrowUpRight, TrendingUp, CreditCard, Award, Calendar } from 'lucide-react';

interface OverviewViewProps {
  items: OrderItem[];
  kpis: KPISummary;
  onSelectProduct: (productName: string) => void;
}

const PAYMENT_COLORS = {
  'Credit Card': '#0f172a', // Deep Slate
  'eWallet': '#2563eb',     // Royal Blue
  'Debit Card': '#0d9488',  // Teal
  'Cash': '#d97706',        // Amber
};

export const OverviewView: React.FC<OverviewViewProps> = ({ items, kpis, onSelectProduct }) => {
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'rolling' | 'cumulative' | 'units'>('revenue');

  const dailyTrend = calculateDailyTrend(items);
  const paymentBreakdown = calculatePaymentBreakdown(items);
  const productPerformance = calculateProductPerformance(items);

  // Highest revenue day calculation
  const highestDay = dailyTrend.reduce(
    (max, curr) => (curr.revenue > max.revenue ? curr : max),
    { date: 'N/A', revenue: 0, units: 0, orders: 0, formattedDate: 'N/A' }
  );

  return (
    <div className="space-y-6">
      {/* 1. Key Metrics Strip */}
      <KPICards kpis={kpis} />

      {/* 2. Main Revenue & Volume Timeline Chart */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Revenue & Volume Cadence</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily sales dynamics across the 54-day recording period (Aug 15 – Oct 07, 2025)
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md self-start sm:self-auto">
            <button
              onClick={() => setTrendMetric('revenue')}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                trendMetric === 'revenue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Revenue
            </button>
            <button
              onClick={() => setTrendMetric('rolling')}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                trendMetric === 'rolling'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Rolling Avg
            </button>
            <button
              onClick={() => setTrendMetric('cumulative')}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                trendMetric === 'cumulative'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cumulative Growth
            </button>
            <button
              onClick={() => setTrendMetric('units')}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                trendMetric === 'units'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Units Sold
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-72 w-full pt-4">
          {dailyTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No data points match current filter criteria.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="rollingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) =>
                    trendMetric === 'units' ? `${val}` : `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-md shadow-lg text-xs space-y-1">
                          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
                            {data.formattedDate} ({data.date})
                          </div>
                          <div className="flex justify-between gap-4 font-mono">
                            <span className="text-slate-400">Day Revenue:</span>
                            <span className="font-semibold text-emerald-400">${data.revenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4 font-mono">
                            <span className="text-slate-400">7d Rolling Avg:</span>
                            <span>${data.rollingAvgRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4 font-mono">
                            <span className="text-slate-400">Units / Orders:</span>
                            <span>
                              {data.units} units · {data.orders} orders
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 font-mono">
                            <span className="text-slate-400">Cumulative:</span>
                            <span>${data.cumulativeRevenue.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {trendMetric === 'revenue' && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                )}
                {trendMetric === 'rolling' && (
                  <Area
                    type="monotone"
                    dataKey="rollingAvgRevenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rollingGradient)"
                  />
                )}
                {trendMetric === 'cumulative' && (
                  <Area
                    type="monotone"
                    dataKey="cumulativeRevenue"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={0.15}
                    fill="#0d9488"
                  />
                )}
                {trendMetric === 'units' && (
                  <Area
                    type="stepAfter"
                    dataKey="units"
                    stroke="#d97706"
                    strokeWidth={2}
                    fillOpacity={0.15}
                    fill="#d97706"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Footer Stats */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500">Peak Daily Volume:</span>
            <div className="font-mono font-semibold text-slate-800 tabular-nums">
              ${highestDay.revenue.toFixed(2)}{' '}
              <span className="font-normal text-slate-500">({highestDay.formattedDate})</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500">Daily Average:</span>
            <div className="font-mono font-semibold text-slate-800 tabular-nums">
              ${kpis.dailyRevenueAverage.toFixed(2)} / day
            </div>
          </div>
          <div>
            <span className="text-slate-500">Active Selling Window:</span>
            <div className="font-mono font-semibold text-slate-800 tabular-nums">
              {kpis.activeDaysCount} distinct transaction dates
            </div>
          </div>
          <div>
            <span className="text-slate-500">Avg Basket Revenue:</span>
            <div className="font-mono font-semibold text-slate-800 tabular-nums">
              ${kpis.averageOrderValue.toFixed(2)} per ticket
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Analytics: Payment Method Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Payment Channel Mix</h3>
                <p className="text-xs text-slate-500 mt-0.5">Share of gross revenue & transaction count</p>
              </div>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>

            {/* Donut Chart */}
            <div className="h-48 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="revenue"
                    nameKey="paymentMethod"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {paymentBreakdown.map((entry) => (
                      <Cell
                        key={entry.paymentMethod}
                        fill={PAYMENT_COLORS[entry.paymentMethod as keyof typeof PAYMENT_COLORS] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as (typeof paymentBreakdown)[0];
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono">
                            <div className="font-semibold text-slate-200">{data.paymentMethod}</div>
                            <div className="text-emerald-400">${data.revenue.toFixed(2)}</div>
                            <div className="text-slate-400">
                              {data.revenueShare.toFixed(1)}% share · {data.units} items
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Structured Table */}
            <div className="divide-y divide-slate-100 text-xs">
              {paymentBreakdown.map((pm) => {
                const color = PAYMENT_COLORS[pm.paymentMethod as keyof typeof PAYMENT_COLORS] || '#64748b';
                return (
                  <div key={pm.paymentMethod} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium text-slate-700">{pm.paymentMethod}</span>
                      <span className="text-slate-400 font-mono">({pm.units} items)</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        ${pm.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-500 ml-2 tabular-nums">
                        ({pm.revenueShare.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Primary channel: <strong>{kpis.topPaymentMethod.method}</strong></span>
            <span>{kpis.topPaymentMethod.share.toFixed(1)}% of total turnover</span>
          </div>
        </div>

        {/* Product Revenue Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Product Revenue Contribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Top performing products ranked by total revenue</p>
              </div>
              <Award className="w-4 h-4 text-slate-400" />
            </div>

            {/* Horizontal Bar Chart for Top 6 */}
            <div className="h-52 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={productPerformance.slice(0, 6)}
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `$${val}`}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    dataKey="product"
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    width={130}
                    tickFormatter={(val) => (val.length > 18 ? `${val.substring(0, 16)}...` : val)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as (typeof productPerformance)[0];
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono space-y-0.5">
                            <div className="font-semibold text-slate-100">{data.product}</div>
                            <div className="text-emerald-400">Total Rev: ${data.revenue.toFixed(2)}</div>
                            <div className="text-slate-300">
                              {data.units} units sold @ ${data.unitPrice.toFixed(2)} each
                            </div>
                            <div className="text-slate-400">{data.revenueShare.toFixed(1)}% of total sales</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 3 Quick Links */}
            <div className="space-y-1.5 mt-2">
              {productPerformance.slice(0, 3).map((prod, idx) => (
                <div
                  key={prod.product}
                  onClick={() => onSelectProduct(prod.product)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors group text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-4 text-center">{idx + 1}.</span>
                    <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                      {prod.product}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">${prod.unitPrice}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500 tabular-nums">{prod.units} units</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      ${prod.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>
              Top product: <strong>{kpis.topProductByRevenue.name}</strong> (${kpis.topProductByRevenue.revenue.toFixed(0)})
            </span>
            <span className="text-slate-600">Click any product to filter drilldown</span>
          </div>
        </div>
      </div>
    </div>
  );
};
