import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, MoreHorizontal, ShoppingCart, Package, Truck, CheckCircle2,
  XCircle, ArrowUpDown, Filter, CalendarIcon, DollarSign, Plus, ChevronDown,
} from "lucide-react";
import {
  useOrders, useOrderMutations, defaultOrderFilters,
  type OrderFilters, type Order, type OrderStatus, type FulfillmentStatus,
} from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  completed: "bg-green-500/15 text-green-700 border-green-500/30",
  canceled: "bg-muted text-muted-foreground border-border",
  refunded: "bg-red-500/15 text-red-700 border-red-500/30",
  partially_refunded: "bg-orange-500/15 text-orange-700 border-orange-500/30",
};

const paymentStyle: Record<string, string> = {
  unpaid: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  paid: "bg-green-500/15 text-green-700 border-green-500/30",
  refunded: "bg-red-500/15 text-red-700 border-red-500/30",
  partially_refunded: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const fulfillmentStyle: Record<string, string> = {
  unfulfilled: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  packed: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  shipped: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  delivered: "bg-green-500/15 text-green-700 border-green-500/30",
  returned: "bg-red-500/15 text-red-700 border-red-500/30",
};

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const PAGE_SIZE = 25;

const OrdersPage = () => {
  const [filters, setFilters] = useState<OrderFilters>(defaultOrderFilters);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(0);
  const { data: orders = [], isLoading } = useOrders(filters);
  const { bulkUpdateOrders } = useOrderMutations();

  const pagedOrders = orders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    setSelected(selected.size === pagedOrders.length ? new Set() : new Set(pagedOrders.map((o) => o.id)));
  };
  const bulkAction = (data: Partial<Order>) => {
    bulkUpdateOrders.mutate({ ids: Array.from(selected), data });
    setSelected(new Set());
  };

  const activeFilterCount = [
    filters.date_from, filters.date_to, filters.min_total,
    filters.has_discount !== "all" ? "y" : "",
    filters.has_loyalty !== "all" ? "y" : "",
    filters.has_referral !== "all" ? "y" : "",
  ].filter(Boolean).length;

  const handleSort = (col: "created_at" | "total" | "order_number") => {
    setFilters((f) => ({
      ...f,
      sort_by: col,
      sort_dir: f.sort_by === col && f.sort_dir === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ col }: { col: string }) => (
    filters.sort_by === col ? (
      <ArrowUpDown size={12} className="ml-1 inline text-primary" />
    ) : null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1 font-body">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/orders/new">
            <Plus size={16} /> Create Order
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order #, name, or email..."
              value={filters.search}
              onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select value={filters.status} onValueChange={(v: any) => { setFilters({ ...filters, status: v }); setPage(0); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Order Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Order Status</SelectItem>
              {(["pending","confirmed","processing","completed","canceled","refunded","partially_refunded"] as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.payment_status} onValueChange={(v: any) => { setFilters({ ...filters, payment_status: v }); setPage(0); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Payment Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              {(["unpaid","paid","refunded","partially_refunded","failed"] as const).map((s) => (
                <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.fulfillment_status} onValueChange={(v: any) => { setFilters({ ...filters, fulfillment_status: v }); setPage(0); }}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Fulfillment Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fulfillment</SelectItem>
              {(["unfulfilled","packed","shipped","delivered","returned"] as FulfillmentStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced filters toggle */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Filter size={14} /> Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-[10px] ml-1 px-1.5">{activeFilterCount}</Badge>
              )}
              <ChevronDown size={12} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1"><CalendarIcon size={12} /> Date From</label>
                <Input type="date" value={filters.date_from} onChange={(e) => { setFilters({ ...filters, date_from: e.target.value }); setPage(0); }} className="w-[160px]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1"><CalendarIcon size={12} /> Date To</label>
                <Input type="date" value={filters.date_to} onChange={(e) => { setFilters({ ...filters, date_to: e.target.value }); setPage(0); }} className="w-[160px]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1"><DollarSign size={12} /> Min Total</label>
                <Input type="number" step="0.01" min="0" placeholder="e.g. 50" value={filters.min_total} onChange={(e) => { setFilters({ ...filters, min_total: e.target.value }); setPage(0); }} className="w-[120px]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Discounted</label>
                <Select value={filters.has_discount} onValueChange={(v: any) => { setFilters({ ...filters, has_discount: v }); setPage(0); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="yes">Has Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Loyalty Used</label>
                <Select value={filters.has_loyalty} onValueChange={(v: any) => { setFilters({ ...filters, has_loyalty: v }); setPage(0); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="yes">Points Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Referral Used</label>
                <Select value={filters.has_referral} onValueChange={(v: any) => { setFilters({ ...filters, has_referral: v }); setPage(0); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="yes">Referral Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setFilters(defaultOrderFilters); setPage(0); }} className="text-xs text-muted-foreground">
                Clear all filters
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
            <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ status: "confirmed" as any })} className="gap-1.5">
              <CheckCircle2 size={14} /> Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ status: "processing" as any })} className="gap-1.5">
              <Package size={14} /> Processing
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ fulfillment_status: "shipped" as any })} className="gap-1.5">
              <Truck size={14} /> Mark Shipped
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction({ status: "canceled" as any })} className="gap-1.5 text-destructive">
              <XCircle size={14} /> Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingCart size={40} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground font-body">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={selected.size === pagedOrders.length && pagedOrders.length > 0} onCheckedChange={toggleAll} /></TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("order_number")}>Order <SortIcon col="order_number" /></TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("created_at")}>Date <SortIcon col="created_at" /></TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("total")}>Total <SortIcon col="total" /></TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead>Rewards</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedOrders.map((o) => (
                    <TableRow key={o.id} className={selected.has(o.id) ? "bg-muted/50" : ""}>
                      <TableCell><Checkbox checked={selected.has(o.id)} onCheckedChange={() => toggleSelect(o.id)} /></TableCell>
                      <TableCell>
                        <Link to={`/admin/orders/${o.id}`} className="font-mono text-sm font-medium text-primary hover:underline">{o.order_number}</Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">{o.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={`text-xs capitalize ${statusStyle[o.status]}`}>{formatLabel(o.status)}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={`text-xs capitalize ${paymentStyle[o.payment_status]}`}>{formatLabel(o.payment_status)}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={`text-xs capitalize ${fulfillmentStyle[o.fulfillment_status]}`}>{formatLabel(o.fulfillment_status)}</Badge></TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ${Number(o.total).toFixed(2)}
                        {Number(o.discount_amount) > 0 && <span className="text-xs text-muted-foreground block">-${Number(o.discount_amount).toFixed(2)}</span>}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{o.item_count}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {o.loyalty_points_redeemed > 0 && <Badge variant="secondary" className="text-[10px] px-1.5">🎯 Points</Badge>}
                          {o.referral_reward_used && <Badge variant="secondary" className="text-[10px] px-1.5">🤝 Referral</Badge>}
                          {o.coupon_code && <Badge variant="secondary" className="text-[10px] px-1.5">🏷️ Coupon</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={16} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link to={`/admin/orders/${o.id}`}>View Details</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => bulkUpdateOrders.mutate({ ids: [o.id], data: { status: "canceled" as any } })} className="text-destructive">Cancel Order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, orders.length)} of {orders.length}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
