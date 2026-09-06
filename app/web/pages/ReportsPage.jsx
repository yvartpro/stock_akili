import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  Boxes,
  PieChart,
  ArrowUpDown,
  FileSpreadsheet,
  Smartphone,
  Shield,
  Clock,
  Printer
} from 'lucide-react';

export default function ReportsPage() {
  const [stockValuation, setStockValuation] = useState(null);
  const [topExits, setTopExits] = useState([]);
  const [replenishmentList, setReplenishmentList] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movementTypeFilter, setMovementTypeFilter] = useState('');

  useEffect(() => {
    loadReports();
  }, [movementTypeFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [val, exits, repl, movs] = await Promise.all([
        api.getStockValuation(),
        api.getTopExits(),
        api.getReplenishmentReport(),
        api.getMovements(movementTypeFilter ? { type: movementTypeFilter } : {})
      ]);
      setStockValuation(val);
      setTopExits(exits);
      setReplenishmentList(repl);
      setMovements(movs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!movements || movements.length === 0) return;
    const headers = ['Date', 'Type Mouvement', 'Document Ref', 'SKU', 'Produit', 'Variation', 'Nouveau Stock', 'Motif'];
    const rows = movements.map(m => [
      `"${new Date(m.createdAt).toISOString()}"`,
      `"${m.type}"`,
      `"${m.reference || ''}"`,
      `"${m.product?.sku || ''}"`,
      `"${(m.product?.name || '').replace(/"/g, '""')}"`,
      m.quantityChange,
      m.newStock,
      `"${(m.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mouvements_stock_aps_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !stockValuation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totals = stockValuation?.totals || {};
  const byCategory = stockValuation?.byCategory || {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Rapports Analytiques & Grand Livre des Mouvements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Valorisation financière, propositions d'achat et traçabilité comptable du stock central
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Exporter CSV Mouvements
          </button>
        </div>
      </div>

      {/* Stock Valuation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Valeur Marchande Totale (Cession)</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totals.totalWholesaleValue ? Math.round(totals.totalWholesaleValue).toLocaleString('fr-FR') : '0'} FC
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Sur la base des prix de gros fixés aux points de vente
          </p>
        </div>

        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Coût Total d'Acquisition (Achat)</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totals.totalCostValue ? Math.round(totals.totalCostValue).toLocaleString('fr-FR') : '0'} FC
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Capital immobilisé dans le magasin central
          </p>
        </div>

        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Marge Brute Théorique de Cession</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {totals.potentialMargin ? Math.round(totals.potentialMargin).toLocaleString('fr-FR') : '0'} FC
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Plus-value brute logistique ({totals.totalUnits || 0} pièces)
          </p>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Pochettes */}
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Segment Pochettes de Téléphones</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {byCategory.pochette?.units || 0} pièces
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Références gérées :</span>
              <span className="font-mono font-semibold text-slate-800">{byCategory.pochette?.count || 0} modèles</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Coût d'achat global :</span>
              <span className="font-mono text-slate-800">{byCategory.pochette?.costValue ? Math.round(byCategory.pochette.costValue).toLocaleString('fr-FR') : '0'} FC</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Valeur marchande :</span>
              <span className="font-mono font-bold text-slate-900">{byCategory.pochette?.wholesaleValue ? Math.round(byCategory.pochette.wholesaleValue).toLocaleString('fr-FR') : '0'} FC</span>
            </div>
          </div>
        </div>

        {/* Protections */}
        <div className="p-4 rounded-md bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900">Segment Protections Anti-Casse</h3>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {byCategory.protection?.units || 0} pièces
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Références gérées :</span>
              <span className="font-mono font-semibold text-slate-800">{byCategory.protection?.count || 0} modèles</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Coût d'achat global :</span>
              <span className="font-mono text-slate-800">{byCategory.protection?.costValue ? Math.round(byCategory.protection.costValue).toLocaleString('fr-FR') : '0'} FC</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Valeur marchande :</span>
              <span className="font-mono font-bold text-slate-900">{byCategory.protection?.wholesaleValue ? Math.round(byCategory.protection.wholesaleValue).toLocaleString('fr-FR') : '0'} FC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Replenishment Suggestions Table */}
      <div className="rounded-md bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Suggestions d'Approvisionnement Urgent (Articles sous seuil)
            </h3>
            <p className="text-xs text-slate-500">
              Calcul automatique de la commande recommandée pour reconstituer le stock de sécurité
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                <th className="p-2.5">SKU</th>
                <th className="p-2.5">Produit</th>
                <th className="p-2.5 text-center">Stock Actuel</th>
                <th className="p-2.5 text-center">Seuil Min</th>
                <th className="p-2.5 text-center">Déficit</th>
                <th className="p-2.5 text-center">Commande Recommandée</th>
                <th className="p-2.5 text-right">Budget Estimé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {replenishmentList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    Aucun produit ne requiert de réapprovisionnement d'urgence.
                  </td>
                </tr>
              ) : (
                replenishmentList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-semibold text-blue-700">{item.sku}</td>
                    <td className="p-2.5 font-medium text-slate-900">{item.name}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-600">{item.currentStock} pcs</td>
                    <td className="p-2.5 text-center font-mono text-slate-500">{item.minStockThreshold} pcs</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-700">-{item.deficit} pcs</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">
                        +{item.recommendedOrder} pcs
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {item.estimatedBudget ? Math.round(item.estimatedBudget).toLocaleString('fr-FR') : '0'} FC
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movements Ledger */}
      <div className="rounded-md bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Grand Livre des Mouvements de Stock</h3>
              <p className="text-xs text-slate-500">Journal chronologique inaltérable de tous les flux physiques</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-700 focus:border-blue-600 outline-none"
            >
              <option value="">Tous les types</option>
              <option value="ENTREE_RECEPTION">Entrées (Réceptions Fournisseur)</option>
              <option value="SORTIE_SHOP">Sorties (Bons de Sortie Shops)</option>
              <option value="AJUSTEMENT_INVENTAIRE">Ajustements d'Inventaire</option>
              <option value="DECLARATION_CASSE">Déclarations de Casse / Perte</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                <th className="p-2.5">Date & Heure</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Document Réf.</th>
                <th className="p-2.5">Produit</th>
                <th className="p-2.5 text-center">Quantité</th>
                <th className="p-2.5 text-center">Nouveau Stock</th>
                <th className="p-2.5">Justification / Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.slice(0, 20).map(m => {
                const isPos = m.quantityChange > 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {m.type}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-blue-700 font-semibold">{m.reference}</td>
                    <td className="p-2.5 font-medium text-slate-900">{m.product?.name}</td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      <span className={isPos ? 'text-emerald-700' : 'text-rose-600'}>
                        {isPos ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-900">{m.newStock}</td>
                    <td className="p-2.5 text-slate-500 text-[11px] max-w-xs truncate">{m.reason || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
