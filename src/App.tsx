import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VisualEditProvider } from "@/contexts/VisualEditContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import AuthModal from "@/components/auth/AuthModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";
import OrderStatusNotification from "./components/orders/OrderStatusNotification";
import ComparisonBar from "./components/comparison/ComparisonBar";
import VisualEditToggle from "./components/admin/VisualEditToggle";
import BackToDashboardBar from "./components/navigation/BackToDashboardBar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SellerAuth from "./pages/seller/SellerAuth";
import BusinessAuth from "./pages/business/BusinessAuth";
import EmailVerificationPending from "./pages/business/EmailVerificationPending";
import EmailVerificationSuccess from "./pages/business/EmailVerificationSuccess";
import CustomerAuth from "./pages/auth/CustomerAuth";
import ResetPassword from "./pages/ResetPassword";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import ComparePage from "./pages/ComparePage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
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
import CustomerMessagesPage from "./pages/account/MessagesPage";
import NotificationsPage from "./pages/account/NotificationsPage";

// New Mobile-First Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import SellerDashboard from "./pages/seller/SellerDashboard";
import DashboardPageWrapper from "./components/layout/DashboardPageWrapper";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";

// Admin Sub-Pages (reused from old structure)
import AdminOrderManagement from "./pages/dashboard/OrderManagement";
import AdminProductCatalog from "./pages/dashboard/ProductCatalog";
import AdminCategoryManager from "./pages/dashboard/AdminCategoryManager";
import AdminProductApprovals from "./pages/dashboard/AdminProductApprovals";
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
import AdminUserDirectory from "./pages/dashboard/AdminUserDirectory";
import AdminSellersDirectory from "./pages/dashboard/AdminSellersDirectory";
import AdminSellerDetailPage from "./pages/dashboard/AdminSellerDetailPage";
import AdminRolesPage from "./pages/dashboard/AdminRolesPage";
import SocialSettingsPage from "./pages/dashboard/SocialSettingsPage";
import AdminAnalyticsPage from "./pages/dashboard/AdminAnalyticsPage";
import AdminReviewsPage from "./pages/dashboard/AdminReviewsPage";
import AdminFlashNominations from "./pages/dashboard/AdminFlashNominations";
import AdminQAModerationPage from "./pages/dashboard/AdminQAModerationPage";
import AdminCancelledOrdersPage from "./pages/admin/AdminCancelledOrdersPage";
import AdminSubscriptionPage from "./pages/dashboard/AdminSubscriptionPage";

// Seller Sub-Pages
import SellerKyc from "./pages/seller/SellerKyc";
import SellerWalletPage from "./pages/seller/SellerWalletPage";
import SellerMessagesPage from "./pages/seller/SellerMessagesPage";
import SellerAnalyticsPage from "./pages/seller/SellerAnalyticsPage";
import VerifiedSellerGuard from "./components/seller/VerifiedSellerGuard";
import SellerFlashSalePage from "./pages/seller/SellerFlashSalePage";
import SellerReviewsPage from "./pages/seller/SellerReviewsPage";
import SellerVouchersPage from "./pages/seller/SellerVouchersPage";
import SellerBulkUploadPage from "./pages/seller/SellerBulkUploadPage";
import SellerProductsPage from "./pages/seller/SellerProductsPage";
import SellerAddProductPage from "./pages/seller/SellerAddProductPage";
import SellerReturnsPage from "./pages/seller/SellerReturnsPage";
import SellerQAPage from "./pages/seller/SellerQAPage";
import SellerCancelledOrdersPage from "./pages/seller/SellerCancelledOrdersPage";
import SellerSettingsPage from "./pages/seller/SellerSettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global stale-while-revalidate defaults
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Admin page wrapper component
const AdminPageWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <PermissionsProvider>
    <DashboardProvider>
      <DashboardPageWrapper title={title} backHref="/admin/dashboard">
        {children}
      </DashboardPageWrapper>
    </DashboardProvider>
  </PermissionsProvider>
);

