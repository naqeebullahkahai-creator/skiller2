import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AuthModal from "@/components/auth/AuthModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";
import OrderStatusNotification from "./components/orders/OrderStatusNotification";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import HelpCenter from "./pages/HelpCenter";
import ChatWidget from "./components/chat/ChatWidget";
import InstallPrompt from "./components/pwa/InstallPrompt";
import NotificationPermissionBanner from "./components/notifications/NotificationPermissionBanner";
// Account Pages
import AccountLayout from "./components/account/AccountLayout";
import ProfilePage from "./pages/account/ProfilePage";
import OrdersPage from "./pages/account/OrdersPage";
import OrderDetailPage from "./pages/account/OrderDetailPage";
import WishlistPage from "./pages/account/WishlistPage";
import AddressesPage from "./pages/account/AddressesPage";

// Admin Dashboard
import AdminDashboardLayout from "./components/dashboard/AdminDashboardLayout";
import AdminDashboardHome from "./pages/dashboard/AdminDashboardHome";
import AdminOrderManagement from "./pages/dashboard/OrderManagement";
import AdminProductCatalog from "./pages/dashboard/ProductCatalog";
import AdminCategoryManager from "./pages/dashboard/CategoryManager";
import SellerApprovals from "./pages/dashboard/SellerApprovals";
import AdminSettings from "./pages/dashboard/DashboardSettings";
import AdminSellerKyc from "./pages/dashboard/AdminSellerKyc";
import AdminSellerDetail from "./pages/dashboard/AdminSellerDetail";
import AdminPayoutManagement from "./pages/dashboard/AdminPayoutManagement";
import FlashSaleManager from "./pages/dashboard/FlashSaleManager";
import VoucherManager from "./pages/dashboard/VoucherManager";
import BannerManager from "./pages/dashboard/BannerManager";
import AdminBulkUploadLogs from "./pages/dashboard/AdminBulkUploadLogs";
import AdminCancellationsPage from "./pages/dashboard/AdminCancellationsPage";
import AdminReturnsPage from "./pages/dashboard/AdminReturnsPage";

// Seller Dashboard
import SellerDashboardLayout from "./components/dashboard/SellerDashboardLayout";
import SellerKyc from "./pages/seller/SellerKyc";
import SellerWalletPage from "./pages/seller/SellerWalletPage";
import SellerMessagesPage from "./pages/seller/SellerMessagesPage";
import SellerAnalyticsPage from "./pages/seller/SellerAnalyticsPage";
import VerifiedSellerGuard from "./components/seller/VerifiedSellerGuard";
import SellerFlashSalePage from "./pages/seller/SellerFlashSalePage";
import SellerReviewsPage from "./pages/seller/SellerReviewsPage";
import SellerVouchersPage from "./pages/seller/SellerVouchersPage";
import SellerBulkUploadPage from "./pages/seller/SellerBulkUploadPage";

// Admin Analytics
import AdminAnalyticsPage from "./pages/dashboard/AdminAnalyticsPage";
import AdminReviewsPage from "./pages/dashboard/AdminReviewsPage";
import AdminFlashNominations from "./pages/dashboard/AdminFlashNominations";

// Customer Messages
import CustomerMessagesPage from "./pages/account/MessagesPage";
import NotificationsPage from "./pages/account/NotificationsPage";


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <OrderStatusNotification>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <BrowserRouter>
              <InstallPrompt />
              <NotificationPermissionBanner />
              <AuthModal />
              <ChatWidget />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/category/:category" element={<ProductListing />} />
              <Route path="/search" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              {/* Slug-based product URLs also supported via the same route */}
              <Route path="/help" element={<HelpCenter />} />
              
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
                <Route path="messages" element={<CustomerMessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
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
                <Route path="cancellations" element={<AdminCancellationsPage />} />
                <Route path="returns" element={<AdminReturnsPage />} />
                <Route path="products" element={<AdminProductCatalog />} />
                <Route path="categories" element={<AdminCategoryManager />} />
                <Route path="approvals" element={<SellerApprovals />} />
                <Route path="kyc" element={<AdminSellerKyc />} />
                <Route path="kyc/:sellerId" element={<AdminSellerDetail />} />
                <Route path="payouts" element={<AdminPayoutManagement />} />
                <Route path="flash-sales" element={<FlashSaleManager />} />
                <Route path="flash-nominations" element={<AdminFlashNominations />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="vouchers" element={<VoucherManager />} />
                <Route path="banners" element={<BannerManager />} />
                <Route path="bulk-uploads" element={<AdminBulkUploadLogs />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
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
                <Route index element={<VerifiedSellerGuard><AdminDashboardHome /></VerifiedSellerGuard>} />
                <Route path="kyc" element={<SellerKyc />} />
                <Route path="products" element={<VerifiedSellerGuard><AdminProductCatalog /></VerifiedSellerGuard>} />
                <Route path="products/new" element={<VerifiedSellerGuard><AdminProductCatalog /></VerifiedSellerGuard>} />
                <Route path="orders" element={<VerifiedSellerGuard><AdminOrderManagement /></VerifiedSellerGuard>} />
                <Route path="reviews" element={<SellerReviewsPage />} />
                <Route path="vouchers" element={<VerifiedSellerGuard><SellerVouchersPage /></VerifiedSellerGuard>} />
                <Route path="bulk-upload" element={<VerifiedSellerGuard><SellerBulkUploadPage /></VerifiedSellerGuard>} />
                <Route path="flash-sales" element={<SellerFlashSalePage />} />
                <Route path="messages" element={<VerifiedSellerGuard><SellerMessagesPage /></VerifiedSellerGuard>} />
                <Route path="wallet" element={<VerifiedSellerGuard><SellerWalletPage /></VerifiedSellerGuard>} />
                <Route path="analytics" element={<VerifiedSellerGuard><SellerAnalyticsPage /></VerifiedSellerGuard>} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              {/* Forbidden Route */}
              <Route path="/forbidden" element={<Forbidden />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </OrderStatusNotification>
      </CartProvider>
    </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
  </HelmetProvider>
  </ErrorBoundary>
);

export default App;
