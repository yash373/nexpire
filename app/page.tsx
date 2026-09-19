"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CircleAlert, PackagePlus, Pencil, Trash2, Undo2 } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CATEGORIES,
  formatDaysRemaining,
  formatExpiryDate,
  getDaysRemaining,
  getExpiryStatus,
  getLocalDateKey,
  isValidDateKey,
  sortByExpiry,
  type Category,
  type ExpiryItem,
  type ExpiryStatus,
} from "@/lib/expiry";
import { loadItems, saveItems } from "@/lib/storage";
import { cn } from "@/lib/utils";

const statusStyles: Record<ExpiryStatus, { label: string; dot: string; wash: string }> = {
  expired: { label: "Expired", dot: "bg-[#c64f55]", wash: "bg-[#fff0ed]" },
  urgent: { label: "Due soon", dot: "bg-[#ed7b43]", wash: "bg-[#fff5e8]" },
  soon: { label: "Coming up", dot: "bg-[#d29d28]", wash: "bg-[#fff9df]" },
  safe: { label: "Safe", dot: "bg-[#4b8f70]", wash: "bg-[#edf7ef]" },
};

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function StatusMark({ status }: { status: ExpiryStatus }) {
  const style = statusStyles[status];
  return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4d6762]"><span aria-hidden="true" className={cn("size-2 rounded-full", style.dot)} />{style.label}</span>;
}

function ItemRow({ item, today, onDelete, onEdit }: { item: ExpiryItem; today: Date; onDelete: (id: string) => void; onEdit: (item: ExpiryItem) => void }) {
  const daysRemaining = getDaysRemaining(item.expiryDate, today);
  const status = getExpiryStatus(daysRemaining);
  const style = statusStyles[status];

  return (
    <article className={cn("group relative overflow-hidden border-b border-[#dfe8e1] px-5 py-5 transition-colors last:border-b-0 hover:bg-[#fbfdf9]", style.wash)}>
      <div aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", style.dot)} />
      <div className="flex items-start justify-between gap-4 pl-1">
        <div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="truncate text-[1.05rem] font-bold text-[#173b3f]">{item.name}</h3><StatusMark status={status} /></div><p className="text-sm text-[#607873]">{item.category}</p></div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`} className="flex size-11 items-center justify-center rounded-xl text-[#607873] transition hover:bg-[#e6eee8] hover:text-[#173b3f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4b942]/40"><Pencil size={17} strokeWidth={1.8} aria-hidden="true" /></button>
          <button type="button" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`} className="flex size-11 items-center justify-center rounded-xl text-[#82958f] transition hover:bg-[#fff0ed] hover:text-[#b44248] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4b942]/40"><Trash2 size={18} strokeWidth={1.8} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 pl-1 text-sm"><span className="inline-flex items-center gap-2 text-[#607873]"><CalendarDays size={16} aria-hidden="true" />{formatExpiryDate(item.expiryDate)}</span><span className={cn("font-bold", status === "expired" ? "text-[#b44248]" : "text-[#173b3f]")}>{formatDaysRemaining(daysRemaining)}</span></div>
    </article>
  );
}

