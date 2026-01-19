// Mock data for FANZON e-commerce platform

export interface Product {
  id: string;
  title: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  ratingCount: number;
  soldCount: number;
  stockTotal: number;
  stockSold: number;
  vendor: string;
  vendorRating?: number;
  vendorPositiveRating?: number;
  category: string;
  categorySlug?: string;
  brand?: string;
  isFlashSale?: boolean;
  freeShipping?: boolean;
  fulfilledByFanzon?: boolean;
  description?: string;
  specifications?: { key: string; value: string }[];
  reviews?: Review[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  helpful: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  link: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export const brands: Brand[] = [
  { id: "b1", name: "Samsung", slug: "samsung" },
  { id: "b2", name: "Apple", slug: "apple" },
  { id: "b3", name: "Nike", slug: "nike" },
  { id: "b4", name: "Adidas", slug: "adidas" },
  { id: "b5", name: "Sony", slug: "sony" },
  { id: "b6", name: "LG", slug: "lg" },
  { id: "b7", name: "Xiaomi", slug: "xiaomi" },
  { id: "b8", name: "Puma", slug: "puma" },
];

export const categories: Category[] = [
  { id: "1", name: "Electronics", icon: "Smartphone", slug: "electronics" },
  { id: "2", name: "Fashion", icon: "Shirt", slug: "fashion" },
  { id: "3", name: "Home & Living", icon: "Home", slug: "home-living" },
  { id: "4", name: "Health & Beauty", icon: "Heart", slug: "health-beauty" },
  { id: "5", name: "Sports & Outdoor", icon: "Dumbbell", slug: "sports-outdoor" },
  { id: "6", name: "Groceries", icon: "ShoppingBasket", slug: "groceries" },
  { id: "7", name: "Babies & Toys", icon: "Baby", slug: "babies-toys" },
  { id: "8", name: "Motors", icon: "Car", slug: "motors" },
  { id: "9", name: "Watches", icon: "Watch", slug: "watches" },
  { id: "10", name: "Books", icon: "BookOpen", slug: "books" },
  { id: "11", name: "Gaming", icon: "Gamepad2", slug: "gaming" },
  { id: "12", name: "Appliances", icon: "Refrigerator", slug: "appliances" },
];

export const navCategories = [
  "Electronics",
  "Fashion",
  "Home & Lifestyle",
  "Health & Beauty",
  "Sports & Outdoor",
  "Groceries",
  "Babies & Toys",
  "Motors",
];

const sampleReviews: Review[] = [
  {
    id: "r1",
    userName: "John D.",
    rating: 5,
    comment: "Excellent product! Exactly as described. Fast delivery and great packaging.",
    date: "2024-01-15",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"],
    helpful: 24,
  },
  {
    id: "r2",
    userName: "Sarah M.",
    rating: 4,
    comment: "Good quality for the price. Would recommend to others.",
    date: "2024-01-10",
    helpful: 12,
  },
  {
    id: "r3",
    userName: "Mike R.",
    rating: 5,
    comment: "Amazing value! The quality exceeded my expectations.",
    date: "2024-01-05",
    helpful: 18,
  },
];

const sampleSpecifications = [
  { key: "Brand", value: "Premium Brand" },
  { key: "Material", value: "High Quality" },
  { key: "Warranty", value: "1 Year" },
  { key: "Weight", value: "0.5 kg" },
  { key: "Dimensions", value: "20 x 15 x 10 cm" },
  { key: "Country of Origin", value: "China" },
];

export const flashSaleProducts: Product[] = [
  {
    id: "fs1",
    title: "Wireless Bluetooth Earbuds Pro Max with Noise Cancellation",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&h=600&fit=crop",
    ],
    price: 1299,
    originalPrice: 3999,
    discount: 68,
    rating: 4.5,
    ratingCount: 2341,
    soldCount: 892,
    stockTotal: 1000,
    stockSold: 892,
    vendor: "TechZone",
    vendorRating: 4.8,
    vendorPositiveRating: 96,
    category: "Electronics",
    categorySlug: "electronics",
    brand: "Samsung",
    isFlashSale: true,
    freeShipping: true,
    fulfilledByFanzon: true,
    description: "Experience premium sound quality with our Wireless Bluetooth Earbuds Pro Max. Featuring advanced noise cancellation technology, these earbuds deliver crystal-clear audio for music, calls, and more. With up to 30 hours of battery life, ergonomic design, and IPX5 water resistance, they're perfect for any lifestyle.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "fs2",
    title: "Men's Casual Cotton T-Shirt Premium Quality",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
    ],
    price: 349,
    originalPrice: 999,
    discount: 65,
    rating: 4.2,
    ratingCount: 1523,
    soldCount: 456,
    stockTotal: 500,
    stockSold: 456,
    vendor: "FashionHub",
    vendorRating: 4.5,
    vendorPositiveRating: 92,
    category: "Fashion",
    categorySlug: "fashion",
    brand: "Nike",
    isFlashSale: true,
    freeShipping: false,
    description: "Premium quality cotton t-shirt with a comfortable fit. Perfect for casual everyday wear.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "fs3",
    title: "Smart Watch Fitness Tracker with Heart Rate Monitor",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop",
    ],
    price: 1899,
    originalPrice: 4999,
    discount: 62,
    rating: 4.7,
    ratingCount: 3421,
    soldCount: 234,
    stockTotal: 300,
    stockSold: 234,
    vendor: "GadgetWorld",
    vendorRating: 4.9,
    vendorPositiveRating: 98,
    category: "Electronics",
    categorySlug: "electronics",
    brand: "Xiaomi",
    isFlashSale: true,
    freeShipping: true,
    fulfilledByFanzon: true,
    description: "Track your fitness goals with this advanced smart watch featuring heart rate monitoring, sleep tracking, and more.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "fs4",
    title: "Organic Face Cream Anti-Aging Moisturizer",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=600&h=600&fit=crop",
    ],
    price: 499,
    originalPrice: 1299,
    discount: 62,
    rating: 4.4,
    ratingCount: 892,
    soldCount: 567,
    stockTotal: 800,
    stockSold: 567,
    vendor: "BeautyStore",
    vendorRating: 4.6,
    vendorPositiveRating: 94,
    category: "Health & Beauty",
    categorySlug: "health-beauty",
    isFlashSale: true,
    freeShipping: true,
    description: "Natural and organic face cream for youthful, radiant skin.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "fs5",
    title: "Portable Bluetooth Speaker Waterproof",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=600&fit=crop",
    ],
    price: 799,
    originalPrice: 1999,
    discount: 60,
    rating: 4.3,
    ratingCount: 1234,
    soldCount: 345,
    stockTotal: 400,
    stockSold: 345,
    vendor: "AudioMax",
    vendorRating: 4.4,
    vendorPositiveRating: 90,
    category: "Electronics",
    categorySlug: "electronics",
    brand: "Sony",
    isFlashSale: true,
    freeShipping: false,
    description: "Waterproof portable speaker with powerful bass and long battery life.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "fs6",
    title: "Women's Running Shoes Lightweight Athletic",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop",
    ],
    price: 1499,
    originalPrice: 3499,
    discount: 57,
    rating: 4.6,
    ratingCount: 2156,
    soldCount: 678,
    stockTotal: 750,
    stockSold: 678,
    vendor: "SportsFit",
    vendorRating: 4.7,
    vendorPositiveRating: 95,
    category: "Sports & Outdoor",
    categorySlug: "sports-outdoor",
    brand: "Nike",
    isFlashSale: true,
    freeShipping: true,
    fulfilledByFanzon: true,
    description: "Lightweight and comfortable running shoes designed for performance.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
];

