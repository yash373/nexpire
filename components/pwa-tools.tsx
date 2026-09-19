"use client";

import { useEffect, useState } from "react";
import { Bell, Download, RefreshCw } from "lucide-react";
import { getLocalDateKey, type ExpiryItem } from "@/lib/expiry";
import { getEligibleReminders, getUnsentReminders, readReminderRecords, reconcileReminderRecords, writeReminderRecords } from "@/lib/reminders";

declare global {
  interface WindowEventMap {
    "nexpire:sw-updated": Event;
  }
}

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function PwaTools({ items }: { items: ExpiryItem[] }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => (
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  ));

  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("nexpire:sw-updated", onUpdate);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("nexpire:sw-updated", onUpdate);
    };
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      if (notificationPermission !== "granted") return;
      void sendReminders(items);
    };
    window.addEventListener("focus", checkReminders);
    document.addEventListener("visibilitychange", checkReminders);
    checkReminders();
    return () => {
      window.removeEventListener("focus", checkReminders);
      document.removeEventListener("visibilitychange", checkReminders);
    };
  }, [items, notificationPermission]);

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (updateAvailable) {
    return <button className="pwa-action" type="button" onClick={() => window.location.reload()}><RefreshCw size={13} aria-hidden="true" /> Update available</button>;
  }
  if (installPrompt) {
    return <button className="pwa-action" type="button" onClick={install}><Download size={13} aria-hidden="true" /> Install Nexpire</button>;
  }
  if (notificationPermission === "default") {
    return <button className="pwa-action" type="button" onClick={enableNotifications}><Bell size={13} aria-hidden="true" /> Enable reminders</button>;
  }
  if (notificationPermission === "denied") return <span className="pwa-note">Browser reminders are off</span>;
  return null;
}

async function sendReminders(items: ExpiryItem[]) {
  const registration = await navigator.serviceWorker?.ready.catch(() => null);
  if (!registration || !("showNotification" in registration)) return;

  const storage = window.localStorage;
  const today = new Date();
  const sent = reconcileReminderRecords(readReminderRecords(storage), items, today);
  const eligible = getEligibleReminders(items, today);
  const unsent = getUnsentReminders(eligible, sent);
  if (unsent.length === 0) {
    writeReminderRecords(storage, sent);
    return;
  }

  for (const reminder of unsent) {
    const item = items.find((entry) => entry.id === reminder.itemId);
    if (!item) continue;
    await registration.showNotification(reminder.kind === "due-today" ? `${item.name} is due today` : `${item.name} expires in 3 days`, {
      body: `${item.category} · ${reminder.dateKey}`,
      tag: `nexpire-${item.id}-${reminder.kind}-${getLocalDateKey()}`,
    });
  }
  writeReminderRecords(storage, [...sent, ...unsent]);
}
