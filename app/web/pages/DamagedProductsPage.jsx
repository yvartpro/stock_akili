import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  AlertOctagon,
  AlertTriangle,
  Plus,
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import DeclareDamagedModal from '../components/DeclareDamagedModal.jsx';

export default function DamagedProductsPage() {
  const [damagedRecords, setDamagedRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [records, prods] = await Promise.all([
        api.getDamagedProducts(),
        api.getProducts()
      ]);
      setDamagedRecords(records);
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProduct(prods[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = damagedRecords.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.product?.sku?.toLowerCase().includes(term) ||
      r.product?.name?.toLowerCase().includes(term) ||
      r.reason?.toLowerCase().includes(term)
    );
  });

  const totalUnits = damagedRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalFinancialLoss = damagedRecords.reduce((sum, r) => {
    const cost = r.product?.unitCost || 0;
    return sum + (cost * r.quantity);
  }, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            Registre des Articles Endommagés & Pertes (Art. 11)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aucun article n'est jamais supprimé : traçabilité complète des fêlures, casses et pertes
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Déclarer une Casse / Perte
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Articles Hors Service</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">{totalUnits} pcs</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Considérés comme pertes sèches</span>
        </div>

        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Perte Financière Estimée (Coût Achat)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold font-mono text-rose-700">{Math.round(totalFinancialLoss).toLocaleString('fr-FR')} FC</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Basé sur le prix d'achat unitaire usine</span>
        </div>

        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Règle d'Immutabilité du Stock</span>
            <ShieldAlert className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs font-semibold text-slate-900 mt-1">Zéro suppression autorisée</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Historique conservé pour audit commissaire</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-md bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par référence, produit, motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({damagedRecords.length})
          </button>
          <button
            onClick={() => setStatusFilter('endommage')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'endommage' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Endommagé
          </button>
          <button
            onClick={() => setStatusFilter('perdu')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'perdu' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Perdu
          </button>
          <button
            onClick={() => setStatusFilter('hors_service')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'hors_service' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Hors Service
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Date Déclaration</th>
                <th className="p-3.5">SKU & Produit</th>
                <th className="p-3.5">Statut Spécifique</th>
                <th className="p-3.5 text-center">Quantité</th>
                <th className="p-3.5">Motif Obligatoire (Cahier des charges)</th>
                <th className="p-3.5">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Chargement du registre...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    Aucun article endommagé ou déclassé enregistré.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-slate-800 font-bold block text-[11px]">{item.product?.sku}</span>
                      <span className="text-slate-900 font-medium">{item.product?.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-rose-700 text-xs">
                      {item.quantity} pcs
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-sm">
                      <p className="italic">"{item.reason}"</p>
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {item.user?.name || 'Gestionnaire'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Declare Modal */}
      <DeclareDamagedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        onSuccess={loadData}
      />
    </div>
  );
}
