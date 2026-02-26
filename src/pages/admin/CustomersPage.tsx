import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Users, ArrowUpDown, Crown, Star, Gift, UserPlus,
  ShoppingCart, TrendingUp, MoreHorizontal,
} from "lucide-react";
import {
  useCustomers, defaultCustomerFilters, type CustomerFilters, type CustomerWithStats,
} from "@/hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 25;

const CustomersPage = () => {
  const [filters, setFilters] = useState<CustomerFilters>(defaultCustomerFilters);
  const [page, setPage] = useState(0);
  const { data: customers = [], isLoading } = useCustomers(filters);

  const paged = customers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));

  const handleSort = (col: CustomerFilters["sort_by"]) => {
    setFilters((f) => ({
      ...f,
      sort_by: col,
      sort_dir: f.sort_by === col && f.sort_dir === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ col }: { col: string }) =>
    filters.sort_by === col ? <ArrowUpDown size={12} className="ml-1 inline text-primary" /> : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1 font-body">
          {customers.length} customer{customers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={filters.search}
              onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select value={filters.status} onValueChange={(v: any) => { setFilters({ ...filters, status: v }); setPage(0); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Customers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="vip">VIP Customers</SelectItem>
              <SelectItem value="new">New (30 days)</SelectItem>
              <SelectItem value="returning">Returning</SelectItem>
              <SelectItem value="inactive">Inactive (90+ days)</SelectItem>
              <SelectItem value="no_orders">No Orders</SelectItem>
              <SelectItem value="has_loyalty">Has Chamoy Points</SelectItem>
              <SelectItem value="has_referrals">Has Referrals</SelectItem>
              <SelectItem value="high_value">High Value ($200+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users size={40} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground font-body">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("display_name")}>
                      Customer <SortIcon col="display_name" />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("total_orders")}>
                      Orders <SortIcon col="total_orders" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("total_spent")}>
                      Lifetime Value <SortIcon col="total_spent" />
                    </TableHead>
                    <TableHead className="text-right">Avg Order</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead className="text-right">Chamoy Pts</TableHead>
                    <TableHead className="text-right">Referrals</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort("created_at")}>
                      Joined <SortIcon col="created_at" />
                    </TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link to={`/admin/customers/${c.user_id}`} className="hover:underline">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {(c.display_name || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                {c.display_name || "Unnamed"}
                                {c.is_vip && <Crown size={13} className="text-yellow-500" />}
                              </p>
                              {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {c.is_vip && <Badge variant="outline" className="text-[10px] bg-yellow-500/15 text-yellow-700 border-yellow-500/30">VIP</Badge>}
                          {c.total_orders > 1 && <Badge variant="secondary" className="text-[10px]">Returning</Badge>}
                          {c.total_orders === 0 && <Badge variant="outline" className="text-[10px] text-muted-foreground">No orders</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{c.total_orders}</TableCell>
                      <TableCell className="text-right text-sm font-medium">${c.total_spent.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {c.total_orders > 0 ? `$${c.avg_order_value.toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {c.last_order_date
                          ? new Date(c.last_order_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {c.loyalty_balance > 0 ? (
                          <span className="font-medium">{c.loyalty_balance.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {c.referral_count > 0 ? (
                          <span className="font-medium">{c.referral_count}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={16} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link to={`/admin/customers/${c.user_id}`}>View Profile</Link></DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, customers.length)} of {customers.length}
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

export default CustomersPage;
