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
        className={`w-full min-h-[34px] px-2.5 py-1.5 bg-white border rounded-lg text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-stone-50 border-stone-200'
            : isOpen
            ? 'border-stone-600 ring-1 ring-stone-600 shadow-sm'
            : 'border-stone-300 hover:border-stone-400'
        }`}
      >
        {selectedProduct ? (
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <span className="font-mono font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-sm shrink-0 border border-stone-200">
              {selectedProduct.sku}
            </span>
            <span className="text-stone-800 truncate font-medium flex-1">
              {selectedProduct.name}
            </span>
            {showStock && (
              <span className={`text-sm px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                selectedProduct.currentStock <= (selectedProduct.minStockThreshold || 5)
                  ? 'bg-stone-100 text-stone-800 border border-stone-200'
                  : 'bg-stone-100 text-stone-700'
              }`}>
                Stock: {selectedProduct.currentStock}
              </span>
            )}
          </div>
        ) : (
          <span className="text-stone-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-stone-400" />
            {placeholder}
          </span>
        )}

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-stone-600' : ''}`} />
      </div>

      {/* Search & Results Dropdown */}
      {isOpen && (
        <div className="absolute z-[70] left-0 right-0 top-full mt-1 bg-white border border-stone-300 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-80 min-w-[340px]">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-stone-200 bg-stone-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par SKU, marque, modèle..."
              className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-stone-100 flex-1">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-sm text-stone-500">
                Aucun produit ne correspond à « {searchTerm} »
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = String(p.id) === String(selectedProductId);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectItem(p)}
                    className={`p-2 hover:bg-stone-100/70 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-stone-100 font-semibold' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-sm font-bold text-stone-700 bg-white px-1.5 py-0.2 rounded border border-stone-200">
                          {p.sku}
                        </span>
                        <span className="text-sm text-stone-900 truncate">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-sm text-stone-500 flex items-center gap-2">
                        {p.brand?.name && <span>{p.brand.name}</span>}
                        {p.phoneModel?.name && <span>• {p.phoneModel.name}</span>}
                        {p.color?.name && <span>• {p.color.name}</span>}
                        {p.protectionType && <span>• {p.protectionType}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {showStock && (
                        <span className={`text-sm px-1.5 py-0.5 rounded font-mono font-bold ${
                          p.currentStock <= 0
                            ? 'bg-stone-100 text-stone-700 border border-stone-200'
                            : p.currentStock <= (p.minStockThreshold || 5)
                            ? 'bg-stone-100 text-stone-800 border border-stone-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {p.currentStock} pcs
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-stone-600" />}
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
