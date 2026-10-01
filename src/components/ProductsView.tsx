import React, { useState } from 'react';
import { OrderItem } from '../types';
import { calculateProductPerformance, ProductPerformance } from '../utils/analytics';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { ArrowUpDown, Tag, ShoppingBag, DollarSign, X, ExternalLink } from 'lucide-react';

interface ProductsViewProps {
  items: OrderItem[];
  allDatasetItems: OrderItem[];
  onFilterByProduct: (productName: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  items,
  allDatasetItems,
  onFilterByProduct,
}) => {
  const [sortField, setSortField] = useState<keyof ProductPerformance>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedProductDetail, setSelectedProductDetail] = useState<string | null>(null);

  const productData = calculateProductPerformance(items);

  const handleSort = (field: keyof ProductPerformance) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedProducts = [...productData].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return sortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Price tier aggregation
  const tiers = {
    'Economy (<$70)': { count: 0, revenue: 0, units: 0 },
    'Mid-Tier ($70-$100)': { count: 0, revenue: 0, units: 0 },
    'Premium (>$100)': { count: 0, revenue: 0, units: 0 },
  };

  for (const p of productData) {
    const tier = p.priceTier as keyof typeof tiers;
    if (tiers[tier]) {
      tiers[tier].count++;
      tiers[tier].revenue += p.revenue;
      tiers[tier].units += p.units;
    }
  }

  const tierChartData = Object.entries(tiers).map(([tier, val]) => ({
    tier,
    revenue: val.revenue,
    units: val.units,
    products: val.count,
  }));

  // Detail Modal data if open
  const detailProductItems = selectedProductDetail
    ? allDatasetItems.filter((i) => i.product === selectedProductDetail)
    : [];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Price Tier Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tierChartData.map((t) => (
          <div
            key={t.tier}
            className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{t.tier}</span>
              <Tag className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              ${t.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {t.units} units sold across {t.products} distinct styles
            </div>
          </div>
        ))}
      </div>

      {/* 2. Visual Matrix: Unit Price vs. Units Sold (Scatter Plot with Bubble Size = Revenue) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Price Elasticity & Volume Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizing Unit Price ($) vs Units Sold. Bubble radius represents total gross revenue generated.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {productData.length} trouser models in current selection
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="unitPrice"
                name="Unit Price"
                unit="$"
                domain={[50, 190]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                label={{ value: 'Unit Price ($)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="units"
                name="Units Sold"
                domain={[0, 'dataMax + 2']}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#64748b' }}
              />
              <ZAxis type="number" dataKey="revenue" range={[60, 450]} name="Gross Revenue" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ProductPerformance;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-md shadow-lg text-xs space-y-1">
                        <div className="font-semibold text-slate-100 border-b border-slate-800 pb-1">
                          {data.product}
                        </div>
                        <div className="flex justify-between gap-4 font-mono">
                          <span className="text-slate-400">Unit Price:</span>
                          <span className="text-slate-200">${data.unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono">
                          <span className="text-slate-400">Units Sold:</span>
                          <span className="text-slate-200">{data.units} units</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono">
                          <span className="text-slate-400">Total Revenue:</span>
                          <span className="text-emerald-400 font-semibold">${data.revenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono">
                          <span className="text-slate-400">Revenue Share:</span>
                          <span className="text-slate-300">{data.revenueShare.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Products" data={productData} fill="#0f172a">
                {productData.map((entry, index) => {
                  let color = '#2563eb';
                  if (entry.unitPrice > 100) color = '#0f172a';
                  else if (entry.unitPrice < 70) color = '#d97706';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span>Premium Tier (&gt;$100)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Mid Tier ($70–$100)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Economy Tier (&lt;$70)</span>
            </span>
          </div>
          <span className="italic">Hover over any bubble for product economics</span>
        </div>
      </div>

      {/* 3. Comprehensive Product Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Product Portfolio Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed revenue, volume, and pricing metrics. Click column header to sort; click row for drill-down.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('product')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unitPrice')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Unit Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('units')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Units Sold</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('revenue')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Gross Revenue</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('revenueShare')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Revenue Share</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-left">Price Tier</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProducts.map((p) => (
                <tr
                  key={p.product}
                  onClick={() => setSelectedProductDetail(p.product)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <span className="group-hover:text-blue-600 transition-colors">{p.product}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                    ${p.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums font-semibold">
                    {p.units}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-900 tabular-nums font-bold">
                    ${p.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 font-mono tabular-nums">
                      <span className="w-12 text-slate-600">{p.revenueShare.toFixed(1)}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-900 h-full rounded-full"
                          style={{ width: `${Math.min(100, p.revenueShare * 4)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {p.priceTier}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterByProduct(p.product);
                      }}
                      className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      title="Filter whole dashboard by this product"
                    >
                      Filter Dashboard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Product Detail Modal */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-900">{selectedProductDetail}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order history and transaction breakdown for this product
                </p>
              </div>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                  <div className="text-[11px] text-slate-500">Total Units Sold</div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {detailProductItems.length}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                  <div className="text-[11px] text-slate-500">Unit Catalog Price</div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ${detailProductItems[0]?.price.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                  <div className="text-[11px] text-slate-500">Total Gross Turnover</div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ${(detailProductItems.length * (detailProductItems[0]?.price || 0)).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-700 mb-2">
                  Transactions ({detailProductItems.length} records)
                </h5>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-medium">Order #</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Day</th>
                        <th className="px-3 py-2 font-medium">Payment</th>
                        <th className="px-3 py-2 font-medium text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {detailProductItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-semibold text-slate-900">{item.orderNumber}</td>
                          <td className="px-3 py-1.5 text-slate-600">{item.date}</td>
                          <td className="px-3 py-1.5 text-slate-500">{item.dayOfWeek}</td>
                          <td className="px-3 py-1.5 text-slate-700">{item.paymentMethod}</td>
                          <td className="px-3 py-1.5 text-right text-slate-900 font-bold">
                            ${item.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  onFilterByProduct(selectedProductDetail);
                  setSelectedProductDetail(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
              >
                Apply As Filter to Entire Dashboard
              </button>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
