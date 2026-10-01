import React, { useState } from 'react';
import { FilterState, PaymentMethod } from '../types';
import { Search, RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface GlobalFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  minAvailableDate: string;
  maxAvailableDate: string;
  availableProducts: string[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
}

export const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  filters,
  setFilters,
  minAvailableDate,
  maxAvailableDate,
  availableProducts,
  totalRecordsCount,
  filteredRecordsCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const paymentMethods: PaymentMethod[] = ['Credit Card', 'Debit Card', 'eWallet', 'Cash'];

  const handleDatePreset = (preset: 'all' | 'aug' | 'sep' | 'oct') => {
    switch (preset) {
      case 'all':
        setFilters((prev) => ({
          ...prev,
          dateRange: { start: minAvailableDate, end: maxAvailableDate },
        }));
        break;
      case 'aug':
        setFilters((prev) => ({
          ...prev,
          dateRange: { start: '2025-08-15', end: '2025-08-31' },
        }));
        break;
      case 'sep':
        setFilters((prev) => ({
          ...prev,
          dateRange: { start: '2025-09-01', end: '2025-09-30' },
        }));
        break;
      case 'oct':
        setFilters((prev) => ({
          ...prev,
          dateRange: { start: '2025-10-01', end: '2025-10-07' },
        }));
        break;
    }
  };

  const togglePaymentMethod = (pm: PaymentMethod) => {
    setFilters((prev) => {
      const exists = prev.selectedPaymentMethods.includes(pm);
      if (exists) {
        return {
          ...prev,
          selectedPaymentMethods: prev.selectedPaymentMethods.filter((m) => m !== pm),
        };
      } else {
        return {
          ...prev,
          selectedPaymentMethods: [...prev.selectedPaymentMethods, pm],
        };
      }
    });
  };

  const resetAllFilters = () => {
    setFilters({
      searchQuery: '',
      dateRange: { start: minAvailableDate, end: maxAvailableDate },
      selectedProducts: [],
      selectedPaymentMethods: [],
      priceRange: [0, 200],
      basketFilter: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.dateRange.start !== minAvailableDate ||
    filters.dateRange.end !== maxAvailableDate ||
    filters.selectedProducts.length > 0 ||
    filters.selectedPaymentMethods.length > 0 ||
    filters.basketFilter !== 'all' ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Primary Filter Bar: Search + Quick Payment + Quick Presets + Expand Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, order #, or date..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Date Range Quick Presets & Payment Method Badges */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Date Presets Segmented Control */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
              <button
                onClick={() => handleDatePreset('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                  filters.dateRange.start === minAvailableDate && filters.dateRange.end === maxAvailableDate
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 54 Days
              </button>
              <button
                onClick={() => handleDatePreset('aug')}
                className={`px-2 py-1 text-xs font-medium rounded-sm transition-colors ${
                  filters.dateRange.start === '2025-08-15' && filters.dateRange.end === '2025-08-31'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                August
              </button>
              <button
                onClick={() => handleDatePreset('sep')}
                className={`px-2 py-1 text-xs font-medium rounded-sm transition-colors ${
                  filters.dateRange.start === '2025-09-01' && filters.dateRange.end === '2025-09-30'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                September
              </button>
              <button
                onClick={() => handleDatePreset('oct')}
                className={`px-2 py-1 text-xs font-medium rounded-sm transition-colors ${
                  filters.dateRange.start === '2025-10-01' && filters.dateRange.end === '2025-10-07'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                October
              </button>
            </div>

            {/* Payment Method Filter Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {paymentMethods.map((pm) => {
                const isSelected = filters.selectedPaymentMethods.includes(pm);
                return (
                  <button
                    key={pm}
                    onClick={() => togglePaymentMethod(pm)}
                    className={`px-2 py-1 text-xs font-medium rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>

            {/* Expand / Filter Details Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {/* Reset Filters if active */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                title="Clear all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded Controls Drawer */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Custom Date Range Picker */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5">Custom Date Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  min={minAvailableDate}
                  max={filters.dateRange.end || maxAvailableDate}
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value },
                    }))
                  }
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  min={filters.dateRange.start || minAvailableDate}
                  max={maxAvailableDate}
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value },
                    }))
                  }
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Basket Type Filter */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5">Basket Composition</label>
              <div className="flex items-center gap-1">
                {(['all', 'single-item', 'multi-item'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters((prev) => ({ ...prev, basketFilter: type }))}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      filters.basketFilter === type
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type === 'all'
                      ? 'All Baskets'
                      : type === 'single-item'
                      ? 'Single Item (1)'
                      : 'Multi-Item (2+)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Multiselect quick selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 font-medium">Product Filter</label>
                {filters.selectedProducts.length > 0 && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, selectedProducts: [] }))}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const val = e.target.value;
                  setFilters((prev) => {
                    const exists = prev.selectedProducts.includes(val);
                    return {
                      ...prev,
                      selectedProducts: exists
                        ? prev.selectedProducts.filter((p) => p !== val)
                        : [...prev.selectedProducts, val],
                    };
                  });
                }}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="">
                  {filters.selectedProducts.length === 0
                    ? 'All 12 Products included (Click to filter)'
                    : `${filters.selectedProducts.length} selected - choose to toggle...`}
                </option>
                {availableProducts.map((p) => (
                  <option key={p} value={p}>
                    {filters.selectedProducts.includes(p) ? `✓ ${p}` : p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filter Chips row if filters applied */}
        {hasActiveFilters && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                Search: "{filters.searchQuery}"
                <button
                  onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))}
                  className="hover:text-slate-900"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.dateRange.start !== minAvailableDate || filters.dateRange.end !== maxAvailableDate) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono">
                {filters.dateRange.start} → {filters.dateRange.end}
                <button
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      dateRange: { start: minAvailableDate, end: maxAvailableDate },
                    }))
                  }
                  className="hover:text-slate-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.selectedPaymentMethods.map((pm) => (
              <span
                key={pm}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]"
              >
                {pm}
                <button
                  onClick={() => togglePaymentMethod(pm as PaymentMethod)}
                  className="hover:text-slate-900"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.basketFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                {filters.basketFilter === 'single-item' ? 'Single Items Only' : 'Multi-Item Orders Only'}
                <button
                  onClick={() => setFilters((p) => ({ ...p, basketFilter: 'all' }))}
                  className="hover:text-slate-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.selectedProducts.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]"
              >
                {p}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      selectedProducts: prev.selectedProducts.filter((x) => x !== p),
                    }))
                  }
                  className="hover:text-slate-900"
                >
                  ×
                </button>
              </span>
            ))}
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-500 tabular-nums">
              Showing {filteredRecordsCount} of {totalRecordsCount} records
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
