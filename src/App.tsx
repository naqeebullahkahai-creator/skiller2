import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";

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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthModal />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/category/:category" element={<ProductListing />} />
            <Route path="/search" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
