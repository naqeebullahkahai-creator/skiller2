

## Plan: Complete Platform Overhaul (Theme + QR Gallery + Domain Links + Notifications)

---

### Phase 1: Premium Clean Theme Overhaul ✅ DONE

- Refined CSS variables: warmer backgrounds, softer borders, premium dashboard tokens
- Added `--dashboard-sidebar-*` semantic tokens for consistent sidebar theming
- Polished storefront: ProductCard, MainHeader, MobileHeader, MobileBottomNav, Footer, TopBar
- Unified Admin & Seller dashboard sidebars using design tokens (no more hardcoded slate colors)
- Homepage sections refined with better gradients and spacing

---

### Phase 2: QR Code Scanner - Gallery Image Support (NEXT)

1. Add gallery upload button to `QRCodeScanner.tsx`
2. Use hidden `<input type="file" accept="image/*">` + canvas + BarcodeDetector
3. Fallback for unsupported browsers

---

### Phase 3: Dynamic Domain Links (Auto-detect)

1. Add `site_domain` setting to `site_settings` table
2. Create `useSiteDomain` hook
3. Admin UI in `SocialSettingsPage.tsx`
4. Update QRCodeDisplay, SocialShareButtons

---

### Phase 4: Real-time Notifications (All Channels)

1. Verify Realtime on notifications table
2. Fix Push Notification flow (VAPID)
3. Notification triggers audit
