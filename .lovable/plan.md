

# FANZOON Complete Site Rebuild — Phased Plan

## Current Issues Identified
1. **Scroll lock** — `ScrollToTop` aggressively fights scroll locks but doesn't always win on all devices/browsers
2. **Data not loading** — Products, categories depend on Supabase queries that may silently fail
3. **UI broken on mobile** — ProductDetail page uses desktop-first layout on mobile (no separate mobile view)
4. **No mobile ProductDetail** — Unlike Index which has `MobileHomeLayout`, ProductDetail serves same layout to all screens
5. **PWA cache staleness** — Old service workers serve broken cached pages

---

## Phase Breakdown (8 Phases)

### Phase 1: Nuclear Scroll Fix + CSS Foundation Reset
**Files:** `src/index.css`, `src/components/ScrollToTop.tsx`, `src/main.tsx`, `vite.config.ts`

- Remove all complex scroll enforcement logic from ScrollToTop — replace with simple, bulletproof approach using `!important` CSS rules directly on `html` and `body`
- Add CSS rule: `html, body { overflow-y: auto !important; overflow-x: hidden !important; position: static !important; }`
- Simplify ScrollToTop to just scroll to top on route change — no MutationObserver, no intervals, no style overrides
- Bump PWA cache version to force fresh load
- Remove service worker cache complexity — use `NetworkFirst` for all resources

### Phase 2: Home Page Rebuild (Mobile + Desktop)
**Files:** `src/pages/Index.tsx`, `src/components/mobile/MobileHomeLayout.tsx`, `src/components/layout/MobileHeader.tsx`, `src/components/layout/MobileBottomNav.tsx`, `src/components/home/HeroCarousel.tsx`, `src/components/home/Categories.tsx`

- Rebuild mobile home with clean sections: Hero → Categories → Flash Sale → Just For You grid
- Fix MobileHeader hide-on-scroll behavior
- Ensure MobileBottomNav doesn't overlap content (proper `pb-16`)
- Desktop home: clean Header → Hero → Categories → Flash Sale → Products → Footer
- Add proper error boundaries around each section so one failing section doesn't break the page
- Add loading/error/empty states for all data sections

### Phase 3: Product Detail Page Rebuild
**Files:** `src/pages/ProductDetail.tsx`, new `src/components/mobile/MobileProductDetail.tsx`

- Create dedicated mobile product detail layout like Daraz/Amazon app:
  - Full-width image gallery swiper
  - Price + discount badge
  - Variant selector
  - Add to Cart / Buy Now sticky bottom bar
  - Collapsible description/specs
  - Reviews section
- Desktop: 3-column layout (Gallery | Info | Delivery) — keep current but clean up
- Add `isMobile` check to render correct layout
- Proper loading skeleton and error states

### Phase 4: Product Listing + Category Pages
**Files:** `src/pages/ProductListing.tsx`, `src/pages/CategoryPage.tsx`, `src/components/product/ProductCard.tsx`, `src/components/mobile/MobileProductCard.tsx`

- Rebuild product cards with consistent sizing
- Mobile: 2-column grid, compact cards
- Desktop: responsive grid with filters sidebar
- Fix InfiniteProductGrid error handling
- Add "No products found" empty states

### Phase 5: Auth + Account Pages Polish  
**Files:** `src/pages/auth/CustomerAuth.tsx`, `src/components/account/AccountLayout.tsx`, account sub-pages

- Clean auth forms (login/signup) for mobile
- Account page mobile menu grid
- Orders, Wallet, Profile pages — consistent card-based layout
- Ensure all protected routes redirect properly

### Phase 6: Checkout + Order Flow
**Files:** `src/pages/Checkout.tsx`, `src/pages/OrderSuccess.tsx`, `src/pages/TrackOrder.tsx`

- Mobile-optimized checkout steps
- Order success page with clear CTA
- Track order with status stepper

### Phase 7: Dashboard Pages (Admin + Seller)
**Files:** Admin management hubs, Seller dashboard pages

- Ensure all hub pages render correctly on mobile with `overflow-x-hidden`
- Fix any data loading issues in dashboard analytics
- Consistent card/table layouts across all management pages

### Phase 8: Final QA + PWA Polish
**Files:** `vite.config.ts`, `src/main.tsx`, various component files

- Final scroll verification across all pages
- PWA manifest and icons check
- Performance audit — lazy loading, code splitting
- Test all routes for 404s or broken links
- Final cache version bump for production deploy

---

## Technical Details

**Scroll Fix Strategy (Phase 1):**
The current approach of fighting scroll locks with JS is fragile. Instead, add a CSS layer with `!important` that cannot be overridden by any library (Radix, Vaul). For modals/drawers, use a CSS class `.scroll-locked` that temporarily allows the lock, and remove it on close.

**Data Loading Pattern:**
Every section that loads from database will have 3 states: Loading (skeleton), Error (retry button), Empty (illustration + message). This prevents blank white screens.

**Mobile-First Approach:**
Each page will check `useIsMobile()` and render a dedicated mobile component, same pattern as `Index.tsx` already uses with `MobileHomeLayout`.

---

## Estimated: 8 phases, each done in 1-2 messages = ~10-16 messages total

Kya main Phase 1 (Scroll fix + CSS foundation) se shuru karoon?

