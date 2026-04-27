import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Search,
  Bell,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/invoices/new", label: "Create", icon: PlusCircle },
  { to: "/search", label: "Search", icon: Search },
];

type Notif = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "success" | "warning" | "info";
  unread: boolean;
};

const initialNotifs: Notif[] = [
  {
    id: "n1",
    title: "Payment received",
    description: "Aakash Mehta paid INV-2041 · ₹48,500",
    time: "2m ago",
    type: "success",
    unread: true,
  },
  {
    id: "n2",
    title: "Invoice overdue",
    description: "INV-2043 to Rohan Kapoor is 18 days overdue",
    time: "1h ago",
    type: "warning",
    unread: true,
  },
  {
    id: "n3",
    title: "Reminder sent",
    description: "Auto-reminder emailed to Priya Sharma",
    time: "4h ago",
    type: "info",
    unread: true,
  },
  {
    id: "n4",
    title: "Invoice viewed",
    description: "Vikram Singh opened INV-2045",
    time: "Yesterday",
    type: "info",
    unread: false,
  },
];

import { useAuth } from "../auth";
import { useNavigate } from "@tanstack/react-router";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const unreadCount = notifs.filter((n) => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
    toast.success("Signed out successfully");
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  return (
    <div className="min-h-screen flex w-full bg-background gradient-mesh">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center shadow-glow border border-border bg-white">
            <img src="/PayTracker-Logo.png" alt="Pay Tracker Logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Pay Tracker Parth</span>
            <span className="text-[11px] text-muted-foreground">Invoice & Cashflow</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${active
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          {user?.role === "ADMIN" && (
            <Link
              to="/admin/dashboard"
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${pathname.startsWith("/admin")
                  ? "bg-destructive text-destructive-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                }`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}
        </nav>

        <div className="m-3 rounded-2xl border border-border p-4 bg-card shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live payments
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
            UPI & Razorpay enabled. Get paid in seconds.
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-30 glass border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center border border-border bg-white">
              <img src="/PayTracker-Logo.png" alt="Pay Tracker Logo" className="h-full w-full object-cover" />
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 w-80 shadow-card">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search invoices, clients..."
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="relative h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors shadow-card"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-glow animate-scale-in">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[360px] p-0 overflow-hidden rounded-2xl shadow-pop animate-scale-in"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div>
                    <div className="text-sm font-semibold">Notifications</div>
                    <div className="text-[11px] text-muted-foreground">
                      {unreadCount} unread
                    </div>
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[380px] overflow-y-auto">
                  {notifs.map((n) => {
                    const Icon =
                      n.type === "success"
                        ? CheckCircle2
                        : n.type === "warning"
                          ? AlertTriangle
                          : Clock;
                    const tone =
                      n.type === "success"
                        ? "text-success bg-success-soft"
                        : n.type === "warning"
                          ? "text-destructive bg-destructive-soft"
                          : "text-primary bg-primary-soft";
                    return (
                      <button
                        key={n.id}
                        onClick={() =>
                          setNotifs((prev) =>
                            prev.map((x) =>
                              x.id === n.id ? { ...x, unread: false } : x,
                            ),
                          )
                        }
                        className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors text-left ${n.unread ? "bg-primary-soft/30" : ""
                          }`}
                      >
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${tone}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {n.title}
                            </span>
                            {n.unread && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.description}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                            {n.time}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <Link
                    to="/settings"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Notification settings →
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

            <Link
              to="/settings"
              className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors shadow-card"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold hover:scale-105 transition-transform uppercase">
                  {user?.email.substring(0, 2) || "U"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-pop">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate max-w-[180px]">{user?.email.split('@')[0]}</span>
                    <span className="text-[11px] text-muted-foreground font-normal truncate max-w-[180px]">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</main>

        <nav className="lg:hidden sticky bottom-0 glass border-t border-border grid grid-cols-4 px-2 py-2">
          {nav.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[11px] ${active ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
