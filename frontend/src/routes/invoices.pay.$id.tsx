import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { formatINR } from "@/lib/mock";
import { ShieldCheck, Copy, Check, Loader2, ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invoices/pay/$id")({
  loader: async ({ params }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices/${params.id}`);
      return response.data.data;
    } catch (error) {
      throw notFound();
    }
  },
  component: DashboardPay,
});

function DashboardPay() {
  const inv = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState(inv.status);

  const tax = Math.round(inv.amount * 0.18);
  const total = inv.amount + tax;
  const upiId = inv.sme?.upiId || "merchant@upi";
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(inv.sme?.businessName || inv.sme?.name)}&am=${total}&cu=INR&tn=${encodeURIComponent(`Invoice ${inv.invoiceNumber}`)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/status`, {
        status: "PAID"
      });
      setStatus("PAID");
      toast.success("Payment confirmed!");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setPaying(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/invoices/received" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to received invoices
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => window.print()}>
               <Download className="h-4 w-4" />
               Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl bg-card border border-border shadow-card p-6 lg:p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                    {(inv.sme?.businessName || "B")[0]}
                  </div>
                  <div>
                    <div className="text-lg font-bold tracking-tight">{inv.sme?.businessName || "Business Merchant"}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{inv.sme?.name}</div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Invoice Record</div>
                   <div className="font-mono text-xl font-black">{inv.invoiceNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-6 border-y border-border/50">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Sender Information</div>
                  <div className="text-sm font-bold text-foreground">{inv.sme?.businessName}</div>
                  <div className="text-xs text-muted-foreground">{inv.sme?.email}</div>
                  <div className="text-xs text-muted-foreground font-mono">UPI: {upiId}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">My Information</div>
                  <div className="text-sm font-bold text-foreground">{inv.clientName}</div>
                  <div className="text-xs text-muted-foreground">{inv.clientEmail}</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase mt-2">
                    Due {new Date(inv.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="py-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="tabular-nums font-bold">{formatINR(inv.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Estimated Taxes (18% GST)</span>
                  <span className="tabular-nums font-bold">{formatINR(tax)}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-dashed border-border/60 flex justify-between items-center">
                  <span className="text-base font-black uppercase tracking-tight">Total Amount Due</span>
                  <span className="text-3xl font-black tabular-nums text-primary">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Secure Payment Protection</div>
                <div className="text-xs text-muted-foreground leading-snug">This invoice is verified. Your payment is protected by 256-bit encryption and directly reaches the merchant.</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-card border border-border shadow-pop p-6">
              <div className="text-center mb-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Scan & Pay</div>
                <h3 className="text-base font-bold">Universal UPI Payment</h3>
              </div>

              <div className="relative mx-auto w-56 h-56 rounded-3xl bg-white p-4 shadow-card border border-border flex items-center justify-center overflow-hidden">
                {status === "PAID" ? (
                  <div className="flex flex-col items-center gap-3 text-success animate-in zoom-in duration-500">
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                       <Check className="h-10 w-10" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Fully Paid</span>
                  </div>
                ) : (
                  <img src={qrUrl} alt="Payment QR" className="w-full h-full object-contain" />
                )}
              </div>

              <div className="mt-8 space-y-3">
                <Button 
                   variant="secondary" 
                   className="w-full rounded-xl h-12 justify-between px-4" 
                   onClick={copy}
                   disabled={status === "PAID"}
                >
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-bold opacity-60">Merchant UPI ID</div>
                    <div className="text-xs font-mono font-bold truncate max-w-[150px]">{upiId}</div>
                  </div>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>

                {inv.paymentLink && status !== "PAID" && (
                  <Button 
                    className="w-full rounded-xl h-12 bg-white text-primary border-2 border-primary hover:bg-primary/5 font-bold shadow-none"
                    onClick={() => window.open(inv.paymentLink, "_blank")}
                  >
                    Pay via Razorpay
                  </Button>
                )}

                <Button 
                  className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-black shadow-glow hover:scale-[1.01] active:scale-[0.98] transition-all"
                  disabled={paying || status === "PAID"}
                  onClick={handlePay}
                >
                  {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : status === "PAID" ? "Transaction Complete" : "Confirm Payment"}
                </Button>
              </div>

              <p className="mt-6 text-[10px] text-center text-muted-foreground leading-relaxed font-medium">
                Payments are processed instantly. If you face issues, please contact the merchant directly at {inv.sme?.email}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
