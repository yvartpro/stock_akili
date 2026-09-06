import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  Plus,
  Smartphone,
  Shield,
  Edit2,
  AlertOctagon,
  Copy,
  Check,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import NewProductModal from '../components/NewProductModal.jsx';
import DeclareDamagedModal from '../components/DeclareDamagedModal.jsx';

export default function StockManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('lowStock') === 'true');

  // Modals
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [damagedModalOpen, setDamagedModalOpen] = useState(false);
  const [selectedProductForDamaged, setSelectedProductForDamaged] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const [copiedSku, setCopiedSku] = useState(null);

  useEffect(() => {
    loadProducts();
    loadBrands();
  }, [categoryFilter, brandFilter, statusFilter, lowStockOnly]);

  const loadBrands = async () => {
    try {
      const data = await api.getBrands();
      setBrands(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (brandFilter) params.brandId = brandFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (lowStockOnly) params.lowStock = 'true';

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  const handleQuickSaveEdit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      await api.updateProduct(editProduct.id, {
        minStockThreshold: editProduct.minStockThreshold,
        unitCost: editProduct.unitCost,
        unitPrice: editProduct.unitPrice,
        notes: editProduct.notes
      });
      setEditProduct(null);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // Client-side text filter
  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.sku.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.brand?.name?.toLowerCase().includes(term) ||
      p.phoneModel?.name?.toLowerCase().includes(term) ||
      p.color?.name?.toLowerCase().includes(term) ||
      (p.protectionType && p.protectionType.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Stock Principal des Articles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catalogue unitaire : Pochettes de téléphones & Protections anti-casse
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter Référence
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par SKU, modèle, couleur, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                categoryFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({products.length})
            </button>
            <button
              onClick={() => setCategoryFilter('pochette')}
              className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                categoryFilter === 'pochette' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Pochettes
            </button>
            <button
              onClick={() => setCategoryFilter('protection')}
              className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                categoryFilter === 'protection' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Protections Anti-casse
            </button>
          </div>

          {/* Brand select */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:border-blue-600 outline-none"
          >
            <option value="">Toutes Marques</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Low stock alert toggle */}
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              lowStockOnly
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Stock Faible Uniquement
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="rounded-md bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">SKU / Code Unique</th>
                <th className="p-3.5">Désignation & Catégorie</th>
                <th className="p-3.5">Marque & Modèle</th>
                <th className="p-3.5">Couleur / Spécificité</th>
                <th className="p-3.5 text-center">Niveau de Stock</th>
                <th className="p-3.5 text-center">Seuil Min</th>
                <th className="p-3.5 text-right">Prix Cession</th>
                <th className="p-3.5 text-center">Statut (Art. 11)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Chargement des articles...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center">
                    <p className="text-slate-800 font-medium">Aucun article ne correspond aux critères de recherche.</p>
                    <p className="text-slate-500 text-[11px] mt-1">Modifiez vos filtres ou créez une nouvelle référence.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.currentStock <= product.minStockThreshold;
                  const isPochette = product.category === 'pochette';

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-slate-50 transition-colors ${
                        product.status !== 'disponible' ? 'opacity-70 bg-rose-50/50' : ''
                      }`}
                    >
                      {/* SKU */}
                      <td className="p-3.5 font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{product.sku}</span>
                          <button
                            onClick={() => handleCopy(product.sku)}
                            title="Copier SKU"
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            {copiedSku === product.sku ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wide border ${
                            isPochette 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {isPochette ? 'Pochette' : 'Protection'}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                      </td>

                      {/* Brand & Model */}
                      <td className="p-3.5 text-slate-700 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{product.brand?.name}</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span>{product.phoneModel?.name}</span>
                      </td>

                      {/* Color / Variant */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {product.color?.hexCode && (
                            <span 
                              className="w-3 h-3 rounded-full border border-slate-300 shrink-0" 
                              style={{ backgroundColor: product.color.hexCode }}
                            />
                          )}
                          <span className="text-slate-700 truncate max-w-[120px]">
                            {product.color?.name || '-'}
                          </span>
                        </div>
                        {product.protectionType && (
                          <span className="text-[10px] text-purple-700 font-medium block mt-0.5">
                            {product.protectionType}
                          </span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            product.currentStock === 0 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : isLow 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {product.currentStock} pcs
                          </span>
                          {isLow && product.currentStock > 0 && (
                            <span className="text-[9px] text-amber-700 font-bold tracking-tight mt-0.5">
                              Stock Faible
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="p-3.5 text-center font-mono text-slate-600 text-xs">
                        {product.minStockThreshold}
                      </td>

                      {/* Price */}
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-900">
                        {product.unitPrice ? `${Math.round(product.unitPrice).toLocaleString('fr-FR')} FC` : '-'}
                      </td>

                      {/* Status (Article 11) */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          product.status === 'disponible' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : product.status === 'endommage' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {product.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditProduct(product)}
                            title="Modifier paramètres de stock"
                            className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProductForDamaged(product);
                              setDamagedModalOpen(true);
                            }}
                            title="Déclarer casse / anomalie (Art. 11)"
                            className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-md p-6 shadow-lg">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Paramètres Produit : {editProduct.sku}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{editProduct.name}</p>

            <form onSubmit={handleQuickSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seuil Minimum d'Alerte Réapprovisionnement
                </label>
                <input
                  type="number"
                  min="1"
                  value={editProduct.minStockThreshold}
                  onChange={(e) => setEditProduct({ ...editProduct, minStockThreshold: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Coût Achat (FC)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editProduct.unitCost}
                    onChange={(e) => setEditProduct({ ...editProduct, unitCost: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Prix Cession (FC)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editProduct.unitPrice}
                    onChange={(e) => setEditProduct({ ...editProduct, unitPrice: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes / Emplacement en rayon</label>
                <input
                  type="text"
                  placeholder="Ex: Allée B - Bac 12"
                  value={editProduct.notes || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs"
                >
                  Mettre à Jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      <NewProductModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onProductCreated={loadProducts}
      />

      {/* Declare Damaged Modal */}
      <DeclareDamagedModal
        isOpen={damagedModalOpen}
        onClose={() => setDamagedModalOpen(false)}
        product={selectedProductForDamaged}
        onSuccess={loadProducts}
      />
    </div>
  );
}
