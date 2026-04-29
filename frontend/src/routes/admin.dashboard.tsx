import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, FileText, TrendingUp, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { formatINR } from "@/lib/mock";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/CountUp";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated || (context.auth.user as any)?.role !== "ADMIN") {
      throw redirect({
        to: "/admin/login",
      });
    }
  },
  component: AdminDashboardComponent,
});

function AdminDashboardComponent() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("pay_tracker_token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(response.data.data);
      } catch (error) {
        toast.error("Failed to load admin statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading system stats...</p>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "from-blue-500 to-indigo-600", desc: "Registered SMEs" },
    { title: "Total Revenue", value: stats?.totalRevenue || 0, icon: TrendingUp, color: "from-emerald-500 to-teal-600", desc: "Confirmed payments", isCurrency: true },
    { title: "Pending Volume", value: stats?.totalPending || 0, icon: CreditCard, color: "from-amber-500 to-orange-600", desc: "Expected payments", isCurrency: true },
    { title: "Total Invoices", value: stats?.totalInvoices || 0, icon: FileText, color: "from-violet-500 to-purple-600", desc: "System-wide generated" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground font-medium">System-wide overview of Pay Tracker activity.</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((stat, i) => (
          <motion.div key={i} variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Card className="relative overflow-hidden shadow-glow border-border/50 bg-card/80 backdrop-blur-sm group h-full">
              <div className={`absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                   <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold tracking-tight">
                  <CountUp to={stat.value} format={stat.isCurrency ? formatINR : undefined} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  {stat.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-pop border-border/50 bg-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold">Recent Users</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <AnimatePresence>
                  {stats?.recentUsers?.map((u: any, idx: number) => (
                    <motion.div 
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (idx * 0.1) }}
                      className="flex items-center gap-4 p-5 hover:bg-primary-soft/30 transition-colors group"
                    >
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold text-sm uppercase ring-2 ring-primary/10 group-hover:scale-110 transition-transform shadow-sm">
                        {u.name.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{u.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate font-medium">{u.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-lg">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-pop border-border/50 bg-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
               <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-success-soft text-success flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold">Recent Invoices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {stats?.recentInvoices?.map((inv: any, idx: number) => (
                  <motion.div 
                    key={inv._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.1) }}
                    className="flex items-center gap-4 p-5 hover:bg-accent/50 transition-colors group"
                  >
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${
                      inv.status === 'PAID' ? 'bg-success-soft text-success' : 'bg-amber-50 text-amber-600'
                    }`}>
                       {inv.status === 'PAID' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate font-medium">{inv.clientName} · <span className="text-foreground">{formatINR(inv.amount)}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                       <span className={`text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full ring-1 ${
                        inv.status === 'PAID' 
                          ? 'bg-success/10 text-success ring-success/20' 
                          : 'bg-amber-100 text-amber-700 ring-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


