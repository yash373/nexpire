import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexpire — know what needs attention",
  description: "A simple family expiry tracker that keeps the closest dates visible.",
  applicationName: "Nexpire",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "Nexpire", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#173b3f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<ServiceWorkerRegister /></body></html>;
}
