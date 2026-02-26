import { useState } from "react";
import { Link } from "react-router-dom";
import { Gift, TrendingUp, TrendingDown, Coins, DollarSign, Search, Filter, ChevronDown, ChevronUp, Info, Users, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoyaltyStats,
  useLoyaltyActivity,
  defaultLoyaltyFilters,
  type LoyaltyFilters,
  type LoyaltyEntryWithCustomer,
} from "@/hooks/useLoyalty";
import { format } from "date-fns";

const PAGE_SIZE = 25;

const typeLabels: Record<string, string> = {
  earned: "Earned",
  redeemed: "Redeemed",
  manual_add: "Manual Add",
  manual_subtract: "Manual Subtract",
  reversal: "Reversal",
};

const typeStyles: Record<string, string> = {
  earned: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  redeemed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  manual_add: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  manual_subtract: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  reversal: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function StatCard({ title, value, sub, icon: Icon, accent }: { title: string; value: string; sub?: string; icon: any; accent?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-display font-bold mt-1 ${accent || "text-foreground"}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
            <Icon size={22} className="text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const LoyaltyPage = () => {
  const [filters, setFilters] = useState<LoyaltyFilters>(defaultLoyaltyFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(0);

  const { data: stats, isLoading: statsLoading } = useLoyaltyStats();
  const { data: activity, isLoading: activityLoading } = useLoyaltyActivity(filters);

  const paged = (activity || []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil((activity || []).length / PAGE_SIZE);

  const handleSort = (col: "created_at" | "points") => {
    setFilters((f) => ({
      ...f,
      sort_by: col,
      sort_dir: f.sort_by === col && f.sort_dir === "desc" ? "asc" : "desc",
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters(defaultLoyaltyFilters);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Chamoy Points</h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">
          Manage the loyalty points program, view activity, and audit adjustments.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="rules">Program Rules</TabsTrigger>
        </TabsList>

        {/* ─── OVERVIEW TAB ─── */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Points Issued"
              value={stats ? stats.totalIssued.toLocaleString() : "—"}
              icon={TrendingUp}
            />
            <StatCard
              title="Total Points Redeemed"
              value={stats ? stats.totalRedeemed.toLocaleString() : "—"}
              icon={TrendingDown}
            />
            <StatCard
              title="Active Points Outstanding"
              value={stats ? stats.totalActive.toLocaleString() : "—"}
              sub={stats ? `$${stats.dollarValue.toFixed(2)} liability` : undefined}
              icon={Coins}
              accent="text-primary"
            />
            <StatCard
              title="Total Transactions"
              value={stats ? stats.totalTransactions.toLocaleString() : "—"}
              icon={Gift}
            />
          </div>

          {/* Two-column: Recent + Top Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {stats?.recentActivity.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <Badge className={`text-[10px] ${typeStyles[e.type] || "bg-muted text-muted-foreground"}`}>
                        {typeLabels[e.type] || e.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{e.description || "—"}</p>
                    </div>
                    <div className="text-right ml-3">
                      <span className={`text-sm font-semibold ${e.points >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {e.points >= 0 ? "+" : ""}{e.points}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(e.created_at), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                ))}
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Top Loyalty Customers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Loyalty Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.topCustomers && stats.topCustomers.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topCustomers.map((c, i) => (
                      <Link
                        key={c.customer_id}
                        to={`/admin/customers/${c.customer_id}`}
                        className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium truncate">{c.customer_id.slice(0, 8)}...</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{c.balance.toLocaleString()} pts</span>
                          <p className="text-[10px] text-muted-foreground">${(c.balance / 100).toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No loyalty data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── ACTIVITY LOG TAB ─── */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search customer, email, or note..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(0); }}
                />
              </div>
            </div>
            <Select
              value={filters.type}
              onValueChange={(v) => { setFilters((f) => ({ ...f, type: v as any })); setPage(0); }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="manual_add">Manual Add</SelectItem>
                <SelectItem value="manual_subtract">Manual Subtract</SelectItem>
                <SelectItem value="reversal">Reversal</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter size={14} className="mr-1" />
              Advanced
              {showAdvanced ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
            </Button>
            {(filters.search || filters.type !== "all" || filters.date_from || filters.date_to || filters.high_value) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear all</Button>
            )}
          </div>

          {showAdvanced && (
            <div className="flex flex-wrap gap-3 items-end bg-muted/50 p-4 rounded-lg">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <Input
                  type="date"
                  className="w-[150px]"
                  value={filters.date_from}
                  onChange={(e) => { setFilters((f) => ({ ...f, date_from: e.target.value })); setPage(0); }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <Input
                  type="date"
                  className="w-[150px]"
                  value={filters.date_to}
                  onChange={(e) => { setFilters((f) => ({ ...f, date_to: e.target.value })); setPage(0); }}
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.high_value}
                  onChange={(e) => { setFilters((f) => ({ ...f, high_value: e.target.checked })); setPage(0); }}
                  className="rounded"
                />
                High-value (≥500 pts)
              </label>
            </div>
          )}

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("points")}>
                    <span className="flex items-center gap-1">
                      Points
                      <ArrowUpDown size={14} />
                    </span>
                  </TableHead>
                  <TableHead>$ Value</TableHead>
                  <TableHead>Source / Note</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("created_at")}>
                    <span className="flex items-center gap-1">
                      Date
                      <ArrowUpDown size={14} />
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : paged.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No loyalty activity found</TableCell></TableRow>
                ) : (
                  paged.map((e) => (
                    <ActivityRow key={e.id} entry={e} />
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {(activity || []).length} entries · Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── PROGRAM RULES TAB ─── */}
        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info size={18} className="text-primary" />
                Current Chamoy Points Program Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RuleCard label="Earning Rate" value="10 points per $1 spent" />
                <RuleCard label="Redemption Rate" value="100 points = $1 off" />
                <RuleCard label="Partial Redemption" value="Allowed" />
                <RuleCard label="Refund Behavior" value="Points reversed on refund/cancel" />
                <RuleCard label="Discount Stacking" value="Admin configurable per order" />
                <RuleCard label="Point Expiration" value="Not currently enabled" />
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How it works</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Customers earn <strong>10 Chamoy Points</strong> for every <strong>$1</strong> spent on completed orders.</li>
                  <li>Points can be redeemed at checkout: <strong>100 points = $1 discount</strong>.</li>
                  <li>Partial redemption is supported — customers choose how many points to use.</li>
                  <li>If an order is refunded or canceled, earned points are automatically reversed.</li>
                  <li>Admins can manually add or subtract points with a required reason/note.</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                To edit program rules (earning rate, redemption rate, stacking behavior), go to{" "}
                <Link to="/admin/loyalty-rules" className="text-primary underline">Super Admin → Loyalty Rules</Link>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function RuleCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

function ActivityRow({ entry: e }: { entry: LoyaltyEntryWithCustomer }) {
  const isManual = e.type === "manual_add" || e.type === "manual_subtract";
  return (
    <TableRow>
      <TableCell>
        <Link to={`/admin/customers/${e.customer_id}`} className="hover:underline">
          <p className="text-sm font-medium">{e.customer_name}</p>
          <p className="text-xs text-muted-foreground">{e.customer_email}</p>
        </Link>
      </TableCell>
      <TableCell>
        <Badge className={`text-[10px] ${typeStyles[e.type] || "bg-muted text-muted-foreground"}`}>
          {typeLabels[e.type] || e.type}
          {isManual && " 🔧"}
        </Badge>
      </TableCell>
      <TableCell>
        <span className={`font-semibold ${e.points >= 0 ? "text-green-600" : "text-red-600"}`}>
          {e.points >= 0 ? "+" : ""}{e.points}
        </span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        ${(Math.abs(e.points) / 100).toFixed(2)}
      </TableCell>
      <TableCell className="max-w-[200px]">
        <p className="text-xs truncate">{e.description || "—"}</p>
      </TableCell>
      <TableCell>
        {e.order_id ? (
          <Link to={`/admin/orders/${e.order_id}`} className="text-xs text-primary hover:underline">
            View order
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(e.created_at), "MMM d, yyyy h:mm a")}
      </TableCell>
    </TableRow>
  );
}

export default LoyaltyPage;
