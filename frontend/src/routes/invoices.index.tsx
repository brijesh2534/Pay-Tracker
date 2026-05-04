import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { formatINR, type InvoiceStatus } from "@/lib/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowUpDown, Download, Plus, Search, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNotifications } from "../context/NotificationContext";

export const Route = createFileRoute("/invoices/")({
  head: () => ({
    meta: [
      { title: "Invoices — Pay Tracker" },
      { name: "description", content: "All your invoices in one place — filter, sort and export." },
    ],
  }),
  component: InvoiceList,
});

const filters: ("all" | "remaining" | InvoiceStatus)[] = ["all", "remaining", "paid", "pending", "overdue"];

function InvoiceList() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [q, setQ] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotif } = useNotifications();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("pay_tracker_token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const newInvoices = response.data.data;
        
        // Check for newly paid invoices to add notifications
        if (invoices.length > 0) {
          newInvoices.forEach((newInv: any) => {
            const oldInv = invoices.find(i => i._id === newInv._id);
            if (oldInv && oldInv.status === "PENDING" && newInv.status === "PAID") {
              addNotif({
                title: "Payment received (Auto)",
                description: `${newInv.clientName} paid ${newInv.invoiceNumber} · ${formatINR(newInv.totalAmount || newInv.amount)}`,
                type: "success",
                category: "payment",
              });
            }
          });
        }

        setInvoices(newInvoices);
      } catch (error: any) {
        toast.error("Failed to load invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();

    // Refetch when user returns to the tab
    window.addEventListener("focus", fetchInvoices);
    return () => window.removeEventListener("focus", fetchInvoices);
  }, []);

  const rows = useMemo(() => {
    return invoices.filter((i) => {
      const status = i.status.toLowerCase();
      let matchFilter = filter === "all" || status === filter;
      
      if (filter === "remaining") {
        matchFilter = status === "pending" || status === "overdue";
      }

      const matchQ = q === "" || 
        `${i.clientName} ${i.invoiceNumber} ${i.clientEmail}`.toLowerCase().includes(q.toLowerCase());
      return matchFilter && matchQ;
    });
  }, [filter, q, invoices]);

  const counts = {
    all: invoices.length,
    remaining: invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    pending: invoices.filter((i) => i.status === "PENDING").length,
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
    draft: 0
  };

  const handleExport = () => {
    if (rows.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    const headers = ["Invoice #", "Client Name", "Client Email", "Amount", "Due Date", "Status"];
    const csvRows = rows.map((inv) => [
      inv.invoiceNumber,
      `"${inv.clientName}"`, // Handle names with commas
      inv.clientEmail,
      inv.amount,
      new Date(inv.dueDate).toISOString().split('T')[0],
      inv.status,
    ]);

    const csvContent = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Invoices exported successfully");
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Invoices</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {invoices.length} total · {counts.overdue} need attention
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-accent transition-colors shadow-card"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <Link to="/invoices/new" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium shadow-glow hover:scale-[1.02] transition-all">
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filter === f
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              <span className="capitalize">{f}</span>
              <span className={`ml-2 text-[11px] ${filter === f ? "opacity-70" : "text-muted-foreground"}`}>
                {counts[f as keyof typeof counts]}
              </span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 w-full sm:w-72 shadow-card">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by client or ID"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">Amount <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-5 py-3 font-medium">Due date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Loading invoices...</p>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  rows.map((inv, idx) => (
                    <tr
                      key={inv._id}
                      className="group hover:bg-accent/40 transition-colors animate-fade-up"
                      style={{ animationDelay: `${idx * 30}ms`, animationDuration: "300ms" }}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-foreground">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-[11px] font-semibold">
                            {inv.clientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{inv.clientName}</div>
                            <div className="text-xs text-muted-foreground">{inv.clientEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold tabular-nums">{formatINR(inv.totalAmount || inv.amount)}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={inv.status.toLowerCase() as InvoiceStatus} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/pay/$id"
                          params={{ id: inv._id }}
                          className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
