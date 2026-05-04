import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { formatINR } from "@/lib/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, CreditCard } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/received")({
  head: () => ({
    meta: [
      { title: "Received Invoices — Pay Tracker" },
      { name: "description", content: "Invoices sent to you by other businesses." },
    ],
  }),
  component: ReceivedInvoices,
});

function ReceivedInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("pay_tracker_token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices/received`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setInvoices(response.data.data);
      } catch (error: any) {
        toast.error("Failed to load received invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">My Invoices</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Invoices sent to your email by other businesses on Pay Tracker.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Sender</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
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
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No invoices received yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="group hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-foreground">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5 font-medium">
                        {(inv.userId as any)?.businessName || (inv.userId as any)?.name || "Unknown Business"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold tabular-nums">{formatINR(inv.amount)}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={inv.status.toLowerCase() as any} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Link 
                          to="/invoices/pay/$id"
                          params={{ id: inv._id }}
                          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                        >
                          <CreditCard className="h-3 w-3" />
                          Pay Now
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