// Seller page wrapper component
const SellerPageWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <DashboardProvider>
    <DashboardPageWrapper title={title} backHref="/seller/dashboard">
      {children}
    </DashboardPageWrapper>
  </DashboardProvider>
);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <ViewModeProvider>
              <VisualEditProvider>
                <CartProvider>
                  <ComparisonProvider>
                    <OrderStatusNotification>
                      <MaintenanceGuard>
                        <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <OfflineIndicator />
                          <BrowserRouter>
                          <BackToDashboardBar />
                          <InstallPrompt />
                          <NotificationPermissionBanner />
                          <AuthModal />
                          <ChatWidget />
                          <ComparisonBar />
                          <VisualEditToggle />
                          <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          
                          {/* Customer Auth Routes - /auth/* */}
                          <Route path="/auth/login" element={<CustomerAuth />} />
                          <Route path="/auth/signup" element={<CustomerAuth />} />
                          
                          {/* Business Partner Auth Routes - /business/* */}
                          <Route path="/business/login" element={<BusinessAuth />} />
                          <Route path="/business/signup" element={<BusinessAuth />} />
                          <Route path="/business/verify-email-pending" element={<EmailVerificationPending />} />
                          <Route path="/business/verify-email-success" element={<EmailVerificationSuccess />} />
                          
                          {/* Legacy Seller Auth Routes - Redirect to /business/* */}
                          <Route path="/seller/login" element={<SellerAuth />} />
                          <Route path="/seller/signup" element={<SellerAuth />} />
                          
                          {/* Password Reset Route */}
                          <Route path="/reset-password" element={<ResetPassword />} />
                          
                          {/* Password Reset Route */}
                          <Route path="/reset-password" element={<ResetPassword />} />
                          
                          <Route path="/products" element={<ProductListing />} />
                          <Route path="/category/:slug" element={<CategoryPage />} />
                          <Route path="/search" element={<ProductListing />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/compare" element={<ComparePage />} />
                          <Route path="/help" element={<HelpCenter />} />
                          <Route path="/contact" element={<ContactUs />} />
                          
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
                          
                          {/* NEW Admin Routes - /admin/* */}
                          <Route 
                            path="/admin/dashboard" 
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <PermissionsProvider>
                                  <AdminDashboard />
                                </PermissionsProvider>
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Customers"><AdminUserDirectory /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/sellers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Sellers"><AdminSellersDirectory /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/sellers/:sellerId" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Seller Details"><AdminSellerDetailPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Roles & Permissions"><AdminRolesPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Orders"><AdminOrderManagement /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/cancellations" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Cancellations"><AdminCancellationsPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/cancelled" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Cancelled Orders"><AdminCancelledOrdersPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/orders/cancelled" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Cancelled Orders"><AdminCancelledOrdersPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/returns" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Returns"><AdminReturnsPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Products"><AdminProductCatalog /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Categories"><AdminCategoryManager /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Product Approvals"><AdminProductApprovals /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/seller-kyc" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Seller KYC"><AdminSellerKyc /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/seller-kyc/:sellerId" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Seller Details"><AdminSellerDetail /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/payouts" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Payouts"><AdminPayoutManagement /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Subscriptions"><AdminSubscriptionPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/flash-sales" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Flash Sales"><FlashSaleManager /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/flash-nominations" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Flash Nominations"><AdminFlashNominations /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Reviews"><AdminReviewsPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/qa" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Q&A Moderation"><AdminQAModerationPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/vouchers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Vouchers"><VoucherManager /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/banners" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Banners"><BannerManager /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/bulk-uploads" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Bulk Uploads"><AdminBulkUploadLogs /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Analytics"><AdminAnalyticsPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/site-settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Site Settings"><SocialSettingsPage /></AdminPageWrapper></ProtectedRoute>} />
                          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPageWrapper title="Settings"><AdminSettings /></AdminPageWrapper></ProtectedRoute>} />

                          {/* NEW Seller Routes - /seller/* */}
                          <Route 
                            path="/seller/dashboard" 
                            element={
                              <ProtectedRoute allowedRoles={["seller"]}>
                                <SellerDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/seller/kyc" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="KYC Verification"><SellerKyc /></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/products" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="My Products"><VerifiedSellerGuard><SellerProductsPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/products/new" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Add Product"><VerifiedSellerGuard><SellerAddProductPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Orders"><VerifiedSellerGuard><AdminOrderManagement /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/vouchers" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Vouchers"><VerifiedSellerGuard><SellerVouchersPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/reviews" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Reviews"><SellerReviewsPage /></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/qa" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Q&A"><VerifiedSellerGuard><SellerQAPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/bulk-upload" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Bulk Upload"><VerifiedSellerGuard><SellerBulkUploadPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/flash-sale" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Flash Sale"><SellerFlashSalePage /></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/messages" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Messages"><VerifiedSellerGuard><SellerMessagesPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/wallet" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Wallet"><VerifiedSellerGuard><SellerWalletPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/analytics" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Analytics"><VerifiedSellerGuard><SellerAnalyticsPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/returns" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Returns"><VerifiedSellerGuard><SellerReturnsPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/cancelled" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Cancelled Orders"><VerifiedSellerGuard><SellerCancelledOrdersPage /></VerifiedSellerGuard></SellerPageWrapper></ProtectedRoute>} />
                          <Route path="/seller/settings" element={<ProtectedRoute allowedRoles={["seller"]}><SellerPageWrapper title="Settings"><SellerSettingsPage /></SellerPageWrapper></ProtectedRoute>} />

                          {/* Legacy route redirects */}
                          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="/admin-dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="/seller-center" element={<Navigate to="/seller/dashboard" replace />} />
                          <Route path="/seller-center/*" element={<Navigate to="/seller/dashboard" replace />} />
                          
                          {/* Forbidden Route */}
                          <Route path="/forbidden" element={<Forbidden />} />
                          
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                    </TooltipProvider>
                  </MaintenanceGuard>
                </OrderStatusNotification>
                </ComparisonProvider>
              </CartProvider>
            </VisualEditProvider>
          </ViewModeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
</ErrorBoundary>
);

export default App;
