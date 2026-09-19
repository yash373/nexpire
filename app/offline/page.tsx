export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf4ef] px-6 text-[#173b3f]">
      <section className="max-w-md rounded-[24px] border border-[#d5e3d8] bg-[#fffdf8] p-8 text-center shadow-[0_20px_50px_rgba(23,59,63,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c66f2f]">You are offline</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">Nexpire is still here.</h1>
        <p className="mt-4 text-sm leading-6 text-[#607873]">
          Reconnect to load the latest app, then your items will remain stored privately on this device.
        </p>
      </section>
    </main>
  );
}
