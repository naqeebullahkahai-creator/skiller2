

## Commission Management Tool - Mukammal System

Aap ko ek complete commission management page chahiye jahan se admin sab sellers ki commission manage kar sake - naye sellers ko free period de sake, daily rate set kar sake, aur har seller ki individually manage kar sake.

### Kya banega:

**1. Naya Admin Commission Management Page**
- Ek dedicated page `/admin/commission-management` banegi
- Sidebar mein link add hoga
- Is page par 3 sections honge:
  - Global Settings (default commission rate + new seller free period toggle)
  - All Sellers Commission Overview (table with all sellers)
  - Per-seller edit capability

**2. Global New Seller Policy**
- Admin toggle kar sakta hai: "New sellers ko pehle 3 months free do (0% commission)"
- Admin months change kar sakta hai (1 se 12 months)
- Admin grace period commission bhi set kar sakta hai (default 0%)
- Jab ye ON hai, har naye seller ko automatically grace period mil jayega
- Jab OFF kare, naye sellers ko direct global rate lagega

**3. All Sellers Commission Table**
- Ek table jismein sab sellers dikhenge with:
  - Seller name, shop name
  - Status: New Seller / Old Seller (based on join date)
  - Current effective rate
  - Grace period status (Active/Expired/None)
  - Grace end date
  - Custom rate ya Global rate
  - Quick edit button
- Filter: New Sellers / Old Sellers / Grace Active / All
- Search by seller name

**4. Per-Seller Inline Edit**
- Table se kisi bhi seller par click karke:
  - Custom commission set/remove karna
  - Grace period on/off karna
  - Grace period months change karna
  - Grace commission % change karna
  - Notes add karna
- Ye existing `SellerCommissionManager` component reuse karega

---

### Technical Details

**Database Changes:**
- `admin_settings` table mein 3 naye settings add honge:
  - `new_seller_grace_enabled` (true/false) - Toggle for auto grace period
  - `new_seller_grace_months` (default: 3) - Kitne months free
  - `new_seller_grace_commission` (default: 0) - Grace period mein commission %

**New Files:**
- `src/pages/dashboard/AdminCommissionManagementPage.tsx` - Main page with:
  - Global commission rate settings (reusing `AdminCommissionSettings`)
  - New seller policy card with toggle + months + rate inputs
  - Sellers commission overview table with filters and search
  - Dialog-based per-seller commission editor (using `SellerCommissionManager`)

**Modified Files:**
- `src/App.tsx` - Route add: `/admin/commission-management`
- `src/components/admin/DynamicAdminSidebar.tsx` - Sidebar link add
- `src/hooks/useAdminFinance.ts` - New seller policy settings ka fetch/update logic add

**Auto Grace Period Logic:**
- Jab new seller verify hota hai aur `new_seller_grace_enabled = true`:
  - Automatically `seller_commissions` mein entry create hogi
  - `grace_period_months` = admin setting se
  - `grace_commission_percentage` = admin setting se (default 0%)
  - `grace_start_date` = verification date
- Database trigger banayenge jo `seller_profiles.verification_status` change hone par fire ho

**Seller Classification:**
- "New Seller" = joined within last 3 months (or grace period active)
- "Old Seller" = grace period expired or no grace period

**Data Flow:**
- Page loads > fetch all seller_profiles + seller_commissions + admin_settings
- Admin changes global policy > admin_settings update
- Admin edits individual seller > seller_commissions upsert
- New seller gets verified > trigger auto-creates commission entry with grace period
