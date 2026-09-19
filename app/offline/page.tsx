import { Logo } from "@/components/brand/logo";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-shell">
      <section className="offline-card">
        <Logo markSize={48} />
        <p className="eyebrow">You are offline</p>
        <h1>Nexpire is still here.</h1>
        <p>Reconnect when you can. Your saved items remain private on this device and are not held in the offline cache.</p>
        <Link href="/" className="offline-link">Try the watchlist again</Link>
      </section>
    </main>
  );
}
