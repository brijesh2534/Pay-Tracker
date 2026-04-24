import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { invoices, formatINR } from "@/lib/mock";
import { ShieldCheck, Copy, Check, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pay/$id")({
  loader: ({ params }) => {
    const inv = invoices.find((i) => i.id === params.id) ?? invoices[0];
    if (!inv) throw notFound();
    return inv;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Pay ${loaderData?.id ?? "invoice"} — Brightlabs Studio` },
      { name: "description", content: "Secure payment via UPI or Razorpay." },
    ],
  }),
  component: PublicPay,
});

const UPI_ID = "brightlabs@hdfcbank";

// Inline SVG QR placeholder (decorative grid that looks like a real QR)
function QRCode() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill="white" rx="12" />
      {Array.from({ length: 21 }).map((_, r) =>
        Array.from({ length: 21 }).map((_, c) => {
          // deterministic pseudo-random pattern
          const v = (r * 31 + c * 17 + r * c) % 7;
          if (v < 3) return null;
          return <rect key={`${r}-${c}`} x={10 + c * 8.5} y={10 + r * 8.5} width="8" height="8" fill="#0F172A" rx="1" />;
        }),
      )}
      {/* finder squares */}
      {[
        [10, 10],
        [148, 10],
        [10, 148],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="42" height="42" fill="white" />
          <rect x={x} y={y} width="42" height="42" fill="none" stroke="#0F172A" strokeWidth="6" rx="4" />
          <rect x={x + 12} y={y + 12} width="18" height="18" fill="#0F172A" rx="2" />
        </g>
      ))}
    </svg>
  );
}

function PublicPay() {
  const inv = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);

  const tax = Math.round(inv.amount * 0.18);
  const total = inv.amount + tax;

  const copy = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success("UPI ID copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      toast.success("Payment successful!", { description: `${formatINR(total)} received` });
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-border bg-white shadow-card">
              <img src="/PayTracker-Logo.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Pay Tracker</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Secure payment
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Invoice card */}
          <div className="lg:col-span-3 rounded-3xl bg-card border border-border shadow-pop p-6 lg:p-8 animate-fade-up">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="h-10 w-10 rounded-xl gradient-primary mb-3" />
                <div className="text-base font-semibold">Brightlabs Studio Pvt Ltd</div>
                <div className="text-xs text-muted-foreground">GSTIN: 27AABCB1234X1Z5</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Invoice</div>
                <div className="font-mono text-base font-semibold">{inv.id}</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Issued {new Date(inv.issuedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-5 border-y border-border">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Bill to</div>
                <div className="text-sm font-semibold">{inv.client}</div>
                <div className="text-xs text-muted-foreground">{inv.email}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Due date</div>
                <div className="text-sm font-semibold">
                  {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            <div className="py-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Professional services</span>
                <span className="tabular-nums font-medium">{formatINR(inv.amount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (18%)</span>
                <span className="tabular-nums">{formatINR(tax)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-secondary text-secondary-foreground p-5 flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Amount due</div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums mt-1">{formatINR(total)}</div>
              </div>
              <div className="text-[11px] opacity-70 text-right">
                Payable to<br />
                <span className="font-medium opacity-100">Brightlabs Studio</span>
              </div>
            </div>
          </div>

          {/* Payment card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl bg-card border border-border shadow-pop p-6 animate-scale-in" style={{ animationDelay: "120ms" }}>
              <div className="text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Scan to pay</div>
                <div className="text-base font-semibold mt-1">UPI · GPay · PhonePe · Paytm</div>
              </div>

              <div className="mt-5 mx-auto w-52 h-52 rounded-2xl bg-white p-3 shadow-card animate-fade-in border border-border">
                <QRCode />
              </div>

              <button
                onClick={copy}
                className="mt-5 w-full group flex items-center justify-between rounded-xl border border-border bg-muted/40 hover:bg-accent transition-colors px-3.5 py-2.5"
              >
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">UPI ID</div>
                  <div className="text-sm font-mono font-medium">{UPI_ID}</div>
                </div>
                <span className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${copied ? "bg-success text-success-foreground scale-110" : "bg-card text-muted-foreground"}`}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </span>
              </button>

              <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="flex-1 h-px bg-border" />
                or
                <span className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow-glow hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100"
              >
                {paying ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay with Razorpay
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card flex items-center gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="h-9 w-9 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <div className="font-semibold text-foreground">256-bit secure payment</div>
                <div className="text-muted-foreground">Powered by Razorpay & UPI · PCI-DSS compliant</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8">
          Need help? Email <span className="font-medium text-foreground">support@brightlabs.in</span>
        </p>
      </main>
    </div>
  );
}
