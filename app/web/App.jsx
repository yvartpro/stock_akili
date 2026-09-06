import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StockManagementPage from './pages/StockManagementPage.jsx';
import ReceptionsPage from './pages/ReceptionsPage.jsx';
import ExitVouchersPage from './pages/ExitVouchersPage.jsx';
import InventoriesPage from './pages/InventoriesPage.jsx';
import DamagedProductsPage from './pages/DamagedProductsPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import ShopsPage from './pages/ShopsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AuditLogsPage from './pages/AuditLogsPage.jsx';
import UsersManagementPage from './pages/UsersManagementPage.jsx';

// Protected route guard
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected app routes inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Layout>
                <StockManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptions"
          element={
            <ProtectedRoute>
              <Layout>
                <ReceptionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sorties"
          element={
            <ProtectedRoute>
              <Layout>
                <ExitVouchersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventaires"
          element={
            <ProtectedRoute>
              <Layout>
                <InventoriesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/endommages"
          element={
            <ProtectedRoute>
              <Layout>
                <DamagedProductsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/fournisseurs"
          element={
            <ProtectedRoute>
              <Layout>
                <SuppliersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shops"
          element={
            <ProtectedRoute>
              <Layout>
                <ShopsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rapports"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin only routes */}
        <Route
          path="/audit"
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <AuditLogsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/utilisateurs"
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <UsersManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
