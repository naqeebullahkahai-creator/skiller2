

## Plan: Agent Real-time, Scroll Fix, Role Enforcement, Agent Dashboard, Wallet PIN Fix, Mobile UI & Back Buttons

This is a large multi-area fix covering 7 distinct issues. Here's the breakdown:

---

### 1. ScrollToTop Fix (Scrolling not working)

**Problem**: No `ScrollToTop` component exists — pages don't scroll to top on navigation.

**Solution**: Create `src/components/ScrollToTop.tsx` using `useLocation` + `useEffect` to call `window.scrollTo(0,0)` on every pathname change. Add it inside `<BrowserRouter>` in `App.tsx`.

---

### 2. Agent Real-time Connection

**Problem**: Agent chat uses polling (`refetchInterval: 5000/10000`). No real-time Supabase channel for new waiting sessions.

**Solution**: In `AgentDashboard.tsx`, add Supabase Realtime subscriptions:
- Subscribe to `support_chat_sessions` for new waiting sessions (instant notification when customer/seller needs help)
- Keep existing realtime for `support_messages` (already works)
- Add sound/toast notification when new session arrives in queue
- Auto-invalidate queries on realtime events instead of polling

---

### 3. Role Enforcement: Agent Role = Only Agent

**Problem**: When admin assigns `support_agent` role via "Change User Role", only `user_roles.role` is updated — old role data remains.

**Solution**: In `AdminRolesPage.tsx` `handleChangeUserRole`, after updating `user_roles`, ensure the role is exclusive (the table already enforces `unique(user_id, role)` so only one role per user). The current code already does `UPDATE user_roles SET role = ... WHERE user_id = ...` which replaces the old role. This is working correctly. Add a confirmation dialog warning that changing to `support_agent` will remove their previous role access.

---

### 4. Agent Dashboard Hub (Sub-dashboards like Admin)

**Problem**: Agent only has a single chat page. No separate management sections for income, withdrawals, salary, performance etc.

**Solution**: Create a full Agent dashboard layout similar to Admin's hub pattern:

**New Files**:
- `src/components/dashboard/AgentDashboardLayout.tsx` — Layout with sidebar + bottom nav (matching Admin/Seller pattern)
- `src/pages/agent/AgentDashboardHome.tsx` — Command center with stat cards + quick actions
- `src/pages/agent/AgentChatsPage.tsx` — The existing chat interface (moved from AgentDashboard)
- `src/pages/agent/AgentEarningsPage.tsx` — Income, salary, withdraw requests
- `src/pages/agent/AgentPerformancePage.tsx` — Ratings, sessions resolved, metrics
- `src/pages/agent/AgentSettingsPage.tsx` — Profile, availability, preferences

**Route Changes** in `App.tsx`:
```
/agent → AgentDashboardLayout (nested)
  /agent/dashboard → AgentDashboardHome
  /agent/chats → AgentChatsPage
  /agent/earnings → AgentEarningsPage
  /agent/performance → AgentPerformancePage
  /agent/settings → AgentSettingsPage
```

Update `/agent-app` PWA routes similarly with `AgentBottomNav` updated to match.

---

### 5. Admin Wallet PIN Fix

**Problem**: The `set_admin_wallet_pin` function does `INSERT ... ON CONFLICT DO NOTHING` then `UPDATE admin_wallet SET pin_hash=...`. The issue is the `ON CONFLICT DO NOTHING` prevents insert if wallet exists, and the subsequent `UPDATE` has no `WHERE` clause — it updates ALL rows. But the real issue is likely that `pin_set` returns `false` when wallet row doesn't exist yet (query returns `null`).

**Fix**: 
- In `useAdminWallet.ts`, when `wallet` is `null` (no row exists), treat `isPinSet` as `false` and allow the "Set PIN" flow
- The `set_admin_wallet_pin` function already handles insert-or-update. The issue is the `verifyPin` mutation doesn't show error feedback on failure. Add `toast.error('Invalid PIN')` on `false` result.
- Also in `AdminWalletPage.tsx`, the verify flow doesn't show error when PIN is wrong (line 23-24 just clears input silently). Add toast feedback.

---

### 6. Mobile UI for All Dashboards

**Problem**: Sub-dashboards need responsive mobile layouts with proper text sizing, no horizontal scroll, no scrollbar artifacts.

**Solution**: Audit and fix all 9 management hub pages + agent pages:
- Add `overflow-x-hidden` to all dashboard wrappers
- Use `text-sm` / `text-xs` consistently on mobile
- Grid columns: `grid-cols-2` on mobile, `grid-cols-4` on desktop for stat cards
- Quick action cards: single column on mobile
- Ensure all text uses `truncate` or `line-clamp` to prevent overflow
- Add `max-w-full` constraints on card content

---

### 7. Back Button on Every Page for All Roles

**Problem**: `MobileFloatingBackButton` hides on some routes but doesn't cover all role dashboards. Agent pages have no back button.

**Solution**: 
- Update `MobileFloatingBackButton.tsx` to include agent dashboard root (`/agent/dashboard`, `/agent-app`) in `hideOnRoutes`
- Ensure it shows on ALL other pages regardless of role
- Add desktop back button in `AgentDashboardLayout` header (matching Admin/Seller pattern)
- Each sub-dashboard already has "Return to Admin Panel" button — keep those

---

### Files to Create (6)
- `src/components/ScrollToTop.tsx`
- `src/components/dashboard/AgentDashboardLayout.tsx`
- `src/pages/agent/AgentDashboardHome.tsx`
- `src/pages/agent/AgentChatsPage.tsx`
- `src/pages/agent/AgentEarningsPage.tsx`
- `src/pages/agent/AgentSettingsPage.tsx`

### Files to Modify (7)
- `src/App.tsx` — Add ScrollToTop, restructure agent routes
- `src/pages/agent/AgentDashboard.tsx` — Extract chat logic to AgentChatsPage
- `src/components/pwa/AgentBottomNav.tsx` — Update nav items for new pages
- `src/components/pwa/AgentAppShell.tsx` — Update routes
- `src/components/mobile/MobileFloatingBackButton.tsx` — Add agent routes to hideOnRoutes
- `src/hooks/useAdminWallet.ts` — Fix PIN verification feedback
- `src/pages/dashboard/AdminWalletPage.tsx` — Add toast on wrong PIN

### Database Changes
- Enable Supabase Realtime for `support_chat_sessions` table (migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_sessions;`)

