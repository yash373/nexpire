import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const serviceWorker = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

describe("service worker request policy", () => {
  it("uses network-first navigation with branded offline fallbacks", () => {
    expect(serviceWorker).toContain('request.mode === "navigate"');
    expect(serviceWorker).toContain('caches.match("/offline")');
    expect(serviceWorker).toContain("networkFirstNavigation(request)");
  });

  it("keeps static assets cache-first and excludes RSC/data requests", () => {
    expect(serviceWorker).toContain("cacheFirstAsset(request)");
    expect(serviceWorker).toContain('url.pathname.startsWith("/_next/static/")');
    expect(serviceWorker).toContain('request.headers.has("RSC")');
    expect(serviceWorker).toContain("if (!isSameOrigin(url) || isNextDataRequest(request, url)) return;");
  });

  it("does not turn local item storage into a service-worker cache", () => {
    expect(serviceWorker).not.toContain("nexpire-items-v1");
  });
});
