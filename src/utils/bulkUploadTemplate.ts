/**
 * FANZON Bulk Upload Template Generator
 * Generates professional CSV/Excel templates with category mapping and instructions
 */
import * as XLSX from 'xlsx';

export interface CategoryMapping {
  id: number;
  name: string;
  examples: string;
}

// Category mappings with IDs for easy reference
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  { id: 1, name: "Electronics", examples: "Phones, Laptops, Cameras" },
  { id: 2, name: "Fashion", examples: "Clothes, Shoes, Accessories" },
  { id: 3, name: "Home & Garden", examples: "Furniture, Decor, Tools" },
  { id: 4, name: "Sports", examples: "Equipment, Apparel, Fitness" },
  { id: 5, name: "Beauty", examples: "Skincare, Makeup, Fragrances" },
  { id: 6, name: "Books", examples: "Fiction, Non-fiction, Textbooks" },
  { id: 7, name: "Toys", examples: "Games, Dolls, Educational" },
  { id: 8, name: "Automotive", examples: "Parts, Accessories, Tools" },
  { id: 9, name: "Health", examples: "Supplements, Devices, Personal Care" },
  { id: 10, name: "Groceries", examples: "Food, Beverages, Household" },
];

// Get category name by ID
export const getCategoryById = (id: number): string | null => {
  const category = CATEGORY_MAPPINGS.find(c => c.id === id);
  return category?.name || null;
};

// Get category ID by name (case insensitive)
export const getCategoryId = (name: string): number | null => {
  const category = CATEGORY_MAPPINGS.find(
    c => c.name.toLowerCase() === name.toLowerCase().trim()
  );
  return category?.id || null;
};

// Validate if category exists (by name or ID)
export const isValidCategory = (value: string): boolean => {
  const trimmed = value.trim();
  // Check if it's a valid ID
  const asNumber = parseInt(trimmed);
  if (!isNaN(asNumber) && CATEGORY_MAPPINGS.some(c => c.id === asNumber)) {
    return true;
  }
  // Check if it's a valid name
  return CATEGORY_MAPPINGS.some(
    c => c.name.toLowerCase() === trimmed.toLowerCase()
  );
};

// Resolve category input to category name
export const resolveCategory = (value: string): string | null => {
  const trimmed = value.trim();
  // Try as ID first
  const asNumber = parseInt(trimmed);
  if (!isNaN(asNumber)) {
    return getCategoryById(asNumber);
  }
  // Try as name
  const category = CATEGORY_MAPPINGS.find(
    c => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  return category?.name || null;
};

// Validate image URL format
export const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === "") return true; // Optional field
  const trimmed = url.trim();
  
  // Check for valid URL format
  try {
    const parsed = new URL(trimmed);
    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Check for common image extensions or image hosting patterns
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => 
      parsed.pathname.toLowerCase().endsWith(ext)
    );
    // Also allow common image hosting services
    const imageHosts = ['imgur.com', 'cloudinary.com', 'unsplash.com', 'pexels.com', 'images.', 'img.', 'cdn.'];
    const isImageHost = imageHosts.some(host => 
      parsed.hostname.includes(host) || parsed.pathname.includes(host)
    );
    
    return hasImageExtension || isImageHost || trimmed.includes('image');
  } catch {
    return false;
  }
};

// Validate price (must be positive number, no letters/symbols)
export const isValidPrice = (value: string): { valid: boolean; error?: string } => {
  if (!value || value.trim() === "") {
    return { valid: false, error: "Price is required" };
  }
  
  const trimmed = value.trim();
  
  // Check for invalid characters (letters, Rs, PKR, symbols except decimal)
  if (/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: "Price cannot contain letters (e.g., 'Rs' or 'PKR'). Use numbers only." };
  }
  
  if (/[^\d.]/.test(trimmed)) {
    return { valid: false, error: "Price cannot contain symbols. Use numbers only (e.g., 2500 or 2500.50)." };
  }
  
  const price = parseFloat(trimmed);
  if (isNaN(price)) {
    return { valid: false, error: "Price must be a valid number" };
  }
  
  if (price <= 0) {
    return { valid: false, error: "Price must be greater than 0" };
  }
  
  return { valid: true };
};

