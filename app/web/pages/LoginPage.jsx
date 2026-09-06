import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, KeyRound, Mail, AlertCircle, ArrowRight, Smartphone, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      await quickSwitch(role);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xl">
              APS
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              APS Stock Principal
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Gestion logistique du stock central des pochettes & protections anti-casse
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse Email Professionnelle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aps.cd"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de Passe Sécurisé
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Connexion en cours...' : 'Accéder au Stock Principal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Logins */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Comptes Démonstration (Accès Rapide)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-800">
                    Admin
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs font-bold text-slate-900">Christian Kabamba</p>
                <p className="text-[10px] text-slate-600">Droits système & Audit</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('gestionnaire')}
                className="p-2.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">
                    Gestionnaire
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs font-bold text-slate-900">Grace Tshilombo</p>
                <p className="text-[10px] text-slate-600">Stock, Réceptions & Sorties</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer specs */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          Système conforme au Cahier des Charges APS • JWT Role-Based Auth
        </p>
      </div>
    </div>
  );
}