export const justForYouProducts: Product[] = [
  {
    id: "jfy1",
    title: "Wireless Gaming Mouse RGB with 16000 DPI Sensor",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop",
    ],
    price: 899,
    originalPrice: 1499,
    discount: 40,
    rating: 4.5,
    ratingCount: 1892,
    soldCount: 423,
    stockTotal: 500,
    stockSold: 423,
    vendor: "GamerZone",
    vendorRating: 4.6,
    vendorPositiveRating: 93,
    category: "Electronics",
    categorySlug: "electronics",
    brand: "Sony",
    freeShipping: true,
    description: "Professional gaming mouse with customizable RGB lighting and precision sensor.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy2",
    title: "Stainless Steel Water Bottle 1L Vacuum Insulated",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
    ],
    price: 399,
    originalPrice: 799,
    discount: 50,
    rating: 4.3,
    ratingCount: 567,
    soldCount: 234,
    stockTotal: 300,
    stockSold: 234,
    vendor: "HomeEssentials",
    vendorRating: 4.4,
    vendorPositiveRating: 89,
    category: "Home & Living",
    categorySlug: "home-living",
    freeShipping: false,
    description: "Keep your drinks hot or cold for hours with this vacuum insulated bottle.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy3",
    title: "Men's Leather Wallet RFID Blocking Slim Design",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop",
    ],
    price: 549,
    originalPrice: 999,
    discount: 45,
    rating: 4.4,
    ratingCount: 892,
    soldCount: 345,
    stockTotal: 400,
    stockSold: 345,
    vendor: "LeatherCraft",
    vendorRating: 4.5,
    vendorPositiveRating: 91,
    category: "Fashion",
    categorySlug: "fashion",
    freeShipping: true,
    description: "Slim leather wallet with RFID blocking technology for security.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy4",
    title: "Yoga Mat Non-Slip Exercise Fitness Mat 6mm",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
    ],
    price: 699,
    originalPrice: 1299,
    discount: 46,
    rating: 4.6,
    ratingCount: 1234,
    soldCount: 567,
    stockTotal: 600,
    stockSold: 567,
    vendor: "FitLife",
    vendorRating: 4.7,
    vendorPositiveRating: 96,
    category: "Sports & Outdoor",
    categorySlug: "sports-outdoor",
    brand: "Adidas",
    freeShipping: true,
    fulfilledByFanzon: true,
    description: "Professional yoga mat with non-slip surface for safe workouts.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy5",
    title: "USB-C Fast Charging Cable 2m Braided Nylon",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    ],
    price: 199,
    originalPrice: 499,
    discount: 60,
    rating: 4.2,
    ratingCount: 3456,
    soldCount: 1234,
    stockTotal: 2000,
    stockSold: 1234,
    vendor: "CablePro",
    vendorRating: 4.3,
    vendorPositiveRating: 88,
    category: "Electronics",
    categorySlug: "electronics",
    freeShipping: false,
    description: "Durable braided nylon USB-C cable for fast charging.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy6",
    title: "Ceramic Coffee Mug Set of 4 Modern Design",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
    ],
    price: 599,
    originalPrice: 999,
    discount: 40,
    rating: 4.5,
    ratingCount: 678,
    soldCount: 234,
    stockTotal: 300,
    stockSold: 234,
    vendor: "KitchenArt",
    vendorRating: 4.6,
    vendorPositiveRating: 94,
    category: "Home & Living",
    categorySlug: "home-living",
    freeShipping: true,
    description: "Beautiful ceramic mug set perfect for your morning coffee.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy7",
    title: "Sunglasses Polarized UV400 Protection Classic Style",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    ],
    price: 449,
    originalPrice: 899,
    discount: 50,
    rating: 4.3,
    ratingCount: 456,
    soldCount: 189,
    stockTotal: 250,
    stockSold: 189,
    vendor: "EyeWear",
    vendorRating: 4.4,
    vendorPositiveRating: 90,
    category: "Fashion",
    categorySlug: "fashion",
    freeShipping: false,
    description: "Classic polarized sunglasses with UV400 protection.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy8",
    title: "Mechanical Keyboard RGB Backlit Blue Switch",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop",
    ],
    price: 2499,
    originalPrice: 3999,
    discount: 38,
    rating: 4.7,
    ratingCount: 1567,
    soldCount: 456,
    stockTotal: 500,
    stockSold: 456,
    vendor: "KeyMaster",
    vendorRating: 4.8,
    vendorPositiveRating: 97,
    category: "Electronics",
    categorySlug: "electronics",
    freeShipping: true,
    fulfilledByFanzon: true,
    description: "Professional mechanical keyboard with RGB backlighting.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy9",
    title: "Women's Crossbody Bag PU Leather Shoulder Bag",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    ],
    price: 799,
    originalPrice: 1499,
    discount: 47,
    rating: 4.4,
    ratingCount: 892,
    soldCount: 345,
    stockTotal: 400,
    stockSold: 345,
    vendor: "BagBoutique",
    vendorRating: 4.5,
    vendorPositiveRating: 92,
    category: "Fashion",
    categorySlug: "fashion",
    freeShipping: true,
    description: "Stylish crossbody bag made from premium PU leather.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy10",
    title: "LED Desk Lamp Touch Control 3 Color Modes",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop",
    ],
    price: 649,
    originalPrice: 1199,
    discount: 46,
    rating: 4.5,
    ratingCount: 789,
    soldCount: 234,
    stockTotal: 300,
    stockSold: 234,
    vendor: "LightHouse",
    vendorRating: 4.6,
    vendorPositiveRating: 93,
    category: "Home & Living",
    categorySlug: "home-living",
    freeShipping: false,
    description: "Modern LED desk lamp with touch control and adjustable brightness.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy11",
    title: "Electric Toothbrush Sonic with 4 Brush Heads",
    image: "https://images.unsplash.com/photo-1559467270-3f1b3b8e21b1?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1559467270-3f1b3b8e21b1?w=600&h=600&fit=crop",
    ],
    price: 899,
    originalPrice: 1799,
    discount: 50,
    rating: 4.6,
    ratingCount: 1234,
    soldCount: 567,
    stockTotal: 600,
    stockSold: 567,
    vendor: "OralCare",
    vendorRating: 4.7,
    vendorPositiveRating: 95,
    category: "Health & Beauty",
    categorySlug: "health-beauty",
    freeShipping: true,
    description: "Advanced sonic electric toothbrush for superior cleaning.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
  {
    id: "jfy12",
    title: "Backpack Laptop 15.6 inch Waterproof Travel Bag",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    ],
    price: 1199,
    originalPrice: 2299,
    discount: 48,
    rating: 4.5,
    ratingCount: 2345,
    soldCount: 789,
    stockTotal: 1000,
    stockSold: 789,
    vendor: "TravelGear",
    vendorRating: 4.6,
    vendorPositiveRating: 94,
    category: "Fashion",
    categorySlug: "fashion",
    freeShipping: true,
    fulfilledByFanzon: true,
    description: "Waterproof laptop backpack perfect for travel and daily use.",
    specifications: sampleSpecifications,
    reviews: sampleReviews,
  },
];

export const allProducts: Product[] = [...flashSaleProducts, ...justForYouProducts];

export const banners: Banner[] = [
  {
    id: "b1",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    title: "Flash Sale - Up to 70% Off",
    link: "/flash-sale",
  },
  {
    id: "b2",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop",
    title: "Fashion Week Special",
    link: "/fashion",
  },
  {
    id: "b3",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=400&fit=crop",
    title: "Tech Deals - Latest Gadgets",
    link: "/electronics",
  },
];

export const getProductById = (id: string): Product | undefined => {
  return allProducts.find((product) => product.id === id);
};

export const getProductsByCategory = (categorySlug: string): Product[] => {
  return allProducts.filter((product) => 
    product.categorySlug === categorySlug || 
    product.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
  );
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return allProducts.filter((product) =>
    product.title.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.vendor.toLowerCase().includes(lowerQuery) ||
    product.brand?.toLowerCase().includes(lowerQuery)
  );
};
