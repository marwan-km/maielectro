import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import TopBar from './components/layout/TopBar.jsx';
import Header from './components/layout/Header.jsx';
import Navbar from './components/layout/Navbar.jsx';
import MobileMenu from './components/layout/MobileMenu.jsx';
import Footer from './components/layout/Footer.jsx';
import WhatsAppButton from './components/ui/WhatsAppButton.jsx';

const AdminRoute = lazy(() => import('./components/admin/AdminRoute.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const Repair = lazy(() => import('./pages/Repair.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs.jsx'));
const AdminStock = lazy(() => import('./pages/admin/AdminStock.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'));
const AdminHelp = lazy(() => import('./pages/admin/AdminHelp.jsx'));
const AdminResetPassword = lazy(() => import('./pages/admin/AdminResetPassword.jsx'));
const AdminRepairServices = lazy(() => import('./pages/admin/AdminRepairServices.jsx'));

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(location.hash.slice(1));
      const targetPath = hashParams.get('type') === 'recovery' ? '/admin/reset-password' : '/admin';
      if (location.pathname !== targetPath) {
        navigate({ pathname: targetPath, hash: location.hash }, { replace: true });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  }, [location.hash, location.pathname, navigate]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
      {!isAdminRoute && (
        <>
          <TopBar />
          <Header onMenuOpen={() => setIsMenuOpen(true)} />
          <Navbar />
          <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
      )}
      <main>
        <Suspense fallback={<RouteFallback isAdmin={isAdminRoute} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/repair" element={<Repair />} />
            <Route path="/reparation" element={<Repair />} />
            {/* Blog removed from UI — redirect to homepage */}
            <Route path="/blog" element={<Navigate to="/" replace />} />
            <Route path="/blog/*" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/stock" element={<AdminRoute><AdminStock /></AdminRoute>} />
            <Route path="/admin/repair-services" element={<AdminRoute><AdminRepairServices /></AdminRoute>} />
            <Route path="/admin/admins" element={<AdminRoute superAdminOnly><AdminUsers /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute superAdminOnly><AdminUsers /></AdminRoute>} />
            <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/help" element={<AdminRoute><AdminHelp /></AdminRoute>} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}
    </div>
  );
}

function RouteFallback({ isAdmin }) {
  return (
    <div className={isAdmin ? 'p-6 lg:p-8' : 'container-shell py-10'}>
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="h-10 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
      </div>
    </div>
  );
}
