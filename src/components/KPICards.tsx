import React from 'react';
import { KPISummary } from '../utils/analytics';
import { DollarSign, ShoppingBag, ShoppingCart, Tag, TrendingUp, Layers } from 'lucide-react';

interface KPICardsProps {
  kpis: KPISummary;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const cards = [
    {
      label: 'Gross Revenue',
      value: `$${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: `${kpis.activeDaysCount} active sales days recorded`,
      icon: DollarSign,
    },
    {
      label: 'Total Orders',
      value: kpis.uniqueOrders.toLocaleString(),
      subtext: `${kpis.multiItemOrderCount} multi-item orders (${kpis.multiItemOrderShare.toFixed(1)}%)`,
      icon: ShoppingCart,
    },
    {
      label: 'Units Sold',
      value: kpis.totalUnits.toLocaleString(),
      subtext: `Avg ${(kpis.totalUnits / Math.max(1, kpis.uniqueOrders)).toFixed(2)} units per order`,
      icon: ShoppingBag,
    },
    {
      label: 'Average Order Value',
      value: `$${kpis.averageOrderValue.toFixed(2)}`,
      subtext: `Gross revenue per placed order`,
      icon: TrendingUp,
    },
    {
      label: 'Average Item Price',
      value: `$${kpis.averageItemPrice.toFixed(2)}`,
      subtext: `Across all trouser categories`,
      icon: Tag,
    },
    {
      label: 'Daily Sales Velocity',
      value: `$${kpis.dailyRevenueAverage.toFixed(2)}`,
      subtext: `~${(kpis.totalUnits / Math.max(1, kpis.activeDaysCount)).toFixed(1)} units sold / day`,
      icon: Layers,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-medium text-slate-600">{card.label}</span>
              <Icon className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                {card.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
