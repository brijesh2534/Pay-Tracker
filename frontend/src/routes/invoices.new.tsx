import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { formatINR } from "@/lib/mock";
import { ArrowLeft, Send, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/new")({
  head: () => ({
    meta: [
      { title: "Create invoice — Pay Tracker" },
      { name: "description", content: "Create a professional invoice in seconds with live preview." },
    ],
  }),
  component: CreateInvoice,
});

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const lift = focused || hasValue;

  return (
    <label className="relative block">
      <span
        className={`absolute left-3.5 transition-all duration-200 pointer-events-none ${
          lift ? "top-1.5 text-[10px] font-medium uppercase tracking-wider" : "top-1/2 -translate-y-1/2 text-sm"
        } ${focused ? "text-primary" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <div className={`flex items-center rounded-xl border bg-card transition-all ${focused ? "border-primary ring-4 ring-primary/10" : "border-border"}`}>
        {prefix && (
          <span className="pl-3.5 pt-4 text-sm text-muted-foreground tabular-nums">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent outline-none px-3.5 pt-5 pb-1.5 text-sm tabular-nums"
        />
      </div>
    </label>
  );
}

function CreateInvoice() {
  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");

  const amountNum = Number(amount.replace(/[^0-9.]/g, "")) || 0;
  const tax = Math.round(amountNum * 0.18);
  const total = amountNum + tax;

  const handleSend = () => {
    if (!client || !email || !amountNum) {
      toast.error("Please fill client name, email and amount");
      return;
    }
    toast.success("Invoice sent!", { description: `${client} · ${formatINR(total)}` });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/invoices" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to invoices
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight mt-2">Create invoice</h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in the details — your client sees the preview on the right.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5 rounded-2xl bg-card border border-border p-6 shadow-card animate-fade-up">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</div>
              <FloatingInput label="Client name" value={client} onChange={setClient} />
              <FloatingInput label="Email address" type="email" value={email} onChange={setEmail} />
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput label="Amount" prefix="₹" value={amount} onChange={setAmount} />
                <FloatingInput label="Due date" type="date" value={due} onChange={setDue} />
              </div>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes (optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Thanks for your business!"
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSend}
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow-glow hover:scale-[1.02] transition-all"
              >
                <Send className="h-4 w-4" />
                Send invoice
              </button>
              <button
                onClick={() => toast("Saved as draft")}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                <Save className="h-4 w-4" />
                Save draft
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Live preview
              </div>
              <div className="rounded-2xl bg-card border border-border shadow-pop p-6 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="h-9 w-9 rounded-lg gradient-primary mb-2" />
                    <div className="text-sm font-semibold">Brightlabs Studio</div>
                    <div className="text-[11px] text-muted-foreground">hello@brightlabs.in</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Invoice</div>
                    <div className="font-mono text-sm font-semibold">#INV-2049</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-border">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Bill to</div>
                    <div className="text-sm font-medium">{client || "Client name"}</div>
                    <div className="text-xs text-muted-foreground">{email || "client@email.com"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Due</div>
                    <div className="text-sm font-medium">
                      {due ? new Date(due).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatINR(amountNum)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18%)</span>
                    <span className="tabular-nums">{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="tabular-nums">{formatINR(total)}</span>
                  </div>
                </div>

                {notes && (
                  <div className="mt-5 pt-4 border-t border-border text-xs text-muted-foreground italic">
                    "{notes}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
