import React, { useState } from 'react';
import { parseCSV, RAW_CSV_DATA } from '../data/initialData';
import { OrderItem } from '../types';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newItems: OrderItem[], mode: 'replace' | 'append') => void;
  onRestoreOriginal: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onRestoreOriginal,
}) => {
  const [csvText, setCsvText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<OrderItem[] | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setCsvText(text);
    setErrorMsg(null);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }

    try {
      const items = parseCSV(text);
      if (items.length === 0) {
        setErrorMsg('Could not find valid rows. Expected columns: Order Number, Product, Price, Date, Payment Method');
        setParsedPreview(null);
      } else {
        setParsedPreview(items);
      }
    } catch (err) {
      setErrorMsg('Failed to parse CSV format.');
      setParsedPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    onImport(parsedPreview, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">Import CSV Sales Data</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-700">Paste CSV or Upload File</label>
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                Browse file...
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={6}
              placeholder={`Order Number,Product,Price,Date,Payment Method\nTT-1001,Slim-Fit Denim Jeans,$88.00,2025-08-15,Credit Card...`}
              value={csvText}
              onChange={(e) => handleParse(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-[11px] focus:bg-white focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Expected header: <code className="text-slate-700">Order Number,Product,Price,Date,Payment Method</code>
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedPreview && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-emerald-800 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Successfully parsed {parsedPreview.length} order items!</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono">
                Total Value: ${parsedPreview.reduce((s, it) => s + it.price, 0).toLocaleString()} across{' '}
                {new Set(parsedPreview.map((it) => it.orderNumber)).size} unique orders
              </div>
            </div>
          )}

          {/* Import Mode Selection */}
          <div>
            <label className="font-medium text-slate-700 block mb-1.5">Action Strategy</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`flex-1 p-2 rounded border text-left transition-colors ${
                  importMode === 'replace'
                    ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>Replace Existing Data</div>
                <div className="text-[10px] text-slate-500 font-normal">
                  Overwrites dashboard with the new imported dataset
                </div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`flex-1 p-2 rounded border text-left transition-colors ${
                  importMode === 'append'
                    ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>Append to Existing Data</div>
                <div className="text-[10px] text-slate-500 font-normal">
                  Adds new rows to current dataset
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onRestoreOriginal();
              onClose();
            }}
            className="text-slate-500 hover:text-slate-800"
          >
            Restore Default Dataset
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!parsedPreview || parsedPreview.length === 0}
              onClick={handleSubmit}
              className="px-3.5 py-1.5 font-medium text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-40"
            >
              Apply Imported Data ({parsedPreview?.length || 0})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
