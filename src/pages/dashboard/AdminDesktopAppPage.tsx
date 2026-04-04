import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Monitor, Copy, Check, Shield, Database, Wifi, WifiOff, RefreshCw,
  Users, Package, ShoppingCart, DollarSign, Settings, FileCode, Terminal,
  ArrowLeft, Zap, HardDrive, Globe, Lock, FolderTree, LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUPA_URL = "https://faevzfibzcbuqjoatmjm.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXZ6ZmliemNidXFqb2F0bWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTM4OTQsImV4cCI6MjA4NzM2OTg5NH0.1P6q4Xo5xKWHExRnUOaQPjwq-AxmQ6K4Sp4FTpWPXGM";

/* ════════════════════════════════════════════════════════════
   ADMIN DESKTOP APP PAGE – Complete Electron project files
   with offline SQLite + online Supabase real‑time sync
   ════════════════════════════════════════════════════════════ */

// ─── Source code strings ─────────────────────────────────
const PKG = `{
  "name": "fanzon-admin-desktop",
  "version": "1.0.0",
  "description": "FANZON Admin Panel – Desktop Software",
  "main": "electron/main.cjs",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win --x64",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.fanzon.admin",
    "productName": "FANZON Admin Panel",
    "directories": { "output": "release" },
    "win": { "target": "nsis", "icon": "assets/icon.ico" },
    "nsis": { "oneClick": false, "allowToChangeInstallationDirectory": true }
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "@supabase/supabase-js": "^2.49.0"
  },
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0"
  }
}`;

const MAIN = `const { app, BrowserWindow, ipcMain, Tray, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store({ defaults: { windowBounds: { width: 1280, height: 800 } } });
let mainWindow, tray;

function createWindow() {
  const { width, height } = store.get('windowBounds');
  mainWindow = new BrowserWindow({
    width, height, minWidth: 1024, minHeight: 700,
    title: 'FANZON Admin Panel',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false },
    frame: false, backgroundColor: '#0f172a',
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.on('resize', () => { const [w,h] = mainWindow.getSize(); store.set('windowBounds',{width:w,height:h}); });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname,'../assets/icon.png'));
  tray = new Tray(icon.resize({width:16,height:16}));
  tray.setToolTip('FANZON Admin Panel');
  tray.on('click', () => mainWindow?.show());
}

ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('maximize-window', () => { mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize(); });
ipcMain.handle('close-window', () => mainWindow?.close());

app.whenReady().then(() => { createWindow(); createTray(); });
app.on('window-all-closed', () => { if(process.platform!=='darwin') app.quit(); });`;

const PRELOAD = `const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
});`;

