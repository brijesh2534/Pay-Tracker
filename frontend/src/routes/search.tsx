import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Search, FileText, Download, Upload, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/mock";
import { StatusBadge } from "@/components/StatusBadge";
import QRCode from "qrcode";

export const Route = createFileRoute("/search")({
  component: InvoiceSearchPage,
});

function InvoiceSearchPage() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [email, setEmail] = useState("");
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInvoice(null);
    setQrCodeUrl("");
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices/search`, {
        params: { invoiceNumber, email }
      });
      setInvoice(response.data.data);
      
      // Generate QR Code if invoice found
      const qrUrl = await QRCode.toDataURL(window.location.origin + "/pay/" + response.data.data._id);
      setQrCodeUrl(qrUrl);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invoice not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !invoice) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("proof", e.target.files[0]);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/invoices/${invoice._id}/proof`, formData);
      toast.success("Payment proof uploaded successfully");
      // Refresh invoice data
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices/search`, {
        params: { invoiceNumber, email }
      });
      setInvoice(response.data.data);
    } catch (error) {
      toast.error("Failed to upload proof");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-4">
            <div className="h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center">P</div>
            Pay Tracker
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Find your invoice</h1>
          <p className="text-muted-foreground text-sm">Enter your details to view, pay, or download your invoice.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice ID</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2026-XXXX"
                    className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Email</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
            <button
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl shadow-glow hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search Invoice"}
            </button>
          </form>
        </div>

        {invoice && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-pop animate-fade-up">
            <div className="bg-primary/5 p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Invoice Found</div>
                <h2 className="text-xl font-bold">{invoice.invoiceNumber}</h2>
              </div>
              <StatusBadge status={invoice.status.toLowerCase() as any} />
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Billed To</div>
                  <div className="font-bold text-lg">{invoice.clientName}</div>
                  <div className="text-sm text-muted-foreground">{invoice.clientEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount Due</div>
                  <div className="font-extrabold text-2xl text-foreground">{formatINR(invoice.amount)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Due {new Date(invoice.dueDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-top border-border">
                <Link
                  to="/pay/$id"
                  params={{ id: invoice._id }}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-center shadow-glow hover:opacity-90 transition-opacity"
                >
                  Pay Now
                </Link>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 border border-border bg-muted/30 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment QR</div>
                    <div className="bg-white p-3 rounded-2xl inline-block border border-border shadow-sm">
                      {qrCodeUrl && <img src={qrCodeUrl} alt="Payment QR" className="h-32 w-32" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px]">
                      Scan this code to quickly access the payment gateway on your mobile device.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment Proof</div>
                    {invoice.paymentProof ? (
                      <div className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                        <img src={invoice.paymentProof} alt="Payment Proof" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={invoice.paymentProof} target="_blank" rel="noreferrer" className="text-white text-xs font-bold bg-primary/80 px-3 py-1.5 rounded-lg">View Full</a>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <div className="text-xs font-bold">Upload Screenshot</div>
                            <div className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</div>
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
