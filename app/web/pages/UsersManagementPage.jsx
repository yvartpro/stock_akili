import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Users, Plus, Shield, User, Mail, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('gestionnaire');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.createUser({
        name,
        email,
        password,
        role
      });

      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('gestionnaire');
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.updateUser(user.id, {
        isActive: !user.isActive
      });
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestion des Utilisateurs & Rôles de Sécurité
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contrôle d'accès basé sur les rôles (RBAC) : Administrateur système et Gestionnaires du stock principal
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-md bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Nom Complet</th>
                <th className="p-3.5">Email de Connexion</th>
                <th className="p-3.5">Rôle Système</th>
                <th className="p-3.5 text-center">Statut du Compte</th>
                <th className="p-3.5">Date de Création</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">
                      {u.email}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {u.role === 'admin' ? 'Administrateur' : 'Gestionnaire Stock'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                      >
                        {u.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-md p-5 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-0.5">
              Créer un Utilisateur
            </h3>
            <p className="text-xs text-slate-500 mb-3.5">
              Attribuez un compte et définissez le périmètre de sécurité
            </p>

            {error && (
              <div className="mb-3 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom Complet *</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Professionnel *</label>
                <input
                  type="email"
                  placeholder="j.dupont@aps.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de Passe Initial *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle Système *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:border-blue-600 outline-none"
                  required
                >
                  <option value="gestionnaire">Gestionnaire de Stock Principal (Stock, Bons, Réceptions)</option>
                  <option value="admin">Administrateur (Tous droits, Utilisateurs, Piste d'Audit)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Création...' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
