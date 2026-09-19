"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  Undo2,
} from "lucide-react";
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

const statusMeta: Record<ExpiryStatus, {
  label: string;
  noun: string;
  icon: typeof AlertCircle;
  tone: string;
  soft: string;
}> = {
  expired: {
    label: "Expired",
    noun: "Needs action",
    icon: AlertCircle,
    tone: "status-danger",
    soft: "status-soft-danger",
  },
  urgent: {
    label: "Due soon",
    noun: "Due soon",
    icon: Clock3,
    tone: "status-warning",
    soft: "status-soft-warning",
  },
  soon: {
    label: "Coming up",
    noun: "Coming up",
    icon: CalendarDays,
    tone: "status-yellow",
    soft: "status-soft-yellow",
  },
  safe: {
    label: "Safe",
    noun: "Safe",
    icon: CheckCircle2,
    tone: "status-safe",
    soft: "status-soft-safe",
  },
};

type Filter = "all" | "attention" | "safe";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDateAtNoon(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function StatusBadge({ status }: { status: ExpiryStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span className={cn("status-badge", meta.soft)}>
      <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function ItemCard({
  item,
  today,
  onDelete,
  onEdit,
}: {
  item: ExpiryItem;
  today: Date;
  onDelete: (id: string) => void;
  onEdit: (item: ExpiryItem) => void;
}) {
  const daysRemaining = getDaysRemaining(item.expiryDate, today);
  const status = getExpiryStatus(daysRemaining);
  const meta = statusMeta[status];

  return (
    <article className="item-card">
      <div className={cn("item-card-rail", meta.tone)} aria-hidden="true" />
      <div className="item-card-main">
        <div className="item-card-topline">
          <div className="item-card-title-wrap">
            <h3>{item.name}</h3>
            <span className="category-chip">{item.category}</span>
          </div>
          <div className="item-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.name}`}
            >
              <Pencil size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button icon-button-danger"
              onClick={() => onDelete(item.id)}
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="item-card-bottomline">
          <span className="date-line">
            <CalendarDays size={15} aria-hidden="true" />
            {formatExpiryDate(item.expiryDate)}
          </span>
          <div className="item-status-line">
            <StatusBadge status={status} />
            <strong className={status === "expired" ? "text-danger" : ""}>
              {formatDaysRemaining(daysRemaining)}
            </strong>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [todayKey, setTodayKey] = useState(getLocalDateKey());
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Grocery");
  const [expiryDate, setExpiryDate] = useState(getLocalDateKey());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletedItem, setDeletedItem] = useState<{ item: ExpiryItem; index: number } | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

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

  const today = useMemo(() => toDateAtNoon(todayKey), [todayKey]);
  const sortedItems = useMemo(() => sortByExpiry(items), [items]);
  const counts = useMemo(() => sortedItems.reduce((result, item) => {
    const status = getExpiryStatus(getDaysRemaining(item.expiryDate, today));
    result[status] += 1;
    return result;
  }, { expired: 0, urgent: 0, soon: 0, safe: 0 } as Record<ExpiryStatus, number>), [sortedItems, today]);
  const visibleItems = useMemo(() => sortedItems.filter((item) => {
    const status = getExpiryStatus(getDaysRemaining(item.expiryDate, today));
    if (filter === "attention") return status === "expired" || status === "urgent";
    if (filter === "safe") return status === "safe";
    return true;
  }), [filter, sortedItems, today]);
  const attentionCount = counts.expired + counts.urgent;
  const isEditing = editingItemId !== null;

  function resetForm() {
    setEditingItemId(null);
    setName("");
    setCategory("Grocery");
    setExpiryDate(getLocalDateKey());
    setError("");
  }

  function saveItem(form: HTMLFormElement) {
    const formData = new FormData(form);
    const trimmedName = String(formData.get("name") ?? "").trim();
    const submittedCategory = String(formData.get("category") ?? "Grocery") as Category;
    const submittedExpiryDate = String(formData.get("expiryDate") ?? "");

    if (!trimmedName) {
      setError("Give this item a name first.");
      return;
    }
    if (!isValidDateKey(submittedExpiryDate)) {
      setError("Choose a valid calendar date.");
      return;
    }

    setItems((current) => isEditing
      ? current.map((item) => item.id === editingItemId
        ? { ...item, name: trimmedName, category: submittedCategory, expiryDate: submittedExpiryDate }
        : item)
      : [...current, { id: makeId(), name: trimmedName, category: submittedCategory, expiryDate: submittedExpiryDate }]);
    resetForm();
  }

  function startEditing(item: ExpiryItem) {
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setExpiryDate(item.expiryDate);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteItem(id: string) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const item = current[index];
      if (!item) return current;
      setDeletedItem({ item, index });
      if (editingItemId === id) resetForm();
      return current.filter((entry) => entry.id !== id);
    });
  }

  function undoDelete() {
    if (!deletedItem) return;
    setItems((current) => {
      const restored = [...current];
      restored.splice(Math.min(deletedItem.index, restored.length), 0, deletedItem.item);
      return restored;
    });
    setDeletedItem(null);
  }

  return (
    <main className="app-shell">
      <div className="app-frame">
        <header className="topbar">
          <Link href="/" className="brand" aria-label="Nexpire home">
            <span className="brand-mark" aria-hidden="true">n</span>
            <span className="brand-name">nexpire</span>
          </Link>
          <span className="privacy-pill"><span aria-hidden="true" />Private on this device</span>
        </header>

        <section className="intro-row" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">Household watchlist</p>
            <h1 id="page-title">Keep the little deadlines visible.</h1>
            <p className="intro-description">A quiet place for the things that matter, before they become urgent.</p>
          </div>
          <div className="date-stamp">
            <span>Today</span>
            <strong>{new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "short" }).format(today)}</strong>
          </div>
        </section>

        <section className="stat-strip" aria-label="Expiry overview">
          <div className="stat-card stat-card-attention"><span className="stat-number">{attentionCount}</span><span className="stat-label">Need attention</span><span className="stat-detail">Expired or due soon</span></div>
          <div className="stat-card"><span className="stat-number">{items.length}</span><span className="stat-label">On your list</span><span className="stat-detail">Saved on this device</span></div>
          <div className="stat-card stat-card-safe"><span className="stat-number">{counts.safe}</span><span className="stat-label">Looking good</span><span className="stat-detail">More than a week away</span></div>
        </section>

        <section className="workspace-grid">
          <form className={cn("add-panel", isEditing && "add-panel-editing")} onSubmit={(event) => { event.preventDefault(); saveItem(event.currentTarget); }}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{isEditing ? "Make a correction" : "Add to the watchlist"}</p>
                <h2>{isEditing ? "Edit this item" : "What should we watch?"}</h2>
              </div>
              <span className="panel-icon" aria-hidden="true"><Plus size={18} /></span>
            </div>
            {isEditing && <p className="editing-note">You are editing an existing item. Its history stays intact.</p>}
            <div className="form-fields">
              <label>Item name<Input name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Paracetamol" autoComplete="off" /></label>
              <div className="form-two-up">
                <label>Category<Select name="category" value={category} onChange={(event) => setCategory(event.target.value as Category)}>{CATEGORIES.map((option) => <option key={option}>{option}</option>)}</Select></label>
                <label>Expiry date<Input name="expiryDate" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></label>
              </div>
            </div>
            {error && <p className="form-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{error}</p>}
            <div className="form-actions">
              <Button type="submit" className="primary-action">{isEditing ? "Save changes" : "Add item"}<Plus size={17} aria-hidden="true" /></Button>
              {isEditing && <Button type="button" variant="quiet" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>

          <section className="list-panel" aria-labelledby="list-title">
            <div className="list-heading">
              <div><p className="eyebrow">Your dates</p><h2 id="list-title">Watchlist <span>{items.length}</span></h2></div>
              <div className="filter-tabs" role="group" aria-label="Filter watchlist">
                {(["all", "attention", "safe"] as const).map((option) => <button key={option} type="button" className={cn(filter === option && "active")} onClick={() => setFilter(option)}>{option === "all" ? "All" : option === "attention" ? "Attention" : "Safe"}</button>)}
              </div>
            </div>
            {visibleItems.length > 0 ? <div className="item-list">{visibleItems.map((item) => <ItemCard key={item.id} item={item} today={today} onEdit={startEditing} onDelete={deleteItem} />)}</div> : <div className="empty-state"><div className="empty-orbit" aria-hidden="true"><CheckCircle2 size={25} /></div><h3>{items.length === 0 ? "Your list is clear." : "Nothing in this view."}</h3><p>{items.length === 0 ? "Add the first item and we’ll keep its date in sight." : "Try another filter to see the rest of your items."}</p>{items.length === 0 && <button type="button" className="empty-link" onClick={() => document.querySelector<HTMLInputElement>('input[name="name"]')?.focus()}>Add your first item <span aria-hidden="true">↗</span></button>}</div>}
          </section>
        </section>

        {deletedItem && <div className="undo-toast" role="status"><span><strong>{deletedItem.item.name}</strong> removed from your list.</span><button type="button" onClick={undoDelete}><Undo2 size={16} aria-hidden="true" />Undo</button></div>}
        <footer className="footer-note"><span>Dates stay on this device.</span><span>Red means act now.</span></footer>
      </div>
    </main>
  );
}
