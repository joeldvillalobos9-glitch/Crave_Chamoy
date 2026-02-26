import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Crown, Gift, UserPlus, ShoppingCart, Plus, Minus,
  Tag, Clock, DollarSign, TrendingUp, Edit2, Save, AlertTriangle,
  Zap, Heart, Repeat, Ticket,
} from "lucide-react";
import {
  useCustomerProfile, useCustomerOrders, useCustomerLoyalty,
  useCustomerReferrals, useCustomerActivity, useCustomerMutations,
} from "@/hooks/useCustomers";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  completed: "bg-green-500/15 text-green-700 border-green-500/30",
  canceled: "bg-muted text-muted-foreground border-border",
  refunded: "bg-red-500/15 text-red-700 border-red-500/30",
  partially_refunded: "bg-orange-500/15 text-orange-700 border-orange-500/30",
};

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCustomerProfile(id);
  const { data: orders = [] } = useCustomerOrders(id);
  const { data: loyalty = [] } = useCustomerLoyalty(id);
  const { data: referrals = [] } = useCustomerReferrals(id);
  const { data: activity = [] } = useCustomerActivity(id);
  const { updateProfile, addActivity, addLoyaltyEntry } = useCustomerMutations();

  const [tagInput, setTagInput] = useState("");
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  if (profileLoading) {
    return <div className="p-12 text-center text-muted-foreground">Loading customer...</div>;
  }
  if (!profile) {
    return <div className="p-12 text-center text-muted-foreground">Customer not found</div>;
  }

  const totalSpent = orders.reduce((s: number, o: any) => s + Number(o.total), 0);
  const avgOrder = orders.length > 0 ? totalSpent / orders.length : 0;
  const loyaltyBalance = loyalty.length > 0 ? loyalty[0].balance_after : 0;
  const completedReferrals = referrals.filter((r: any) => r.status === "completed").length;
  const pendingReferrals = referrals.filter((r: any) => r.status === "pending").length;
  const customerEmail = orders.length > 0 ? orders[0].customer_email : "";

  // Business insight signals
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
  const isNew = profile.created_at >= thirtyDaysAgo;
  const isReturning = orders.length > 1;
  const lastOrderDate = orders.length > 0 ? orders[0].created_at : null;
  const isInactive = !lastOrderDate || lastOrderDate < ninetyDaysAgo;
  const isHighValue = totalSpent >= 200;
  const isReferralActive = completedReferrals > 0;

  // Discount usage from orders
  const couponsUsed = orders.filter((o: any) => o.coupon_code).map((o: any) => o.coupon_code);
  const signupDiscountUsed = orders.some((o: any) => o.signup_discount_used);
  const loyaltyOrdersCount = orders.filter((o: any) => Number(o.loyalty_points_redeemed) > 0).length;
  const referralOrdersCount = orders.filter((o: any) => o.referral_reward_used).length;

  const toggleVip = () => {
    updateProfile.mutate({ userId: profile.user_id, data: { is_vip: !profile.is_vip } });
    addActivity.mutate({
      customer_id: profile.user_id,
      actor_id: currentUser?.id,
      actor_name: currentUser?.email,
      action: profile.is_vip ? "vip_removed" : "vip_added",
      details: profile.is_vip ? "VIP status removed" : "VIP status added",
    });
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTags = [...(profile.tags || []), tagInput.trim()];
    updateProfile.mutate({ userId: profile.user_id, data: { tags: newTags } });
    addActivity.mutate({
      customer_id: profile.user_id,
      actor_id: currentUser?.id,
      actor_name: currentUser?.email,
      action: "tag_added",
      details: `Tag added: ${tagInput.trim()}`,
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const newTags = (profile.tags || []).filter((t: string) => t !== tag);
    updateProfile.mutate({ userId: profile.user_id, data: { tags: newTags } });
  };

  const saveInternalNotes = () => {
    updateProfile.mutate({ userId: profile.user_id, data: { internal_notes: internalNotes } });
    addActivity.mutate({
      customer_id: profile.user_id,
      actor_id: currentUser?.id,
      actor_name: currentUser?.email,
      action: "notes_updated",
      details: "Internal notes updated",
    });
    setEditingNotes(false);
  };

  const adjustPoints = (type: "manual_add" | "manual_subtract") => {
    const pts = parseInt(pointsAmount);
    if (!pts || pts <= 0) return;
    const signed = type === "manual_add" ? pts : -pts;
    const newBalance = loyaltyBalance + signed;
    addLoyaltyEntry.mutate({
      customer_id: profile.user_id,
      points: signed,
      balance_after: Math.max(0, newBalance),
      type,
      description: pointsReason || `Manual ${type === "manual_add" ? "addition" : "subtraction"}`,
      actor_id: currentUser?.id,
    });
    addActivity.mutate({
      customer_id: profile.user_id,
      actor_id: currentUser?.id,
      actor_name: currentUser?.email,
      action: type,
      details: `${type === "manual_add" ? "Added" : "Subtracted"} ${pts} points. Reason: ${pointsReason || "N/A"}`,
    });
    setPointsAmount("");
    setPointsReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-1">
          <Link to="/admin/customers"><ArrowLeft size={18} /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {profile.display_name || "Unnamed Customer"}
            </h1>
            {profile.is_vip && <Crown size={18} className="text-secondary" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5 flex-wrap">
            {customerEmail && <span>{customerEmail}</span>}
            {customerEmail && profile.phone && <span>·</span>}
            {profile.phone && <span>{profile.phone}</span>}
            <span>·</span>
            <span>Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          </div>
          {/* Insight badges */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {profile.is_vip && <Badge variant="outline" className="text-[10px] bg-secondary/15 text-secondary border-secondary/30 gap-1"><Crown size={10} /> VIP</Badge>}
            {isNew && <Badge variant="outline" className="text-[10px] bg-blue-500/15 text-blue-700 border-blue-500/30 gap-1"><Zap size={10} /> New Customer</Badge>}
            {isReturning && <Badge variant="outline" className="text-[10px] bg-green-500/15 text-green-700 border-green-500/30 gap-1"><Repeat size={10} /> Returning</Badge>}
            {isHighValue && <Badge variant="outline" className="text-[10px] bg-purple-500/15 text-purple-700 border-purple-500/30 gap-1"><DollarSign size={10} /> High Value</Badge>}
            {isReferralActive && <Badge variant="outline" className="text-[10px] bg-accent/15 text-accent border-accent/30 gap-1"><Heart size={10} /> Referral Active</Badge>}
            {isInactive && !isNew && <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border gap-1"><AlertTriangle size={10} /> Inactive</Badge>}
          </div>
        </div>
        <Button variant={profile.is_vip ? "outline" : "default"} size="sm" onClick={toggleVip} className="gap-1.5 shrink-0">
          <Crown size={14} /> {profile.is_vip ? "Remove VIP" : "Mark VIP"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart size={20} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign size={20} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Lifetime Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp size={20} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">${avgOrder.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Avg Order</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift size={20} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">{loyaltyBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Chamoy Points</p>
            <p className="text-[10px] text-muted-foreground">(${(loyaltyBalance / 100).toFixed(2)} value)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserPlus size={20} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">{completedReferrals}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
            {pendingReferrals > 0 && <p className="text-[10px] text-muted-foreground">{pendingReferrals} pending</p>}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="loyalty">Chamoy Points</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="profile">Profile & Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Order History</CardTitle>
              {orders.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Last order: {new Date(orders[0].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No orders yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead>Rewards</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Link to={`/admin/orders/${o.id}`} className="text-primary hover:underline font-mono text-sm">{o.order_number}</Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusStyle[o.status] || ""}`}>{formatLabel(o.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">${Number(o.total).toFixed(2)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{o.item_count}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {Number(o.loyalty_points_redeemed) > 0 && <Badge variant="secondary" className="text-[10px]">🎯 Points</Badge>}
                            {o.referral_reward_used && <Badge variant="secondary" className="text-[10px]">🤝 Referral</Badge>}
                            {o.coupon_code && <Badge variant="secondary" className="text-[10px]">🏷️ {o.coupon_code}</Badge>}
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

        {/* Loyalty Tab */}
        <TabsContent value="loyalty">
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Chamoy Points Balance</CardTitle>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1"><Plus size={14} /> Add Points</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Chamoy Points</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <Input type="number" placeholder="Points amount" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} />
                        <Input placeholder="Reason (optional)" value={pointsReason} onChange={(e) => setPointsReason(e.target.value)} />
                      </div>
                      <DialogFooter>
                        <Button onClick={() => adjustPoints("manual_add")} disabled={!pointsAmount}>Add Points</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1"><Minus size={14} /> Subtract</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Subtract Chamoy Points</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <Input type="number" placeholder="Points amount" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} />
                        <Input placeholder="Reason (optional)" value={pointsReason} onChange={(e) => setPointsReason(e.target.value)} />
                      </div>
                      <DialogFooter>
                        <Button variant="destructive" onClick={() => adjustPoints("manual_subtract")} disabled={!pointsAmount}>Subtract Points</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-foreground">{loyaltyBalance.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm">points (${(loyaltyBalance / 100).toFixed(2)} value)</span>
                </div>
                {loyalty.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No points history.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loyalty.map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs capitalize">{formatLabel(l.type)}</Badge>
                          </TableCell>
                          <TableCell className={`text-right text-sm font-medium ${l.points >= 0 ? "text-green-600" : "text-destructive"}`}>
                            {l.points >= 0 ? "+" : ""}{l.points}
                          </TableCell>
                          <TableCell className="text-right text-sm">{l.balance_after}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{l.description || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Referral Activity</CardTitle>
              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                <span>{completedReferrals} completed</span>
                <span>{pendingReferrals} pending</span>
                <span>${(completedReferrals * 10).toFixed(2)} earned</span>
              </div>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-muted-foreground text-sm">No referral activity.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Referred</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Reward</TableHead>
                      <TableHead>Rewarded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-sm">{r.referred_email || "—"}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">{r.referral_code}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs capitalize ${
                            r.status === "completed" ? "bg-green-500/15 text-green-700 border-green-500/30" :
                            r.status === "reversed" ? "bg-destructive/15 text-destructive border-destructive/30" :
                            "bg-yellow-500/15 text-yellow-700 border-yellow-500/30"
                          }`}>{formatLabel(r.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">${Number(r.reward_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{r.referrer_rewarded ? "✅" : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Discount Usage Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">First-Order Discount</span>
                  </div>
                  <Badge variant={signupDiscountUsed ? "secondary" : "outline"} className="text-xs">
                    {signupDiscountUsed ? "Used" : "Not Used"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Gift size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Orders with Loyalty Points</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{loyaltyOrdersCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Orders with Referral Reward</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{referralOrdersCount}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Coupons Used</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{couponsUsed.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Coupon History</CardTitle></CardHeader>
              <CardContent>
                {couponsUsed.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No coupons used.</p>
                ) : (
                  <div className="space-y-2">
                    {[...new Set(couponsUsed)].map((code) => {
                      const count = couponsUsed.filter((c: string) => c === code).length;
                      return (
                        <div key={code} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className="text-sm font-mono text-foreground">{code}</span>
                          <Badge variant="secondary" className="text-xs">{count}× used</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile & Notes Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Name</label>
                    <p className="text-sm text-foreground">{profile.display_name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Email</label>
                    <p className="text-sm text-foreground">{customerEmail || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Phone</label>
                    <p className="text-sm text-foreground">{profile.phone || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Account Created</label>
                    <p className="text-sm text-foreground">
                      {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {profile.shipping_address && (
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Shipping Address</label>
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {typeof profile.shipping_address === "object"
                        ? Object.values(profile.shipping_address).filter(Boolean).join(", ")
                        : String(profile.shipping_address)}
                    </p>
                  </div>
                )}
                {profile.billing_address && (
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Billing Address</label>
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {typeof profile.billing_address === "object"
                        ? Object.values(profile.billing_address).filter(Boolean).join(", ")
                        : String(profile.billing_address)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Tags & Labels</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {profile.is_vip && <Badge variant="outline" className="bg-secondary/15 text-secondary border-secondary/30">VIP</Badge>}
                  {(profile.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
                    </Badge>
                  ))}
                  {!profile.is_vip && (profile.tags || []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags yet.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                    <Tag size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Internal Notes</CardTitle>
                {!editingNotes ? (
                  <Button variant="ghost" size="sm" onClick={() => { setInternalNotes(profile.internal_notes || ""); setEditingNotes(true); }}>
                    <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                ) : (
                  <Button size="sm" onClick={saveInternalNotes} className="gap-1">
                    <Save size={14} /> Save
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editingNotes ? (
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={4}
                    placeholder="Add internal notes about this customer..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {profile.internal_notes || "No notes yet."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle className="text-lg">Activity History</CardTitle></CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-muted-foreground text-sm">No activity recorded.</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((a: any) => (
                    <div key={a.id} className="flex gap-3 items-start border-b border-border pb-3 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">{formatLabel(a.action)}</p>
                        {a.details && <p className="text-xs text-muted-foreground">{a.details}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {a.actor_name && <span>by {a.actor_name} · </span>}
                          {new Date(a.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetailPage;
