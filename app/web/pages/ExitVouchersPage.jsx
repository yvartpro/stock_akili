import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import {
  ArrowUpFromLine,
  Plus,
  Trash2,
  Printer,
  Store,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Loader2
} from 'lucide-react';
import PrintVoucherModal from '../components/PrintVoucherModal.jsx';
import ProductSearchSelect from '../components/ProductSearchSelect.jsx';

export default function ExitVouchersPage() {
  const [searchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New voucher modal
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('new') === 'true');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [observation, setObservation] = useState('');
  const [lines, setLines] = useState([
    { productId: '', quantity: 10 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchOpened, setSearchOpened] = useState(false);

  // Print voucher
  const [selectedForPrint, setSelectedForPrint] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vouchersData, shopsData, productsData] = await Promise.all([
        api.getExitVouchers(),
        api.getShops(),
        api.getProducts()
      ]);
      setVouchers(vouchersData);
      setShops(shopsData);
      // Only available products with stock > 0
      const availableProds = productsData.filter(p => p.status === 'disponible' && p.currentStock > 0);
      setProducts(availableProds);

      if (shopsData.length > 0) setSelectedShopId(shopsData[0].id);
      if (availableProds.length > 0) {
        setLines([{ productId: availableProds[0].id, quantity: Math.min(10, availableProds[0].currentStock) }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setLines([
      ...lines,
      { productId: defaultProd.id, quantity: Math.min(5, defaultProd.currentStock) }
    ]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedShopId) {
      setFormError('Veuillez sélectionner le Shop destinataire.');
      return;
    }

    // Client-side rule check: Une sortie ne peut jamais dépasser le stock disponible
    for (const line of lines) {
      const prod = products.find(p => String(p.id) === String(line.productId));
      const qty = parseInt(line.quantity, 10);
      if (!prod) {
        setFormError('Produit invalide sélectionné.');
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        setFormError(`La quantité pour "${prod.name}" doit être supérieure à zéro.`);
        return;
      }
      if (qty > prod.currentStock) {
        setFormError(`Stock insuffisant pour "${prod.name}". Demandé: ${qty}, Disponible en stock: ${prod.currentStock}. Règle métier : la sortie ne peut jamais excéder le stock disponible!`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const created = await api.createExitVoucher({
        shopId: selectedShopId,
        date,
        time,
        observation,
        items: lines.map(l => ({
          productId: l.productId,
          quantity: Number(l.quantity)
        }))
      });

      setShowCreateModal(false);
      loadData();
      // Show printable bon de sortie
      setSelectedForPrint(created);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-blue-600" />
            Bons de Sortie (Approvisionnement des Shops)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sortie stricte avec vérification temps réel des stocks et génération automatique des bons
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouveau Bon de Sortie
        </button>
      </div>

      {/* Strict Rule Notice */}
      <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
        <div>
          <strong className="font-semibold">Règles métier strictes (Section 10) : </strong>
          Une sortie ne peut jamais dépasser le stock disponible. Les bons validés deviennent immédiatement non modifiables et décrémentent le stock central. Aucun retour shop vers stock principal n'est accepté.
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-md bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">N° Bon de Sortie</th>
                <th className="p-3.5">Date & Heure</th>
                <th className="p-3.5">Point de Vente Destinataire</th>
                <th className="p-3.5 text-center">Quantité Totale</th>
                <th className="p-3.5">Responsable Émission</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Document Officiel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Chargement des bons de sortie...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    Aucun bon de sortie enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const totalUnits = v.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
                        {v.voucherNumber}
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px] whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{v.date}</span> à {v.time}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-900">{v.shop?.name}</p>
                        <span className="text-[10px] text-slate-500">{v.shop?.location}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                          {totalUnits} pcs ({v.items?.length || 0} réf)
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {v.user?.name || 'Gestionnaire'}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Validé & Verrouillé
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedForPrint(v)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          Imprimer Bon
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Exit Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className={`relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-4 flex flex-col transition-all duration-200 ${
            searchOpened ? 'min-h-[720px]' : 'min-h-[580px]'
          }`}>
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ArrowUpFromLine className="w-5 h-5 text-blue-600" />
                  Créer un Bon de Sortie vers un Shop
                </h3>
                <p className="text-xs text-slate-500">Expédition de marchandises vers un point de vente APS</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="m-6 mb-0 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shop Destinataire (Point de Vente) *
                  </label>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:border-blue-600 outline-none"
                    required
                  >
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de Sortie *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-blue-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Heure de Sortie *
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consignes de transport / Observation
                </label>
                <input
                  type="text"
                  placeholder="Ex: Livraison express coursier moto, colis scellés..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-blue-600 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Product Lines */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Références Produits à Expédier
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une ligne
                  </button>
                </div>

                <div className={`space-y-2 overflow-y-auto pr-1 transition-all duration-200 ${
                  searchOpened ? 'min-h-[300px] pb-44' : 'min-h-[140px] max-h-72'
                }`}>
                  {lines.map((line, idx) => {
                    const selectedProd = products.find(p => String(p.id) === String(line.productId));
                    const isExceeding = selectedProd && Number(line.quantity) > selectedProd.currentStock;

                    return (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-md border transition-colors flex items-center gap-2.5 ${
                          isExceeding ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex-1">
                          <ProductSearchSelect
                            products={products}
                            selectedProductId={line.productId}
                            onSelect={(prod) => {
                              handleLineChange(idx, 'productId', prod.id);
                              if (Number(line.quantity) > prod.currentStock) {
                                handleLineChange(idx, 'quantity', Math.min(Number(line.quantity), prod.currentStock));
                              }
                            }}
                            onOpenChange={setSearchOpened}
                            placeholder="Rechercher produit en stock..."
                          />
                        </div>

                        <div className="w-32">
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max={selectedProd ? selectedProd.currentStock : undefined}
                              placeholder="Quantité"
                              value={line.quantity}
                              onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                              className={`w-full px-2 py-1.5 bg-white border rounded-md text-xs font-mono text-center outline-none ${
                                isExceeding ? 'border-rose-500 text-rose-700 bg-rose-50/50' : 'border-slate-300 text-slate-900 focus:border-blue-600'
                              }`}
                              title="Quantité à sortir"
                              required
                            />
                          </div>
                          {selectedProd && (
                            <span className={`text-[10px] block text-center mt-0.5 ${
                              isExceeding ? 'text-rose-600 font-bold' : 'text-slate-500'
                            }`}>
                              Max: {selectedProd.currentStock} pcs
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lines.length === 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded transition-colors cursor-pointer"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Summary */}
              <div className="p-3 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                <span className="font-medium">Décrémentation immédiate du stock :</span>
                <span className="font-mono font-bold">
                  -{lines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0)} unités expédiées
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Validation en cours...' : 'Valider & Décrémenter le Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable slip */}
      <PrintVoucherModal
        isOpen={Boolean(selectedForPrint)}
        onClose={() => setSelectedForPrint(null)}
        voucher={selectedForPrint}
        type="sortie"
      />
    </div>
  );
}