const APP_JS = `const SUPABASE_URL = '${SUPA_URL}';
const SUPABASE_KEY = '${SUPA_KEY}';
let currentPage='dashboard', isOnline=false, currentUser=null, syncTimer=null;
let localData = { sellers:[], products:[], orders:[] };

// ── IndexedDB ────────────────────────────────────────────
function openDB(){return new Promise((r,j)=>{const q=indexedDB.open('fanzon_admin',1);q.onupgradeneeded=e=>{const d=e.target.result;['sellers','products','orders'].forEach(n=>{if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})});};q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)})}
async function saveLocal(n,d){const db=await openDB();const tx=db.transaction(n,'readwrite');tx.objectStore(n).clear();d.forEach(i=>tx.objectStore(n).put(i))}
async function getLocal(n){const db=await openDB();return new Promise(r=>{const q=db.transaction(n,'readonly').objectStore(n).getAll();q.onsuccess=()=>r(q.result||[]);q.onerror=()=>r([])})}

// ── API ──────────────────────────────────────────────────
async function api(ep,opt={}){const r=await fetch(SUPABASE_URL+'/rest/v1/'+ep,{headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+(currentUser?.access_token||SUPABASE_KEY),'Content-Type':'application/json','Prefer':'return=representation',...opt.headers},...opt});return r.json()}

async function checkOnline(){try{const r=await fetch(SUPABASE_URL+'/rest/v1/',{headers:{'apikey':SUPABASE_KEY},signal:AbortSignal.timeout(5000)});const was=!isOnline;isOnline=r.ok;if(was&&isOnline)syncData()}catch{isOnline=false}
document.getElementById('status-dot').className='status-dot '+(isOnline?'online':'offline');document.getElementById('status-text').textContent=isOnline?'Online – Real-time':'Offline – Local'}

// ── Auth ─────────────────────────────────────────────────
async function login(email,pw){try{const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});const d=await r.json();if(d.access_token){currentUser=d;localStorage.setItem('fz_admin',JSON.stringify(d));boot();return{ok:true}}return{ok:false,msg:d.error_description||'Failed'}}catch{const s=localStorage.getItem('fz_admin');if(s){currentUser=JSON.parse(s);boot();return{ok:true,offline:true}}return{ok:false,msg:'Offline & no session'}}}
function logout(){currentUser=null;localStorage.removeItem('fz_admin');clearInterval(syncTimer);showLogin()}

// ── Sync ─────────────────────────────────────────────────
async function syncData(){if(!isOnline)return;try{const[s,p,o]=await Promise.all([api('seller_profiles?select=*&order=submitted_at.desc'),api('products?select=*&order=created_at.desc'),api('orders?select=*&order=created_at.desc&limit=500')]);localData={sellers:s||[],products:p||[],orders:o||[]};await Promise.all([saveLocal('sellers',localData.sellers),saveLocal('products',localData.products),saveLocal('orders',localData.orders)]);renderPage()}catch(e){console.error('Sync:',e)}}

// ── Nav ──────────────────────────────────────────────────
const NAV=[{id:'dashboard',l:'Dashboard',i:'📊'},{id:'sellers',l:'Sellers',i:'👥'},{id:'products',l:'Products',i:'📦'},{id:'orders',l:'Orders',i:'🛒'},{id:'sync',l:'Sync Center',i:'🔄'},{id:'settings',l:'Settings',i:'⚙️'}];
function renderNav(){document.getElementById('sidebar-nav').innerHTML=NAV.map(n=>'<div class="nav-item '+(currentPage===n.id?'active':'')+'" onclick="go(\\''+n.id+'\\')"><span>'+n.i+'</span>'+n.l+'</div>').join('')+'<div class="nav-section">Account</div><div class="nav-item" onclick="logout()"><span>🚪</span>Logout</div>'}
function go(p){currentPage=p;renderNav();renderPage()}
function renderPage(){const fn={dashboard:pgDash,sellers:pgSellers,products:pgProducts,orders:pgOrders,sync:pgSync,settings:pgSettings};(fn[currentPage]||pgDash)()}

// ── Pages ────────────────────────────────────────────────
function pgDash(){const s=localData.sellers,p=localData.products,o=localData.orders;const rev=o.reduce((a,x)=>a+Number(x.total_amount_pkr||0),0);const pend=o.filter(x=>x.order_status==='pending').length;const ver=s.filter(x=>x.verification_status==='verified').length;const act=p.filter(x=>x.status==='active').length;
document.getElementById('main-content').innerHTML='<div class="page-header"><h1 class="page-title">Dashboard</h1><span style="font-size:12px;color:var(--muted)">'+new Date().toLocaleTimeString()+'</span></div><div class="stats-grid"><div class="stat-card purple"><div class="stat-label">Sellers</div><div class="stat-value">'+s.length+'</div><small style="color:#4ade80">'+ver+' verified</small></div><div class="stat-card green"><div class="stat-label">Products</div><div class="stat-value">'+p.length+'</div><small style="color:#4ade80">'+act+' active</small></div><div class="stat-card blue"><div class="stat-label">Orders</div><div class="stat-value">'+o.length+'</div><small style="color:#fbbf24">'+pend+' pending</small></div><div class="stat-card amber"><div class="stat-label">Revenue</div><div class="stat-value">Rs.'+rev.toLocaleString()+'</div></div></div><h3 style="margin-bottom:12px;font-size:15px">Recent Orders</h3><table class="data-table"><thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>'+o.slice(0,10).map(x=>'<tr><td>'+(x.order_number||x.id.slice(0,8))+'</td><td>'+(x.customer_name||'-')+'</td><td>Rs.'+Number(x.total_amount_pkr||0).toLocaleString()+'</td><td><span class="badge badge-'+(x.order_status==='delivered'?'success':x.order_status==='pending'?'warning':'info')+'">'+x.order_status+'</span></td></tr>').join('')+'</tbody></table>'}
function pgSellers(){const s=localData.sellers;document.getElementById('main-content').innerHTML='<div class="page-header"><h1 class="page-title">Sellers ('+s.length+')</h1></div><table class="data-table"><thead><tr><th>Name</th><th>Business</th><th>Phone</th><th>Status</th></tr></thead><tbody>'+s.map(x=>'<tr><td>'+(x.full_name||'-')+'</td><td>'+(x.business_name||'-')+'</td><td>'+(x.phone||'-')+'</td><td><span class="badge badge-'+(x.verification_status==='verified'?'success':x.verification_status==='rejected'?'danger':'warning')+'">'+x.verification_status+'</span></td></tr>').join('')+'</tbody></table>'}
function pgProducts(){const p=localData.products;document.getElementById('main-content').innerHTML='<div class="page-header"><h1 class="page-title">Products ('+p.length+')</h1></div><table class="data-table"><thead><tr><th>Title</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead><tbody>'+p.slice(0,50).map(x=>'<tr><td>'+(x.title||'-').substring(0,40)+'</td><td>Rs.'+Number(x.price_pkr||0).toLocaleString()+'</td><td>'+( x.stock_count||0)+'</td><td><span class="badge badge-'+(x.status==='active'?'success':'warning')+'">'+x.status+'</span></td></tr>').join('')+'</tbody></table>'}
function pgOrders(){const o=localData.orders;document.getElementById('main-content').innerHTML='<div class="page-header"><h1 class="page-title">Orders ('+o.length+')</h1></div><table class="data-table"><thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>'+o.slice(0,50).map(x=>'<tr><td>'+(x.order_number||x.id.slice(0,8))+'</td><td>'+(x.customer_name||'-')+'</td><td>Rs.'+Number(x.total_amount_pkr||0).toLocaleString()+'</td><td><span class="badge badge-'+(x.order_status==='delivered'?'success':x.order_status==='cancelled'?'danger':x.order_status==='pending'?'warning':'info')+'">'+x.order_status+'</span></td><td>'+new Date(x.created_at).toLocaleDateString()+'</td></tr>').join('')+'</tbody></table>'}
function pgSync(){document.getElementById('main-content').innerHTML='<div class="page-header"><h1 class="page-title">Sync Center</h1></div><div class="sync-panel"><div class="sync-header"><div><h3 style="font-size:15px">Data Sync</h3><p style="font-size:12px;color:var(--muted)">'+(isOnline?'🟢 Connected':'🔴 Offline')+'</p></div><button class="sync-btn" onclick="syncData().then(pgSync)">🔄 Sync Now</button></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px"><div style="background:var(--bg);padding:12px;border-radius:8px;text-align:center"><div style="font-size:22px;font-weight:700">'+localData.sellers.length+'</div><div style="font-size:11px;color:var(--muted)">Sellers</div></div><div style="background:var(--bg);padding:12px;border-radius:8px;text-align:center"><div style="font-size:22px;font-weight:700">'+localData.products.length+'</div><div style="font-size:11px;color:var(--muted)">Products</div></div><div style="background:var(--bg);padding:12px;border-radius:8px;text-align:center"><div style="font-size:22px;font-weight:700">'+localData.orders.length+'</div><div style="font-size:11px;color:var(--muted)">Orders</div></div></div></div>'}
function pgSettings(){document.getElementById('main-content').innerHTML='<div class="page-header"><h1 class="page-title">Settings</h1></div><div class="settings-group"><h3 style="font-size:15px;margin-bottom:12px">General</h3><div class="settings-row"><span>Auto Sync (30s)</span><div class="toggle on" onclick="this.classList.toggle(\\'on\\')"></div></div><div class="settings-row"><span>Notifications</span><div class="toggle on" onclick="this.classList.toggle(\\'on\\')"></div></div></div><div class="settings-group"><div class="settings-row"><span>Version</span><span style="color:var(--muted)">1.0.0</span></div><div class="settings-row"><span>Status</span><span style="color:'+(isOnline?'var(--success)':'var(--danger)')+'">'+(isOnline?'Online':'Offline')+'</span></div></div>'}

// ── Login ────────────────────────────────────────────────
function showLogin(){document.getElementById('sidebar-nav').innerHTML='';document.getElementById('main-content').innerHTML='<div class="login-container"><div class="login-card"><div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#8b5cf6,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px">FANZON</div><div style="font-size:12px;color:var(--muted);margin-bottom:24px">Admin Control Panel</div><input class="login-input" id="le" type="email" placeholder="Admin Email"><input class="login-input" id="lp" type="password" placeholder="Password"><div id="lerr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div><button class="login-btn" id="lbtn" onclick="doLogin()">Sign In</button><div style="margin-top:16px;font-size:11px;color:var(--muted)">Works offline with saved session</div></div></div>'}
async function doLogin(){const b=document.getElementById('lbtn'),e=document.getElementById('lerr');b.disabled=true;b.textContent='Signing in...';const r=await login(document.getElementById('le').value,document.getElementById('lp').value);if(!r.ok){e.textContent=r.msg;b.disabled=false;b.textContent='Sign In'}}

// ── Boot ─────────────────────────────────────────────────
async function boot(){renderNav();localData.sellers=await getLocal('sellers');localData.products=await getLocal('products');localData.orders=await getLocal('orders');pgDash();syncData();syncTimer=setInterval(syncData,30000)}
async function init(){await checkOnline();setInterval(checkOnline,10000);const s=localStorage.getItem('fz_admin');if(s){currentUser=JSON.parse(s);boot()}else showLogin()}
init();`;

const HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>FANZON Admin</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0f172a;--sidebar:#1e293b;--card:#1e293b;--text:#f1f5f9;--muted:#94a3b8;--primary:#8b5cf6;--primary-glow:#a78bfa;--success:#22c55e;--danger:#ef4444;--warning:#f59e0b;--border:#334155}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);overflow:hidden;height:100vh}
.titlebar{display:flex;align-items:center;justify-content:space-between;height:36px;background:#0b1120;-webkit-app-region:drag;padding:0 12px}
.titlebar-title{font-size:12px;font-weight:600;color:var(--muted)}
.titlebar-btns{display:flex;gap:4px;-webkit-app-region:no-drag}
.titlebar-btns button{width:14px;height:14px;border-radius:50%;border:none;cursor:pointer}
.btn-min{background:#f59e0b}.btn-max{background:#22c55e}.btn-close{background:#ef4444}
.app-layout{display:flex;height:calc(100vh - 36px)}
.sidebar{width:240px;background:var(--sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column}
.sidebar-header{padding:20px 16px;border-bottom:1px solid var(--border)}
.sidebar-logo{font-size:18px;font-weight:800;background:linear-gradient(135deg,var(--primary),var(--primary-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sidebar-sub{font-size:10px;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:1px}
.sidebar-nav{flex:1;padding:12px 8px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;color:var(--muted);font-size:13px;transition:.2s;margin-bottom:2px}
.nav-item:hover{background:rgba(139,92,246,.1);color:var(--text)}
.nav-item.active{background:rgba(139,92,246,.15);color:var(--primary-glow);font-weight:600}
.nav-section{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;padding:12px 12px 6px}
.status-bar{padding:12px 16px;border-top:1px solid var(--border)}
.status-indicator{display:flex;align-items:center;gap:6px;font-size:11px}
.status-dot{width:8px;height:8px;border-radius:50%}
.status-dot.online{background:var(--success);box-shadow:0 0 8px var(--success)}
.status-dot.offline{background:var(--danger);box-shadow:0 0 8px var(--danger)}
.main{flex:1;overflow-y:auto;padding:24px}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.page-title{font-size:22px;font-weight:700}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;position:relative;overflow:hidden}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.stat-card.purple::before{background:linear-gradient(90deg,#8b5cf6,#a78bfa)}
.stat-card.green::before{background:linear-gradient(90deg,#22c55e,#4ade80)}
.stat-card.blue::before{background:linear-gradient(90deg,#3b82f6,#60a5fa)}
.stat-card.amber::before{background:linear-gradient(90deg,#f59e0b,#fbbf24)}
.stat-label{font-size:12px;color:var(--muted);margin-bottom:6px}
.stat-value{font-size:28px;font-weight:800}
.data-table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;border:1px solid var(--border)}
.data-table th{text-align:left;padding:12px 16px;font-size:11px;text-transform:uppercase;color:var(--muted);background:rgba(0,0,0,.2)}
.data-table td{padding:12px 16px;font-size:13px;border-top:1px solid var(--border)}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.badge-success{background:rgba(34,197,94,.15);color:#4ade80}
.badge-warning{background:rgba(245,158,11,.15);color:#fbbf24}
.badge-danger{background:rgba(239,68,68,.15);color:#f87171}
.badge-info{background:rgba(59,130,246,.15);color:#60a5fa}
.sync-panel{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:24px}
.sync-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sync-btn{background:linear-gradient(135deg,var(--primary),var(--primary-glow));color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600}
.login-container{max-width:400px;margin:80px auto;text-align:center}
.login-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:40px 32px}
.login-input{width:100%;padding:12px 16px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;margin-bottom:12px;outline:none}
.login-input:focus{border-color:var(--primary)}
.login-btn{width:100%;padding:12px;background:linear-gradient(135deg,var(--primary),var(--primary-glow));color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-top:8px}
.settings-group{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.settings-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0}
.settings-row+.settings-row{border-top:1px solid var(--border)}
.toggle{width:44px;height:24px;background:var(--border);border-radius:12px;position:relative;cursor:pointer;transition:.3s}
.toggle.on{background:var(--primary)}
.toggle::after{content:'';width:18px;height:18px;background:white;border-radius:50%;position:absolute;top:3px;left:3px;transition:.3s}
.toggle.on::after{left:23px}
</style></head><body>
<div class="titlebar"><span class="titlebar-title">FANZON Admin Panel v1.0</span><div class="titlebar-btns"><button class="btn-min" onclick="window.electronAPI?.minimize()"></button><button class="btn-max" onclick="window.electronAPI?.maximize()"></button><button class="btn-close" onclick="window.electronAPI?.close()"></button></div></div>
<div class="app-layout"><div class="sidebar"><div class="sidebar-header"><div class="sidebar-logo">FANZON</div><div class="sidebar-sub">Admin Control Panel</div></div><div class="sidebar-nav" id="sidebar-nav"></div><div class="status-bar"><div class="status-indicator"><div class="status-dot" id="status-dot"></div><span id="status-text">Checking...</span></div></div></div><div class="main" id="main-content"></div></div>
<script src="app.js"></script></body></html>`;

const FOLDER = `fanzon-admin-desktop/
├── package.json
├── electron/
│   ├── main.cjs
│   └── preload.cjs
├── renderer/
│   ├── index.html
│   └── app.js
└── assets/
    └── icon.png`;

const FILES: { name: string; code: string }[] = [
  { name: "package.json", code: PKG },
  { name: "electron/main.cjs", code: MAIN },
  { name: "electron/preload.cjs", code: PRELOAD },
  { name: "renderer/index.html", code: HTML },
  { name: "renderer/app.js", code: APP_JS },
];

const AdminDesktopAppPage = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-desktop-live"],
    queryFn: async () => {
      const [s, p, o] = await Promise.all([
        supabase.from("seller_profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("orders").select("total_amount_pkr", { count: "exact" }),
      ]);
      return {
        sellers: s.count || 0,
        products: p.count || 0,
        orders: o.count || 0,
        revenue: o.data?.reduce((a, x) => a + Number(x.total_amount_pkr || 0), 0) || 0,
      };
    },
    refetchInterval: 15000,
  });

  const copy = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    setCopied(name);
    toast.success(`${name} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const CBtn = ({ code, name }: { code: string; name: string }) => (
    <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 px-2 text-xs" onClick={() => copy(code, name)}>
      {copied === name ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
      {copied === name ? "Copied" : "Copy"}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 text-white/80 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/15 rounded-xl"><Monitor className="w-8 h-8" /></div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Admin Desktop Software
              <Badge className="bg-white/20 text-white border-0 text-xs">Offline + Online</Badge>
            </h1>
            <p className="text-white/70 text-sm">Complete .exe with IndexedDB offline + Supabase real-time sync</p>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Sellers", v: stats?.sellers, icon: <Users className="w-5 h-5" />, c: "text-violet-500" },
          { l: "Products", v: stats?.products, icon: <Package className="w-5 h-5" />, c: "text-green-500" },
          { l: "Orders", v: stats?.orders, icon: <ShoppingCart className="w-5 h-5" />, c: "text-blue-500" },
          { l: "Revenue", v: stats ? `Rs.${stats.revenue.toLocaleString()}` : null, icon: <DollarSign className="w-5 h-5" />, c: "text-amber-500" },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={s.c}>{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.l}</p>
                {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : <p className="text-lg font-bold">{s.v}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="files">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files"><FileCode className="w-4 h-4 mr-1.5" />Complete Files</TabsTrigger>
          <TabsTrigger value="setup"><Terminal className="w-4 h-4 mr-1.5" />Setup Guide</TabsTrigger>
          <TabsTrigger value="features"><Zap className="w-4 h-4 mr-1.5" />Features</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><FolderTree className="w-4 h-4 text-primary" />Folder Structure</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <CBtn code={FOLDER} name="folder" />
              <pre className="bg-muted/50 p-4 rounded-lg text-xs font-mono">{FOLDER}</pre>
            </CardContent>
          </Card>
          {FILES.map((f) => (
            <Card key={f.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm"><code className="text-primary">{f.name}</code></CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CBtn code={f.code} name={f.name} />
                <pre className="bg-muted/50 p-4 rounded-lg text-[11px] font-mono overflow-x-auto max-h-[400px] overflow-y-auto leading-relaxed">{f.code}</pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="setup" className="space-y-4 mt-4">
          {[
            { s: 1, t: "Create Folder", c: "mkdir fanzon-admin-desktop\ncd fanzon-admin-desktop\nmkdir electron renderer assets" },
            { s: 2, t: "Create All Files", c: "Copy all 5 files from 'Complete Files' tab\ninto their respective folders." },
            { s: 3, t: "Add Icon", c: "Place 256x256 PNG icon at assets/icon.png" },
            { s: 4, t: "Install Dependencies", c: "npm install" },
            { s: 5, t: "Run App", c: "npm start" },
            { s: 6, t: "Build .exe", c: "npm run build\n\n→ Output: release/FANZON Admin Panel Setup.exe" },
          ].map((x) => (
            <Card key={x.s}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">{x.s}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-2">{x.t}</h3>
                  <div className="relative">
                    <CBtn code={x.c} name={`s${x.s}`} />
                    <pre className="bg-muted/50 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">{x.c}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-amber-600 mb-2">⚠️ Requirements</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Node.js v18+</strong> — nodejs.org</li>
                <li>• <strong>Windows 10/11</strong> for .exe</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: <WifiOff className="w-5 h-5" />, t: "Offline Mode", d: "IndexedDB stores all data locally. Works without internet.", c: "text-red-500" },
              { icon: <Wifi className="w-5 h-5" />, t: "Online Sync", d: "Auto-syncs every 30 seconds when connected.", c: "text-green-500" },
              { icon: <RefreshCw className="w-5 h-5" />, t: "Real-time Data", d: "Live sellers, products, orders & revenue.", c: "text-blue-500" },
              { icon: <Shield className="w-5 h-5" />, t: "Secure Login", d: "Supabase auth. Offline login with saved session.", c: "text-violet-500" },
              { icon: <HardDrive className="w-5 h-5" />, t: "Local Storage", d: "IndexedDB stores complete backup offline.", c: "text-amber-500" },
              { icon: <Lock className="w-5 h-5" />, t: "Security", d: "Context isolation + preload bridge.", c: "text-rose-500" },
              { icon: <LayoutDashboard className="w-5 h-5" />, t: "Full Panel", d: "Dashboard, Sellers, Products, Orders, Sync, Settings.", c: "text-teal-500" },
              { icon: <Settings className="w-5 h-5" />, t: "System Tray", d: "Runs in background with custom titlebar.", c: "text-gray-500" },
            ].map((f) => (
              <Card key={f.t}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={f.c}>{f.icon}</div>
                  <div><h3 className="font-semibold text-sm">{f.t}</h3><p className="text-xs text-muted-foreground mt-0.5">{f.d}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDesktopAppPage;
