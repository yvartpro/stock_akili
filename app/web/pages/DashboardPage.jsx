import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  TrendingUp,
  Store,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  Smartphone,
  Shield
} from 'lucide-react';
import NewProductModal from '../components/NewProductModal.jsx';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Chargement des données en temps réel...</p>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const lowStockAlerts = stats?.lowStockAlerts || [];
  const recentMovements = stats?.recentMovements || [];
  const shopStats = stats?.shopStats || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-md bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Bonjour, {user?.name || 'Gestionnaire'} 👋
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              Stock Principal APS
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Gestion centralisée des pochettes & protections anti-casse vers les points de vente
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/sorties?new=true"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            Nouveau Bon de Sortie
          </Link>
          <Link
            to="/receptions?new=true"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            Réception Marchandise
          </Link>
          <button
            onClick={() => setNewProductModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Nouveau Produit
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Units */}
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Unités en Stock Central</span>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {summary.totalUnits?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span className="text-blue-600 font-semibold">{summary.pochettesUnits}</span> pochettes •
              <span className="text-purple-600 font-semibold">{summary.protectionsUnits}</span> protections
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Alertes Réappro</span>
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
              summary.lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-900 flex items-center gap-2">
              <span className={summary.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}>
                {summary.lowStockCount || 0}
              </span>
              {summary.lowStockCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase tracking-wider">
                  Critique
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Articles sous le seuil minimum
            </p>
          </div>
        </div>

        {/* Total Sorties Vers Shops */}
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Bons de Sortie Émis</span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {summary.totalExitVouchers || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Expéditions vers les shops
            </p>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Valeur Cession Totale</span>
            <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {summary.totalStockWholesaleValue ? Math.round(summary.totalStockWholesaleValue).toLocaleString('fr-FR') : 0} FC
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Achat : <span className="font-mono text-slate-700 font-semibold">{summary.totalStockCostValue ? Math.round(summary.totalStockCostValue).toLocaleString('fr-FR') : 0} FC</span>
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Low-Stock Alerts & Distribution by Shop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts (2 cols) */}
        <div className="lg:col-span-2 rounded-md bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">
                  Produits Nécessitant Réapprovisionnement
                </h3>
              </div>
              <Link
                to="/stock?lowStock=true"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
              >
                Voir tout ({lowStockAlerts.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {lowStockAlerts.length === 0 ? (
              <div className="p-8 text-center rounded-md bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">Tous les stocks sont au-dessus des seuils d'alerte.</p>
                <p className="text-[11px] text-slate-500 mt-1">Aucune rupture imminente détectée.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <th className="pb-2.5">SKU / Réf</th>
                      <th className="pb-2.5">Désignation</th>
                      <th className="pb-2.5 text-center">Stock Actuel</th>
                      <th className="pb-2.5 text-center">Seuil Min</th>
                      <th className="pb-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStockAlerts.slice(0, 5).map((p) => {
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 font-mono font-semibold text-blue-700 text-[11px]">
                            {p.sku}
                          </td>
                          <td className="py-2.5 pr-2">
                            <p className="font-semibold text-slate-900 truncate max-w-xs">{p.name}</p>
                            <span className="text-[10px] text-slate-500">
                              {p.brand?.name} • {p.phoneModel?.name}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              p.currentStock <= 5 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {p.currentStock}
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-mono text-slate-500">
                            {p.minStockThreshold}
                          </td>
                          <td className="py-2.5 text-right">
                            <Link
                              to="/receptions?new=true"
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                            >
                              Commander
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Dispatch by Shop (1 col) */}
        <div className="rounded-md bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Expéditions vers les Shops
                </h3>
              </div>
              <Link to="/shops" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                Voir détails
              </Link>
            </div>

            <div className="space-y-2.5">
              {shopStats.map((shop) => (
                <div key={shop.id} className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900">{shop.name}</span>
                    <span className="font-mono font-bold text-emerald-700">{shop.unitsDispatched} pcs</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{shop.location}</span>
                    <span>{shop.vouchersCount} bon(s) de sortie</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Règle logistique APS :</span>
            <span className="text-slate-700 font-medium">Shops = Destinataires passifs</span>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed / Recent Stock Movements */}
      <div className="rounded-md bg-white border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Historique des Mouvements en Temps Réel
            </h3>
          </div>
          <Link to="/rapports" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
            Journal complet
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="pb-2.5">Date & Heure</th>
                <th className="pb-2.5">Type de mouvement</th>
                <th className="pb-2.5">Réf. Document</th>
                <th className="pb-2.5">Produit concerné</th>
                <th className="pb-2.5 text-center">Variation</th>
                <th className="pb-2.5 text-center">Nouveau Stock</th>
                <th className="pb-2.5">Motif / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMovements.slice(0, 8).map((m) => {
                const isPositive = m.quantityChange > 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        m.type === 'ENTREE_RECEPTION' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : m.type === 'SORTIE_SHOP' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {m.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-semibold text-slate-700 text-[11px]">
                      {m.reference}
                    </td>
                    <td className="py-2.5">
                      <p className="font-semibold text-slate-900 truncate max-w-xs">{m.product?.name || '-'}</p>
                      <span className="font-mono text-[10px] text-slate-500">{m.product?.sku}</span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono font-bold text-slate-900">
                      {m.newStock}
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px] max-w-xs truncate">
                      {m.reason || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for creating product */}
      <NewProductModal
        isOpen={newProductModalOpen}
        onClose={() => setNewProductModalOpen(false)}
        onProductCreated={loadDashboard}
      />
    </div>
  );
}
