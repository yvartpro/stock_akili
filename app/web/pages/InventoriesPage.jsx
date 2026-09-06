import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ClipboardCheck,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Check,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function InventoriesPage() {
  const { user, isManager } = useAuth();
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New inventory session state
  const [sessionOpen, setSessionOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryDate, setInventoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [observation, setObservation] = useState('Inventaire périodique de fin de mois');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Details modal & Validation confirmation
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryToValidate, setInventoryToValidate] = useState(null);
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadInventories();
  }, []);

  const loadInventories = async () => {
    setLoading(true);
    try {
      const data = await api.getInventories();
      setInventories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInventory = async () => {
    setError('');
    try {
      const prefill = await api.prepareInventory();
      setInventoryItems(prefill);
      setSessionOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePhysicalStockChange = (productId, val) => {
    setInventoryItems(prev => prev.map(item => {
      if (String(item.productId) === String(productId)) {
        if (val === '') {
          return {
            ...item,
            physicalStock: '',
            difference: 0 - Number(item.theoreticalStock)
          };
        }
        const phys = parseInt(val, 10);
        const physicalStock = isNaN(phys) ? 0 : Math.max(0, phys);
        return {
          ...item,
          physicalStock,
          difference: physicalStock - Number(item.theoreticalStock)
        };
      }
      return item;
    }));
  };

  const handleStepStock = (productId, delta) => {
    setInventoryItems(prev => prev.map(item => {
      if (String(item.productId) === String(productId)) {
        const currentVal = Number(item.physicalStock) || 0;
        const physicalStock = Math.max(0, currentVal + delta);
        return {
          ...item,
          physicalStock,
          difference: physicalStock - Number(item.theoreticalStock)
        };
      }
      return item;
    }));
  };

  const handleJustificationChange = (productId, text) => {
    setInventoryItems(prev => prev.map(item => {
      if (String(item.productId) === String(productId)) {
        return { ...item, justification: text };
      }
      return item;
    }));
  };

  const handleSaveInventory = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Verification of Cahier des Charges Article 9 & 10:
    // Saisie obligatoire d'une justification en cas d'écart
    for (const item of inventoryItems) {
      const phys = Number(item.physicalStock) || 0;
      const theo = Number(item.theoreticalStock) || 0;
      const diff = phys - theo;
      if (diff !== 0 && (!item.justification || item.justification.trim() === '')) {
        setError(
          `Justification obligatoire pour "${item.name}" (écart constaté : ${diff > 0 ? '+' : ''}${diff}). Les règles d'inventaire exigent un motif pour tout écart.`
        );
        return;
      }
    }

    setSaving(true);
    try {
      await api.createInventory({
        date: inventoryDate,
        observation,
        items: inventoryItems.map(item => ({
          productId: item.productId,
          theoreticalStock: Number(item.theoreticalStock),
          physicalStock: Number(item.physicalStock) || 0,
          difference: (Number(item.physicalStock) || 0) - Number(item.theoreticalStock),
          justification: item.justification ? item.justification.trim() : ''
        }))
      });

      setSessionOpen(false);
      setSuccessMessage('Feuille d\'inventaire enregistrée avec succès !');
      setTimeout(() => setSuccessMessage(''), 5000);
      loadInventories();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'inventaire');
    } finally {
      setSaving(false);
    }
  };

  // Regularize discrepancies
  const handleApplyAdjustments = async (invId) => {
    setAdjusting(true);
    setActionError('');
    try {
      const res = await api.adjustInventory(invId);
      setSuccessMessage(res.message || 'Inventaire validé et stocks ajustés avec succès !');
      setSelectedInventory(null);
      setInventoryToValidate(null);
      await loadInventories();
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      setActionError(err.message || 'Erreur lors de la validation des ajustements.');
    } finally {
      setAdjusting(false);
    }
  };

  const filteredSessionItems = inventoryItems.filter(item => {
    if (!searchTerm || !searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    const sku = (item.sku || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();
    const model = (item.phoneModel || '').toLowerCase();
    return sku.includes(term) || name.includes(term) || brand.includes(term) || model.includes(term);
  });

  const discrepanciesCount = inventoryItems.filter(it => it.physicalStock !== it.theoreticalStock).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-purple-600" />
            Inventaires Périodiques & Contrôle des Écarts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparaison stock théorique vs stock physique, justification obligatoire des écarts et régularisation autorisée
          </p>
        </div>

        <button
          onClick={handleStartInventory}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Lancer une Session d'Inventaire
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {actionError}
          </span>
          <button onClick={() => setActionError('')} className="text-rose-700 hover:text-rose-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Rules Banner */}
      <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="font-semibold text-slate-900 mb-1">Règle de séparation des contrôles (Section 9 & 10) :</p>
          <p className="text-slate-600">
            Les écarts détectés lors d'un inventaire <strong className="font-semibold text-slate-800">ne modifient pas automatiquement le stock</strong>. L'inventaire constate d'abord la réalité terrain avec justification obligatoire.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900 mb-1">Validation & Historisation :</p>
          <p className="text-slate-600">
            La correction de stock doit être validée par un utilisateur autorisé et enregistrée dans le journal des mouvements d'ajustement.
          </p>
        </div>
      </div>

      {/* Inventories List */}
      <div className="rounded-md bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">N° Inventaire</th>
                <th className="p-3.5">Date de Réalisation</th>
                <th className="p-3.5">Responsable / Auditeur</th>
                <th className="p-3.5 text-center">Articles Contrôlés</th>
                <th className="p-3.5 text-center">Écarts Constatés</th>
                <th className="p-3.5">Statut de Régularisation</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Chargement des inventaires...
                  </td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    Aucun inventaire périodique réalisé pour le moment.
                  </td>
                </tr>
              ) : (
                inventories.map((inv) => {
                  const withDiff = inv.items?.filter(it => it.difference !== 0) || [];
                  const isValide = inv.status === 'valide';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-purple-700 text-xs">
                        {inv.inventoryNumber}
                      </td>
                      <td className="p-3.5 text-slate-900 font-semibold">
                        {inv.date}
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {inv.user?.name || 'Gestionnaire'}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-800">
                        {inv.items?.length || 0} références
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          withDiff.length > 0 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {withDiff.length} écart(s)
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isValide 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isValide ? 'Ajustements Validés' : 'En Attente Régularisation'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isValide && (
                            <button
                              onClick={() => setInventoryToValidate(inv)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                              title="Valider et appliquer la régularisation au stock central"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valider
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInventory(inv)}
                            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Consulter Fiche
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

      {/* New Inventory Sheet Modal */}
      {sessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-purple-600" />
                  Feuille de Comptage Physique de l'Inventaire
                </h3>
                <p className="text-xs text-slate-500">
                  Saisissez les quantités réellement comptées dans les allées et bacs du stock central
                </p>
              </div>
              <button
                onClick={() => setSessionOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="m-6 mb-0 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveInventory} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date d'inventaire *</label>
                  <input
                    type="date"
                    value={inventoryDate}
                    onChange={(e) => setInventoryDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-purple-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observation / Cadre</label>
                  <input
                    type="text"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              {/* Live search in sheet */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrer un SKU ou modèle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-600 outline-none"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">Écarts détectés : </span>
                  <span className={`font-mono font-bold ${discrepanciesCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {discrepanciesCount} article(s)
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3">SKU & Produit</th>
                      <th className="p-3 text-center">Stock Théorique</th>
                      <th className="p-3 text-center">Stock Physique Compté</th>
                      <th className="p-3 text-center">Écart Calculé</th>
                      <th className="p-3">Justification (Obligatoire si écart)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessionItems.map((item) => {
                      const diff = item.physicalStock - item.theoreticalStock;
                      const hasDiff = diff !== 0;

                      return (
                        <tr key={item.productId} className={`hover:bg-slate-50 ${hasDiff ? 'bg-amber-50/50' : ''}`}>
                          <td className="p-3 max-w-xs">
                            <span className="font-mono text-purple-700 font-bold block text-[11px]">{item.sku}</span>
                            <span className="text-slate-900 font-medium truncate block">{item.name}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700">
                            {item.theoreticalStock}
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStepStock(item.productId, -1)}
                                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors"
                                title="Diminuer de 1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={item.physicalStock}
                                onChange={(e) => handlePhysicalStockChange(item.productId, e.target.value)}
                                className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded-md text-center font-mono font-bold text-slate-900 text-xs focus:border-purple-600 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleStepStock(item.productId, 1)}
                                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors"
                                title="Augmenter de 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              diff === 0 
                                ? 'text-slate-500' 
                                : diff > 0 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder={hasDiff ? "Motif obligatoire (casse, erreur de comptage, etc.)" : "Facultatif"}
                              value={item.justification || ''}
                              onChange={(e) => handleJustificationChange(item.productId, e.target.value)}
                              className={`w-full px-2.5 py-1 bg-white border rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none ${
                                hasDiff && !item.justification ? 'border-amber-500 bg-amber-50/30' : 'border-slate-300 focus:border-purple-600'
                              }`}
                              required={hasDiff}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500">
                  * L'enregistrement sauvegarde la feuille sans altérer le stock tant qu'elle n'est pas validée.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    {saving ? 'Sauvegarde...' : 'Enregistrer la Feuille d\'Inventaire'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Validate Discrepancies Details Modal */}
      {selectedInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Fiche d'Inventaire : {selectedInventory.inventoryNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Réalisé le {selectedInventory.date} par {selectedInventory.user?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedInventory(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border border-slate-200 rounded-md overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3">Produit</th>
                      <th className="p-3 text-center">Théorique</th>
                      <th className="p-3 text-center">Physique</th>
                      <th className="p-3 text-center">Écart</th>
                      <th className="p-3">Justification Obligatoire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInventory.items?.map((item) => (
                      <tr key={item.id} className={item.difference !== 0 ? 'bg-amber-50/50' : ''}>
                        <td className="p-3">
                          <span className="font-mono text-purple-700 block text-[11px]">{item.product?.sku}</span>
                          <span className="font-medium text-slate-900">{item.product?.name}</span>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-700">{item.theoreticalStock}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900">{item.physicalStock}</td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className={item.difference === 0 ? 'text-slate-500' : item.difference > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {item.difference > 0 ? `+${item.difference}` : item.difference}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 italic text-[11px]">
                          {item.justification || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-600">
                  Statut : <strong className={selectedInventory.status === 'valide' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {selectedInventory.status === 'valide' ? 'Ajustements déjà appliqués au stock' : 'Non régularisé'}
                  </strong>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedInventory(null)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200"
                  >
                    Fermer
                  </button>

                  {selectedInventory.status !== 'valide' && (
                    <button
                      onClick={() => setInventoryToValidate(selectedInventory)}
                      disabled={adjusting}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valider & Régulariser les Écarts
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Inventory Validation */}
      {inventoryToValidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden p-6">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Valider l'Inventaire & Régulariser le Stock
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Inventaire N° <span className="font-mono font-bold text-slate-800">{inventoryToValidate.inventoryNumber}</span> du {inventoryToValidate.date}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-700 mb-5 space-y-2">
              <p>
                Cette opération va <strong className="text-slate-900">mettre à jour définitivement le stock central</strong> en appliquant les écarts constatés :
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li>Les articles en excédent seront incrémentés au stock disponible.</li>
                <li>Les articles manquants seront décomptés du stock central.</li>
                <li>Un mouvement d'audit automatique sera tracé dans le journal.</li>
              </ul>
              {actionError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-medium">
                  {actionError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setInventoryToValidate(null);
                  setActionError('');
                }}
                disabled={adjusting}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleApplyAdjustments(inventoryToValidate.id)}
                disabled={adjusting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
              >
                {adjusting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {adjusting ? 'Régularisation en cours...' : 'Confirmer la Régularisation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
