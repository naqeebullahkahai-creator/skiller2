import { useState } from "react";
import { Monitor, Copy, Check, ChevronDown, ChevronUp, Download, Database, Wifi, WifiOff, Upload, Shield, Zap, FolderTree, Terminal, Settings, Package, RefreshCw, Image, LogIn, BarChart3, AlertTriangle, Rocket, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CopyBlock = ({ code, label }: { code: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      {label && <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>}
      <div className="bg-zinc-950 text-green-400 rounded-lg p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap border border-zinc-800">
        {code}
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-zinc-400" />}
        </button>
      </div>
    </div>
  );
};

const StepCard = ({ step, title, icon: Icon, children, badge }: { step: number; title: string; icon: any; children: React.ReactNode; badge?: string }) => {
  const [open, setOpen] = useState(step <= 2);
  return (
    <Card className="border-border/50">
      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{step}</div>
            <Icon size={20} className="text-primary" />
            <CardTitle className="text-base">{title}</CardTitle>
            {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
          </div>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </CardHeader>
      {open && <CardContent className="space-y-4 pt-0">{children}</CardContent>}
    </Card>
  );
};

const AdminDesktopAppPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const copyAll = () => {
    const el = document.getElementById("desktop-guide-content");
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      toast({ title: "Copied!", description: "Full guide copied to clipboard" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24" id="desktop-guide-content">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div className="p-3 rounded-xl bg-blue-600/10">
          <Monitor className="h-7 w-7 text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Desktop App Builder</h1>
          <p className="text-sm text-muted-foreground">FANZON Seller Center — Electron Desktop Application</p>
        </div>
        <Button onClick={copyAll} variant="outline" size="sm" className="gap-2">
          <Copy size={14} /> Copy All
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Monitor, label: "Electron.js", desc: "Desktop Framework" },
          { icon: Database, label: "SQLite", desc: "Offline Database" },
          { icon: Wifi, label: "Sync System", desc: "Online/Offline" },
          { icon: Package, label: ".exe Build", desc: "Windows Installer" },
        ].map((item, i) => (
          <Card key={i} className="text-center p-3">
            <item.icon size={24} className="mx-auto text-primary mb-1" />
            <p className="font-semibold text-sm">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>

      <Separator />

      {/* STEP 1: Prerequisites */}
      <StepCard step={1} title="Prerequisites & Environment Setup" icon={Settings} badge="Required">
        <p className="text-sm text-muted-foreground">Install these tools on your Windows/Mac computer before starting:</p>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="font-semibold text-sm">1. Node.js (v18+)</p>
            <p className="text-xs text-muted-foreground">Download from: https://nodejs.org — Choose LTS version. Verify installation:</p>
            <CopyBlock code="node --version\nnpm --version" />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="font-semibold text-sm">2. Git</p>
            <p className="text-xs text-muted-foreground">Download from: https://git-scm.com — Needed for version control</p>
            <CopyBlock code="git --version" />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="font-semibold text-sm">3. Visual Studio Code</p>
            <p className="text-xs text-muted-foreground">Download from: https://code.visualstudio.com — Your code editor</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="font-semibold text-sm">4. Windows Build Tools (Windows only)</p>
            <CopyBlock code="npm install --global windows-build-tools" />
          </div>
        </div>
      </StepCard>

      {/* STEP 2: Project Setup */}
      <StepCard step={2} title="Create Project & Install Dependencies" icon={FolderTree} badge="Core">
        <p className="text-sm text-muted-foreground">Open Terminal/CMD and run these commands one by one:</p>

        <CopyBlock label="Create project folder" code={`mkdir fanzon-seller-desktop
cd fanzon-seller-desktop
npm init -y`} />

        <CopyBlock label="Install Electron & core dependencies" code={`npm install electron electron-builder --save-dev
npm install better-sqlite3 axios xlsx electron-store electron-updater`} />

        <CopyBlock label="Install UI dependencies" code={`npm install react react-dom react-router-dom
npm install @vitejs/plugin-react vite --save-dev
npm install tailwindcss postcss autoprefixer --save-dev
npm install lucide-react sonner`} />

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle size={14} className="inline mr-1" />
            Make sure all installations complete without errors before moving to next step.
          </p>
        </div>
      </StepCard>

      {/* STEP 3: Project Structure */}
      <StepCard step={3} title="Project Folder Structure" icon={FolderTree}>
        <p className="text-sm text-muted-foreground">Create this exact folder structure in your project:</p>
        <CopyBlock code={`fanzon-seller-desktop/
├── package.json
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js            # Bridge between main & renderer
│   └── database/
│       ├── db.js             # SQLite database setup
│       └── products.js       # Product CRUD operations
├── src/
│   ├── App.jsx               # React main app
│   ├── main.jsx              # React entry
│   ├── index.css             # Tailwind styles
│   ├── pages/
│   │   ├── Dashboard.jsx     # Home dashboard
│   │   ├── AddProduct.jsx    # Add single product
│   │   ├── BulkUpload.jsx    # Excel/CSV upload
│   │   ├── Products.jsx      # Product list table
│   │   ├── SyncPage.jsx      # Sync management
│   │   ├── Settings.jsx      # App settings
│   │   └── Login.jsx         # Seller authentication
│   ├── components/
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   ├── SyncStatus.jsx    # Online/offline indicator
│   │   └── ProductTable.jsx  # Products data table
│   └── utils/
│       ├── api.js            # API client (axios)
│       ├── sync.js           # Sync engine
│       └── imageCompressor.js # Image compression
├── vite.config.js
├── tailwind.config.js
└── electron-builder.yml`} />
      </StepCard>

      {/* STEP 4: Electron Main Process */}
      <StepCard step={4} title="Electron Main Process (electron/main.js)" icon={Terminal} badge="Core">
        <p className="text-sm text-muted-foreground">This is the heart of your desktop app. Create <code>electron/main.js</code>:</p>
        <CopyBlock code={`const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { initDatabase, getDB } = require('./database/db');
const { ProductStore } = require('./database/products');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'FANZON Seller Center',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
  });

  // In development, load Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ========== IPC HANDLERS ==========

// Product CRUD
ipcMain.handle('products:add', async (_, product) => {
  return ProductStore.addProduct(product);
});

ipcMain.handle('products:getAll', async () => {
  return ProductStore.getAllProducts();
});

ipcMain.handle('products:getUnsynced', async () => {
  return ProductStore.getUnsyncedProducts();
});

ipcMain.handle('products:markSynced', async (_, id) => {
  return ProductStore.markAsSynced(id);
});

ipcMain.handle('products:delete', async (_, id) => {
  return ProductStore.deleteProduct(id);
});

ipcMain.handle('products:update', async (_, id, data) => {
  return ProductStore.updateProduct(id, data);
});

// File dialog for images
ipcMain.handle('dialog:openImages', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
  });
  return result.filePaths;
});

// Bulk upload file dialog
ipcMain.handle('dialog:openExcel', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Spreadsheets', extensions: ['xlsx', 'xls', 'csv'] }],
  });
  return result.filePaths[0] || null;
});

// Check internet
ipcMain.handle('network:isOnline', async () => {
  const { net } = require('electron');
  return net.isOnline();
});`} />
      </StepCard>

      {/* STEP 5: SQLite Database */}
      <StepCard step={5} title="SQLite Database Setup (Offline Storage)" icon={Database} badge="Offline">
        <p className="text-sm text-muted-foreground">Create <code>electron/database/db.js</code>:</p>
        <CopyBlock code={`const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'fanzon-seller.db');
  db = new Database(dbPath);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  
  // Create tables
  db.exec(\`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      discount_price REAL,
      category TEXT,
      brand TEXT,
      sku TEXT,
      stock_count INTEGER DEFAULT 0,
      images TEXT,
      variants TEXT,
      status TEXT DEFAULT 'draft',
      is_synced INTEGER DEFAULT 0,
      sync_error TEXT,
      remote_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      action TEXT,
      status TEXT,
      error_message TEXT,
      synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  \`);
  
  console.log('Database initialized at:', dbPath);
  return db;
}

function getDB() {
  return db;
}

module.exports = { initDatabase, getDB };`} />

        <p className="text-sm text-muted-foreground mt-4">Create <code>electron/database/products.js</code>:</p>
        <CopyBlock code={`const { getDB } = require('./db');

const ProductStore = {
  addProduct(product) {
    const db = getDB();
    const stmt = db.prepare(\`
      INSERT INTO products (title, description, price, discount_price, category, brand, sku, stock_count, images, variants)
      VALUES (@title, @description, @price, @discount_price, @category, @brand, @sku, @stock_count, @images, @variants)
    \`);
    const result = stmt.run({
      ...product,
      images: JSON.stringify(product.images || []),
      variants: JSON.stringify(product.variants || []),
    });
    return { id: result.lastInsertRowid, ...product };
  },

  getAllProducts() {
    const db = getDB();
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      variants: JSON.parse(p.variants || '[]'),
    }));
  },

  getUnsyncedProducts() {
    const db = getDB();
    return db.prepare('SELECT * FROM products WHERE is_synced = 0').all().map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      variants: JSON.parse(p.variants || '[]'),
    }));
  },

  markAsSynced(id, remoteId) {
    const db = getDB();
    db.prepare('UPDATE products SET is_synced = 1, remote_id = ?, sync_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(remoteId, id);
  },

  markSyncError(id, error) {
    const db = getDB();
    db.prepare('UPDATE products SET sync_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(error, id);
  },

  deleteProduct(id) {
    const db = getDB();
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
  },

  updateProduct(id, data) {
    const db = getDB();
    const fields = Object.keys(data).map(k => k + ' = @' + k).join(', ');
    db.prepare('UPDATE products SET ' + fields + ', updated_at = CURRENT_TIMESTAMP WHERE id = @id').run({ ...data, id });
  },

  getStats() {
    const db = getDB();
    return {
      total: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
      synced: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_synced = 1').get().count,
      unsynced: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_synced = 0').get().count,
      errors: db.prepare('SELECT COUNT(*) as count FROM products WHERE sync_error IS NOT NULL').get().count,
    };
  },
};

module.exports = { ProductStore };`} />
      </StepCard>

      {/* STEP 6: Preload Script */}
      <StepCard step={6} title="Preload Script (Bridge)" icon={Shield}>
        <p className="text-sm text-muted-foreground">Create <code>electron/preload.js</code> — this securely connects React UI to Electron:</p>
        <CopyBlock code={`const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Products
  addProduct: (product) => ipcRenderer.invoke('products:add', product),
  getAllProducts: () => ipcRenderer.invoke('products:getAll'),
  getUnsyncedProducts: () => ipcRenderer.invoke('products:getUnsynced'),
  markProductSynced: (id) => ipcRenderer.invoke('products:markSynced', id),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),
  updateProduct: (id, data) => ipcRenderer.invoke('products:update', id, data),

  // Dialogs
  openImageDialog: () => ipcRenderer.invoke('dialog:openImages'),
  openExcelDialog: () => ipcRenderer.invoke('dialog:openExcel'),

  // Network
  isOnline: () => ipcRenderer.invoke('network:isOnline'),

  // Events
  onSyncProgress: (callback) => ipcRenderer.on('sync:progress', (_, data) => callback(data)),
  onNetworkChange: (callback) => ipcRenderer.on('network:change', (_, status) => callback(status)),
});`} />
      </StepCard>

      {/* STEP 7: API & Sync Engine */}
      <StepCard step={7} title="API Client & Sync Engine" icon={RefreshCw} badge="Key Feature">
        <p className="text-sm text-muted-foreground">Create <code>src/utils/api.js</code>:</p>
        <CopyBlock code={`import axios from 'axios';

const API_BASE = 'https://faevzfibzcbuqjoatmjm.supabase.co';
const ANON_KEY = 'your-anon-key-here';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('seller_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export const loginSeller = async (email, password) => {
  const response = await api.post('/auth/v1/token?grant_type=password', {
    email, password,
  });
  localStorage.setItem('seller_token', response.data.access_token);
  localStorage.setItem('seller_info', JSON.stringify(response.data.user));
  return response.data;
};

export const uploadProduct = async (product) => {
  const response = await api.post('/rest/v1/products', {
    title: product.title,
    description: product.description,
    price_pkr: product.price,
    discount_price_pkr: product.discount_price,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    stock_count: product.stock_count,
    images: product.images,
    status: 'pending',
    seller_id: JSON.parse(localStorage.getItem('seller_info')).id,
  });
  return response.data;
};

export default api;`} />

        <p className="text-sm text-muted-foreground mt-4">Create <code>src/utils/sync.js</code> — the sync engine:</p>
        <CopyBlock code={`import { uploadProduct } from './api';

export class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.progress = { total: 0, done: 0, failed: 0 };
    this.listeners = [];
  }

  onProgress(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(fn => fn({ ...this.progress }));
  }

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const unsynced = await window.electronAPI.getUnsyncedProducts();
      this.progress = { total: unsynced.length, done: 0, failed: 0 };
      this.notify();

      for (const product of unsynced) {
        try {
          const result = await uploadProduct(product);
          await window.electronAPI.markProductSynced(product.id, result[0]?.id);
          this.progress.done++;
        } catch (error) {
          this.progress.failed++;
          console.error('Sync failed for product:', product.id, error.message);
        }
        this.notify();
      }
    } finally {
      this.isSyncing = false;
    }

    return this.progress;
  }
}

export const syncEngine = new SyncEngine();

// Auto-sync when online
let autoSyncInterval;
export function startAutoSync(intervalMs = 60000) {
  autoSyncInterval = setInterval(async () => {
    const online = await window.electronAPI.isOnline();
    if (online && !syncEngine.isSyncing) {
      syncEngine.syncAll();
    }
  }, intervalMs);
}

export function stopAutoSync() {
  clearInterval(autoSyncInterval);
}`} />
      </StepCard>

      {/* STEP 8: Image Compression */}
      <StepCard step={8} title="Image Handling & Compression" icon={Image}>
        <p className="text-sm text-muted-foreground">Create <code>src/utils/imageCompressor.js</code>:</p>
        <CopyBlock code={`export async function compressImage(filePath, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = 'file://' + filePath;
  });
}

export async function compressMultipleImages(filePaths) {
  const compressed = [];
  for (const path of filePaths) {
    try {
      const result = await compressImage(path);
      compressed.push(result);
    } catch (err) {
      console.error('Failed to compress:', path, err);
    }
  }
  return compressed;
}`} />
      </StepCard>

      {/* STEP 9: Package.json Config */}
      <StepCard step={9} title="Package.json Configuration" icon={Settings}>
        <p className="text-sm text-muted-foreground">Update your <code>package.json</code> with these fields:</p>
        <CopyBlock code={`{
  "name": "fanzon-seller-center",
  "version": "1.0.0",
  "description": "FANZON Seller Center Desktop Application",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \\"vite\\" \\"wait-on http://localhost:5173 && electron .\\"",
    "electron:build": "vite build && electron-builder",
    "electron:preview": "vite build && electron ."
  },
  "build": {
    "appId": "com.fanzon.seller-center",
    "productName": "FANZON Seller Center",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "public/icon.ico",
      "uninstallerIcon": "public/icon.ico",
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "FANZON Seller Center"
    },
    "mac": {
      "target": "dmg",
      "icon": "public/icon.icns"
    }
  }
}`} />

        <CopyBlock label="Install additional dev tools" code={`npm install concurrently wait-on --save-dev`} />
      </StepCard>

      {/* STEP 10: Vite Config */}
      <StepCard step={10} title="Vite Configuration" icon={Zap}>
        <p className="text-sm text-muted-foreground">Create <code>vite.config.js</code>:</p>
        <CopyBlock code={`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});`} />
      </StepCard>

      {/* STEP 11: Run & Build */}
      <StepCard step={11} title="Run, Test & Build .exe" icon={Rocket} badge="Final">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="font-semibold text-sm">Development Mode (Test locally)</p>
            <CopyBlock code="npm run electron:dev" />
            <p className="text-xs text-muted-foreground">This opens the app with hot-reload for development.</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="font-semibold text-sm">Preview Production Build</p>
            <CopyBlock code="npm run electron:preview" />
            <p className="text-xs text-muted-foreground">Builds and opens without hot-reload to test production version.</p>
          </div>

          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 space-y-2">
            <p className="font-semibold text-sm text-green-700 dark:text-green-400">🎉 Build .exe Installer</p>
            <CopyBlock code="npm run electron:build" />
            <p className="text-xs text-muted-foreground">
              This creates the Windows .exe installer in the <code>release/</code> folder. Share this file with sellers to install the app!
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="font-semibold text-sm text-blue-700 dark:text-blue-400">📁 Output Location</p>
            <p className="text-xs text-muted-foreground">
              After build, find your installer at: <code>release/FANZON Seller Center Setup 1.0.0.exe</code>
            </p>
          </div>
        </div>
      </StepCard>

      {/* STEP 12: Scaling & Security Tips */}
      <StepCard step={12} title="Security, Performance & Scaling Tips" icon={BarChart3}>
        <div className="space-y-3">
          {[
            { title: "🔒 Security", items: ["Always use HTTPS for API calls", "Store auth tokens securely with electron-store (encrypted)", "Enable contextIsolation in BrowserWindow", "Never expose database directly to renderer process", "Validate all data before sync"] },
            { title: "⚡ Performance", items: ["Use SQLite WAL mode (already configured)", "Compress images before storing locally", "Batch sync operations (10 products at a time)", "Use pagination for product lists", "Cache API responses locally"] },
            { title: "📈 Scaling", items: ["Add multi-seller support with seller_id in database", "Implement auto-update with electron-updater", "Add conflict resolution for sync (server wins vs local wins)", "Add delta sync (only changed fields)", "Implement background sync with electron service worker"] },
          ].map((section, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <p className="font-semibold text-sm mb-2">{section.title}</p>
              <ul className="space-y-1">
                {section.items.map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                    <Check size={12} className="text-green-500 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </StepCard>

      {/* Quick Command Reference */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal size={18} className="text-primary" />
            Quick Command Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-xs">
            {[
              { cmd: "npm run electron:dev", desc: "Start development" },
              { cmd: "npm run electron:preview", desc: "Preview production" },
              { cmd: "npm run electron:build", desc: "Build .exe installer" },
              { cmd: "npm run dev", desc: "Run web version only" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-background/80">
                <code className="text-primary font-mono">{item.cmd}</code>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDesktopAppPage;
