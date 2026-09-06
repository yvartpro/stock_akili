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
  Package,
  Layers,
  ChevronRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin, isManager, quickSwitch } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch low stock alerts count periodically
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

  // Close mobile sidebar on route change
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
    { to: '/receptions', label: 'Réceptions (Entrées)', icon: ArrowDownToLine },
    { to: '/sorties', label: 'Bons de Sortie', icon: ArrowUpFromLine },
    { to: '/inventaires', label: 'Inventaires & Écarts', icon: ClipboardCheck },
    { to: '/endommages', label: 'Articles Endommagés', icon: AlertOctagon },
    { to: '/fournisseurs', label: 'Fournisseurs', icon: Truck },
    { to: '/shops', label: 'Points de Vente', icon: Store },
    { to: '/rapports', label: 'Rapports & Stats', icon: BarChart3 },
    ...(isAdmin ? [
      { to: '/audit', label: 'Journaux d\'Audit', icon: ShieldCheck, adminOnly: true },
      { to: '/utilisateurs', label: 'Utilisateurs & Rôles', icon: Users, adminOnly: true },
    ] : [])
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-56 bg-white border-r border-slate-200
        flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                APS
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                  APS Stock
                  <span className="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-medium">
                    v2.4
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Stock Principal & Logistique</p>
              </div>
            </div>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-700">Entrepôt Actif</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">APS-HUB-01</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          <div className="px-2.5 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Opérations & Stock
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    location.pathname === item.to ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.to === '/stock' && alertCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 border border-rose-200">
                    {alertCount}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Admin
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Role Switcher */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="p-2.5 rounded-md bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || 'AP'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Utilisateur'}</p>
                  <span className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                    isAdmin 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {isAdmin ? 'Administrateur' : 'Gestionnaire Stock'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Quick role toggle for testing */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-[11px]">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Rôle :
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => quickSwitch('admin')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    isAdmin 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => quickSwitch('gestionnaire')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    !isAdmin 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  Gestionnaire
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        {/* Top bar */}
        <header className="h-14 px-3 md:px-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="text-slate-600 font-medium">APS Magasin Principal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold capitalize">
                {location.pathname.replace('/', '') || 'Tableau de bord'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alert banner trigger */}
            <NavLink
              to="/stock?lowStock=true"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                alertCount > 0 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>{alertCount} Alerte{alertCount > 1 ? 's' : ''} Stock</span>
            </NavLink>

            {/* Live date stamp */}
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-slate-800">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              <p className="text-[10px] text-slate-500">Stock temps réel</p>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-2.5 md:p-3">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