// Generate the branded CSV template
export const generateFanzonTemplate = (): string => {
  const lines: string[] = [];
  
  // Branding header (comment line)
  lines.push("# ═══════════════════════════════════════════════════════════════════════════");
  lines.push("# FANZON Official Seller Template v2.0");
  lines.push("# Generated: " + new Date().toISOString().split('T')[0]);
  lines.push("# ═══════════════════════════════════════════════════════════════════════════");
  lines.push("#");
  lines.push("# INSTRUCTIONS:");
  lines.push("# 1. Fill in the data starting from row 8 (after these comments)");
  lines.push("# 2. Fields marked with * are MANDATORY");
  lines.push("# 3. Do NOT modify the header row (row 7)");
  lines.push("# 4. Maximum 1000 products per upload");
  lines.push("# 5. Delete these comment lines OR keep them (they will be ignored)");
  lines.push("#");
  lines.push("# CATEGORY REFERENCE:");
  CATEGORY_MAPPINGS.forEach(cat => {
    lines.push(`#   ${cat.id} = ${cat.name} (${cat.examples})`);
  });
  lines.push("#");
  lines.push("# PRICE FORMAT: Numbers only! ✓ 2500  ✓ 1999.99  ✗ Rs. 2500  ✗ PKR 1999");
  lines.push("# ═══════════════════════════════════════════════════════════════════════════");
  lines.push("");
  
  // Header row with mandatory/optional indicators
  const headers = [
    "Product_Title*",
    "Category*",
    "Price_PKR*",
    "Stock_Quantity*",
    "Discount_Price",
    "Brand_Name",
    "Product_Description",
    "Image_URL",
    "SKU"
  ];
  lines.push(headers.join(","));
  
  // Example rows
  lines.push('"Wireless Bluetooth Earbuds Pro","Electronics",4500,50,3999,"TechPro","Premium quality earbuds with noise cancellation and 24-hour battery life","https://example.com/earbuds.jpg","SKU-EAR-001"');
  lines.push('"Cotton T-Shirt - Large Blue","Fashion",1200,100,,"StyleWear","100% cotton casual t-shirt comfortable fit",,"SKU-TSH-002"');
  lines.push('"LED Desk Lamp","Home & Garden",2800,30,2499,"HomeBright","Adjustable LED desk lamp with 3 brightness levels","https://example.com/lamp.jpg","SKU-LMP-003"');
  
  return lines.join("\n");
};

