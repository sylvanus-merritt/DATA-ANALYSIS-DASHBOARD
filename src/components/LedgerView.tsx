import React, { useState } from 'react';
import { OrderItem, PaymentMethod } from '../types';
import {
  ArrowUpDown,
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  Layers,
  Check,
} from 'lucide-react';

interface LedgerViewProps {
  items: OrderItem[];
  allDatasetItems: OrderItem[];
  onAddItem: (item: Omit<OrderItem, 'id' | 'dayOfWeekIndex'>) => void;
  onUpdateItem: (item: OrderItem) => void;
  onDeleteItem: (id: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  items,
  allDatasetItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [tableSearch, setTableSearch] = useState('');
  const [sortCol, setSortCol] = useState<keyof OrderItem>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [inspectOrderNumber, setInspectOrderNumber] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

  // New item form state
  const [newOrderNum, setNewOrderNum] = useState(`TT-${1100 + items.length}`);
  const [newProduct, setNewProduct] = useState('Slim-Fit Denim Jeans');
  const [newPrice, setNewPrice] = useState('88.00');
  const [newDate, setNewDate] = useState('2025-10-08');
  const [newPayment, setNewPayment] = useState<PaymentMethod>('Credit Card');

  // Filter items by local table search
  const filteredRows = items.filter((it) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      it.orderNumber.toLowerCase().includes(q) ||
      it.product.toLowerCase().includes(q) ||
      it.date.toLowerCase().includes(q) ||
      it.paymentMethod.toLowerCase().includes(q)
    );
  });

  // Sort
  const sortedRows = [...filteredRows].sort((a, b) => {
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = pageSize === 0 ? 1 : Math.ceil(sortedRows.length / pageSize);
  const paginatedRows =
    pageSize === 0
      ? sortedRows
      : sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (col: keyof OrderItem) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice) || 0;
    const d = new Date(`${newDate}T00:00:00`);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = isNaN(d.getTime()) ? 'Unknown' : dayNames[d.getDay()];

    let priceTier: OrderItem['priceTier'] = 'Mid-Tier ($70-$100)';
    if (priceNum < 70) priceTier = 'Economy (<$70)';
    else if (priceNum > 100) priceTier = 'Premium (>$100)';

    const monthShort = d.toLocaleString('en-US', { month: 'short' });
    const weekLabel = `${monthShort} W${Math.ceil(d.getDate() / 7)}`;

    onAddItem({
      orderNumber: newOrderNum,
      product: newProduct,
      price: priceNum,
      date: newDate,
      paymentMethod: newPayment,
      dayOfWeek,
      weekLabel,
      priceTier,
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateItem(editingItem);
    setEditingItem(null);
  };

  // Inspect order items
  const inspectedOrderItems = inspectOrderNumber
    ? allDatasetItems.filter((i) => i.orderNumber === inspectOrderNumber)
    : [];

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredRows.length} matching rows
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono"
            >
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
              <option value="0">All rows</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 2. Main Ledger Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => handleSort('orderNumber')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Order #</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('product')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Product</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold">Day of Week</th>
                <th
                  onClick={() => handleSort('paymentMethod')}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Payment Method</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold">Price Tier</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No order items found matching search filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      <button
                        onClick={() => setInspectOrderNumber(it.orderNumber)}
                        className="hover:underline hover:text-blue-600 transition-colors"
                        title="Click to inspect complete order ticket"
                      >
                        {it.orderNumber}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 font-sans font-medium text-slate-800">
                      {it.product}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">
                      ${it.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">{it.date}</td>
                    <td className="px-4 py-2.5 font-sans text-slate-600 text-[11px]">
                      {it.dayOfWeek}
                    </td>
                    <td className="px-4 py-2.5 font-sans">
                      <span className="text-slate-700">{it.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-500 text-[11px]">
                      {it.priceTier}
                    </td>
                    <td className="px-4 py-2.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectOrderNumber(it.orderNumber)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Inspect Order"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingItem(it)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit Row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete order item ${it.orderNumber} - ${it.product}?`)) {
                              onDeleteItem(it.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pageSize > 0 && totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {currentPage} of {totalPages} ({sortedRows.length} total rows)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Order Ticket Modal */}
      {inspectOrderNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-semibold font-mono text-slate-900">
                  Order Ticket: {inspectOrderNumber}
                </h4>
              </div>
              <button
                onClick={() => setInspectOrderNumber(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between text-xs text-slate-500 font-mono pb-2 border-b border-slate-100">
                <span>Date: {inspectedOrderItems[0]?.date}</span>
                <span>Payment: {inspectedOrderItems[0]?.paymentMethod}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">
                  Line Items ({inspectedOrderItems.length})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-md">
                  {inspectedOrderItems.map((item, idx) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 font-mono mr-2">{idx + 1}.</span>
                        <span className="font-medium text-slate-900">{item.product}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Order Gross Total:</span>
                <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                  $
                  {inspectedOrderItems
                    .reduce((sum, it) => sum + it.price, 0)
                    .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setInspectOrderNumber(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-900">Add Order Transaction</h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Order Number</label>
                <input
                  type="text"
                  required
                  value={newOrderNum}
                  onChange={(e) => setNewOrderNum(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Product</label>
                <select
                  value={newProduct}
                  onChange={(e) => {
                    setNewProduct(e.target.value);
                    // Autofill catalog price
                    const catalogPrices: Record<string, string> = {
                      'Slim-Fit Denim Jeans': '88.00',
                      'Technical Performance Joggers': '75.00',
                      'Classic Fit Chinos': '78.00',
                      'Flannel-Lined Canvas Work Pants': '98.00',
                      'Double-Pleated Khaki Trousers': '82.00',
                      'Relaxed Fit Corduroy Trousers': '85.00',
                      'Multi-Pocket Cargo Shorts': '58.00',
                      'Premium Tailored Trousers': '175.00',
                      'Classic Denim Overalls': '115.00',
                      'Drawstring Linen Trousers': '92.00',
                      'Tailored Wool Dress Trousers': '145.00',
                      'Striped Seersucker Trousers': '95.00',
                    };
                    if (catalogPrices[e.target.value]) {
                      setNewPrice(catalogPrices[e.target.value]);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-medium"
                >
                  <option value="Slim-Fit Denim Jeans">Slim-Fit Denim Jeans ($88.00)</option>
                  <option value="Technical Performance Joggers">Technical Performance Joggers ($75.00)</option>
                  <option value="Classic Fit Chinos">Classic Fit Chinos ($78.00)</option>
                  <option value="Flannel-Lined Canvas Work Pants">Flannel-Lined Canvas Work Pants ($98.00)</option>
                  <option value="Double-Pleated Khaki Trousers">Double-Pleated Khaki Trousers ($82.00)</option>
                  <option value="Relaxed Fit Corduroy Trousers">Relaxed Fit Corduroy Trousers ($85.00)</option>
                  <option value="Multi-Pocket Cargo Shorts">Multi-Pocket Cargo Shorts ($58.00)</option>
                  <option value="Premium Tailored Trousers">Premium Tailored Trousers ($175.00)</option>
                  <option value="Classic Denim Overalls">Classic Denim Overalls ($115.00)</option>
                  <option value="Drawstring Linen Trousers">Drawstring Linen Trousers ($92.00)</option>
                  <option value="Tailored Wool Dress Trousers">Tailored Wool Dress Trousers ($145.00)</option>
                  <option value="Striped Seersucker Trousers">Striped Seersucker Trousers ($95.00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Method</label>
                <select
                  value={newPayment}
                  onChange={(e) => setNewPayment(e.target.value as PaymentMethod)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="eWallet">eWallet</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-900">
                Edit Record: {editingItem.orderNumber}
              </h4>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Product</label>
                <input
                  type="text"
                  required
                  value={editingItem.product}
                  onChange={(e) => setEditingItem({ ...editingItem, product: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingItem.date}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Method</label>
                <select
                  value={editingItem.paymentMethod}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="eWallet">eWallet</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800"
              >
                Update Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
