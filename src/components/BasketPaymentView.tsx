import React from 'react';
import { OrderItem } from '../types';
import {
  calculateCrossSellPairs,
  calculatePaymentBreakdown,
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
} from 'recharts';
import { ShoppingCart, CreditCard, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface BasketPaymentViewProps {
  items: OrderItem[];
}

export const BasketPaymentView: React.FC<BasketPaymentViewProps> = ({ items }) => {
  const basketAnalysis = calculateCrossSellPairs(items);
  const paymentAnalysis = calculatePaymentBreakdown(items);

  const basketComparisonData = [
    {
      type: 'Single-Item Orders',
      orders: basketAnalysis.singleItemOrderCount,
      revenue: basketAnalysis.singleItemRevenue,
      aov: basketAnalysis.singleItemAOV,
    },
    {
      type: 'Multi-Item Orders (2+)',
      orders: basketAnalysis.multiItemOrderCount,
      revenue: basketAnalysis.multiItemRevenue,
      aov: basketAnalysis.multiItemAOV,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Basket Size Comparative Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Single-Item Orders
              </span>
              <ShoppingCart className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ${basketAnalysis.singleItemRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {basketAnalysis.singleItemOrderCount} orders placed with exactly 1 product
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Average Order Value:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              ${basketAnalysis.singleItemAOV.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Multi-Item Baskets (Bundles)
              </span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ${basketAnalysis.multiItemRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {basketAnalysis.multiItemOrderCount} orders placed with 2+ items (cross-category)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Average Basket Value:</span>
            <span className="font-mono font-bold text-blue-600 tabular-nums">
              ${basketAnalysis.multiItemAOV.toFixed(2)}{' '}
              <span className="text-slate-500 font-normal">
                (+${(basketAnalysis.multiItemAOV - basketAnalysis.singleItemAOV).toFixed(2)})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Frequently Bought Together (Cross-Sell Pairs) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Cross-Sell & Co-Purchasing Pairs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trouser models that customers frequently purchase together in the same order ticket
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {basketAnalysis.pairs.length} distinct product co-occurrences
          </span>
        </div>

        {basketAnalysis.pairs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No multi-item orders in current filtered view.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            {basketAnalysis.pairs.map((pair, idx) => (
              <div
                key={`${pair.productA}-${pair.productB}`}
                className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    PAIR #{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono text-[11px] rounded font-semibold">
                    {pair.count} orders
                  </span>
                </div>

                <div className="space-y-1 my-1">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>{pair.productA}</span>
                    <span className="text-slate-400">+</span>
                    <span>{pair.productB}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">Combined Ticket Value:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    ${pair.totalPairRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Payment Method Economics & Average Ticket Size */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AOV by Payment Method Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Average Ticket Size by Payment Method
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing average order transaction values across credit, debit, eWallet, and cash
            </p>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentAnalysis} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="paymentMethod"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as (typeof paymentAnalysis)[0];
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono space-y-0.5">
                          <div className="font-semibold text-slate-100">{data.paymentMethod}</div>
                          <div className="text-emerald-400">
                            Avg Ticket: ${data.averageTransaction.toFixed(2)}
                          </div>
                          <div className="text-slate-300">
                            Total Rev: ${data.revenue.toFixed(2)} across {data.orders} orders
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="averageTransaction" fill="#0f172a" radius={[4, 4, 0, 0]}>
                  {paymentAnalysis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.paymentMethod === 'Credit Card'
                          ? '#0f172a'
                          : entry.paymentMethod === 'eWallet'
                          ? '#2563eb'
                          : entry.paymentMethod === 'Debit Card'
                          ? '#0d9488'
                          : '#d97706'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Summary Metrics Table (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Payment Channel Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary metrics per payment method</p>
            </div>

            <div className="divide-y divide-slate-100 text-xs mt-2">
              {paymentAnalysis.map((pm) => (
                <div key={pm.paymentMethod} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{pm.paymentMethod}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {pm.orders} orders · {pm.units} items
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-900 tabular-nums">
                      ${pm.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      ${pm.averageTransaction.toFixed(2)} avg / order
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Digital payment channels (Credit Card, Debit Card, eWallet) comprise{' '}
            <strong>
              {(
                paymentAnalysis
                  .filter((p) => p.paymentMethod !== 'Cash')
                  .reduce((sum, p) => sum + p.revenueShare, 0)
              ).toFixed(1)}
              %
            </strong>{' '}
            of total business revenue.
          </div>
        </div>
      </div>
    </div>
  );
};
