import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ensurePageScrollEnabled = () => {
  const html = document.documentElement;
  const body = document.body;

  html.style.overflowX = "hidden";
  html.style.overflowY = "auto";
  body.style.overflowX = "hidden";
  body.style.overflowY = "auto";
  body.style.touchAction = "pan-y";

  if (body.style.position === "fixed") {
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";
  }
};

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    ensurePageScrollEnabled();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const rafId = window.requestAnimationFrame(ensurePageScrollEnabled);
    const timeoutId = window.setTimeout(ensurePageScrollEnabled, 300);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname, search, hash]);

  useEffect(() => {
    const handlePageShow = () => ensurePageScrollEnabled();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") ensurePageScrollEnabled();
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
};

export default ScrollToTop;
