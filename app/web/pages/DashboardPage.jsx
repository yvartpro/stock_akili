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
  CheckCircle2,
  Clock,
} from 'lucide-react';
import NewProductModal from '../components/NewProductModal.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const lowStockAlerts = stats?.lowStockAlerts || [];
  const recentMovements = stats?.recentMovements || [];
  const shopStats = stats?.shopStats || [];

  const kpis = [
    {
      label: 'Unités en stock',
      value: summary.totalUnits?.toLocaleString() || '0',
      detail: `${summary.pochettesUnits || 0} pochettes · ${summary.protectionsUnits || 0} protections`,
      icon: Boxes,
    },
    {
      label: 'Alertes réappro',
      value: summary.lowStockCount || 0,
      detail: 'Articles sous le seuil minimum',
      icon: AlertTriangle,
      highlight: summary.lowStockCount > 0,
    },
    {
      label: 'Bons de sortie',
      value: summary.totalExitVouchers || 0,
      detail: 'Expéditions vers les shops',
      icon: Store,
    },
    {
      label: 'Valeur cession',
      value: `${summary.totalStockWholesaleValue ? Math.round(summary.totalStockWholesaleValue).toLocaleString('fr-FR') : 0} FC`,
      detail: `Coût : ${summary.totalStockCostValue ? Math.round(summary.totalStockCostValue).toLocaleString('fr-FR') : 0} FC`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="page-title">Bonjour, {user?.name?.split(' ')[0] || 'Gestionnaire'}</h2>
          <p className="page-subtitle mt-1">Vue d'ensemble du stock principal APS</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/sorties?new=true" className="btn-primary">
            <ArrowUpFromLine className="w-4 h-4" />
            Nouveau bon de sortie
          </Link>
          <Link to="/receptions?new=true" className="btn-secondary">
            <ArrowDownToLine className="w-4 h-4" />
            Réception
          </Link>
          <button onClick={() => setNewProductModalOpen(true)} className="btn-secondary">
            <Plus className="w-4 h-4" />
            Nouveau produit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-stone-500">{kpi.label}</span>
                <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`kpi-value ${kpi.highlight ? 'text-stone-800' : ''}`}>
                {kpi.value}
              </div>
              <p className="text-sm text-stone-500 mt-2">{kpi.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-stone-900">Réapprovisionnement nécessaire</h3>
            <Link to="/stock?lowStock=true" className="link-action flex items-center gap-1">
              Voir tout ({lowStockAlerts.length})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {lowStockAlerts.length === 0 ? (
            <div className="py-12 text-center rounded-lg bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-800">Tous les stocks sont au-dessus des seuils.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="table-header pb-3 pr-4">SKU</th>
                    <th className="table-header pb-3 pr-4">Désignation</th>
                    <th className="table-header pb-3 text-center">Stock</th>
                    <th className="table-header pb-3 text-center">Seuil</th>
                    <th className="table-header pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {lowStockAlerts.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="py-3 font-mono font-semibold text-stone-700 text-sm">{p.sku}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-stone-900">{p.name}</p>
                        <p className="text-sm text-stone-500">{p.brand?.name} · {p.phoneModel?.name}</p>
                      </td>
                      <td className="py-3 text-center">
                        <span className="badge-alert font-mono">{p.currentStock}</span>
                      </td>
                      <td className="py-3 text-center font-mono text-stone-500">{p.minStockThreshold}</td>
                      <td className="py-3 text-right">
                        <Link to="/receptions?new=true" className="btn-secondary text-sm py-1.5 px-3">
                          Commander
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-stone-900">Expéditions shops</h3>
            <Link to="/shops" className="link-action">Détails</Link>
          </div>

          <div className="space-y-3">
            {shopStats.map((shop) => (
              <div key={shop.id} className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-stone-900">{shop.name}</span>
                  <span className="font-mono font-bold text-stone-700">{shop.unitsDispatched} pcs</span>
                </div>
                <div className="flex items-center justify-between text-sm text-stone-500">
                  <span>{shop.location}</span>
                  <span>{shop.vouchersCount} bon(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-stone-500" />
            Mouvements récents
          </h3>
          <Link to="/rapports" className="link-action">Journal complet</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="table-header pb-3">Date</th>
                <th className="table-header pb-3">Type</th>
                <th className="table-header pb-3">Référence</th>
                <th className="table-header pb-3">Produit</th>
                <th className="table-header pb-3 text-center">Variation</th>
                <th className="table-header pb-3 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentMovements.slice(0, 8).map((m) => (
                <tr key={m.id} className="hover:bg-stone-50">
                  <td className="py-3 text-stone-500 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3">
                    <span className="badge">{m.type.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3 font-mono font-medium text-stone-700">{m.reference}</td>
                  <td className="py-3">
                    <p className="font-medium text-stone-900">{m.product?.name || '—'}</p>
                    <p className="font-mono text-sm text-stone-500">{m.product?.sku}</p>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-stone-800">
                    {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-stone-900">{m.newStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewProductModal
        isOpen={newProductModalOpen}
        onClose={() => setNewProductModalOpen(false)}
        onProductCreated={loadDashboard}
      />
    </div>
  );
}
