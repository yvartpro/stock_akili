import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-sky-50 p-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xl">
              APS
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              APS Stock Principal
            </h1>
            <p className="text-sm text-stone-500 mt-2">
              Gestion du stock central — pochettes & protections
            </p>
          </div>

          {error && (
            <div className="alert-error mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 text-stone-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Adresse email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aps.cd"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200">
            <p className="text-sm font-medium text-stone-500 text-center mb-4">
              Comptes démonstration
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-4 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition-colors cursor-pointer"
              >
                <span className="badge mb-2">Admin</span>
                <p className="text-sm font-semibold text-stone-900">Christian Kabamba</p>
                <p className="text-sm text-stone-500 mt-0.5">Droits système</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('gestionnaire')}
                className="p-4 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition-colors cursor-pointer"
              >
                <span className="badge mb-2">Gestionnaire</span>
                <p className="text-sm font-semibold text-stone-900">Grace Tshilombo</p>
                <p className="text-sm text-stone-500 mt-0.5">Stock & logistique</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-stone-400 mt-6">
          APS Stock Principal v2.4
        </p>
      </div>
    </div>
  );
}
