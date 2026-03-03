import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const hasActiveScrollLockOverlay = () => {
  return Boolean(
    document.querySelector('[data-radix-portal] [data-state="open"]') ||
      document.querySelector('[role="dialog"][data-state="open"]') ||
      document.querySelector('[data-vaul-drawer][data-state="open"]')
  );
};

const ensurePageScrollEnabled = (force = false) => {
  if (!force && hasActiveScrollLockOverlay()) return;

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
    ensurePageScrollEnabled(true);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const rafId = window.requestAnimationFrame(() => ensurePageScrollEnabled(true));
    const timeoutId = window.setTimeout(() => ensurePageScrollEnabled(true), 300);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname, search, hash]);

  useEffect(() => {
    const handlePageShow = () => ensurePageScrollEnabled(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") ensurePageScrollEnabled(true);
    };
    const handleViewportChange = () => ensurePageScrollEnabled(true);

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);

    const observer = new MutationObserver(() => ensurePageScrollEnabled());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
      childList: true,
      subtree: true,
    });

    const intervalId = window.setInterval(() => ensurePageScrollEnabled(), 1200);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
      observer.disconnect();
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
};

export default ScrollToTop;
