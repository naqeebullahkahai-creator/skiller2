

# FANZON Mobile UI -- Native App Style Overhaul

## Overview

Mobile UI ko completely redesign karein ge taake yeh web jaisa na lagay balkay ek real native app (Daraz/Shopee style) jaisa feel karay. Desktop UI bilkul same rahega, sirf mobile pe changes hongi.

---

## Part 1: Mobile Home Page (Complete Redesign)

### 1.1 New Mobile Home Layout

Ek naya `MobileHomeLayout.tsx` component banay ga jo sirf mobile pe render hoga. `Index.tsx` mein `useIsMobile()` se detect karay ga ke mobile hai ya desktop.

**Design:**
- Full-width edge-to-edge layout (no container margins)
- Har section ke beech subtle spacing
- Smooth scroll behavior

### 1.2 Swipeable Hero Banner

Naya `MobileHeroBanner.tsx` -- touch swipe support ke saath:
- Full-width images (no padding/margins)
- Rounded pill dot indicators at bottom
- Auto-slide every 4 seconds
- Touch swipe gestures (embla-carousel already installed)

### 1.3 Horizontal Scrolling Categories

Naya `MobileCategoryScroll.tsx`:
- Horizontal scroll (left-right swipe)
- Round icon circles with labels below
- No grid -- single row scrollable
- Smooth momentum scrolling

### 1.4 Mobile Flash Sale Section

Naya `MobileFlashSale.tsx`:
- Compact countdown timer bar at top (red gradient)
- Horizontal scrollable product cards
- Tighter card design with bigger discount badges

### 1.5 Full-Screen Search Overlay

Naya `MobileSearchOverlay.tsx`:
- Tappable search pill in header (replaces current input)
- Full-screen overlay when tapped
- Recent searches list
- Auto-focus on open

---

## Part 2: Premium Mobile Product Cards

### 2.1 MobileProductCard Redesign

Current card update karay ga:
- `rounded-2xl` corners with soft shadow
- Floating "Add to Cart" icon button on image corner
- Bigger discount badge with gradient background
- Sold count badge for popular items
- Smooth image loading with fade-in animation
- Rating stars inline with actual product rating

---

## Part 3: Mobile Bottom Navigation Enhancement

### 3.1 Glass Effect Bottom Nav

`MobileBottomNav.tsx` update:
- Glass/blur effect background (`backdrop-blur-xl` + semi-transparent bg)
- Active tab: filled icon + colored label + subtle glow
- Cart badge with bounce animation on count change
- Smoother press animation

---

## Part 4: Mobile Header Redesign

### 4.1 Compact Header

`MobileHeader.tsx` update:
- FANZON logo left, notification + avatar right
- Search bar becomes a tappable pill shape
- Tapping pill opens full-screen search overlay
- Cleaner, more compact look

---

## Part 5: Mobile CSS Utilities

### 5.1 New CSS Classes in `index.css`

- `.glass-nav` -- backdrop-blur + transparent background
- `.mobile-card` -- rounded-2xl + shadow
- `.search-pill` -- rounded-full tappable area
- `.swipe-indicator` -- small pill dots for carousels
- Shimmer loading animation improvements

---

## Technical Details

### New Files to Create:
1. `src/components/mobile/MobileHomeLayout.tsx` -- Mobile-specific home wrapper
2. `src/components/mobile/MobileHeroBanner.tsx` -- Swipeable full-width banner
3. `src/components/mobile/MobileCategoryScroll.tsx` -- Horizontal category scroll
4. `src/components/mobile/MobileFlashSale.tsx` -- Mobile flash sale section
5. `src/components/mobile/MobileSearchOverlay.tsx` -- Full-screen search overlay

### Files to Modify:
1. `src/pages/Index.tsx` -- Mobile layout switch using `useIsMobile()`
2. `src/components/layout/MobileHeader.tsx` -- Search pill + compact design
3. `src/components/layout/MobileBottomNav.tsx` -- Glass effect + animations
4. `src/components/mobile/MobileProductCard.tsx` -- Premium card redesign
5. `src/index.css` -- Mobile utility classes

### No database changes needed -- purely frontend.

### Key Design Rules:
- Zero container padding on mobile for edge-to-edge content
- Rounded corners everywhere (16px/2xl radius)
- Subtle shadows instead of borders
- All transitions 200-300ms
- Active press scale (0.97)
- Glass/blur effects on navigation
- `embla-carousel-react` (already installed) for swipe gestures

