import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, FileText, TrendingUp, Loader2, CheckCircle2, Clock, Trash2, ExternalLink, ShieldCheck, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { formatINR } from "@/lib/mock";
import { CountUp } from "@/components/CountUp";
import { useAuth } from "../auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: ({ context }) => {
    // Check context first, then fallback to localStorage to handle refresh
    const storedUser = localStorage.getItem("pay_tracker_user");
    const user = context.auth.user || (storedUser ? JSON.parse(storedUser) : null);
    const isAuthenticated = context.auth.isAuthenticated || !!user;

    if (!isAuthenticated || user?.role !== "ADMIN") {
      throw redirect({
        to: "/admin/login",
      });
    }
  },
  component: AdminDashboardComponent,
});

function AdminDashboardComponent() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("pay_tracker_token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      toast.error("Failed to load admin statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const token = localStorage.getItem("pay_tracker_token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (error) {
      toast.error("Failed to load users list");
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user and all their invoices? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("pay_tracker_token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User deleted successfully");
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading system dashboard...</p>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "from-blue-500 to-indigo-600", desc: "Registered SMEs" },
    { title: "Total Revenue", value: stats?.totalRevenue || 0, icon: TrendingUp, color: "from-emerald-500 to-teal-600", desc: "Confirmed payments", isCurrency: true },
    { title: "Pending Volume", value: stats?.totalPending || 0, icon: CreditCard, color: "from-amber-500 to-orange-600", desc: "Expected payments", isCurrency: true },
    { title: "Total Invoices", value: stats?.totalInvoices || 0, icon: FileText, color: "from-violet-500 to-purple-600", desc: "System-wide generated" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">System-wide control and monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Admin Access Verified</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logout()}
            className="rounded-xl gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8" onValueChange={(val) => val === 'users' && fetchUsers()}>
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
          <TabsTrigger value="overview" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">System Overview</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((stat, i) => (
              <Card key={i} className="relative overflow-hidden shadow-glow border-border/50 bg-card/80 backdrop-blur-sm group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold tracking-tight">
                    <CountUp to={stat.value} format={stat.isCurrency ? formatINR : undefined} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="shadow-pop border-border/50 bg-card overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Recent SMEs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {stats?.recentUsers?.map((u: any) => (
                    <div key={u._id} className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {u.name.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0 font-medium">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-pop border-border/50 bg-card overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-success" /> Recent Invoices
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {stats?.recentInvoices?.map((inv: any) => (
                    <div key={inv._id} className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors group">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        inv.status === 'PAID' ? 'bg-success-soft text-success' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {inv.status === 'PAID' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{inv.clientName} · {formatINR(inv.amount)}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-1 rounded-full ${
                        inv.status === 'PAID' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-pop border-border/50 bg-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30 py-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> SME Network
              </CardTitle>
              <Button size="sm" variant="outline" onClick={fetchUsers} disabled={isUsersLoading} className="rounded-lg">
                {isUsersLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Refresh List
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {isUsersLoading && users.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Fetching full user directory...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Business / SME</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground text-center">Invoices</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Total Revenue</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm truncate">{u.businessName || "Unknown Business"}</div>
                              <div className="text-xs text-muted-foreground truncate">{u.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{u.email}</div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-sm">
                          {u.invoiceCount}
                        </TableCell>
                        <TableCell className="text-right font-black text-sm tabular-nums text-success">
                          {formatINR(u.revenue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-lg">
                               <ExternalLink className="h-4 w-4" />
                             </Button>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteUser(u._id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboardComponent;
