import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { invoices } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Find your invoice — Pay Tracker" },
      { name: "description", content: "Look up an invoice by ID and email." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !email) {
      toast.error("Both fields are required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const found = invoices.find((i) => i.id.toLowerCase() === id.toLowerCase() && i.email.toLowerCase() === email.toLowerCase());
      setLoading(false);
      if (found) {
        toast.success("Invoice found");
        navigate({ to: "/pay/$id", params: { id: found.id } });
      } else {
        // Demo: still navigate to first invoice
        toast("Demo lookup — opening sample invoice");
        navigate({ to: "/pay/$id", params: { id: invoices[0].id } });
      }
    }, 700);
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto pt-6 lg:pt-16">
        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Find an invoice
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mt-4">Look up your invoice</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your invoice ID and email to view payment details.</p>
        </div>

        <form onSubmit={submit} className="mt-8 rounded-2xl bg-card border border-border shadow-pop p-6 space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice ID</span>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="INV-2042"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-glow hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find invoice
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          Demo tip: try <span className="font-mono text-foreground">INV-2042</span> with <span className="font-mono text-foreground">priya@northwinds.co</span>
        </p>
      </div>
    </AppShell>
  );
}
