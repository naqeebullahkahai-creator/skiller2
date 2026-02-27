

## Plan: Complete Platform Overhaul (Theme + QR Gallery + Domain Links + Notifications)

This is a large scope. I'll break it into 4 focused phases, each implementable in one message.

---

### Phase 1: Premium Clean Theme Overhaul

**Current state:** The theme uses Deep Indigo + Coral with decent foundations but inconsistent styling across dashboards and pages.

**Changes:**

1. **Refined CSS Variables** (`src/index.css`)
   - Softer, more premium background tones (slightly warmer whites)
   - Refined border colors with less visual noise
   - Improved dark mode contrast ratios
   - Add subtle gradient tokens for premium sections

2. **Storefront Components Polish**
   - `ProductCard.tsx` - Tighter spacing, refined shadows, smoother hover states
   - `MainHeader.tsx` - Cleaner search bar styling, better icon alignment
   - `MobileHeader.tsx` - More refined mobile header with premium feel
   - `MobileBottomNav.tsx` - Polished bottom nav with smoother active states
   - `Footer.tsx` - Cleaner layout with better spacing
   - `TopBar.tsx` - Refined utility bar

3. **Dashboard Theme Consistency**
   - `AdminDashboardLayout.tsx` - Professional sidebar with better color scheme (move from slate-900 to a more refined dark surface)
   - `SellerDashboardLayout.tsx` - Match admin's refined dark sidebar treatment
   - Both dashboards: Better desktop header, refined mobile drawer

4. **Homepage Sections**
   - `MobileHomeLayout.tsx` / `Index.tsx` - Better section spacing and gradient treatments
   - Category scroll, flash sale, product grid sections polished

---

### Phase 2: QR Code Scanner - Gallery Image Support

**Current state:** QR scanner only uses camera via BarcodeDetector API.

**Changes:**

1. **Add gallery upload button** to `QRCodeScanner.tsx`
   - Add an "Upload from Gallery" button alongside "Start Camera"
   - Use hidden `<input type="file" accept="image/*">` to pick images
   - Draw selected image to a `<canvas>`, then use BarcodeDetector API to scan it
   - Fallback: If BarcodeDetector unavailable, use `jsQR` library or show unsupported message

---

### Phase 3: Dynamic Domain Links (Auto-detect)

**Current state:** Links in QR codes, share buttons, etc. are hardcoded or use `window.location.origin`.

**Changes:**

1. **Add `site_domain` setting** to `site_settings` table via migration
   - Key: `site_domain`, default value: current lovable domain

2. **Create `useSiteDomain` hook**
   - Reads `site_domain` from site_settings
   - Falls back to `window.location.origin`
   - Provides `buildUrl(path)` helper

3. **Admin UI** - Add domain configuration field to `SocialSettingsPage.tsx`

4. **Update link generators**
   - `QRCodeDisplay.tsx` - Use domain from settings
   - `SocialShareButtons.tsx` - Use domain from settings
   - Any other share/link generation points

---

### Phase 4: Real-time Notifications (All Channels)

**Current state:** Has basic Supabase Realtime notifications + browser Notification API + sonner toasts. Push notifications exist but partially implemented.

**Changes:**

1. **Ensure Realtime is fully wired**
   - Verify `notifications` table has realtime enabled
   - Confirm `useNotifications` hook properly subscribes

2. **Fix Push Notification flow**
   - Review `usePushNotifications` hook - ensure VAPID keys are configured
   - Wire push subscription to backend
   - Create/update edge function to send push notifications when DB notifications are created

3. **In-app toast notifications** - Already working via sonner, verify consistency

4. **Notification triggers audit**
   - Ensure all major events fire notifications: order status changes, wallet credits, subscription events, KYC updates, messages

---

### Implementation Order

I recommend implementing in this order:
1. **Phase 1** (Theme) - Biggest visual impact, touches most files
2. **Phase 2** (QR Gallery) - Quick, isolated change
3. **Phase 3** (Domain Links) - DB migration + hook + UI
4. **Phase 4** (Notifications) - Most complex, needs edge function work

Each phase will be one message. Should I start with **Phase 1 (Premium Clean Theme)**?

