import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import {
  ArrowDownToLine,
  Plus,
  Trash2,
  Printer,
  Search,
  PackageCheck,
  Calendar,
  Truck,
  Box,
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2
} from 'lucide-react';
import PrintVoucherModal from '../components/PrintVoucherModal.jsx';
import ProductSearchSelect from '../components/ProductSearchSelect.jsx';

export default function ReceptionsPage() {
  const [searchParams] = useSearchParams();
  const [receptions, setReceptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New reception modal/drawer
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('new') === 'true');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [totalCartons, setTotalCartons] = useState(5);
  const [observation, setObservation] = useState('');
  const [lines, setLines] = useState([
    { productId: '', quantityReceived: 50, cartonsCount: 2, unitCost: '' }
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
      const [recsData, supsData, prodsData] = await Promise.all([
        api.getReceptions(),
        api.getSuppliers(),
        api.getProducts()
      ]);
      setReceptions(recsData);
      setSuppliers(supsData);
      setProducts(prodsData);
      if (supsData.length > 0) setSelectedSupplierId(supsData[0].id);
      if (prodsData.length > 0) {
        setLines([
          { productId: prodsData[0].id, quantityReceived: 50, cartonsCount: 2, unitCost: prodsData[0].unitCost || '' }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = () => {
    const defaultProd = products[0];
    setLines([
      ...lines,
      { 
        productId: defaultProd ? defaultProd.id : '', 
        quantityReceived: 50, 
        cartonsCount: 1, 
        unitCost: defaultProd ? defaultProd.unitCost || '' : '' 
      }
    ]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    if (field === 'productId') {
      const prod = products.find(p => String(p.id) === String(value));
      if (prod) {
        updated[index].unitCost = prod.unitCost || '';
      }
    }
    setLines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedSupplierId) {
      setFormError('Le fournisseur obligatoire doit être sélectionné (Section 7).');
      return;
    }

    if (lines.some(l => !l.productId || Number(l.quantityReceived) <= 0)) {
      setFormError('Veuillez sélectionner un produit valide et une quantité positive pour chaque ligne.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createReception({
        supplierId: selectedSupplierId,
        date,
        time,
        totalCartons: Number(totalCartons),
        observation,
        items: lines.map(l => ({
          productId: l.productId,
          quantityReceived: Number(l.quantityReceived),
          cartonsCount: Number(l.cartonsCount) || 1,
          unitCost: Number(l.unitCost) || 0
        }))
      });

      setShowCreateModal(false);
      loadData();
      // Show printable slip
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
          <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-stone-600" />
            Réceptions de Marchandises (Entrées en Stock)
          </h2>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Enregistrer une Réception
        </button>
      </div>

      {/* Receptions History Table */}
      <div className="rounded-lg bg-white border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-sky-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-sm">
                <th className="p-3.5">N° Réception</th>
                <th className="p-3.5">Date & Heure</th>
                <th className="p-3.5">Fournisseur Partenaire</th>
                <th className="p-3.5 text-center">Cartons</th>
                <th className="p-3.5 text-center">Lignes Réceptionnées</th>
                <th className="p-3.5">Responsable</th>
                <th className="p-3.5">Statut Métier</th>
                <th className="p-3.5 text-right">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    Chargement des réceptions...
                  </td>
                </tr>
              ) : receptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-stone-500">
                    Aucune réception enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                receptions.map((rec) => {
                  const totalUnits = rec.items?.reduce((sum, it) => sum + it.quantityReceived, 0) || 0;
                  return (
                    <tr key={rec.id} className="hover:bg-sky-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-stone-700 text-sm whitespace-nowrap">
                        {rec.receptionNumber}
                      </td>
                      <td className="p-3.5 text-stone-600 text-sm whitespace-nowrap">
                        <span className="font-semibold text-stone-900">{rec.date}</span> à {rec.time}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-stone-900">{rec.supplier?.name}</p>
                        <span className="font-mono text-sm text-stone-500">{rec.supplier?.code}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-stone-800">
                        {rec.totalCartons}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-mono font-bold text-sm">
                          {totalUnits} pcs ({rec.items?.length || 0} réf)
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        {rec.user?.name || 'Gestionnaire'}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Validée & Stocké
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedForPrint(rec)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-sm font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-600" />
                          Bon Réception
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

      {/* New Reception Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
          <div className={`relative w-full max-w-4xl bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden my-4 flex flex-col transition-all duration-200 ${
            searchOpened ? 'min-h-[720px]' : 'min-h-[580px]'
          }`}>
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-sky-50 shrink-0">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-stone-600" />
                  Enregistrement d'une Réception de Marchandises
                </h3>
                <p className="text-sm text-stone-500">Entrée en stock principal de cartons livrés par le fournisseur</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="m-6 mb-0 p-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-stone-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Fournisseur & Date/Heure */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">
                    Fournisseur obligatoire (Art. 7) *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-800 focus:border-sky-500 outline-none"
                    required
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">
                    Date de Réception *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">
                    Nombre Total de Cartons Reçus *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalCartons}
                    onChange={(e) => setTotalCartons(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Observation logistique / État emballages
                </label>
                <input
                  type="text"
                  placeholder="Ex: Palette arrivée intacte, scellés conformes..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none placeholder:text-stone-400"
                />
              </div>

              {/* Product Lines */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
                    Détail des Produits Livrés
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-sm text-stone-700 hover:text-stone-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une ligne
                  </button>
                </div>

                <div className={`space-y-2 overflow-y-auto pr-1 transition-all duration-200 ${
                  searchOpened ? 'min-h-[300px] pb-44' : 'min-h-[140px] max-h-72'
                }`}>
                  {lines.map((line, idx) => (
                    <div key={idx} className="p-2.5 bg-sky-50 rounded-lg border border-stone-200 flex items-center gap-2.5">
                      <div className="flex-1">
                        <ProductSearchSelect
                          products={products}
                          selectedProductId={line.productId}
                          onSelect={(prod) => {
                            handleLineChange(idx, 'productId', prod.id);
                          }}
                          onOpenChange={setSearchOpened}
                          placeholder="Rechercher produit par SKU ou modèle..."
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qté"
                          value={line.quantityReceived}
                          onChange={(e) => handleLineChange(idx, 'quantityReceived', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono text-center outline-none focus:border-sky-500"
                          title="Quantité reçue"
                          required
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          placeholder="Cartons"
                          value={line.cartonsCount}
                          onChange={(e) => handleLineChange(idx, 'cartonsCount', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono text-center outline-none focus:border-sky-500"
                          title="Nombre de cartons associés"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length === 1}
                        className="p-1.5 text-stone-400 hover:text-stone-600 disabled:opacity-30 rounded transition-colors cursor-pointer"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total preview */}
              <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-between text-sm text-stone-800">
                <span className="font-medium">Validation immédiate du stock :</span>
                <span className="font-mono font-bold">
                  +{lines.reduce((sum, l) => sum + (Number(l.quantityReceived) || 0), 0)} unités réparties sur {lines.length} référence(s)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-sm text-stone-600 hover:text-stone-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Validation en cours...' : 'Valider & Incrémenter le Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Print Modal */}
      <PrintVoucherModal
        isOpen={Boolean(selectedForPrint)}
        onClose={() => setSelectedForPrint(null)}
        voucher={selectedForPrint}
        type="reception"
      />
    </div>
  );
}
