

## Plan: Convert All Admin Sections into Category Sub-Dashboards

### Current State
The admin sidebar has ~30+ individual page links spread across collapsible groups. Three sub-dashboards already exist (Sellers, Customers, Agents) with the pattern: gradient header + stat cards + tabs (Quick Actions / Directory).

### Goal
Group ALL remaining sidebar items into **category sub-dashboards**, so the sidebar becomes clean with only ~10 top-level entries. Each sub-dashboard follows the same design pattern as the existing three.

### New Sub-Dashboards to Create

**1. Orders Management Dashboard** (`AdminOrdersManagement.tsx`)
- Route: `/admin/orders-management`
- Stats: Total Orders, Pending, Shipped, Cancelled, Returns
- Quick Actions: All Orders, Direct Orders, Vendor Orders, Cancellations, Returns
- Directory tab: Recent orders table with status filters

**2. Products & Catalog Dashboard** (`AdminProductsManagement.tsx`)
- Route: `/admin/products-management`
- Stats: Total Products, Pending Approval, Categories, Bulk Uploads
- Quick Actions: Product Catalog, Category Manager, Product Approvals, Bulk Upload Logs

**3. Financial Controls Dashboard** (`AdminFinanceManagement.tsx`)
- Route: `/admin/finance-management`
- Stats: Platform Balance, Commission Revenue, Pending Payouts, Deposits
- Quick Actions: Admin Wallet, Payouts, Commission, Subscriptions, Payment Methods, Payment Settings, Balance Adjustments, Seller Deposits, Customer Deposits, Deposit Settings

**4. Marketing & Promotions Dashboard** (`AdminMarketingManagement.tsx`)
- Route: `/admin/marketing-management`
- Stats: Active Flash Sales, Vouchers, Banners, Nominations
- Quick Actions: Flash Sales, Flash Nominations, Vouchers, Banners

**5. Content & Settings Dashboard** (`AdminContentManagement.tsx`)
- Route: `/admin/content-management`
- Stats: Reviews count, Q&A count, Notifications sent
- Quick Actions: Reviews, Q&A Moderation, Site Settings, Content Manager, Brand Assets, Chat Shortcuts, Notifications, All Settings, Platform Settings

**6. Security & Access Dashboard** (`AdminSecurityManagement.tsx`)
- Route: `/admin/security-management`
- Stats: Total Logins, Blocked IPs, Staff Roles, Active Sessions
- Quick Actions: Security & Logins, Roles & Permissions

### Sidebar Restructure (`DynamicAdminSidebar.tsx`)
Replace all individual links and collapsible groups with clean top-level entries:
1. Dashboard (home)
2. Sellers Management
3. Customers Management
4. Agents Management
5. Orders Management (new)
6. Products & Catalog (new)
7. Financial Controls (new)
8. Marketing (new)
9. Content & Settings (new)
10. Security & Access (new)

### Route Updates (`App.tsx`)
- Add 6 new routes under `/admin/*` and `/admin-app/*`
- Keep all existing child routes (individual pages still accessible)

### Design Pattern (consistent across all)
```text
+----------------------------------------------+
| Gradient Header (role color + icon + title)   |
+----------------------------------------------+
| [Stat] [Stat] [Stat] [Stat]                  |
+----------------------------------------------+
| [Quick Actions Tab] | [Directory/List Tab]    |
|  - Action Card 1                              |
|  - Action Card 2                              |
|  - ...                                        |
+----------------------------------------------+
```

### Files to Create (6)
- `src/pages/dashboard/AdminOrdersManagement.tsx`
- `src/pages/dashboard/AdminProductsManagement.tsx`
- `src/pages/dashboard/AdminFinanceManagement.tsx`
- `src/pages/dashboard/AdminMarketingManagement.tsx`
- `src/pages/dashboard/AdminContentManagement.tsx`
- `src/pages/dashboard/AdminSecurityManagement.tsx`

### Files to Modify (3)
- `src/components/admin/DynamicAdminSidebar.tsx` - Replace all items with 10 clean dashboard links
- `src/App.tsx` - Add 6 new routes for both `/admin` and `/admin-app`
- `src/pages/dashboard/AdminDashboardHome.tsx` - Update Command Center to link to new dashboards
- `src/pages/admin/AdminDashboard.tsx` - Update PWA mobile dashboard sections

