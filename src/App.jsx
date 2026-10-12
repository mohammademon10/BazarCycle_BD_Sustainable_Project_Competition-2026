import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import ImpactPage from './pages/public/ImpactPage';
import LoginPage from './pages/public/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMarkets from './pages/admin/AdminMarkets';
import AdminCategories from './pages/admin/AdminCategories';
import AdminWaste from './pages/admin/AdminWaste';
import AdminPickups from './pages/admin/AdminPickups';
import AdminReports from './pages/admin/AdminReports';

// Market Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerWaste from './pages/manager/ManagerWaste';
import ManagerWasteCreate from './pages/manager/ManagerWasteCreate';
import ManagerPickups from './pages/manager/ManagerPickups';
import ManagerImpact from './pages/manager/ManagerImpact';
import ManagerScore from './pages/manager/ManagerScore';

// Collector Pages
import CollectorDashboard from './pages/collector/CollectorDashboard';
import CollectorAvailable from './pages/collector/CollectorAvailable';
import CollectorPickups from './pages/collector/CollectorPickups';
import CollectorHistory from './pages/collector/CollectorHistory';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
              <Route path="/how-it-works" element={<PageTransition><HowItWorksPage /></PageTransition>} />
              <Route path="/impact" element={<PageTransition><ImpactPage /></PageTransition>} />
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/markets"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminMarkets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/waste"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminWaste />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pickups"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPickups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />

              {/* Market Manager Protected Routes */}
              <Route
                path="/manager/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MARKET_MANAGER']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/waste"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MARKET_MANAGER']}>
                    <ManagerWaste />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/waste/create"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MARKET_MANAGER']}>
                    <ManagerWasteCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/pickups"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MARKET_MANAGER']}>
                    <ManagerPickups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/impact"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MARKET_MANAGER']}>
                    <ManagerImpact />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/score"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MARKET_MANAGER']}>
                    <ManagerScore />
                  </ProtectedRoute>
                }
              />

              {/* Collector Protected Routes */}
              <Route
                path="/collector/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COLLECTOR']}>
                    <CollectorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collector/available"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COLLECTOR']}>
                    <CollectorAvailable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collector/pickups"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COLLECTOR']}>
                    <CollectorPickups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collector/history"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COLLECTOR']}>
                    <CollectorHistory />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
