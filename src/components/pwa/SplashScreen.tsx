import { useState, useEffect } from "react";

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1200);
    const remove = setTimeout(() => setVisible(false), 1600);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary transition-opacity duration-400 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="animate-[bounceIn_0.6s_ease-out]">
        <img
          src="/fanzoon-icon.png"
          alt="FANZOON"
          className="w-20 h-20 rounded-2xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
        />
      </div>
      <h1 className="text-primary-foreground text-2xl font-bold mt-4 tracking-wide">
        FANZOON
      </h1>
      <p className="text-primary-foreground/60 text-xs mt-1">Shop Smarter</p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-foreground/40"
            style={{
              animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
