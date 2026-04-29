import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type NotifType = "success" | "warning" | "info";

export interface Notif {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotifType;
  unread: boolean;
  category: "payment" | "viewed" | "overdue" | "report" | "product";
}

interface NotificationSettings {
  paymentReceived: boolean;
  invoiceViewed: boolean;
  overdueAlerts: boolean;
  cashflowReport: boolean;
  productUpdates: boolean;
}

interface NotificationContextType {
  notifs: Notif[];
  settings: NotificationSettings;
  unreadCount: number;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  addNotif: (notif: Omit<Notif, "id" | "unread" | "time">) => void;
}

const initialNotifs: Notif[] = [];

const defaultSettings: NotificationSettings = {
  paymentReceived: true,
  invoiceViewed: true,
  overdueAlerts: true,
  cashflowReport: false,
  productUpdates: false,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifs, setNotifs] = useState<Notif[]>(() => {
    const saved = localStorage.getItem("pay_tracker_notifs");
    return saved ? JSON.parse(saved) : initialNotifs;
  });

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem("pay_tracker_notif_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("pay_tracker_notifs", JSON.stringify(notifs));
  }, [notifs]);

  useEffect(() => {
    localStorage.setItem("pay_tracker_notif_settings", JSON.stringify(settings));
  }, [settings]);

  const filteredNotifs = notifs.filter((n) => {
    if (n.category === "payment") return settings.paymentReceived;
    if (n.category === "viewed") return settings.invoiceViewed;
    if (n.category === "overdue") return settings.overdueAlerts;
    if (n.category === "report") return settings.cashflowReport;
    if (n.category === "product") return settings.productUpdates;
    return true;
  });

  const unreadCount = filteredNotifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addNotif = (notif: Omit<Notif, "id" | "unread" | "time">) => {
    const newNotif: Notif = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      unread: true,
      time: "Just now",
    };
    setNotifs((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifs: filteredNotifs,
        settings,
        unreadCount,
        markAllRead,
        markAsRead,
        updateSettings,
        addNotif,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
