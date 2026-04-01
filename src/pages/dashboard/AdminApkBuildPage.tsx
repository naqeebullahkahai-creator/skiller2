import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Smartphone, Monitor, AlertTriangle, ChevronDown, ChevronUp, ExternalLink, ArrowRight, Info, Terminal, FolderOpen, FileCode, Play, Rocket } from "lucide-react";
import { toast } from "sonner";

const CopyBlock = ({ label, code }: { label?: string; code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-2">
      {label && <p className="text-xs font-semibold text-foreground mb-1">📋 {label}</p>}
      <div className="relative bg-muted rounded-lg p-3 pr-12 overflow-x-auto border border-border">
        <pre className="text-xs text-foreground whitespace-pre-wrap break-all font-mono">{code}</pre>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-7 w-7"
          onClick={handleCopy}
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </Button>
      </div>
    </div>
  );
};

const InfoBox = ({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "warning" | "success" | "tip" }) => {
  const styles = {
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    tip: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",
  };
  const icons = {
    info: <Info size={14} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    success: <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    tip: <Rocket size={14} className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />,
  };
  return (
    <div className={`p-3 rounded-lg flex gap-2 border ${styles[variant]} my-2`}>
      {icons[variant]}
      <div className="text-xs text-foreground">{children}</div>
    </div>
  );
};

const StepSection = ({ step, title, icon, badge, children, defaultOpen = false }: { step: number; title: string; icon: React.ReactNode; badge?: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="py-3 px-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {step}
              </div>
              <div className="flex items-center gap-2">
                {icon}
                <CardTitle className="text-sm">{title}</CardTitle>
              </div>
              {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
            </div>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </CardHeader>
      </button>
      {open && <CardContent className="pt-4 px-4 pb-4 space-y-3">{children}</CardContent>}
    </Card>
  );
};

const AdminApkBuildPage = () => {
  const projectId = "55bb4009-1fbf-4c5e-941b-15943679bf51";
  const previewUrl = `https://${projectId}.lovableproject.com?forceHideBadge=true`;
  const appId = "app.lovable.55bb40091fbf4c5e941b15943679bf51";
  const appName = "FANZON";

  const capacitorConfig = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${appId}',
  appName: '${appName}',
  webDir: 'dist',
  server: {
    url: '${previewUrl}',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#F97316',
    },
  },
};

