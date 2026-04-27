import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CountUp } from "@/components/CountUp";
import { StatusBadge } from "@/components/StatusBadge";
import { cashflow, weekly, formatINR, type InvoiceStatus } from "@/lib/mock";
import { useAuth } from "../auth";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Pay Tracker" },
      { name: "description", content: "Track revenue, pending payments, and cashflow forecast in one place." },
    ],
  }),
  component: Dashboard,
});

const inrShort = (n: number) =>
  n >= 1e7
    ? `₹${(n / 1e7).toFixed(1)}Cr`
    : n >= 1e5
      ? `₹${(n / 1e5).toFixed(1)}L`
      : `₹${(n / 1e3).toFixed(0)}K`;

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  tone: "primary" | "warning" | "destructive";
  delay: number;
}) {
  const toneStyles = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning-foreground",
    destructive: "bg-destructive-soft text-destructive",
  }[tone];

  return (
    <div
      className="group relative rounded-2xl bg-card border border-border p-5 shadow-card hover:shadow-pop hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            <CountUp to={value} format={(n) => formatINR(Math.round(n))} />
          </div>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${toneStyles}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-success">
          <ArrowUpRight className="h-3 w-3" />
          {trend}
        </span>
        vs last month
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("pay_tracker_token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setInvoices(response.data.data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const totalRevenue = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Good evening, {user?.name.split(' ')[0] || "User"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your cashflow today.
            </p>
          </div>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow-glow hover:scale-[1.02] hover:shadow-pop transition-all"
          >
            <Plus className="h-4 w-4" />
            New invoice
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Revenue" value={totalRevenue} icon={TrendingUp} trend="+0%" tone="primary" delay={0} />
              <StatCard label="Pending Amount" value={pending} icon={Clock} trend="+0%" tone="warning" delay={80} />
              <StatCard label="Overdue Amount" value={overdue} icon={AlertTriangle} trend="-0%" tone="destructive" delay={160} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-card animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold">Cashflow trend</h2>
                    <p className="text-xs text-muted-foreground">Revenue vs expected — last 6 months</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Revenue</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Expected</span>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashflow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.546 0.215 262.881)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="oklch(0.546 0.215 262.881)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.72 0.18 150)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="oklch(0.72 0.18 150)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="oklch(0.92 0.012 255)" vertical={false} />
                      <XAxis dataKey="month" stroke="oklch(0.554 0.046 257)" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="oklch(0.554 0.046 257)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={inrShort} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid oklch(0.92 0.012 255)",
                          boxShadow: "0 8px 24px oklch(0.129 0.042 264.695 / 0.08)",
                          fontSize: 12,
                        }}
                        formatter={(v) => formatINR(Number(v))}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="oklch(0.546 0.215 262.881)" strokeWidth={2.5} fill="url(#rev)" animationDuration={1200} />
                      <Area type="monotone" dataKey="expected" stroke="oklch(0.72 0.18 150)" strokeWidth={2} fill="url(#exp)" animationDuration={1400} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl gradient-primary text-primary-foreground p-6 shadow-glow relative overflow-hidden animate-fade-up" style={{ animationDelay: "260ms" }}>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -right-2 bottom-4 h-20 w-20 rounded-full bg-white/5" />
                <Sparkles className="h-5 w-5 mb-3" />
                <div className="text-xs uppercase tracking-wider opacity-80">Expected next 30 days</div>
                <div className="text-4xl font-semibold mt-2 tracking-tight">
                  <CountUp to={pending} format={(n) => formatINR(Math.round(n))} />
                </div>
                <p className="text-sm opacity-80 mt-2 leading-relaxed">
                  Based on {invoices.filter(i => i.status === 'PENDING').length} pending invoices and your current billing cycle.
                </p>
                <div className="mt-5 h-2 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full bg-white rounded-full animate-fade-up" style={{ width: "100%", animationDelay: "600ms" }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-card border border-border p-5 shadow-card animate-fade-up" style={{ animationDelay: "320ms" }}>
                <h2 className="text-base font-semibold">This week</h2>
                <p className="text-xs text-muted-foreground mb-4">Daily collections</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="oklch(0.92 0.012 255)" vertical={false} />
                      <XAxis dataKey="day" stroke="oklch(0.554 0.046 257)" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="oklch(0.554 0.046 257)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={inrShort} />
                      <Tooltip
                        cursor={{ fill: "oklch(0.95 0.04 262 / 0.4)" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid oklch(0.92 0.012 255)",
                          fontSize: 12,
                        }}
                        formatter={(v) => formatINR(Number(v))}
                      />
                      <Bar dataKey="paid" fill="oklch(0.546 0.215 262.881)" radius={[6, 6, 0, 0]} animationDuration={900} />
                      <Bar dataKey="pending" fill="oklch(0.78 0.16 75)" radius={[6, 6, 0, 0]} animationDuration={1100} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card overflow-hidden animate-fade-up" style={{ animationDelay: "380ms" }}>
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold">Recent invoices</h2>
                    <p className="text-xs text-muted-foreground">Your latest activity</p>
                  </div>
                  <Link to="/invoices" className="text-xs font-medium text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {invoices.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No recent invoices.
                    </div>
                  ) : (
                    invoices.slice(0, 5).map((inv) => (
                      <div key={inv._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/40 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {inv.clientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{inv.clientName}</div>
                            <div className="text-xs text-muted-foreground truncate">{inv.invoiceNumber} · Due {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold tabular-nums">{formatINR(inv.amount)}</span>
                          <StatusBadge status={inv.status.toLowerCase() as InvoiceStatus} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
