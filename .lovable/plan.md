


## Plan: Complete Platform Overhaul (Theme + QR Gallery + Domain Links + Notifications)

---

### Phase 1: Premium Clean Theme Overhaul ✅ DONE

- Refined CSS variables: warmer backgrounds, softer borders, premium dashboard tokens
- Added `--dashboard-sidebar-*` semantic tokens for consistent sidebar theming
- Polished storefront: ProductCard, MainHeader, MobileHeader, MobileBottomNav, Footer, TopBar
- Unified Admin & Seller dashboard sidebars using design tokens (no more hardcoded slate colors)
- Homepage sections refined with better gradients and spacing

---

### Phase 2: QR Code Scanner - Gallery Image Support ✅ DONE

1. Added gallery upload button to `QRCodeScanner.tsx`
2. Uses hidden `<input type="file" accept="image/*">` + canvas + BarcodeDetector
3. Loading state while processing gallery image
4. Fallback message for unsupported browsers

---

### Phase 3: Dynamic Domain Links (Auto-detect) ✅ DONE

1. Added `site_domain` setting to `site_settings` table
2. Created `useSiteDomain` hook with `buildUrl(path)` helper
3. Admin UI in `SocialSettingsPage.tsx` for domain configuration
4. Updated QRCodeDisplay and SocialShareButtons to use dynamic domain

---

### Phase 4: Real-time Notifications (All Channels) ✅ DONE

1. ✅ Enabled Realtime on `notifications` table (was missing)
2. ✅ Realtime subscription in `useNotifications` hook already working
3. ✅ Browser Notification API integrated (shows native notifications)
4. ✅ Sonner toast notifications with type-based styling
5. ✅ NotificationBell with animated unread badge
6. ✅ DB triggers: order status, messages, support sessions
7. ⚠️ Push VAPID key is placeholder — needs real VAPID keys for production push notifications
