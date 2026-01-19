import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AuthModal from "@/components/auth/AuthModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

// Account Pages
import AccountLayout from "./components/account/AccountLayout";
import ProfilePage from "./pages/account/ProfilePage";
import OrdersPage from "./pages/account/OrdersPage";
import OrderDetailPage from "./pages/account/OrderDetailPage";
import WishlistPage from "./pages/account/WishlistPage";
import AddressesPage from "./pages/account/AddressesPage";

// Admin Dashboard
import AdminDashboardLayout from "./components/dashboard/AdminDashboardLayout";
import AdminDashboardHome from "./pages/dashboard/DashboardHome";
import AdminOrderManagement from "./pages/dashboard/OrderManagement";
import AdminProductCatalog from "./pages/dashboard/ProductCatalog";
import AdminCategoryManager from "./pages/dashboard/CategoryManager";
import SellerApprovals from "./pages/dashboard/SellerApprovals";
import AdminSettings from "./pages/dashboard/DashboardSettings";

// Seller Dashboard
import SellerDashboardLayout from "./components/dashboard/SellerDashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthModal />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/category/:category" element={<ProductListing />} />
              <Route path="/search" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* Checkout Routes */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
              
              {/* Customer Account Routes */}
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <AccountLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/account/profile" replace />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="addresses" element={<AddressesPage />} />
              </Route>
              <Route path="/my-orders" element={<Navigate to="/account/orders" replace />} />
              
              {/* Admin Dashboard Routes */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardHome />} />
                <Route path="orders" element={<AdminOrderManagement />} />
                <Route path="products" element={<AdminProductCatalog />} />
                <Route path="categories" element={<AdminCategoryManager />} />
                <Route path="approvals" element={<SellerApprovals />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Seller Dashboard Routes */}
              <Route 
                path="/seller-center" 
                element={
                  <ProtectedRoute allowedRoles={["seller"]}>
                    <SellerDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardHome />} />
                <Route path="products" element={<AdminProductCatalog />} />
                <Route path="orders" element={<AdminOrderManagement />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
