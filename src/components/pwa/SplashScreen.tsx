import { useState, useEffect } from "react";

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => setLogoReady(true), 100);
    const timer = setTimeout(() => setFadeOut(true), 1500);
    const remove = setTimeout(() => setVisible(false), 1900);
    return () => { clearTimeout(logoTimer); clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className={`transition-all duration-700 ease-out ${logoReady ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-4"}`}>
        <img
          src="/fanzon-icon.png"
          alt="FANZON"
          className="w-20 h-20 rounded-2xl shadow-2xl object-contain"
        />
      </div>

      <div className={`mt-5 transition-all duration-700 delay-200 ${logoReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <img src="/fanzon-logo.png" alt="FANZON" className="h-8 object-contain" />
      </div>
      <p className={`text-primary-foreground/50 text-xs mt-1.5 tracking-wider transition-all duration-700 delay-300 ${logoReady ? "opacity-100" : "opacity-0"}`}>
        Shop Smarter
      </p>

      <div className={`mt-10 w-16 h-0.5 bg-primary-foreground/20 rounded-full overflow-hidden transition-all duration-500 delay-500 ${logoReady ? "opacity-100" : "opacity-0"}`}>
        <div className="h-full bg-primary-foreground/60 rounded-full animate-[loading_1.2s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 80%; margin-left: 10%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
