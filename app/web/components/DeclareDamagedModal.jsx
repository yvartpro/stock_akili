import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import ProductSearchSelect from './ProductSearchSelect.jsx';

export default function DeclareDamagedModal({ isOpen, onClose, product, onSuccess }) {
  const [status, setStatus] = useState('endommage');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // For product selection when no initial product is passed
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProd, setSelectedProd] = useState(product || null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedProd(product || null);
      setQuantity(1);
      setReason('');
      setError('');
      setStatus('endommage');
      setSearchOpened(false);

      if (!product) {
        setLoadingProducts(true);
        api.getProducts()
          .then(data => {
            setAllProducts(data);
            // Default to first product that has stock > 0 if available
            const inStock = data.find(p => p.currentStock > 0);
            setSelectedProd(inStock || data[0] || null);
          })
          .catch(err => setError('Impossible de charger les produits: ' + err.message))
          .finally(() => setLoadingProducts(false));
      }
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const currentActiveProduct = selectedProd || product;
  const isOutOfStock = currentActiveProduct && currentActiveProduct.currentStock <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentActiveProduct) {
      setError('Veuillez sélectionner un article dans la liste.');
      return;
    }

    if (currentActiveProduct.currentStock <= 0) {
      setError('Impossible de déclarer une casse sur un article dont le stock disponible est épuisé (0 unité).');
      return;
    }

    if (!reason.trim()) {
      setError('La justification / description circonstanciée de l\'anomalie est obligatoire.');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('La quantité doit être supérieure ou égale à 1.');
      return;
    }

    if (qty > currentActiveProduct.currentStock) {
      setError(`Quantité excessive : le stock disponible actuel est de ${currentActiveProduct.currentStock} unité(s).`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.declareDamaged({
        productId: currentActiveProduct.id,
        status,
        quantity: qty,
        reason: reason.trim()
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la déclaration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className={`relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col transition-all duration-200 ${
        searchOpened ? 'min-h-[620px]' : 'min-h-[480px]'
      }`}>
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900">Déclarer une Casse / Perte</h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-rose-50 border-b border-rose-100 text-xs text-rose-800 shrink-0">
          <p className="font-semibold mb-0.5">Règle de gestion (Cahier des charges Art. 11) :</p>
          <p className="text-rose-700">
            Les articles déclarés cassés, fêlés ou égarés ne sont <strong>jamais supprimés</strong>. Ils sont décomptés du stock disponible et conservés au registre d'audit.
          </p>
        </div>

        {error && (
          <div className="m-5 mb-0 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* If no preselected product, allow searching and selecting */}
            {!product ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sélectionner l'article concerné *
                </label>
                {loadingProducts ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-slate-500 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    <span>Chargement des articles du stock...</span>
                  </div>
                ) : (
                  <div className={searchOpened ? 'pb-36' : ''}>
                    <ProductSearchSelect
                      products={allProducts}
                      selectedProductId={currentActiveProduct?.id}
                      onSelect={(p) => {
                        setSelectedProd(p);
                        setError('');
                      }}
                      onOpenChange={setSearchOpened}
                      placeholder="Rechercher par SKU, modèle ou nom..."
                    />
                  </div>
                )}
              </div>
            ) : null}

            {currentActiveProduct && (
              <div className={`p-3 rounded-md border text-xs ${
                isOutOfStock 
                  ? 'bg-rose-50/70 border-rose-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-slate-500">Article sélectionné : </span>
                    <span className="font-bold text-slate-900 block mt-0.5">{currentActiveProduct.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                    isOutOfStock
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    Stock: {currentActiveProduct.currentStock} unités
                  </span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>SKU: <code className="font-bold text-blue-700">{currentActiveProduct.sku}</code></span>
                  {currentActiveProduct.phoneModel?.name && <span>Modèle: {currentActiveProduct.phoneModel.name}</span>}
                </div>
                {isOutOfStock && (
                  <p className="mt-2 text-rose-700 font-semibold text-[11px]">
                    ⚠️ Attention : le stock actuel de cet article est de 0 unité. Veuillez sélectionner un article en stock disponible.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nature de l'anomalie *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:border-rose-500 outline-none"
                required
              >
                <option value="endommage">Endommagé (Casse, verre trempé fêlé, choc)</option>
                <option value="perdu">Perdu / Égaré (Manquant inexpliqué)</option>
                <option value="hors_service">Hors Service (Défaut de fabrication usine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantité affectée * {currentActiveProduct ? `(Max disponible: ${currentActiveProduct.currentStock})` : ''}
              </label>
              <input
                type="number"
                min="1"
                max={currentActiveProduct && currentActiveProduct.currentStock > 0 ? currentActiveProduct.currentStock : 9999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isOutOfStock}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 font-mono focus:border-rose-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif circonstancié / Justification obligatoire *
              </label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: 5 verres trempés fissurés suite au déchargement du carton au stock central..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-rose-500 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !currentActiveProduct || isOutOfStock}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Enregistrement en cours...' : 'Valider l\'anomalie'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
