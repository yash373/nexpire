import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexpire — know what needs attention",
    short_name: "Nexpire",
    description: "A simple family expiry tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#edf4ef",
    theme_color: "#173b3f",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}