export default function Home() {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Grocery");
  const [expiryDate, setExpiryDate] = useState(getLocalDateKey());
  const [error, setError] = useState("");
  const [todayKey, setTodayKey] = useState(getLocalDateKey());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletedItem, setDeletedItem] = useState<{ item: ExpiryItem; index: number } | null>(null);

  useEffect(() => {
    // Storage is browser-only; hydrate after SSR so server and client markup agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadItems(window.localStorage));
    setHydrated(true);
  }, []);

  useEffect(() => {
    const refreshToday = () => setTodayKey(getLocalDateKey());
    window.addEventListener("focus", refreshToday);
    document.addEventListener("visibilitychange", refreshToday);
    return () => {
      window.removeEventListener("focus", refreshToday);
      document.removeEventListener("visibilitychange", refreshToday);
    };
  }, []);

  useEffect(() => {
    if (hydrated) saveItems(window.localStorage, items);
  }, [hydrated, items]);

  useEffect(() => {
    if (!deletedItem) return;
    const timeout = window.setTimeout(() => setDeletedItem(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [deletedItem]);

  const sortedItems = useMemo(() => sortByExpiry(items), [items]);
  const today = useMemo(() => new Date(`${todayKey}T12:00:00`), [todayKey]);
  const counts = useMemo(() => items.reduce((result, item) => { result[getExpiryStatus(getDaysRemaining(item.expiryDate, today))] += 1; return result; }, { expired: 0, urgent: 0, soon: 0, safe: 0 } as Record<ExpiryStatus, number>), [items, today]);

  function addItem(form: HTMLFormElement) {
    const formData = new FormData(form);
    const trimmedName = String(formData.get("name") ?? "").trim();
    const submittedCategory = String(formData.get("category") ?? "Grocery") as Category;
    const submittedExpiryDate = String(formData.get("expiryDate") ?? "");
    if (!trimmedName) { setError("Add a name so your family knows what this is."); return; }
    if (!submittedExpiryDate || !isValidDateKey(submittedExpiryDate)) { setError("Choose a valid expiry date."); return; }
    setItems((current) => editingItemId
      ? current.map((item) => item.id === editingItemId ? { ...item, name: trimmedName, category: submittedCategory, expiryDate: submittedExpiryDate } : item)
      : [...current, { id: makeId(), name: trimmedName, category: submittedCategory, expiryDate: submittedExpiryDate }]);
    setName(""); setCategory("Grocery"); setExpiryDate(getLocalDateKey()); setEditingItemId(null); setError("");
  }

  function startEditing(item: ExpiryItem) {
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setExpiryDate(item.expiryDate);
    setError("");
  }

  function cancelEditing() {
    setEditingItemId(null);
    setName("");
    setCategory("Grocery");
    setExpiryDate(getLocalDateKey());
    setError("");
  }

  function deleteItem(id: string) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const item = current[index];
      if (!item) return current;
      setDeletedItem({ item, index });
      return current.filter((entry) => entry.id !== id);
    });
  }

  function undoDelete() {
    if (!deletedItem) return;
    setItems((current) => {
      if (current.some((item) => item.id === deletedItem.item.id)) return current;
      const restored = [...current];
      restored.splice(Math.min(deletedItem.index, restored.length), 0, deletedItem.item);
      return restored;
    });
    setDeletedItem(null);
  }

  return (
    <main className="min-h-screen bg-[#edf4ef] text-[#173b3f]">
      <div className="mx-auto min-h-screen max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between py-6 sm:py-8"><Link href="/" className="rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4b942]/40" aria-label="Nexpire home"><Logo /></Link><span className="hidden text-sm font-semibold text-[#607873] sm:block">A little less to remember</span></header>
        <section className="grid gap-8 pb-8 pt-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-start lg:gap-16 lg:pb-14 lg:pt-12">
          <div className="max-w-xl"><p className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#c66f2f]"><span className="size-2 rounded-full bg-[#f4b942]" />Your household, in good time</p><h1 className="max-w-lg text-[clamp(2.6rem,8vw,5.3rem)] font-black leading-[0.94] tracking-[-0.075em] text-[#173b3f]">Know what needs attention.</h1><p className="mt-6 max-w-md text-base leading-7 text-[#607873] sm:text-lg">Keep medicines, groceries, documents, and the small things that matter from quietly slipping past their date.</p><div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-[#607873]"><span className="rounded-full bg-white/75 px-3 py-2">{items.length} {items.length === 1 ? "item" : "items"} tracked</span>{counts.urgent + counts.expired > 0 && <span className="rounded-full bg-[#fff0ed] px-3 py-2 text-[#b44248]">{counts.urgent + counts.expired} need attention</span>}</div></div>
          <form onSubmit={(event) => { event.preventDefault(); addItem(event.currentTarget); }} className="rounded-[24px] border border-[#d5e3d8] bg-[#fffdf8] p-5 shadow-[0_20px_50px_rgba(23,59,63,0.08)] sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c66f2f]">{editingItemId ? "Edit item" : "New item"}</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{editingItemId ? "Update what to watch" : "Add something to watch"}</h2></div><PackagePlus className="text-[#f4b942]" size={27} strokeWidth={2.2} aria-hidden="true" /></div><div className="space-y-4"><label className="block text-sm font-bold text-[#173b3f]">Item name<Input name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Paracetamol" className="mt-2" autoComplete="off" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-[#173b3f]">Category<Select name="category" value={category} onChange={(event) => setCategory(event.target.value as Category)} className="mt-2">{CATEGORIES.map((option) => <option key={option}>{option}</option>)}</Select></label><label className="block text-sm font-bold text-[#173b3f]">Expiry date<Input name="expiryDate" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="mt-2" /></label></div>{error && <p role="alert" className="flex items-center gap-2 text-sm font-semibold text-[#b44248]"><CircleAlert size={16} aria-hidden="true" />{error}</p>}<div className="flex gap-3"><Button type="submit" className="w-full"><PackagePlus size={18} aria-hidden="true" />{editingItemId ? "Update item" : "Save item"}</Button>{editingItemId && <Button type="button" variant="quiet" onClick={cancelEditing}>Cancel</Button>}</div></div></form>
        </section>
        <section aria-labelledby="items-heading" className="overflow-hidden rounded-[24px] border border-[#d5e3d8] bg-[#fffdf8] shadow-[0_20px_50px_rgba(23,59,63,0.06)]"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe8e1] px-5 py-5 sm:px-7"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c66f2f]">Your list</p><h2 id="items-heading" className="mt-1 text-2xl font-black tracking-[-0.04em]">Closest dates first</h2></div><div className="flex gap-3 text-xs font-bold text-[#607873]"><span><strong className="text-[#b44248]">{counts.expired}</strong> expired</span><span><strong className="text-[#d29d28]">{counts.soon}</strong> coming up</span><span><strong className="text-[#4b8f70]">{counts.safe}</strong> safe</span></div></div>{sortedItems.length > 0 ? <div>{sortedItems.map((item) => <ItemRow key={item.id} item={item} today={today} onEdit={startEditing} onDelete={deleteItem} />)}</div> : <div className="px-6 py-16 text-center sm:px-10"><LogoMark size={56} className="mx-auto rounded-2xl shadow-[4px_4px_0_#d5e3d8]" /><h3 className="mt-5 text-xl font-black">Nothing to chase yet.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#607873]">Add your first item above. Nexpire will keep the closest date at the top and make the urgent ones obvious.</p></div>}</section>
        {deletedItem && <div role="status" className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#d5e3d8] bg-[#173b3f] px-4 py-3 text-sm font-semibold text-white"><span>Deleted {deletedItem.item.name}.</span><button type="button" onClick={undoDelete} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 font-bold text-[#f9d36a] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4b942]/40"><Undo2 size={16} aria-hidden="true" />Undo</button></div>}
        <footer className="flex justify-between gap-4 px-1 py-6 text-xs font-semibold text-[#78908c]"><span>Stored privately on this device.</span><span>Red means act now.</span></footer>
      </div>
    </main>
  );
}
