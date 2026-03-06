import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

const APP_RUNTIME_RESET_VERSION = "2026-03-06-phase1";
const APP_RUNTIME_RESET_STORAGE_KEY = "fanzon-runtime-reset-version";
const APP_RUNTIME_RELOAD_GUARD_KEY = `fanzon-runtime-reset-reloaded-${APP_RUNTIME_RESET_VERSION}`;

const forceRefreshPwaRuntime = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const lastResetVersion = window.localStorage.getItem(APP_RUNTIME_RESET_STORAGE_KEY);

    if (lastResetVersion !== APP_RUNTIME_RESET_VERSION) {
      window.localStorage.setItem(APP_RUNTIME_RESET_STORAGE_KEY, APP_RUNTIME_RESET_VERSION);

      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
      }

      if (!window.sessionStorage.getItem(APP_RUNTIME_RELOAD_GUARD_KEY)) {
        window.sessionStorage.setItem(APP_RUNTIME_RELOAD_GUARD_KEY, "1");
        window.location.reload();
        return;
      }
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.update()));
  } catch (error) {
    console.warn("PWA runtime refresh failed:", error);
  }
};

void forceRefreshPwaRuntime();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