export default config;`;

  const productionConfig = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${appId}',
  appName: '${appName}',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;`;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Smartphone size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">📱 FANZON APK Builder - Complete Roadmap</h1>
          <p className="text-xs text-muted-foreground">Starting se APK banane tak ka poora step-by-step guide</p>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm text-foreground mb-2">🎯 Ye Guide Kiya Karega?</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0 mt-0.5" /> FANZON website ko real Android/iOS app mein convert karega</li>
            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0 mt-0.5" /> Aapko .APK file milegi jo kisi bhi phone mein install ho sakti hai</li>
            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0 mt-0.5" /> Google Play Store / Apple App Store par publish kar saktay ho</li>
            <li className="flex gap-2"><ArrowRight size={12} className="text-primary shrink-0 mt-0.5" /> Sirf ek baar setup karna hai, phir updates bahut easy hain</li>
          </ul>
          <InfoBox variant="tip">
            <strong>Time Required:</strong> Pehli baar ~1-2 ghante, baad mein sirf 5 minute per update.
          </InfoBox>
        </CardContent>
      </Card>

      {/* STEP 0: Requirements */}
      <StepSection step={0} title="Requirements - Ye Pehle Install Karo" icon={<Download size={16} className="text-primary" />} badge="Zaroori" defaultOpen={true}>
        <p className="text-sm font-medium text-foreground">In software ko apne computer mein pehle download aur install karo:</p>
        
        <div className="space-y-3 mt-2">
          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">1️⃣</span>
              <strong className="text-sm">Node.js (Version 18 ya upar)</strong>
            </div>
            <p className="text-xs text-muted-foreground ml-7 mb-2">Ye JavaScript ka runtime hai. Commands run karne ke liye zaroori hai.</p>
            <div className="ml-7">
              <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
                Download Node.js <ExternalLink size={10} />
              </a>
            </div>
            <InfoBox variant="info">
              <strong>Install ke baad check karo:</strong> Terminal/CMD kholein aur type karein: <code className="bg-muted px-1 rounded">node --version</code> — Agar version dikhe to sahi install hua.
            </InfoBox>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">2️⃣</span>
              <strong className="text-sm">Git</strong>
            </div>
            <p className="text-xs text-muted-foreground ml-7 mb-2">Code ko download karne ke liye zaroori hai.</p>
            <div className="ml-7">
              <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
                Download Git <ExternalLink size={10} />
              </a>
            </div>
            <InfoBox variant="info">
              <strong>Check:</strong> <code className="bg-muted px-1 rounded">git --version</code>
            </InfoBox>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">3️⃣</span>
              <strong className="text-sm">Android Studio (Android APK ke liye)</strong>
            </div>
            <p className="text-xs text-muted-foreground ml-7 mb-2">Android app build karne ka official tool. Emulator bhi milta hai testing ke liye.</p>
            <div className="ml-7">
              <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
                Download Android Studio <ExternalLink size={10} />
              </a>
            </div>
            <InfoBox variant="warning">
              <strong>Android Studio install karne ke baad:</strong><br/>
              1. Open karein → "More Actions" → "SDK Manager" click karein<br/>
              2. "SDK Platforms" mein "Android 13 (API 33)" ya latest tick karein<br/>
              3. "SDK Tools" mein "Android SDK Build-Tools" tick karein<br/>
              4. "Apply" click karein aur download hone dein
            </InfoBox>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">4️⃣</span>
              <strong className="text-sm">Java JDK 17+</strong>
            </div>
            <p className="text-xs text-muted-foreground ml-7 mb-2">Android build system (Gradle) ke liye zaroori hai.</p>
            <div className="ml-7">
              <a href="https://adoptium.net/" target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
                Download Java JDK <ExternalLink size={10} />
              </a>
            </div>
            <InfoBox variant="info">
              <strong>Check:</strong> <code className="bg-muted px-1 rounded">java --version</code>
            </InfoBox>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">5️⃣</span>
              <strong className="text-sm">Xcode (Sirf Mac ke liye - iOS app)</strong>
            </div>
            <p className="text-xs text-muted-foreground ml-7 mb-2">Sirf agar iPhone/iPad app banana hai to zaroorat hai. Windows par nahi chalega.</p>
            <div className="ml-7">
              <a href="https://developer.apple.com/xcode/" target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
                Download Xcode <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </StepSection>

      {/* STEP 1: Terminal Kholein */}
      <StepSection step={1} title="Terminal / CMD Kholein" icon={<Terminal size={16} className="text-primary" />} badge="Basics">
        <p className="text-sm text-foreground font-medium">Terminal woh jagah hai jahan commands paste karke run karte hain.</p>
        
        <div className="space-y-2 mt-2">
          <div className="p-3 bg-card rounded-lg border border-border">
            <strong className="text-xs text-foreground">Windows par:</strong>
            <p className="text-xs text-muted-foreground mt-1">Start menu mein "cmd" ya "PowerShell" search karein → Open karein</p>
            <p className="text-xs text-muted-foreground">Ya: <code className="bg-muted px-1 rounded">Win + R</code> press karein → <code className="bg-muted px-1 rounded">cmd</code> type karein → Enter</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <strong className="text-xs text-foreground">Mac par:</strong>
            <p className="text-xs text-muted-foreground mt-1">Spotlight (<code className="bg-muted px-1 rounded">Cmd + Space</code>) → "Terminal" type karein → Open karein</p>
          </div>
        </div>

        <InfoBox variant="tip">
          Har command ko terminal mein paste karein aur Enter press karein. Ek command complete hone ka wait karein phir doosri run karein.
        </InfoBox>
      </StepSection>

      {/* STEP 2: GitHub Export */}
      <StepSection step={2} title="Lovable se Code Download Karo" icon={<FolderOpen size={16} className="text-primary" />} badge="Required">
        <p className="text-sm text-foreground">Pehle FANZON ka code apne computer par laana hai.</p>
        
        <div className="p-3 bg-card rounded-lg border border-border space-y-2">
          <p className="text-xs font-semibold text-foreground">A) Lovable se GitHub par Export:</p>
          <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 ml-2">
            <li>Lovable editor mein ooper right corner mein <strong>GitHub icon</strong> click karein</li>
            <li>"Export to GitHub" select karein</li>
            <li>Apna GitHub account connect karein (agar pehle se nahi hai)</li>
            <li>Repository name dein aur export karein</li>
          </ol>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border space-y-2 mt-2">
          <p className="text-xs font-semibold text-foreground">B) Terminal mein Code Download:</p>
          <p className="text-xs text-muted-foreground">Terminal kholein aur ye commands ek ek karke paste karein:</p>
          
          <CopyBlock label="1. Desktop par jaayein (ya jahan save karna hai)" code="cd Desktop" />
          <CopyBlock label="2. Code download karein (YOUR_USERNAME aur YOUR_REPO apna daalein)" code="git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git" />
          <CopyBlock label="3. Project folder mein jaayein" code="cd YOUR_REPO" />
        </div>

        <InfoBox variant="info">
          <strong>YOUR_USERNAME</strong> = Aapka GitHub username<br/>
          <strong>YOUR_REPO</strong> = Jo naam diya tha export mein
        </InfoBox>
      </StepSection>

      {/* STEP 3: Dependencies Install */}
      <StepSection step={3} title="Zaruri Packages Install Karo" icon={<Download size={16} className="text-primary" />} badge="Required">
        <p className="text-sm text-foreground">Ab terminal mein ye commands paste karein (aap project folder mein hone chahiye):</p>
        
        <CopyBlock label="1. Pehle project ki sab cheezein install karo (2-3 min lagega)" code="npm install" />
        
        <InfoBox variant="info">Ye command bahut saari files download karega. Internet speed par depend karta hai. Wait karein jab tak complete na ho.</InfoBox>
        
        <CopyBlock label="2. Capacitor install karo (ye website ko app mein convert karta hai)" code="npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios" />
        
        <CopyBlock label="3. Optional: Extra features ke liye (splash screen, status bar etc)" code="npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/haptics" />
      </StepSection>

      {/* STEP 4: Capacitor Initialize */}
      <StepSection step={4} title="Capacitor Setup Karo" icon={<FileCode size={16} className="text-primary" />} badge="Required">
        <p className="text-sm text-foreground">Ab Capacitor ko project mein add karo:</p>
        
        <CopyBlock label="Terminal mein ye command run karo" code="npx cap init" />
        
        <div className="p-3 bg-card rounded-lg border border-border mt-2">
          <p className="text-xs font-semibold text-foreground">Jab ye puche to ye jawab do:</p>
          <div className="mt-2 space-y-2 ml-2">
            <div className="flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              <span className="text-xs text-foreground"><strong>App name:</strong> <code className="bg-muted px-1 rounded">{appName}</code></span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              <span className="text-xs text-foreground"><strong>App ID:</strong> <code className="bg-muted px-1 rounded">{appId}</code></span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              <span className="text-xs text-foreground"><strong>Web asset directory:</strong> <code className="bg-muted px-1 rounded">dist</code></span>
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground mt-3 font-medium">⚠️ Ab ye IMPORTANT step hai - Config file update karo:</p>
        <p className="text-xs text-muted-foreground">Project folder mein <code className="bg-muted px-1 rounded">capacitor.config.ts</code> file hogi. Us file ka sara content delete karo aur ye paste karo:</p>
        
        <CopyBlock label="capacitor.config.ts — Ye poora copy karke paste karo file mein" code={capacitorConfig} />
        
        <InfoBox variant="warning">
          <strong>File kahan hai?</strong> Project ke main folder mein — jaise <code className="bg-muted px-1 rounded">Desktop/YOUR_REPO/capacitor.config.ts</code><br/>
          Koi bhi text editor mein khol saktay ho (Notepad, VS Code etc)
        </InfoBox>
      </StepSection>

      {/* STEP 5: Android Add */}
      <StepSection step={5} title="Android Platform Add Karo" icon={<Smartphone size={16} className="text-primary" />} badge="Android">
        <p className="text-sm text-foreground">Terminal mein ye commands run karo:</p>
        
        <CopyBlock label="1. Android platform add karo" code="npx cap add android" />
        <CopyBlock label="2. Android dependencies update karo" code="npx cap update android" />
        
        <InfoBox variant="success">
          Ye command project mein ek <code className="bg-muted px-1 rounded">android</code> folder banayega. Yahi folder Android Studio mein open hoga.
        </InfoBox>
      </StepSection>

      {/* STEP 6: Build & Sync */}
      <StepSection step={6} title="Project Build Aur Sync Karo" icon={<Play size={16} className="text-primary" />} badge="Required">
        <p className="text-sm text-foreground">Website ko app ke liye ready karo:</p>
        
        <CopyBlock label="1. Website build karo" code="npm run build" />
        <CopyBlock label="2. Build ko Android mein sync karo" code="npx cap sync" />
        
        <InfoBox variant="tip">
          <strong>Yaad rakhein:</strong> Jab bhi code mein koi change karo, ye dono commands phir se run karni hain:<br/>
          <code className="bg-muted px-1 rounded">npm run build</code> → <code className="bg-muted px-1 rounded">npx cap sync</code>
        </InfoBox>
      </StepSection>

      {/* STEP 7: Test */}
      <StepSection step={7} title="App Test Karo (Emulator ya Phone)" icon={<Play size={16} className="text-primary" />} badge="Testing">
        <p className="text-sm text-foreground font-medium">2 Tareeqay hain app test karne ke:</p>
        
        <div className="p-3 bg-card rounded-lg border border-border mt-2">
          <p className="text-xs font-semibold text-foreground">Option A: Emulator par (Computer mein phone ka duplicate)</p>
          <CopyBlock label="Terminal mein run karo" code="npx cap run android" />
          <p className="text-xs text-muted-foreground mt-1">Ye Android Studio ka emulator khol dega aur app install kar dega.</p>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border mt-2">
          <p className="text-xs font-semibold text-foreground">Option B: Android Studio mein khol kar (zyada control)</p>
          <CopyBlock label="Android Studio mein project kholo" code="npx cap open android" />
          <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 mt-2 ml-2">
            <li>Android Studio khulega aur project load hoga (pehli baar slow hoga)</li>
            <li>Ooper mein green ▶️ (Play) button dikhega</li>
            <li>Uske saath device select karein (emulator ya USB phone)</li>
            <li>Play button click karein — App install ho jayega!</li>
          </ol>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border mt-2">
          <p className="text-xs font-semibold text-foreground">Option C: Real phone par test (USB se)</p>
          <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 ml-2">
            <li>Phone mein <strong>Settings → About Phone → Build Number</strong> par 7 baar tap karein</li>
            <li><strong>Developer Options</strong> enable ho jayega</li>
            <li>Developer Options mein <strong>"USB Debugging"</strong> ON karein</li>
            <li>Phone ko USB se computer se connect karein</li>
            <li>Phone par "Allow USB Debugging" par <strong>OK</strong> karein</li>
            <li>Android Studio mein apka phone dikhega device list mein</li>
          </ol>
        </div>

        <InfoBox variant="tip">
          <strong>Hot Reload:</strong> Config mein server URL set hai, to jab Lovable mein changes karo, phone par refresh karo to changes dikh jayein!
        </InfoBox>
      </StepSection>

      {/* STEP 8: Final APK */}
      <StepSection step={8} title="Final APK File Banao (Release)" icon={<Rocket size={16} className="text-primary" />} badge="🎯 Final APK">
        <p className="text-sm text-foreground font-medium text-destructive">⚠️ IMPORTANT: Production APK ke liye pehle config change karo!</p>
        
        <p className="text-xs text-foreground mt-2">1. <code className="bg-muted px-1 rounded">capacitor.config.ts</code> file kholein aur ye paste karo (server URL hata diya hai):</p>
        <CopyBlock label="Production Config — Server URL Removed" code={productionConfig} />

        <p className="text-xs text-foreground mt-2">2. Terminal mein ye run karo:</p>
        <CopyBlock code={`npm run build\nnpx cap sync`} />

        <p className="text-xs text-foreground mt-2">3. Android Studio mein kholein:</p>
        <CopyBlock code="npx cap open android" />

        <div className="p-3 bg-card rounded-lg border border-border mt-2">
          <p className="text-xs font-semibold text-foreground">4. Android Studio mein ye karein:</p>
          <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-2 mt-2 ml-2">
            <li>Menu mein <strong>Build</strong> click karein</li>
            <li><strong>"Generate Signed Bundle / APK"</strong> click karein</li>
            <li>Popup aayega — <strong>"APK"</strong> select karein → Next</li>
            <li><strong>"Create new..."</strong> click karein keystore banane ke liye:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                <li>Key store path: Koi bhi jagah save karo (.jks extension)</li>
                <li>Password: Strong password daalein (YAAD RAKHEIN!)</li>
                <li>Alias: <code className="bg-muted px-1 rounded">fanzon</code></li>
                <li>Validity: <code className="bg-muted px-1 rounded">25</code> years</li>
                <li>Name / Organization: Apni company ka naam</li>
              </ul>
            </li>
            <li><strong>"release"</strong> build type select karein → Finish</li>
            <li>Wait karein jab tak build complete ho</li>
          </ol>
        </div>

        <p className="text-xs text-foreground mt-3">5. APK file yahan milegi:</p>
        <CopyBlock label="APK File Location" code="android/app/build/outputs/apk/release/app-release.apk" />

        <InfoBox variant="success">
          <strong>🎉 Done!</strong> Ye <code className="bg-muted px-1 rounded">app-release.apk</code> file kisi bhi Android phone mein install ho sakti hai! WhatsApp ya email se bheej saktay ho.
        </InfoBox>

        <InfoBox variant="warning">
          <strong>Keystore file (.jks) bahut important hai!</strong> Agar kho gayi to app ka update nahi de saktay. Safe jagah save karein aur password yaad rakhein.
        </InfoBox>
      </StepSection>

      {/* STEP 9: Play Store */}
      <StepSection step={9} title="Google Play Store Par Publish Karo" icon={<Rocket size={16} className="text-primary" />} badge="Optional">
        <p className="text-sm text-foreground">Play Store par app daalne ke liye:</p>
        
        <div className="p-3 bg-card rounded-lg border border-border space-y-2">
          <p className="text-xs font-semibold text-foreground">Google Play Store Steps:</p>
          <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1.5 ml-2">
            <li><a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Play Console</a> par account banao ($25 one-time fee)</li>
            <li>"Create app" click karo</li>
            <li>Play Store ke liye APK nahi AAB (Android App Bundle) chahiye:</li>
          </ol>
          <CopyBlock label="AAB file generate karo (Play Store ke liye)" code="cd android && ./gradlew bundleRelease" />
          <p className="text-xs text-muted-foreground">AAB file yahan milegi:</p>
          <CopyBlock code="android/app/build/outputs/bundle/release/app-release.aab" />
          <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 ml-2" start={4}>
            <li>Play Console mein AAB upload karo</li>
            <li>Screenshots, description, icon etc add karo</li>
            <li>Review ke liye submit karo (2-7 din lagta hai approval)</li>
          </ol>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border space-y-2 mt-2">
          <p className="text-xs font-semibold text-foreground">Apple App Store Steps (Sirf Mac):</p>
          <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 ml-2">
            <li>Apple Developer Program join karo ($99/year)</li>
            <li>Xcode mein <code className="bg-muted px-1 rounded">npx cap open ios</code> run karo</li>
            <li>Product → Archive karein</li>
            <li>App Store Connect par upload karein</li>
          </ol>
        </div>
      </StepSection>

      {/* Quick Reference */}
      <StepSection step={10} title="Quick Commands Cheat Sheet" icon={<Terminal size={16} className="text-primary" />} badge="Reference">
        <p className="text-sm text-foreground mb-2">Sab important commands ek jagah:</p>
        {[
          { label: "Dependencies install", cmd: "npm install" },
          { label: "Capacitor install", cmd: "npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios" },
          { label: "Capacitor initialize", cmd: "npx cap init" },
          { label: "Android add", cmd: "npx cap add android" },
          { label: "iOS add (Mac only)", cmd: "npx cap add ios" },
          { label: "Build project", cmd: "npm run build" },
          { label: "Sync to native", cmd: "npx cap sync" },
          { label: "Test on Android", cmd: "npx cap run android" },
          { label: "Open in Android Studio", cmd: "npx cap open android" },
          { label: "AAB for Play Store", cmd: "cd android && ./gradlew bundleRelease" },
        ].map((item, i) => (
          <CopyBlock key={i} label={item.label} code={item.cmd} />
        ))}
      </StepSection>

      {/* Troubleshooting */}
      <StepSection step={11} title="Common Problems & Solutions" icon={<AlertTriangle size={16} className="text-amber-600" />} badge="Help">
        <div className="space-y-3">
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs font-semibold text-destructive">❌ "npx: command not found"</p>
            <p className="text-xs text-muted-foreground mt-1">→ Node.js install nahi hai. Step 0 mein Node.js install karo.</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs font-semibold text-destructive">❌ "JAVA_HOME is not set"</p>
            <p className="text-xs text-muted-foreground mt-1">→ Java JDK install nahi hai ya path set nahi hai. Step 0 mein JDK install karo.</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs font-semibold text-destructive">❌ "SDK not found"</p>
            <p className="text-xs text-muted-foreground mt-1">→ Android Studio mein SDK Manager kholein aur SDK 33+ install karein.</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs font-semibold text-destructive">❌ Build fail ho raha hai</p>
            <p className="text-xs text-muted-foreground mt-1">→ <code className="bg-muted px-1 rounded">npx cap sync</code> run karein phir dubara try karein.</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs font-semibold text-destructive">❌ App white screen dikha raha hai</p>
            <p className="text-xs text-muted-foreground mt-1">→ capacitor.config.ts mein server URL check karein. <code className="bg-muted px-1 rounded">npm run build</code> aur <code className="bg-muted px-1 rounded">npx cap sync</code> phir se run karein.</p>
          </div>
        </div>
      </StepSection>
    </div>
  );
};

export default AdminApkBuildPage;
