import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Smartphone, Monitor, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
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
      {label && <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>}
      <div className="relative bg-muted rounded-lg p-3 pr-12 overflow-x-auto">
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

const CollapsibleSection = ({ title, badge, children, defaultOpen = false }: { title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">{title}</CardTitle>
              {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
            </div>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </CardHeader>
      </button>
      {open && <CardContent className="pt-0 px-4 pb-4">{children}</CardContent>}
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

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Smartphone size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">APK / Native App Builder</h1>
          <p className="text-xs text-muted-foreground">FANZON ko Android/iOS app mein convert karne ka complete guide</p>
        </div>
      </div>

      {/* Requirements */}
      <CollapsibleSection title="📋 Step 0: Requirements" badge="Zaroori" defaultOpen={true}>
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Ye cheezein pehle se install honi chahiye:</p>
          <div className="space-y-1.5">
            {[
              { name: "Node.js (v18+)", link: "https://nodejs.org/" },
              { name: "npm ya yarn", link: "" },
              { name: "Git", link: "https://git-scm.com/" },
              { name: "Android Studio (Android ke liye)", link: "https://developer.android.com/studio" },
              { name: "Xcode (iOS ke liye - sirf Mac)", link: "https://developer.apple.com/xcode/" },
              { name: "Java JDK 17+", link: "https://adoptium.net/" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span className="text-foreground">{item.name}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-destructive/10 rounded-lg flex gap-2">
            <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">Android Studio mein SDK 33+ aur emulator setup hona chahiye.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Step 1: Export to GitHub */}
      <CollapsibleSection title="📥 Step 1: GitHub Export" badge="Required">
        <div className="space-y-2 text-sm">
          <p className="text-foreground">Lovable se project GitHub par export karein:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Lovable editor mein <strong>"Export to GitHub"</strong> button click karein</li>
            <li>Apna GitHub repository select karein ya naya banaein</li>
            <li>Export complete hone ka wait karein</li>
          </ol>
          <p className="text-foreground mt-2">Phir local machine par clone karein:</p>
          <CopyBlock label="Git Clone" code="git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git" />
          <CopyBlock label="Directory mein jaayein" code="cd YOUR_REPO" />
        </div>
      </CollapsibleSection>

      {/* Step 2: Install Dependencies */}
      <CollapsibleSection title="📦 Step 2: Dependencies Install" badge="Required">
        <div className="space-y-2 text-sm">
          <p className="text-foreground">Pehle project ki dependencies install karein:</p>
          <CopyBlock label="NPM Install" code="npm install" />
          <p className="text-foreground mt-2">Phir Capacitor packages install karein:</p>
          <CopyBlock
            label="Capacitor Core + CLI + Platforms"
            code="npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android"
          />
          <p className="text-foreground mt-2">Optional useful plugins:</p>
          <CopyBlock
            label="Capacitor Plugins (Optional)"
            code="npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/haptics"
          />
        </div>
      </CollapsibleSection>

      {/* Step 3: Initialize Capacitor */}
      <CollapsibleSection title="⚡ Step 3: Capacitor Initialize" badge="Required">
        <div className="space-y-2 text-sm">
          <p className="text-foreground">Capacitor ko initialize karein:</p>
          <CopyBlock label="Init Command" code="npx cap init" />
          <p className="text-muted-foreground">Jab puche to ye values dein:</p>
          <div className="space-y-1 ml-4">
            <p className="text-foreground">App Name: <code className="bg-muted px-1 rounded text-xs">{appName}</code></p>
            <p className="text-foreground">App ID: <code className="bg-muted px-1 rounded text-xs">{appId}</code></p>
          </div>
          <p className="text-foreground mt-3">Ya phir <code className="bg-muted px-1 rounded text-xs">capacitor.config.ts</code> file manually banaein:</p>
          <CopyBlock label="capacitor.config.ts (Complete File)" code={capacitorConfig} />
        </div>
      </CollapsibleSection>

      {/* Step 4: Add Android Platform */}
      <CollapsibleSection title="🤖 Step 4: Android Platform Add" badge="Android">
        <div className="space-y-2 text-sm">
          <CopyBlock label="Android Add" code="npx cap add android" />
          <CopyBlock label="Android Update" code="npx cap update android" />
        </div>
      </CollapsibleSection>

      {/* Step 5: Add iOS Platform */}
      <CollapsibleSection title="🍎 Step 5: iOS Platform Add" badge="iOS (Mac Only)">
        <div className="space-y-2 text-sm">
          <CopyBlock label="iOS Add" code="npx cap add ios" />
          <CopyBlock label="iOS Update" code="npx cap update ios" />
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex gap-2 mt-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">iOS sirf Mac par build hota hai Xcode ke zariye.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Step 6: Build & Sync */}
      <CollapsibleSection title="🔨 Step 6: Build & Sync" badge="Required">
        <div className="space-y-2 text-sm">
          <p className="text-foreground">Project build karein aur sync karein:</p>
          <CopyBlock label="Build Project" code="npm run build" />
          <CopyBlock label="Sync to Native" code="npx cap sync" />
          <div className="p-2 bg-primary/10 rounded-lg flex gap-2 mt-2">
            <Smartphone size={14} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">Har code change ke baad <code className="bg-muted px-1 rounded">npx cap sync</code> zaroor run karein.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Step 7: Run on Device */}
      <CollapsibleSection title="▶️ Step 7: Run / Test" badge="Testing">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Emulator ya physical device par run karein:</p>
          <CopyBlock label="Android Run" code="npx cap run android" />
          <CopyBlock label="iOS Run" code="npx cap run ios" />
          <p className="text-foreground mt-2">Ya Android Studio / Xcode mein open karein:</p>
          <CopyBlock label="Open in Android Studio" code="npx cap open android" />
          <CopyBlock label="Open in Xcode" code="npx cap open ios" />
          <div className="p-2 bg-primary/10 rounded-lg mt-2">
            <p className="text-xs text-foreground">💡 <strong>Hot Reload:</strong> capacitor.config.ts mein server URL set hai, to live changes dekhne ke liye sirf browser refresh karein.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Step 8: Generate APK */}
      <CollapsibleSection title="📱 Step 8: APK Generate (Release)" badge="Final APK">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Production APK banane ke liye:</p>
          
          <p className="text-foreground mt-2">1. Pehle <code className="bg-muted px-1 rounded text-xs">capacitor.config.ts</code> se server URL hataein:</p>
          <CopyBlock
            label="Production capacitor.config.ts"
            code={`import type { CapacitorConfig } from '@capacitor/cli';

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

export default config;`}
          />

          <p className="text-foreground mt-2">2. Build aur sync karein:</p>
          <CopyBlock code={`npm run build\nnpx cap sync`} />

          <p className="text-foreground mt-2">3. Android Studio mein open karein:</p>
          <CopyBlock code="npx cap open android" />

          <p className="text-foreground mt-2">4. Android Studio mein:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong>Build</strong> → <strong>Generate Signed Bundle / APK</strong></li>
            <li><strong>APK</strong> select karein</li>
            <li>Keystore banaein ya existing use karein</li>
            <li><strong>Release</strong> build type select karein</li>
            <li><strong>Finish</strong> click karein</li>
          </ol>

          <p className="text-foreground mt-2">5. APK yahan milega:</p>
          <CopyBlock code="android/app/build/outputs/apk/release/app-release.apk" />

          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex gap-2 mt-2">
            <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Ye APK kisi bhi Android phone mein install ho sakta hai!</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Step 9: Play Store */}
      <CollapsibleSection title="🏪 Step 9: Play Store / App Store Publish" badge="Optional">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Google Play Store:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li><a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Play Console</a> par account banaein ($25 one-time fee)</li>
            <li>New app create karein</li>
            <li>AAB (Android App Bundle) upload karein — APK ki jagah AAB preferred hai</li>
            <li>Store listing, screenshots, description fill karein</li>
            <li>Review ke liye submit karein</li>
          </ol>
          <CopyBlock label="AAB Generate (Play Store ke liye)" code="cd android && ./gradlew bundleRelease" />

          <p className="font-medium text-foreground mt-3">Apple App Store:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Apple Developer Program join karein ($99/year)</li>
            <li>Xcode mein archive banaein</li>
            <li>App Store Connect par upload karein</li>
            <li>Review submit karein</li>
          </ol>
        </div>
      </CollapsibleSection>

      {/* Quick Commands Reference */}
      <CollapsibleSection title="⚡ Quick Commands Reference" badge="Cheat Sheet" defaultOpen={false}>
        <div className="space-y-1">
          {[
            { label: "Install deps", cmd: "npm install" },
            { label: "Install Capacitor", cmd: "npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios" },
            { label: "Init Capacitor", cmd: "npx cap init" },
            { label: "Add Android", cmd: "npx cap add android" },
            { label: "Add iOS", cmd: "npx cap add ios" },
            { label: "Build", cmd: "npm run build" },
            { label: "Sync", cmd: "npx cap sync" },
            { label: "Run Android", cmd: "npx cap run android" },
            { label: "Run iOS", cmd: "npx cap run ios" },
            { label: "Open Android Studio", cmd: "npx cap open android" },
            { label: "Open Xcode", cmd: "npx cap open ios" },
            { label: "Generate AAB", cmd: "cd android && ./gradlew bundleRelease" },
          ].map((item, i) => (
            <CopyBlock key={i} label={item.label} code={item.cmd} />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default AdminApkBuildPage;
