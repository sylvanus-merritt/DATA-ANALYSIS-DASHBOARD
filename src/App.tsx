import React, { useState, useMemo, useEffect } from 'react';
import {
  OrderItem,
  FilterState,
  DashboardTab,
  PaymentMethod,
} from './types';
import { INITIAL_ORDER_ITEMS } from './data/initialData';
import { calculateKPIs } from './utils/analytics';
import { Header } from './components/Header';
import { GlobalFilters } from './components/GlobalFilters';
import { OverviewView } from './components/OverviewView';
import { ProductsView } from './components/ProductsView';
import { TemporalView } from './components/TemporalView';
import { BasketPaymentView } from './components/BasketPaymentView';
import { CustomChartStudio } from './components/CustomChartStudio';
import { LedgerView } from './components/LedgerView';
import { ImportModal } from './components/ImportModal';

const STORAGE_KEY = 'trousers_dashboard_data_v1';

export default function App() {
  // Load data with localStorage fallback
  const [items, setItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_ORDER_ITEMS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Compute dates and available products
  const { minAvailableDate, maxAvailableDate, availableProducts } = useMemo(() => {
    if (items.length === 0) {
      return {
        minAvailableDate: '2025-08-15',
        maxAvailableDate: '2025-10-07',
        availableProducts: [],
      };
    }
    const dates = items.map((it) => it.date).sort();
    const products = Array.from(new Set(items.map((it) => it.product))).sort();
    return {
      minAvailableDate: dates[0],
      maxAvailableDate: dates[dates.length - 1],
      availableProducts: products,
    };
  }, [items]);

  // Filters state
  const [filters, setFilters] = useState<FilterState>(() => ({
    searchQuery: '',
    dateRange: {
      start: '2025-08-15',
      end: '2025-10-07',
    },
    selectedProducts: [],
    selectedPaymentMethods: [],
    priceRange: [0, 200],
    basketFilter: 'all',
  }));

  // Ensure filter date bounds align with dataset
  useEffect(() => {
    if (items.length > 0) {
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          start: prev.dateRange.start < minAvailableDate ? minAvailableDate : prev.dateRange.start,
          end: prev.dateRange.end > maxAvailableDate ? maxAvailableDate : prev.dateRange.end,
        },
      }));
    }
  }, [minAvailableDate, maxAvailableDate, items.length]);

  // Order count per orderNumber for basketFilter
  const orderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      counts.set(it.orderNumber, (counts.get(it.orderNumber) || 0) + 1);
    }
    return counts;
  }, [items]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      // Date filter
      if (it.date < filters.dateRange.start || it.date > filters.dateRange.end) {
        return false;
      }

      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          it.orderNumber.toLowerCase().includes(q) ||
          it.product.toLowerCase().includes(q) ||
          it.date.toLowerCase().includes(q) ||
          it.paymentMethod.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Products filter
      if (filters.selectedProducts.length > 0) {
        if (!filters.selectedProducts.includes(it.product)) return false;
      }

      // Payment method filter
      if (filters.selectedPaymentMethods.length > 0) {
        if (!filters.selectedPaymentMethods.includes(it.paymentMethod)) return false;
      }

      // Basket type filter
      if (filters.basketFilter !== 'all') {
        const count = orderCounts.get(it.orderNumber) || 1;
        if (filters.basketFilter === 'single-item' && count > 1) return false;
        if (filters.basketFilter === 'multi-item' && count <= 1) return false;
      }

      // Price filter
      if (it.price < filters.priceRange[0] || it.price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [items, filters, orderCounts]);

  // KPIs computed dynamically from filtered items
  const kpis = useMemo(() => calculateKPIs(filteredItems), [filteredItems]);

  // Reset to original data
  const handleResetData = () => {
    if (window.confirm('Reset dataset back to the initial 116 order items?')) {
      setItems(INITIAL_ORDER_ITEMS);
      localStorage.removeItem(STORAGE_KEY);
      setFilters({
        searchQuery: '',
        dateRange: { start: '2025-08-15', end: '2025-10-07' },
        selectedProducts: [],
        selectedPaymentMethods: [],
        priceRange: [0, 200],
        basketFilter: 'all',
      });
    }
  };

  // Import data
  const handleImport = (newItems: OrderItem[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setItems(newItems);
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Product', 'Price', 'Date', 'Payment Method'];
    const rows = filteredItems.map((i) => [
      i.orderNumber,
      `"${i.product}"`,
      `$${i.price.toFixed(2)}`,
      i.date,
      i.paymentMethod,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trousers_sales_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Item
  const handleAddItem = (itemData: Omit<OrderItem, 'id' | 'dayOfWeekIndex'>) => {
    const d = new Date(`${itemData.date}T00:00:00`);
    const dayOfWeekIndex = isNaN(d.getTime()) ? 0 : d.getDay();
    const newItem: OrderItem = {
      ...itemData,
      id: `${itemData.orderNumber}-${Date.now()}`,
      dayOfWeekIndex,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  // Update Item
  const handleUpdateItem = (updated: OrderItem) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Filter drilldown from Overview or Products
  const handleFilterByProduct = (productName: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedProducts: [productName],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalRecords={items.length}
        filteredRecords={filteredItems.length}
        onResetData={handleResetData}
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Global Filter Bar */}
      <GlobalFilters
        filters={filters}
        setFilters={setFilters}
        minAvailableDate={minAvailableDate}
        maxAvailableDate={maxAvailableDate}
        availableProducts={availableProducts}
        totalRecordsCount={items.length}
        filteredRecordsCount={filteredItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            items={filteredItems}
            kpis={kpis}
            onSelectProduct={(name) => {
              handleFilterByProduct(name);
              setActiveTab('products');
            }}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            items={filteredItems}
            allDatasetItems={items}
            onFilterByProduct={handleFilterByProduct}
          />
        )}

        {activeTab === 'temporal' && <TemporalView items={filteredItems} />}

        {activeTab === 'basket-payment' && <BasketPaymentView items={filteredItems} />}

        {activeTab === 'custom-studio' && <CustomChartStudio items={filteredItems} />}

        {activeTab === 'ledger' && (
          <LedgerView
            items={filteredItems}
            allDatasetItems={items}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Trousers & Co. Analytics</span>
            <span>·</span>
            <span>Accurate Sales Ledger & Multi-Dimensional Visualization Suite</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>{items.length} total entries</span>
            <span>·</span>
            <span>12 trouser styles</span>
            <span>·</span>
            <span>4 payment channels</span>
          </div>
        </div>
      </footer>

      {/* Import / Paste CSV Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        onRestoreOriginal={() => {
          setItems(INITIAL_ORDER_ITEMS);
          localStorage.removeItem(STORAGE_KEY);
        }}
      />
    </div>
  );
}
