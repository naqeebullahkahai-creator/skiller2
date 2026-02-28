import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const TopProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(30);
    const t1 = setTimeout(() => setProgress(70), 100);
    const t2 = setTimeout(() => setProgress(100), 250);
    const t3 = setTimeout(() => setVisible(false), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px]">
      <div
        className="h-full bg-accent transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TopProgressBar;
