// Dashboard mock data for FANZON admin panel

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  pendingApprovals: number;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: "COD" | "EasyPaisa" | "JazzCash" | "Card";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  items: number;
  sellerId?: string;
}

export interface DashboardProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  status: "active" | "pending" | "out_of_stock" | "rejected";
  image: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
}

export interface SellerApproval {
  id: string;
  sellerName: string;
  email: string;
  storeName: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  productsCount: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  status: "active" | "inactive";
}

export interface SalesData {
  month: string;
  revenue: number;
  orders: number;
}

export const dashboardStats: DashboardStats = {
  totalRevenue: 2547890,
  totalOrders: 1234,
  activeProducts: 456,
  pendingApprovals: 12,
};

export const salesData: SalesData[] = [
  { month: "Jan", revenue: 185000, orders: 89 },
  { month: "Feb", revenue: 220000, orders: 112 },
  { month: "Mar", revenue: 195000, orders: 95 },
  { month: "Apr", revenue: 280000, orders: 145 },
  { month: "May", revenue: 310000, orders: 168 },
  { month: "Jun", revenue: 265000, orders: 132 },
  { month: "Jul", revenue: 340000, orders: 185 },
  { month: "Aug", revenue: 385000, orders: 201 },
  { month: "Sep", revenue: 420000, orders: 223 },
  { month: "Oct", revenue: 395000, orders: 198 },
  { month: "Nov", revenue: 450000, orders: 245 },
  { month: "Dec", revenue: 520000, orders: 289 },
];

export const recentOrders: Order[] = [
  {
    id: "1",
    orderId: "FZ-2024-001234",
    customerName: "Ahmed Khan",
    customerEmail: "ahmed@example.com",
    totalAmount: 12500,
    paymentMethod: "COD",
    status: "pending",
    date: "2024-01-15",
    items: 3,
    sellerId: "seller1",
  },
  {
    id: "2",
    orderId: "FZ-2024-001235",
    customerName: "Fatima Ali",
    customerEmail: "fatima@example.com",
    totalAmount: 8900,
    paymentMethod: "EasyPaisa",
    status: "processing",
    date: "2024-01-15",
    items: 2,
    sellerId: "seller1",
  },
  {
    id: "3",
    orderId: "FZ-2024-001236",
    customerName: "Muhammad Usman",
    customerEmail: "usman@example.com",
    totalAmount: 25600,
    paymentMethod: "JazzCash",
    status: "shipped",
    date: "2024-01-14",
    items: 5,
    sellerId: "seller2",
  },
  {
    id: "4",
    orderId: "FZ-2024-001237",
    customerName: "Ayesha Siddiqui",
    customerEmail: "ayesha@example.com",
    totalAmount: 4500,
    paymentMethod: "Card",
    status: "delivered",
    date: "2024-01-14",
    items: 1,
    sellerId: "seller1",
  },
  {
    id: "5",
    orderId: "FZ-2024-001238",
    customerName: "Hassan Raza",
    customerEmail: "hassan@example.com",
    totalAmount: 18900,
    paymentMethod: "COD",
    status: "cancelled",
    date: "2024-01-13",
    items: 4,
    sellerId: "seller2",
  },
  {
    id: "6",
    orderId: "FZ-2024-001239",
    customerName: "Zainab Malik",
    customerEmail: "zainab@example.com",
    totalAmount: 7800,
    paymentMethod: "EasyPaisa",
    status: "pending",
    date: "2024-01-13",
    items: 2,
    sellerId: "seller1",
  },
];

