import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  Settings,
  Tag,
  Smartphone,
  Palette,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';

const TABS = [
  { id: 'brands', label: 'Marques & Modèles', icon: Smartphone },
  { id: 'colors', label: 'Couleurs', icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('brands');
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBrandId, setExpandedBrandId] = useState(null);

  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelBrandId, setModelBrandId] = useState('');
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#64748b');

  const [submitting, setSubmitting] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [brandsData, colorsData] = await Promise.all([
        api.getBrands(),
        api.getColors(),
      ]);
      setBrands(brandsData);
      setColors(colorsData);
      if (brandsData.length > 0 && !modelBrandId) {
        setModelBrandId(String(brandsData[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setSubmitting('brand');
    setError('');
    try {
      const created = await api.createBrand({ name: brandName.trim() });
      setBrands((prev) => [...prev, { ...created, models: [] }].sort((a, b) => a.name.localeCompare(b.name)));
      setBrandName('');
      setModelBrandId(String(created.id));
      showSuccess(`Marque « ${created.name} » créée.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting('');
    }
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();
    if (!modelName.trim() || !modelBrandId) return;
    setSubmitting('model');
    setError('');
    try {
      const created = await api.createModel({ name: modelName.trim(), brandId: Number(modelBrandId) });
      setBrands((prev) =>
        prev.map((b) =>
          String(b.id) === String(modelBrandId)
            ? { ...b, models: [...(b.models || []), created].sort((a, c) => a.name.localeCompare(c.name)) }
            : b
        )
      );
      setExpandedBrandId(Number(modelBrandId));
      setModelName('');
      showSuccess(`Modèle « ${created.name} » créé.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting('');
    }
  };

  const handleCreateColor = async (e) => {
    e.preventDefault();
    if (!colorName.trim()) return;
    setSubmitting('color');
    setError('');
    try {
      const created = await api.createColor({ name: colorName.trim(), hexCode: colorHex });
      setColors((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setColorName('');
      setColorHex('#64748b');
      showSuccess(`Couleur « ${created.name} » créée.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting('');
    }
  };

  const toggleBrand = (brandId) => {
    setExpandedBrandId((prev) => (prev === brandId ? null : brandId));
  };

  const totalModels = brands.reduce((sum, b) => sum + (b.models?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="page-title flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-600" />
          Paramètres
        </h2>
      </div>

      <div className="card p-4 flex items-start gap-3 bg-sky-50 border-sky-200">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <p className="text-sm text-stone-700">
          Vous pouvez aussi créer une marque ou un modèle directement depuis le formulaire{' '}
          <strong>Nouveau Produit</strong> lors de l'ajout d'une référence au stock.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-sm">
          {success}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="card p-12 text-center text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-500" />
          Chargement...
        </div>
      ) : activeTab === 'brands' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <form onSubmit={handleCreateBrand} className="card p-5 space-y-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-600" />
                Nouvelle marque
              </h3>
              <div>
                <label className="label">Nom de la marque</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ex: Samsung, Apple, Xiaomi..."
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" disabled={submitting === 'brand'} className="btn-primary">
                {submitting === 'brand' && <Loader2 className="w-4 h-4 animate-spin" />}
                Ajouter la marque
              </button>
            </form>

            <form onSubmit={handleCreateModel} className="card p-5 space-y-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-600" />
                Nouveau modèle
              </h3>
              <div>
                <label className="label">Marque associée</label>
                <select
                  value={modelBrandId}
                  onChange={(e) => setModelBrandId(e.target.value)}
                  className="input-field"
                  required
                  disabled={brands.length === 0}
                >
                  {brands.length === 0 ? (
                    <option value="">Créez d'abord une marque</option>
                  ) : (
                    brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="label">Nom du modèle</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Ex: iPhone 16 Pro, Galaxy S25..."
                  className="input-field"
                  required
                  disabled={brands.length === 0}
                />
              </div>
              <button type="submit" disabled={submitting === 'model' || brands.length === 0} className="btn-primary">
                {submitting === 'model' && <Loader2 className="w-4 h-4 animate-spin" />}
                Ajouter le modèle
              </button>
            </form>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">
                Marques enregistrées
              </h3>
              <span className="badge">
                {brands.length} marque{brands.length > 1 ? 's' : ''} · {totalModels} modèle{totalModels > 1 ? 's' : ''}
              </span>
            </div>

            {brands.length === 0 ? (
              <div className="p-10 text-center text-stone-500 text-sm">
                Aucune marque enregistrée. Ajoutez-en une ci-dessus ou depuis le formulaire Nouveau Produit.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {brands.map((brand) => {
                  const isExpanded = expandedBrandId === brand.id;
                  const models = brand.models || [];
                  return (
                    <div key={brand.id}>
                      <button
                        type="button"
                        onClick={() => toggleBrand(brand.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-stone-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          )}
                          <span className="font-semibold text-stone-900">{brand.name}</span>
                        </div>
                        <span className="badge">
                          {models.length} modèle{models.length > 1 ? 's' : ''}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-4 pl-12">
                          {models.length === 0 ? (
                            <p className="text-sm text-stone-500 italic">Aucun modèle pour cette marque.</p>
                          ) : (
                            <ul className="flex flex-wrap gap-2">
                              {models.map((model) => (
                                <li
                                  key={model.id}
                                  className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sm text-stone-800"
                                >
                                  {model.name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleCreateColor} className="card p-5 space-y-4 max-w-lg">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-sky-600" />
              Nouvelle couleur
            </h3>
            <div>
              <label className="label">Nom de la couleur</label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Ex: Noir Mat, Bleu Nuit..."
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Code couleur</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-stone-300 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="input-field font-mono flex-1"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                />
                <div
                  className="w-12 h-12 rounded-lg border border-stone-200 shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
              </div>
            </div>
            <button type="submit" disabled={submitting === 'color'} className="btn-primary">
              {submitting === 'color' && <Loader2 className="w-4 h-4 animate-spin" />}
              Ajouter la couleur
            </button>
          </form>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">Couleurs enregistrées</h3>
              <span className="badge">{colors.length} couleur{colors.length > 1 ? 's' : ''}</span>
            </div>

            {colors.length === 0 ? (
              <div className="p-10 text-center text-stone-500 text-sm">
                Aucune couleur enregistrée.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="table-header text-left px-5 py-3">Aperçu</th>
                      <th className="table-header text-left px-5 py-3">Nom</th>
                      <th className="table-header text-left px-5 py-3">Code hex</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {colors.map((color) => (
                      <tr key={color.id} className="hover:bg-stone-50">
                        <td className="px-5 py-3">
                          <div
                            className="w-8 h-8 rounded-lg border border-stone-200"
                            style={{ backgroundColor: color.hexCode }}
                          />
                        </td>
                        <td className="px-5 py-3 font-medium text-stone-900">{color.name}</td>
                        <td className="px-5 py-3 font-mono text-stone-600">{color.hexCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
