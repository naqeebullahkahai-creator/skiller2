/**
 * FANZON Bulk Upload Template Generator v2.0
 * Clean branded templates with strict validation and row-level error reporting
 */
import * as XLSX from 'xlsx';

// ============ CATEGORY SYSTEM ============
export interface CategoryMapping {
  id: number;
  name: string;
  examples: string;
}

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

export const getCategoryById = (id: number): string | null => {
  const category = CATEGORY_MAPPINGS.find(c => c.id === id);
  return category?.name || null;
};

export const getCategoryId = (name: string): number | null => {
  const category = CATEGORY_MAPPINGS.find(
    c => c.name.toLowerCase() === name.toLowerCase().trim()
  );
  return category?.id || null;
};

export const isValidCategoryId = (id: number): boolean => {
  return CATEGORY_MAPPINGS.some(c => c.id === id);
};

export const isValidCategory = (value: string): boolean => {
  const trimmed = value.trim();
  const asNumber = parseInt(trimmed);
  if (!isNaN(asNumber) && isValidCategoryId(asNumber)) {
    return true;
  }
  return CATEGORY_MAPPINGS.some(
    c => c.name.toLowerCase() === trimmed.toLowerCase()
  );
};

export const resolveCategory = (value: string): string | null => {
  const trimmed = value.trim();
  const asNumber = parseInt(trimmed);
  if (!isNaN(asNumber)) {
    return getCategoryById(asNumber);
  }
  const category = CATEGORY_MAPPINGS.find(
    c => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  return category?.name || null;
};

// ============ FIELD DEFINITIONS (Clean - as requested) ============
export const TEMPLATE_FIELDS = [
  { name: "Product_Name", required: true, description: "Product title (max 200 chars)" },
  { name: "SKU", required: true, description: "Unique product code" },
  { name: "Category_ID", required: true, description: "Category ID (1-10)" },
  { name: "Base_Price", required: true, description: "Regular price (numbers only)" },
  { name: "Discount_Price", required: false, description: "Sale price (optional)" },
  { name: "Stock_Quantity", required: true, description: "Available quantity" },
  { name: "Description", required: false, description: "Product details" },
];

// Header mapping for parsing
export const HEADER_MAPPING: Record<string, string> = {
  "product_name": "title",
  "product name": "title",
  "title": "title",
  "sku": "sku",
  "category_id": "category",
  "category id": "category",
  "category": "category",
  "base_price": "price",
  "base price": "price",
  "price": "price",
  "discount_price": "discount_price",
  "discount price": "discount_price",
  "sale_price": "discount_price",
  "stock_quantity": "stock_quantity",
  "stock quantity": "stock_quantity",
  "stock": "stock_quantity",
  "quantity": "stock_quantity",
  "description": "description",
};

// ============ PARSED ROW INTERFACE ============
export interface ParsedProductRow {
  title: string;
  sku: string;
  category: string;
  price: string;
  discount_price?: string;
  stock_quantity: string;
  description?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

// ============ CSV TEMPLATE (Clean - No Dummy Data) ============
export const generateFanzonTemplate = (): string => {
  const headers = TEMPLATE_FIELDS.map(f => f.name);
  return headers.join(",") + "\n";
};

// ============ EXCEL TEMPLATE (Branded with Logo Header) ============
export const generateExcelTemplate = (): Blob => {
  const wb = XLSX.utils.book_new();
  
  // ===== INSTRUCTIONS SHEET =====
  const instructionsData = [
    [""],
    ["╔══════════════════════════════════════════════════════════════════════════════╗"],
    ["║                                                                              ║"],
    ["║     ███████╗ █████╗ ███╗   ██╗███████╗ ██████╗ ███╗   ██╗                    ║"],
    ["║     ██╔════╝██╔══██╗████╗  ██║╚══███╔╝██╔═══██╗████╗  ██║                    ║"],
    ["║     █████╗  ███████║██╔██╗ ██║  ███╔╝ ██║   ██║██╔██╗ ██║                    ║"],
    ["║     ██╔══╝  ██╔══██║██║╚██╗██║ ███╔╝  ██║   ██║██║╚██╗██║                    ║"],
    ["║     ██║     ██║  ██║██║ ╚████║███████╗╚██████╔╝██║ ╚████║                    ║"],
    ["║     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝                    ║"],
    ["║                                                                              ║"],
    ["║                    BULK PRODUCT UPLOAD TEMPLATE v2.0                         ║"],
    ["║                         Official Seller Template                             ║"],
    ["║                                                                              ║"],
    ["╠══════════════════════════════════════════════════════════════════════════════╣"],
    [""],
    ["📋 FIELD DEFINITIONS"],
    [""],
    ["Field Name", "Required", "Description", "Format Example"],
    ["Product_Name", "YES ✓", "Your product title (max 200 characters)", "Wireless Bluetooth Earbuds"],
    ["SKU", "YES ✓", "Your unique product code (letters/numbers)", "WBE-2024-001"],
    ["Category_ID", "YES ✓", "Category ID number from table below", "1"],
    ["Base_Price", "YES ✓", "Regular price - NUMBERS ONLY", "4500"],
    ["Discount_Price", "Optional", "Sale price (must be less than Base_Price)", "3999"],
    ["Stock_Quantity", "YES ✓", "Available quantity (whole number)", "50"],
    ["Description", "Optional", "Product details (max 2000 characters)", "Premium quality with..."],
    [""],
    ["══════════════════════════════════════════════════════════════════════════════"],
    [""],
    ["📂 CATEGORY REFERENCE TABLE"],
    [""],
    ["Category_ID", "Category Name", "Example Products"],
    ["1", "Electronics", "Phones, Laptops, Cameras"],
    ["2", "Fashion", "Clothes, Shoes, Accessories"],
    ["3", "Home & Garden", "Furniture, Decor, Tools"],
    ["4", "Sports", "Equipment, Apparel, Fitness"],
    ["5", "Beauty", "Skincare, Makeup, Fragrances"],
    ["6", "Books", "Fiction, Non-fiction, Textbooks"],
    ["7", "Toys", "Games, Dolls, Educational"],
    ["8", "Automotive", "Parts, Accessories, Tools"],
    ["9", "Health", "Supplements, Devices, Personal Care"],
    ["10", "Groceries", "Food, Beverages, Household"],
    [""],
    ["══════════════════════════════════════════════════════════════════════════════"],
    [""],
    ["💰 PRICE FORMAT - IMPORTANT!"],
    [""],
    ["✅ CORRECT", "❌ WRONG"],
    ["2500", "Rs. 2500"],
    ["1999.99", "PKR 1999"],
    ["50000", "2,500"],
    ["", "$50"],
    [""],
    ["⚠️ IMPORTANT TIPS"],
    ["• Do NOT change the header row in Products sheet"],
    ["• Each SKU must be unique - duplicates will be rejected"],
    ["• Category_ID must be a number from 1-10"],
    ["• Maximum 1,000 products per upload"],
    ["• Save file as .xlsx or export to .csv"],
    [""],
    ["❓ NEED HELP? Contact: seller-support@fanzon.pk"],
    [""],
    ["╚══════════════════════════════════════════════════════════════════════════════╝"],
  ];
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet["!cols"] = [
    { wch: 20 }, { wch: 15 }, { wch: 45 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, instructionsSheet, "📖 Instructions");
  
  // ===== PRODUCTS SHEET (Clean - No Data) =====
  const headers = TEMPLATE_FIELDS.map(f => f.name);
  const productsData = [headers];
  
  const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
  
  // Column widths for better UX
  productsSheet["!cols"] = [
    { wch: 35 },  // Product_Name
    { wch: 18 },  // SKU
    { wch: 12 },  // Category_ID
    { wch: 12 },  // Base_Price
    { wch: 14 },  // Discount_Price
    { wch: 15 },  // Stock_Quantity
    { wch: 50 },  // Description
  ];
  
  XLSX.utils.book_append_sheet(wb, productsSheet, "Products");
  
  // Generate file
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
};

// ============ INSTRUCTIONS TEXT FILE ============
export const generateInstructionsGuide = (): string => {
  const categoryTable = CATEGORY_MAPPINGS
    .map(c => `  ${c.id.toString().padEnd(3)} │ ${c.name.padEnd(15)} │ ${c.examples}`)
    .join("\n");

  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║     ███████╗ █████╗ ███╗   ██╗███████╗ ██████╗ ███╗   ██╗                    ║
║     ██╔════╝██╔══██╗████╗  ██║╚══███╔╝██╔═══██╗████╗  ██║                    ║
║     █████╗  ███████║██╔██╗ ██║  ███╔╝ ██║   ██║██╔██╗ ██║                    ║
║     ██╔══╝  ██╔══██║██║╚██╗██║ ███╔╝  ██║   ██║██║╚██╗██║                    ║
║     ██║     ██║  ██║██║ ╚████║███████╗╚██████╔╝██║ ╚████║                    ║
║     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝                    ║
║                                                                              ║
║                    BULK PRODUCT UPLOAD GUIDE v2.0                            ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📋 REQUIRED FIELDS (All Must Be Filled)                                     ║
║  ─────────────────────────────────────────                                   ║
║  • Product_Name     Your product title (max 200 characters)                  ║
║  • SKU              Unique product code (e.g., WBE-2024-001)                 ║
║  • Category_ID      Category number from table below (1-10)                  ║
║  • Base_Price       Regular price - NUMBERS ONLY (e.g., 2500)                ║
║  • Stock_Quantity   Available quantity (whole number, 0 or more)             ║
║                                                                              ║
║  📝 OPTIONAL FIELDS                                                          ║
║  ─────────────────────                                                       ║
║  • Discount_Price   Sale price (must be less than Base_Price)                ║
║  • Description      Product details (max 2000 characters)                    ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📂 CATEGORY REFERENCE TABLE                                                 ║
║  ────────────────────────────                                                ║
║  Use the Category_ID number in your upload file                              ║
║                                                                              ║
║  ID  │ Category        │ Examples                                            ║
║  ────┼─────────────────┼─────────────────────────────────────                ║
${categoryTable}
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  💰 PRICE FORMAT EXAMPLES                                                    ║
║  ────────────────────────                                                    ║
║  ✅ CORRECT:  2500        (whole number)                                     ║
║  ✅ CORRECT:  1999.99     (decimal)                                          ║
║  ❌ WRONG:    Rs. 2500    (contains letters)                                 ║
║  ❌ WRONG:    PKR 1999    (contains letters)                                 ║
║  ❌ WRONG:    2,500       (contains comma)                                   ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ⚠️ IMPORTANT RULES                                                          ║
║  ─────────────────                                                           ║
║  • Do NOT change the header row                                              ║
║  • Each SKU must be UNIQUE - duplicates will be rejected                     ║
║  • Maximum 1,000 products per upload                                         ║
║  • Use UTF-8 encoding for special characters                                 ║
║                                                                              ║
║  ❓ NEED HELP?                                                               ║
║  Contact seller support at: seller-support@fanzon.pk                         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`.trim();
};

// ============ FILE TYPE HELPERS ============
export const isSupportedFileType = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().split(".").pop();
  return ext === "csv" || ext === "xlsx" || ext === "xls";
};

export const getFileTypeLabel = (fileName: string): string => {
  const ext = fileName.toLowerCase().split(".").pop();
  return ext === "xlsx" || ext === "xls" ? "Excel" : "CSV";
};

// ============ PARSING FUNCTIONS ============
export const parseCSVContent = (content: string): ParsedProductRow[] => {
  const lines = content.trim().split("\n");
  const dataLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed !== "" && !trimmed.startsWith("#");
  });
  
  if (dataLines.length < 2) return [];
  
  const rawHeaders = dataLines[0].split(",").map(h => 
    h.trim().toLowerCase().replace(/"/g, "")
  );
  const headers = rawHeaders.map(h => HEADER_MAPPING[h] || h);
  
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
      sku: row.sku || "",
      category: row.category || "",
      price: row.price || "",
      discount_price: row.discount_price || "",
      stock_quantity: row.stock_quantity || "",
      description: row.description || "",
    };
  });
};

export const parseExcelContent = async (file: File): Promise<ParsedProductRow[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  
  // Find Products sheet or use first sheet
  const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes("product")) || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
  
  return data.map((row) => {
    const normalizedRow: Record<string, string> = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = HEADER_MAPPING[key.toLowerCase()] || key.toLowerCase();
      normalizedRow[normalizedKey] = String(row[key] || "");
    });
    
    return {
      title: normalizedRow.title || "",
      sku: normalizedRow.sku || "",
      category: normalizedRow.category || "",
      price: normalizedRow.price || "",
      discount_price: normalizedRow.discount_price || "",
      stock_quantity: normalizedRow.stock_quantity || "",
      description: normalizedRow.description || "",
    };
  });
};

export const parseUploadFile = async (file: File): Promise<ParsedProductRow[]> => {
  const ext = file.name.toLowerCase().split(".").pop();
  
  if (ext === "csv") {
    const content = await file.text();
    return parseCSVContent(content);
  } else if (ext === "xlsx" || ext === "xls") {
    return parseExcelContent(file);
  }
  
  throw new Error("Unsupported file format. Please use .csv or .xlsx files.");
};

// ============ VALIDATION WITH ROW-SPECIFIC ERRORS ============
export const validateProductRow = (
  row: ParsedProductRow,
  rowIndex: number
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const rowNum = rowIndex + 2; // +1 for header, +1 for 1-indexed
  
  // Product_Name validation
  if (!row.title || row.title.trim().length === 0) {
    errors.push({
      row: rowNum,
      field: "Product_Name",
      message: `Row ${rowNum}: Product_Name is missing`,
    });
  } else if (row.title.trim().length > 200) {
    errors.push({
      row: rowNum,
      field: "Product_Name",
      message: `Row ${rowNum}: Product_Name exceeds 200 characters`,
      value: `(${row.title.length} characters)`,
    });
  }
  
  // SKU validation
  if (!row.sku || row.sku.trim().length === 0) {
    errors.push({
      row: rowNum,
      field: "SKU",
      message: `Row ${rowNum}: SKU is missing`,
    });
  } else if (!/^[a-zA-Z0-9\-_]+$/.test(row.sku.trim())) {
    errors.push({
      row: rowNum,
      field: "SKU",
      message: `Row ${rowNum}: SKU contains invalid characters. Use only letters, numbers, hyphens, and underscores`,
      value: row.sku,
    });
  }
  
  // Category_ID validation
  if (!row.category || row.category.trim().length === 0) {
    errors.push({
      row: rowNum,
      field: "Category_ID",
      message: `Row ${rowNum}: Category_ID is missing. Use 1-10`,
    });
  } else {
    const categoryId = parseInt(row.category.trim());
    if (isNaN(categoryId)) {
      errors.push({
        row: rowNum,
        field: "Category_ID",
        message: `Row ${rowNum}: Category_ID must be a number (1-10)`,
        value: row.category,
      });
    } else if (!isValidCategoryId(categoryId)) {
      errors.push({
        row: rowNum,
        field: "Category_ID",
        message: `Row ${rowNum}: Invalid Category_ID "${categoryId}". Valid IDs are 1-10`,
        value: row.category,
      });
    }
  }
  
  // Base_Price validation
  if (!row.price || row.price.trim().length === 0) {
    errors.push({
      row: rowNum,
      field: "Base_Price",
      message: `Row ${rowNum}: Base_Price is missing`,
    });
  } else {
    const priceStr = row.price.trim();
    if (/[a-zA-Z]/.test(priceStr)) {
      errors.push({
        row: rowNum,
        field: "Base_Price",
        message: `Row ${rowNum}: Base_Price cannot contain letters. Use numbers only (e.g., 2500)`,
        value: priceStr,
      });
    } else if (/[^\d.]/.test(priceStr)) {
      errors.push({
        row: rowNum,
        field: "Base_Price",
        message: `Row ${rowNum}: Base_Price cannot contain symbols. Use numbers only`,
        value: priceStr,
      });
    } else {
      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        errors.push({
          row: rowNum,
          field: "Base_Price",
          message: `Row ${rowNum}: Base_Price must be a positive number`,
          value: priceStr,
        });
      }
    }
  }
  
  // Discount_Price validation (optional)
  if (row.discount_price && row.discount_price.trim().length > 0) {
    const discountStr = row.discount_price.trim();
    if (/[a-zA-Z]/.test(discountStr)) {
      errors.push({
        row: rowNum,
        field: "Discount_Price",
        message: `Row ${rowNum}: Discount_Price cannot contain letters`,
        value: discountStr,
      });
    } else {
      const discountPrice = parseFloat(discountStr);
      const basePrice = parseFloat(row.price);
      if (isNaN(discountPrice) || discountPrice < 0) {
        errors.push({
          row: rowNum,
          field: "Discount_Price",
          message: `Row ${rowNum}: Discount_Price must be a valid number`,
          value: discountStr,
        });
      } else if (!isNaN(basePrice) && discountPrice >= basePrice) {
        errors.push({
          row: rowNum,
          field: "Discount_Price",
          message: `Row ${rowNum}: Discount_Price must be less than Base_Price`,
          value: `${discountPrice} >= ${basePrice}`,
        });
      }
    }
  }
  
  // Stock_Quantity validation
  if (!row.stock_quantity || row.stock_quantity.trim().length === 0) {
    errors.push({
      row: rowNum,
      field: "Stock_Quantity",
      message: `Row ${rowNum}: Stock_Quantity is missing`,
    });
  } else {
    const stock = parseInt(row.stock_quantity.trim());
    if (isNaN(stock)) {
      errors.push({
        row: rowNum,
        field: "Stock_Quantity",
        message: `Row ${rowNum}: Stock_Quantity must be a whole number`,
        value: row.stock_quantity,
      });
    } else if (stock < 0) {
      errors.push({
        row: rowNum,
        field: "Stock_Quantity",
        message: `Row ${rowNum}: Stock_Quantity cannot be negative`,
        value: row.stock_quantity,
      });
    }
  }
  
  return errors;
};

// Validate all rows and check for duplicate SKUs
export const validateAllRows = (rows: ParsedProductRow[]): ValidationError[] => {
  const allErrors: ValidationError[] = [];
  const skuMap = new Map<string, number[]>();
  
  rows.forEach((row, index) => {
    // Individual row validation
    const rowErrors = validateProductRow(row, index);
    allErrors.push(...rowErrors);
    
    // Track SKUs for duplicate detection
    if (row.sku && row.sku.trim().length > 0) {
      const sku = row.sku.trim().toLowerCase();
      if (!skuMap.has(sku)) {
        skuMap.set(sku, []);
      }
      skuMap.get(sku)!.push(index + 2);
    }
  });
  
  // Check for duplicate SKUs
  skuMap.forEach((rowNums, sku) => {
    if (rowNums.length > 1) {
      rowNums.forEach(rowNum => {
        allErrors.push({
          row: rowNum,
          field: "SKU",
          message: `Row ${rowNum}: Duplicate SKU "${sku}" found in rows ${rowNums.join(", ")}`,
          value: sku,
        });
      });
    }
  });
  
  return allErrors;
};