export const dashboardProducts: DashboardProduct[] = [
  {
    id: "dp1",
    title: "Wireless Bluetooth Earbuds Pro Max",
    sku: "WBE-001",
    category: "Electronics",
    brand: "TechPro",
    originalPrice: 4999,
    discountedPrice: 2999,
    stock: 150,
    status: "active",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop",
    sellerId: "seller1",
    sellerName: "TechZone Store",
    createdAt: "2024-01-10",
  },
  {
    id: "dp2",
    title: "Men's Premium Cotton T-Shirt",
    sku: "MCT-002",
    category: "Fashion",
    brand: "StyleHub",
    originalPrice: 1999,
    discountedPrice: 999,
    stock: 0,
    status: "out_of_stock",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
    sellerId: "seller1",
    sellerName: "TechZone Store",
    createdAt: "2024-01-08",
  },
  {
    id: "dp3",
    title: "Smart Watch Fitness Tracker",
    sku: "SWF-003",
    category: "Electronics",
    brand: "FitTech",
    originalPrice: 8999,
    discountedPrice: 5999,
    stock: 45,
    status: "pending",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop",
    sellerId: "seller2",
    sellerName: "GadgetWorld",
    createdAt: "2024-01-12",
  },
  {
    id: "dp4",
    title: "Women's Running Shoes Athletic",
    sku: "WRS-004",
    category: "Sports",
    brand: "SportsFit",
    originalPrice: 6999,
    discountedPrice: 4499,
    stock: 78,
    status: "active",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
    sellerId: "seller1",
    sellerName: "TechZone Store",
    createdAt: "2024-01-05",
  },
  {
    id: "dp5",
    title: "Portable Bluetooth Speaker",
    sku: "PBS-005",
    category: "Electronics",
    brand: "AudioMax",
    originalPrice: 3499,
    discountedPrice: 1999,
    stock: 200,
    status: "active",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop",
    sellerId: "seller2",
    sellerName: "GadgetWorld",
    createdAt: "2024-01-11",
  },
  {
    id: "dp6",
    title: "Organic Face Cream Moisturizer",
    sku: "OFC-006",
    category: "Health & Beauty",
    brand: "NaturaCare",
    originalPrice: 2499,
    discountedPrice: 1499,
    stock: 120,
    status: "pending",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&h=100&fit=crop",
    sellerId: "seller3",
    sellerName: "BeautyStore",
    createdAt: "2024-01-14",
  },
];

export const sellerApprovals: SellerApproval[] = [
  {
    id: "sa1",
    sellerName: "Ali Hassan",
    email: "ali.hassan@example.com",
    storeName: "Ali Electronics",
    phone: "+92 300 1234567",
    status: "pending",
    appliedAt: "2024-01-14",
    productsCount: 0,
  },
  {
    id: "sa2",
    sellerName: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    storeName: "Sara Fashion House",
    phone: "+92 321 9876543",
    status: "pending",
    appliedAt: "2024-01-13",
    productsCount: 0,
  },
  {
    id: "sa3",
    sellerName: "Omar Farooq",
    email: "omar.farooq@example.com",
    storeName: "Tech Galaxy",
    phone: "+92 333 5555555",
    status: "approved",
    appliedAt: "2024-01-10",
    productsCount: 15,
  },
  {
    id: "sa4",
    sellerName: "Hina Malik",
    email: "hina.malik@example.com",
    storeName: "Beauty Paradise",
    phone: "+92 345 7777777",
    status: "rejected",
    appliedAt: "2024-01-08",
    productsCount: 0,
  },
];

export const categoryItems: CategoryItem[] = [
  { id: "c1", name: "Electronics", slug: "electronics", parentId: null, productCount: 234, status: "active" },
  { id: "c2", name: "Fashion", slug: "fashion", parentId: null, productCount: 567, status: "active" },
  { id: "c3", name: "Home & Living", slug: "home-living", parentId: null, productCount: 189, status: "active" },
  { id: "c4", name: "Health & Beauty", slug: "health-beauty", parentId: null, productCount: 145, status: "active" },
  { id: "c5", name: "Sports & Outdoor", slug: "sports-outdoor", parentId: null, productCount: 98, status: "active" },
  { id: "c6", name: "Smartphones", slug: "smartphones", parentId: "c1", productCount: 89, status: "active" },
  { id: "c7", name: "Laptops", slug: "laptops", parentId: "c1", productCount: 67, status: "active" },
  { id: "c8", name: "Men's Clothing", slug: "mens-clothing", parentId: "c2", productCount: 234, status: "active" },
  { id: "c9", name: "Women's Clothing", slug: "womens-clothing", parentId: "c2", productCount: 333, status: "active" },
  { id: "c10", name: "Groceries", slug: "groceries", parentId: null, productCount: 0, status: "inactive" },
];

export const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString()}`;
};
