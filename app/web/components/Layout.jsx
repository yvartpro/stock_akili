import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  AlertOctagon,
  Truck,
  Store,
  BarChart3,
  ShieldCheck,
  Users,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin, quickSwitch } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function checkAlerts() {
      try {
        const res = await api.getAlerts();
        setAlertCount(res.count || 0);
      } catch (e) {
        // ignore
      }
    }
    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/stock', label: 'Stock Principal', icon: Boxes },
    { to: '/receptions', label: 'Réceptions', icon: ArrowDownToLine },
    { to: '/sorties', label: 'Bons de Sortie', icon: ArrowUpFromLine },
    { to: '/inventaires', label: 'Inventaires', icon: ClipboardCheck },
    { to: '/endommages', label: 'Articles Endommagés', icon: AlertOctagon },
    { to: '/fournisseurs', label: 'Fournisseurs', icon: Truck },
    { to: '/shops', label: 'Points de Vente', icon: Store },
    { to: '/rapports', label: 'Rapports', icon: BarChart3 },
    ...(isAdmin ? [
      { to: '/audit', label: 'Journaux d\'Audit', icon: ShieldCheck, adminOnly: true },
      { to: '/utilisateurs', label: 'Utilisateurs', icon: Users, adminOnly: true },
    ] : [])
  ];

  const pageLabels = {
    '': 'Tableau de bord',
    stock: 'Stock Principal',
    receptions: 'Réceptions',
    sorties: 'Bons de Sortie',
    inventaires: 'Inventaires',
    endommages: 'Articles Endommagés',
    fournisseurs: 'Fournisseurs',
    shops: 'Points de Vente',
    rapports: 'Rapports',
    audit: 'Journaux d\'Audit',
    utilisateurs: 'Utilisateurs',
  };

  const currentPage = pageLabels[location.pathname.replace('/', '')] || 'Tableau de bord';

  return (
    <div className="flex h-screen w-full bg-sky-50 text-stone-800 overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-stone-200
        flex flex-col transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-base">
                APS
              </div>
              <div>
                <h1 className="font-bold text-base text-stone-900">APS Stock</h1>
                <p className="text-sm text-stone-500">Gestion entrepôt</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'nav-active' : 'nav-inactive'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)) ? 'text-sky-700' : 'text-stone-400 group-hover:text-sky-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.to === '/stock' && alertCount > 0 && (
                  <span className="badge-alert min-w-[1.5rem] justify-center">
                    {alertCount}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="badge text-sm">Admin</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-200">
          <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center font-semibold text-sky-700 text-sm shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || 'AP'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">{user?.name || 'Utilisateur'}</p>
                  <span className="badge text-sm mt-0.5">
                    {isAdmin ? 'Administrateur' : 'Gestionnaire'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-2 text-stone-400 hover:text-sky-700 hover:bg-sky-100 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-stone-400" />
                Rôle
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => quickSwitch('admin')}
                  className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isAdmin
                      ? 'bg-sky-600 text-white'
                      : 'bg-white hover:bg-sky-50 text-stone-600 border border-stone-200'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => quickSwitch('gestionnaire')}
                  className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${
                    !isAdmin
                      ? 'bg-sky-600 text-white'
                      : 'bg-white hover:bg-sky-50 text-stone-600 border border-stone-200'
                  }`}
                >
                  Gestionnaire
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 px-4 md:px-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-sky-100 text-sky-700 hover:text-sky-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500">
              <span>APS Magasin Principal</span>
              <ChevronRight className="w-4 h-4 text-stone-300" />
              <span className="text-stone-900 font-medium">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NavLink
              to="/stock?lowStock=true"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                alertCount > 0
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-sky-50 text-stone-600 border-stone-200 hover:bg-sky-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{alertCount} alerte{alertCount > 1 ? 's' : ''}</span>
            </NavLink>

            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-stone-800">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
