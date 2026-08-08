import { AppNotification } from "../types";

const NOTIFICATION_STORAGE_KEY = "heritage_study_notifications_v1";
const READ_IDS_KEY = "heritage_study_read_notifications_v1";

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse notifications:", e);
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications)
    );
    window.dispatchEvent(new Event("heritage_notifications_updated"));
  } catch (e) {
    console.warn("Failed to save notifications:", e);
  }
}

export function pushAdminNotification(
  title: string,
  message: string,
  type: "admin" | "system" | "update" | "alert" = "admin"
): AppNotification {
  const newNotif: AppNotification = {
    id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
    sender: "Admin (Heritage Study Portal)",
  };

  const current = getNotifications();
  const updated = [newNotif, ...current];
  saveNotifications(updated);
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function deleteNotification(id: string): void {
  const current = getNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}
