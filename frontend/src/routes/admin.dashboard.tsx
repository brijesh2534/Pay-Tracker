import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, AlertCircle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated || context.auth.user?.role !== "admin") {
      throw redirect({
        to: "/admin/login",
      });
    }
  },
  component: AdminDashboardComponent,
});

function AdminDashboardComponent() {
  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "text-blue-600" },
    { title: "Total Revenue", value: "$45,231", icon: TrendingUp, color: "text-green-600" },
    { title: "Active Subs", value: "892", icon: CreditCard, color: "text-purple-600" },
    { title: "System Alerts", value: "3", icon: AlertCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application and view system statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Administrative Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Admin updated system configuration
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
