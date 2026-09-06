import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ShieldCheck, Search, Loader2 } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(actionFilter ? { action: actionFilter } : {});
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.user?.name?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.entity?.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Piste d'Audit & Journalisation des Opérations (Art. 12)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Journal inaltérable de sécurité : traçabilité complète des utilisateurs, réceptions, sorties et ajustements
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-md bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par utilisateur, action, détail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-700 focus:border-blue-600 outline-none"
        >
          <option value="">Toutes les actions</option>
          <option value="LOGIN_SUCCESS">Connexions (LOGIN)</option>
          <option value="CREATE_PRODUCT">Création de Produit</option>
          <option value="UPDATE_PRODUCT">Modification Paramètres</option>
          <option value="CREATE_RECEPTION">Réception Marchandise</option>
          <option value="CREATE_EXIT_VOUCHER">Bon de Sortie</option>
          <option value="CREATE_INVENTORY">Création Inventaire</option>
          <option value="ADJUST_INVENTORY">Régularisation Écarts</option>
          <option value="DECLARE_DAMAGED">Déclaration Casse</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="rounded-md bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Horodatage Exact</th>
                <th className="p-3.5">Utilisateur Responsable</th>
                <th className="p-3.5">Action Déclenchée</th>
                <th className="p-3.5">Entité / Réf</th>
                <th className="p-3.5">Détails de l'Opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Chargement des journaux de sécurité...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    Aucun événement d'audit enregistré.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{log.user?.name || log.userName || 'Système'}</p>
                      <span className="text-[10px] text-slate-500">{log.user?.role || 'SYSTEM'}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-blue-700 font-semibold whitespace-nowrap">
                      {log.entity || log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-md">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
