import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Box } from 'lucide-react';

export default function ProductSearchSelect({
  products = [],
  selectedProductId,
  onSelect,
  placeholder = 'Rechercher un produit (SKU, nom, marque)...',
  showStock = true,
  disabled = false,
  onOpenChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  // Filter products by search term
  const filteredProducts = products.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    const brand = (p.brand?.name || '').toLowerCase();
    const model = (p.phoneModel?.name || '').toLowerCase();
    const color = (p.color?.name || '').toLowerCase();
    const protection = (p.protectionType || '').toLowerCase();

    return (
      sku.includes(term) ||
      name.includes(term) ||
      brand.includes(term) ||
      model.includes(term) ||
      color.includes(term) ||
      protection.includes(term)
    );
  });

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    onOpenChange?.(true);
    setSearchTerm('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSelectItem = (prod) => {
    onSelect(prod);
    setIsOpen(false);
    onOpenChange?.(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Selected Box / Trigger */}
      <div
        onClick={handleOpen}
        className={`w-full min-h-[34px] px-2.5 py-1.5 bg-white border rounded-md text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200'
            : isOpen
            ? 'border-blue-600 ring-1 ring-blue-600 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {selectedProduct ? (
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] shrink-0 border border-blue-200">
              {selectedProduct.sku}
            </span>
            <span className="text-slate-800 truncate font-medium flex-1">
              {selectedProduct.name}
            </span>
            {showStock && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                selectedProduct.currentStock <= (selectedProduct.minStockThreshold || 5)
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                Stock: {selectedProduct.currentStock}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            {placeholder}
          </span>
        )}

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </div>

      {/* Search & Results Dropdown */}
      {isOpen && (
        <div className="absolute z-[70] left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-80 min-w-[340px]">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par SKU, marque, modèle..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Aucun produit ne correspond à « {searchTerm} »
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = String(p.id) === String(selectedProductId);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectItem(p)}
                    className={`p-2 hover:bg-blue-50/70 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-blue-50 font-semibold' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                          {p.sku}
                        </span>
                        <span className="text-xs text-slate-900 truncate">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        {p.brand?.name && <span>{p.brand.name}</span>}
                        {p.phoneModel?.name && <span>• {p.phoneModel.name}</span>}
                        {p.color?.name && <span>• {p.color.name}</span>}
                        {p.protectionType && <span>• {p.protectionType}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {showStock && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          p.currentStock <= 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : p.currentStock <= (p.minStockThreshold || 5)
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.currentStock} pcs
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
