import { createFileRoute, redirect } from "@tanstack/react-router";
import { Camera, Mail, MapPin, Building2, CreditCard, Save, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Profile — Pay Tracker" },
      { name: "description", content: "Manage your business profile, contact info and payment details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your business identity shown on every invoice & payment page.
            </p>
          </div>
          <Button
            onClick={() => toast.success("Profile saved", { description: "Changes are visible on new invoices." })}
            className="gradient-primary text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
          >
            <Save className="h-4 w-4 mr-2" />
            Save changes
          </Button>
        </div>

        {/* Hero card */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="h-28 gradient-primary relative">
            <div className="absolute inset-0 gradient-mesh opacity-50" />
          </div>
          <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold ring-4 ring-card shadow-pop">
                RA
              </div>
              <button
                onClick={() => toast("Upload coming soon")}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
                aria-label="Upload avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Raghav Acharya</h2>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success-soft px-2 py-0.5 rounded-full">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Founder · Brightlabs Pvt. Ltd.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Invoices", value: "248" },
                { label: "Clients", value: "36" },
                { label: "Paid", value: "92%" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-lg font-semibold">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> Personal information
          </h3>
          <Separator className="my-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" defaultValue="Raghav Acharya" />
            <Field label="Email" type="email" defaultValue="raghav@brightlabs.in" />
            <Field label="Phone" type="tel" defaultValue="+91 98765 43210" />
            <Field label="Designation" defaultValue="Founder" />
          </div>
        </section>

        {/* Business */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Business details
          </h3>
          <Separator className="my-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business name" defaultValue="Brightlabs Pvt. Ltd." />
            <Field label="GSTIN" defaultValue="29ABCDE1234F1Z5" />
            <Field label="PAN" defaultValue="ABCDE1234F" />
            <Field label="Website" defaultValue="brightlabs.in" />
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Registered address
              </Label>
              <Textarea
                defaultValue="404, Indiranagar, Bengaluru, Karnataka 560038"
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Payment details
          </h3>
          <Separator className="my-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="UPI ID" defaultValue="brightlabs@hdfc" />
            <Field label="Account holder" defaultValue="Brightlabs Pvt. Ltd." />
            <Field label="Account number" defaultValue="50100123456789" />
            <Field label="IFSC" defaultValue="HDFC0001234" />
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary-soft text-primary p-3 text-xs">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <p>These details are displayed on your public invoice payment page so clients can pay securely.</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  type = "text",
  defaultValue,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input type={type} defaultValue={defaultValue} className="h-10" />
    </div>
  );
}
