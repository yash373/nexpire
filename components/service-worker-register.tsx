"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let active = true;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
      void registration.update();
      if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (active && worker.state === "installed" && navigator.serviceWorker.controller) {
            window.dispatchEvent(new Event("nexpire:sw-updated"));
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    }).catch(() => {
      // The app remains fully usable when service workers are unavailable.
    });
    return () => { active = false; };
  }, []);

  return null;
}
