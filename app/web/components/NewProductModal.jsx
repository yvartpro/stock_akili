import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Check, Smartphone, Shield } from 'lucide-react';
import { api } from '../services/api.js';

export default function NewProductModal({ isOpen, onClose, onProductCreated }) {
  const [category, setCategory] = useState('pochette');
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [protectionType, setProtectionType] = useState('Verre Trempé 9D');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [initialStock, setInitialStock] = useState(50);
  const [minStockThreshold, setMinStockThreshold] = useState(20);
  const [unitCost, setUnitCost] = useState(2.5);
  const [unitPrice, setUnitPrice] = useState(8.0);
  const [notes, setNotes] = useState('');
  
  const [newBrandMode, setNewBrandMode] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelMode, setNewModelMode] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const [brandsData, colorsData] = await Promise.all([
        api.getBrands(),
        api.getColors()
      ]);
      setBrands(brandsData);
      setColors(colorsData);
      if (brandsData.length > 0) {
        setSelectedBrandId(brandsData[0].id);
        if (brandsData[0].models && brandsData[0].models.length > 0) {
          setSelectedModelId(brandsData[0].models[0].id);
        }
      }
      if (colorsData.length > 0) {
        setSelectedColorId(colorsData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedBrand = brands.find(b => String(b.id) === String(selectedBrandId));
  const availableModels = selectedBrand?.models || [];

  // Update selected model when brand changes
  const handleBrandChange = (brandId) => {
    setSelectedBrandId(brandId);
    const b = brands.find(item => String(item.id) === String(brandId));
    if (b && b.models && b.models.length > 0) {
      setSelectedModelId(b.models[0].id);
    } else {
      setSelectedModelId('');
    }
  };

  // Auto-generate name and SKU suggestions
  useEffect(() => {
    const brand = brands.find(b => String(b.id) === String(selectedBrandId));
    const model = availableModels.find(m => String(m.id) === String(selectedModelId));
    const color = colors.find(c => String(c.id) === String(selectedColorId));

    if (brand && model && color) {
      const brandClean = brand.name.replace(/\s+/g, '');
      const modelClean = model.name.replace(/\s+/g, '').replace('iPhone', 'IP').replace('Galaxy', 'S');
      const colorClean = color.name.split(' ')[0].toUpperCase();

      if (category === 'pochette') {
        setName(`Pochette Silicone MagSafe ${model.name} ${color.name}`);
        setSku(`POCH-${modelClean}-${colorClean}`.toUpperCase());
      } else {
        setName(`${protectionType} ${model.name}`);
        const typeShort = protectionType.includes('9D') ? '9D' : protectionType.includes('Hydrogel') ? 'HYDR' : 'PROT';
        setSku(`PROT-${modelClean}-${typeShort}`.toUpperCase());
      }
    }
  }, [category, selectedBrandId, selectedModelId, selectedColorId, protectionType, brands, colors]);

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName) return;
    try {
      const created = await api.createBrand({ name: newBrandName });
      setBrands([...brands, { ...created, models: [] }]);
      setSelectedBrandId(created.id);
      setNewBrandName('');
      setNewBrandMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();
    if (!newModelName || !selectedBrandId) return;
    try {
      const created = await api.createModel({ name: newModelName, brandId: selectedBrandId });
      const updatedBrands = brands.map(b => {
        if (String(b.id) === String(selectedBrandId)) {
          return { ...b, models: [...(b.models || []), created] };
        }
        return b;
      });
      setBrands(updatedBrands);
      setSelectedModelId(created.id);
      setNewModelName('');
      setNewModelMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createProduct({
        name,
        sku,
        category,
        brandId: selectedBrandId,
        modelId: selectedModelId,
        colorId: selectedColorId,
        protectionType: category === 'protection' ? protectionType : null,
        initialStock: Number(initialStock),
        minStockThreshold: Number(minStockThreshold),
        unitCost: Number(unitCost),
        unitPrice: Number(unitPrice),
        notes
      });

      onProductCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-sky-50">
          <div>
            <h3 className="font-bold text-base text-stone-900">Nouveau Produit au Stock Principal</h3>
            <p className="text-sm text-stone-500">Enregistrement d'une référence unitaire (Pochette ou Protection)</p>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-stone-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Toggle */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
              Type d'article géré
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('pochette')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border font-semibold text-sm transition-colors cursor-pointer ${
                  category === 'pochette'
                    ? 'bg-stone-100 text-stone-700 border-stone-300'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-sky-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-stone-600" />
                Pochette de téléphone
              </button>
              <button
                type="button"
                onClick={() => setCategory('protection')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border font-semibold text-sm transition-colors cursor-pointer ${
                  category === 'protection'
                    ? 'bg-stone-100 text-stone-700 border-stone-300'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-sky-50'
                }`}
              >
                <Shield className="w-4 h-4 text-stone-600" />
                Protection anti-casse
              </button>
            </div>
          </div>

          {/* Marque & Modèle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-stone-700">Marque de téléphone *</label>
                <button
                  type="button"
                  onClick={() => setNewBrandMode(!newBrandMode)}
                  className="text-sm text-stone-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  {newBrandMode ? 'Annuler' : 'Ajouter marque'}
                </button>
              </div>
              {newBrandMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: OnePlus"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleCreateBrand}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <select
                  value={selectedBrandId}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:border-sky-500 outline-none"
                  required
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-stone-700">Modèle de téléphone *</label>
                <button
                  type="button"
                  onClick={() => setNewModelMode(!newModelMode)}
                  className="text-sm text-stone-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  {newModelMode ? 'Annuler' : 'Ajouter modèle'}
                </button>
              </div>
              {newModelMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: iPhone 16 Plus"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleCreateModel}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:border-sky-500 outline-none"
                  required
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Couleur & Protection Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Couleur du produit *</label>
              <select
                value={selectedColorId}
                onChange={(e) => setSelectedColorId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:border-sky-500 outline-none"
                required
              >
                {colors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {category === 'protection' ? (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Type de protection anti-casse *</label>
                <select
                  value={protectionType}
                  onChange={(e) => setProtectionType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:border-sky-500 outline-none"
                  required
                >
                  <option value="Verre Trempé 9D">Verre Trempé 9D Bords Incurvés</option>
                  <option value="Film Hydrogel Ultra">Film Hydrogel Auto-Cicatrisant</option>
                  <option value="Céramique Mat">Céramique Incassable Mate</option>
                  <option value="Privacy Anti-Espion">Filtre Privacy Anti-Espion</option>
                  <option value="Protection Caméra">Protection Lentilles Caméra</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Code SKU (Unique dans le stock)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:border-sky-500 outline-none"
                  required
                />
              </div>
            )}
          </div>

          {category === 'protection' && (
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Code SKU (Unique dans le stock)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:border-sky-500 outline-none"
                required
              />
            </div>
          )}

          {/* Designation */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">Désignation commerciale complète</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
              required
            />
          </div>

          {/* Stocks & Seuil */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Stock Initial</label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Seuil Alerte Min</label>
              <input
                type="number"
                min="1"
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Coût Achat (FC)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Prix Cession (FC)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              {loading ? 'Création...' : 'Enregistrer le Produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