// Generate instructions guide
export const generateInstructionsGuide = (): string => {
  const categoryTable = CATEGORY_MAPPINGS
    .map(c => `│  ${c.id.toString().padEnd(3)} │ ${c.name.padEnd(15)} │ ${c.examples.padEnd(35)} │`)
    .join("\n");

  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🛒  FANZON BULK UPLOAD GUIDE  🛒                          ║
║                          Official Seller Template                            ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📋 MANDATORY FIELDS (marked with * in red)                                  ║
║  ───────────────────────────────────────────                                 ║
║  • Product_Title*     Your product name (max 200 characters)                 ║
║  • Category*          Category name OR ID number (see table below)           ║
║  • Price_PKR*         Regular price - NUMBERS ONLY (e.g., 2500, not Rs.2500) ║
║  • Stock_Quantity*    Available quantity (whole number, 0 or more)           ║
║                                                                              ║
║  📝 OPTIONAL FIELDS (in green)                                               ║
║  ─────────────────────────────                                               ║
║  • Discount_Price     Sale price (must be less than regular price)           ║
║  • Brand_Name         Brand or manufacturer name                             ║
║  • Product_Description Product details (max 2000 characters)                 ║
║  • Image_URL          Direct link to product image (https://...)             ║
║  • SKU                Your unique product code                               ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📂 CATEGORY REFERENCE TABLE                                                 ║
║  ────────────────────────────                                                ║
║  You can use EITHER the ID number OR the category name.                      ║
║  Example: "1" or "Electronics" both work!                                    ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
│  ID  │ Category        │ Examples                            │
├──────┼─────────────────┼─────────────────────────────────────┤
${categoryTable}
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  💰 PRICE FORMAT EXAMPLES                                                    ║
║  ────────────────────────                                                    ║
║  ✅ CORRECT:  2500        (whole number)                                     ║
║  ✅ CORRECT:  1999.99     (decimal)                                          ║
║  ✅ CORRECT:  50000       (large number)                                     ║
║  ❌ WRONG:    Rs. 2500    (contains letters)                                 ║
║  ❌ WRONG:    PKR 1999    (contains letters)                                 ║
║  ❌ WRONG:    2,500       (contains comma)                                   ║
║  ❌ WRONG:    $50         (contains symbol)                                  ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🖼️ IMAGE URL REQUIREMENTS                                                   ║
║  ─────────────────────────                                                   ║
║  • Must start with http:// or https://                                       ║
║  • Must be a direct link to the image file                                   ║
║  • Supported formats: .jpg, .jpeg, .png, .gif, .webp                         ║
║  • Example: https://cdn.example.com/products/shirt.jpg                       ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ⚠️ IMPORTANT TIPS                                                           ║
║  ─────────────────                                                           ║
║  • Do NOT change the header row                                              ║
║  • Delete the 3 example rows before uploading your data                      ║
║  • Maximum 1,000 products per upload                                         ║
║  • Save file as CSV with UTF-8 encoding                                      ║
║  • If using Excel, Save As → CSV UTF-8 (Comma delimited)                     ║
║                                                                              ║
║  ❓ NEED HELP?                                                               ║
║  Contact seller support at: seller-support@fanzon.pk                         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`.trim();
};

// Map user-friendly headers to internal field names
export const HEADER_MAPPING: Record<string, string> = {
  // Mandatory fields (various formats)
  "product_title*": "title",
  "product_title": "title",
  "product name*": "title",
  "product name": "title",
  "title*": "title",
  "title": "title",
  
  "category*": "category",
  "category": "category",
  "category_id*": "category",
  "category_id": "category",
  
  "price_pkr*": "price",
  "price_pkr": "price",
  "price (pkr)*": "price",
  "price (pkr)": "price",
  "price*": "price",
  "price": "price",
  
  "stock_quantity*": "stock_quantity",
  "stock_quantity": "stock_quantity",
  "stock*": "stock_quantity",
  "stock": "stock_quantity",
  "quantity*": "stock_quantity",
  "quantity": "stock_quantity",
  
  // Optional fields
  "discount_price": "discount_price",
  "sale_price": "discount_price",
  "sale price (pkr)": "discount_price",
  "sale price": "discount_price",
  
  "brand_name": "brand",
  "brand": "brand",
  
  "product_description": "description",
  "description": "description",
  
  "image_url": "image_url",
  "image url": "image_url",
  "image": "image_url",
  
  "sku": "sku",
};

export interface ParsedProductRow {
  title: string;
  category: string;
  price: string;
  stock_quantity: string;
  discount_price?: string;
  brand?: string;
  description?: string;
  image_url?: string;
  sku?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

// Parse CSV content with enhanced validation
export const parseCSVContent = (content: string): ParsedProductRow[] => {
  const lines = content.trim().split("\n");
  
  // Filter out comment lines (starting with #) and empty lines
  const dataLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed !== "" && !trimmed.startsWith("#");
  });
  
  if (dataLines.length < 2) return [];
  
  // Parse header row
  const rawHeaders = dataLines[0].split(",").map(h => 
    h.trim().toLowerCase().replace(/"/g, "").replace(/\*/g, "*")
  );
  
  const headers = rawHeaders.map(h => HEADER_MAPPING[h] || h);
  
  // Parse data rows
  return dataLines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/"/g, "") || "";
    });
    
    return {
      title: row.title || "",
      category: row.category || "",
      price: row.price || "",
      stock_quantity: row.stock_quantity || "",
      discount_price: row.discount_price || "",
      brand: row.brand || "",
      description: row.description || "",
      image_url: row.image_url || "",
      sku: row.sku || "",
    };
  });
};

// Validate a single row with detailed error messages
export const validateProductRow = (
  row: ParsedProductRow,
  rowIndex: number
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const rowNum = rowIndex + 2; // +1 for header, +1 for 1-indexed
  
  // Title validation
  if (!row.title || row.title.trim().length === 0) {
    errors.push({
      row: rowNum,
      field: "Product_Title",
      message: "Product title is required",
    });
  } else if (row.title.trim().length > 200) {
    errors.push({
      row: rowNum,
      field: "Product_Title",
      message: "Product title must be 200 characters or less",
      value: `(${row.title.length} characters)`,
    });
  }
  
  // Category validation
  if (!row.category || row.category.trim().length === 0) {
    errors.push({
      row: rowNum,
      field: "Category",
      message: "Category is required. Use category name or ID (1-10)",
    });
  } else if (!isValidCategory(row.category)) {
    const categoryList = CATEGORY_MAPPINGS.map(c => `${c.id}=${c.name}`).join(", ");
    errors.push({
      row: rowNum,
      field: "Category",
      message: `Invalid category "${row.category}". Valid options: ${categoryList}`,
      value: row.category,
    });
  }
  
  // Price validation (strict - no letters or symbols)
  const priceValidation = isValidPrice(row.price);
  if (!priceValidation.valid) {
    errors.push({
      row: rowNum,
      field: "Price_PKR",
      message: priceValidation.error || "Invalid price",
      value: row.price,
    });
  }
  
  // Stock validation
  const stock = parseInt(row.stock_quantity);
  if (row.stock_quantity.trim() === "") {
    errors.push({
      row: rowNum,
      field: "Stock_Quantity",
      message: "Stock quantity is required",
    });
  } else if (isNaN(stock) || stock < 0) {
    errors.push({
      row: rowNum,
      field: "Stock_Quantity",
      message: "Stock must be a whole number (0 or more)",
      value: row.stock_quantity,
    });
  }
  
  // Discount price validation (optional but must be valid if provided)
  if (row.discount_price && row.discount_price.trim() !== "") {
    const discountValidation = isValidPrice(row.discount_price);
    if (!discountValidation.valid) {
      errors.push({
        row: rowNum,
        field: "Discount_Price",
        message: discountValidation.error || "Invalid discount price",
        value: row.discount_price,
      });
    } else {
      const price = parseFloat(row.price);
      const discountPrice = parseFloat(row.discount_price);
      if (!isNaN(price) && !isNaN(discountPrice) && discountPrice >= price) {
        errors.push({
          row: rowNum,
          field: "Discount_Price",
          message: "Discount price must be less than regular price",
          value: `${row.discount_price} >= ${row.price}`,
        });
      }
    }
  }
  
  // Image URL validation
  if (row.image_url && row.image_url.trim() !== "") {
    if (!isValidImageUrl(row.image_url)) {
      errors.push({
        row: rowNum,
        field: "Image_URL",
        message: "Invalid image URL. Must be a direct link starting with http:// or https://",
        value: row.image_url.substring(0, 50) + (row.image_url.length > 50 ? "..." : ""),
      });
    }
  }
  
  // Description length validation
  if (row.description && row.description.length > 2000) {
    errors.push({
      row: rowNum,
      field: "Product_Description",
      message: "Description must be 2000 characters or less",
      value: `(${row.description.length} characters)`,
    });
  }
  
  return errors;
};

// ============================================================================
// EXCEL SUPPORT FUNCTIONS
// ============================================================================

// Generate Excel template with branded styling and instructions sheet
export const generateExcelTemplate = (): Blob => {
  const workbook = XLSX.utils.book_new();
  
  // === PRODUCTS SHEET ===
  const headers = [
    "Product_Title*",
    "Category*",
    "Price_PKR*",
    "Stock_Quantity*",
    "Discount_Price",
    "Brand_Name",
    "Product_Description",
    "Image_URL",
    "SKU"
  ];
  
  const exampleData = [
    ["Wireless Bluetooth Earbuds Pro", "Electronics", 4500, 50, 3999, "TechPro", "Premium quality earbuds with noise cancellation and 24-hour battery life", "https://example.com/earbuds.jpg", "SKU-EAR-001"],
    ["Cotton T-Shirt - Large Blue", "Fashion", 1200, 100, "", "StyleWear", "100% cotton casual t-shirt comfortable fit", "", "SKU-TSH-002"],
    ["LED Desk Lamp", "Home & Garden", 2800, 30, 2499, "HomeBright", "Adjustable LED desk lamp with 3 brightness levels", "https://example.com/lamp.jpg", "SKU-LMP-003"],
  ];
  
  const productsData = [headers, ...exampleData];
  const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
  
  // Set column widths
  productsSheet['!cols'] = [
    { wch: 35 }, // Product_Title
    { wch: 15 }, // Category
    { wch: 12 }, // Price_PKR
    { wch: 15 }, // Stock_Quantity
    { wch: 14 }, // Discount_Price
    { wch: 15 }, // Brand_Name
    { wch: 50 }, // Product_Description
    { wch: 40 }, // Image_URL
    { wch: 15 }, // SKU
  ];
  
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");
  
  // === INSTRUCTIONS SHEET ===
  const instructionsData = [
    ["FANZON BULK UPLOAD TEMPLATE - INSTRUCTIONS"],
    [""],
    ["📋 MANDATORY FIELDS (marked with * in header)"],
    ["Field", "Description", "Example"],
    ["Product_Title*", "Your product name (max 200 characters)", "Wireless Bluetooth Earbuds Pro"],
    ["Category*", "Category name OR ID number (see table below)", "Electronics or 1"],
    ["Price_PKR*", "Regular price - NUMBERS ONLY", "2500"],
    ["Stock_Quantity*", "Available quantity (whole number)", "50"],
    [""],
    ["📝 OPTIONAL FIELDS"],
    ["Field", "Description", "Example"],
    ["Discount_Price", "Sale price (must be less than regular price)", "1999"],
    ["Brand_Name", "Brand or manufacturer name", "TechPro"],
    ["Product_Description", "Product details (max 2000 characters)", "Premium quality..."],
    ["Image_URL", "Direct link to product image", "https://cdn.example.com/image.jpg"],
    ["SKU", "Your unique product code", "SKU-001"],
    [""],
    ["📂 CATEGORY REFERENCE"],
    ["ID", "Category Name", "Examples"],
  ];
  
  // Add category mappings
  CATEGORY_MAPPINGS.forEach(cat => {
    instructionsData.push([cat.id.toString(), cat.name, cat.examples]);
  });
  
  instructionsData.push([""]);
  instructionsData.push(["⚠️ IMPORTANT TIPS"]);
  instructionsData.push(["• Do NOT change the header row in the Products sheet"]);
  instructionsData.push(["• Delete the 3 example rows before uploading your data"]);
  instructionsData.push(["• Maximum 1,000 products per upload"]);
  instructionsData.push(["• Price must be numbers only (e.g., 2500, not Rs. 2500)"]);
  instructionsData.push(["• Image URLs must start with http:// or https://"]);
  instructionsData.push([""]);
  instructionsData.push(["❓ Need help? Contact seller-support@fanzon.pk"]);
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  
  // Set column widths for instructions
  instructionsSheet['!cols'] = [
    { wch: 20 },
    { wch: 45 },
    { wch: 40 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
  
  // Generate binary Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Parse Excel file content
export const parseExcelFile = (file: File): Promise<ParsedProductRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet (should be "Products")
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { 
          raw: false,
          defval: "" 
        });
        
        if (jsonData.length === 0) {
          resolve([]);
          return;
        }
        
        // Map Excel columns to our format
        const rows: ParsedProductRow[] = jsonData.map((row) => {
          // Get value by trying multiple possible column names
          const getValue = (keys: string[]): string => {
            for (const key of keys) {
              const lowerKey = key.toLowerCase();
              for (const [colName, value] of Object.entries(row)) {
                if (colName.toLowerCase().replace(/\*/g, "").trim() === lowerKey.replace(/\*/g, "").trim()) {
                  return String(value ?? "").trim();
                }
              }
            }
            return "";
          };
          
          return {
            title: getValue(["Product_Title*", "Product_Title", "title", "Title"]),
            category: getValue(["Category*", "Category", "category"]),
            price: getValue(["Price_PKR*", "Price_PKR", "Price", "price"]),
            stock_quantity: getValue(["Stock_Quantity*", "Stock_Quantity", "Stock", "stock", "Quantity"]),
            discount_price: getValue(["Discount_Price", "discount_price", "Sale_Price", "sale_price"]),
            brand: getValue(["Brand_Name", "brand_name", "Brand", "brand"]),
            description: getValue(["Product_Description", "product_description", "Description", "description"]),
            image_url: getValue(["Image_URL", "image_url", "Image", "image"]),
            sku: getValue(["SKU", "sku"]),
          };
        });
        
        resolve(rows);
      } catch (error) {
        reject(new Error("Failed to parse Excel file. Please ensure it's a valid .xlsx file."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Parse file (CSV or Excel) based on extension
export const parseUploadFile = async (file: File): Promise<ParsedProductRow[]> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelFile(file);
  } else if (fileName.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve(parseCSVContent(content));
        } catch (error) {
          reject(new Error("Failed to parse CSV file."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the file."));
      reader.readAsText(file);
    });
  } else {
    throw new Error("Unsupported file format. Please use .csv or .xlsx files.");
  }
};

// Check if file type is supported
export const isSupportedFileType = (fileName: string): boolean => {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.csv') || lower.endsWith('.xlsx') || lower.endsWith('.xls');
};

// Get file type label
export const getFileTypeLabel = (fileName: string): string => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'Excel';
  if (lower.endsWith('.csv')) return 'CSV';
  return 'Unknown';
};
