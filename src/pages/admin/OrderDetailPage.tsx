import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Truck, Package, CheckCircle2, XCircle, RefreshCw, Printer, MessageSquare, Clock, Gift, Users, Tag, DollarSign, MapPin, Mail, Phone, User } from "lucide-react";
import { useOrder, useOrderItems, useOrderActivity, useOrderMutations, type OrderStatus, type PaymentStatus, type FulfillmentStatus } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700", confirmed: "bg-blue-500/15 text-blue-700",
  processing: "bg-purple-500/15 text-purple-700", completed: "bg-green-500/15 text-green-700",
  canceled: "bg-muted text-muted-foreground", refunded: "bg-red-500/15 text-red-700",
  partially_refunded: "bg-orange-500/15 text-orange-700",
  unpaid: "bg-yellow-500/15 text-yellow-700", paid: "bg-green-500/15 text-green-700",
  failed: "bg-destructive/15 text-destructive",
  unfulfilled: "bg-yellow-500/15 text-yellow-700", packed: "bg-blue-500/15 text-blue-700",
  shipped: "bg-purple-500/15 text-purple-700", delivered: "bg-green-500/15 text-green-700",
  returned: "bg-red-500/15 text-red-700",
};

function formatLabel(s: string) { return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(id);
  const { data: items = [] } = useOrderItems(id);
  const { data: activity = [] } = useOrderActivity(id);
  const { updateOrder, addActivity } = useOrderMutations();
  const [noteText, setNoteText] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  if (isLoading || !order) return <div className="p-12 text-center text-muted-foreground">Loading order...</div>;

  const handleStatusChange = (field: string, value: string) => {
    updateOrder.mutate({ id: order.id, data: { [field]: value } as any });
    addActivity.mutate({
      order_id: order.id, actor_id: user?.id || null,
      actor_name: user?.email?.split("@")[0] || "Admin",
      action: `${field.replace(/_/g, " ")} changed`,
      details: `Changed to ${formatLabel(value)}`, metadata: { field, value },
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addActivity.mutate({
      order_id: order.id, actor_id: user?.id || null,
      actor_name: user?.email?.split("@")[0] || "Admin",
      action: "Note added", details: noteText, metadata: {},
    });
    updateOrder.mutate({ id: order.id, data: { internal_notes: (order.internal_notes ? order.internal_notes + "\n" : "") + noteText } as any });
    setNoteText("");
  };

  const handleTrackingUpdate = () => {
    if (!trackingInput.trim()) return;
    updateOrder.mutate({ id: order.id, data: { tracking_number: trackingInput } as any });
    addActivity.mutate({
      order_id: order.id, actor_id: user?.id || null,
      actor_name: user?.email?.split("@")[0] || "Admin",
      action: "Tracking updated", details: `Tracking: ${trackingInput}`, metadata: { tracking_number: trackingInput },
    });
    setTrackingInput("");
  };

  const handleRefund = (full: boolean) => {
    const amount = full ? Number(order.total) : Number(refundAmount);
    if (!amount || amount <= 0) return;
    const newStatus = (full || amount >= Number(order.total)) ? "refunded" : "partially_refunded";
    updateOrder.mutate({
      id: order.id,
      data: { status: newStatus, payment_status: newStatus, refund_amount: Number(order.refund_amount || 0) + amount } as any,
    });
    addActivity.mutate({
      order_id: order.id, actor_id: user?.id || null,
      actor_name: user?.email?.split("@")[0] || "Admin",
      action: full ? "Full refund issued" : "Partial refund issued",
      details: `$${amount.toFixed(2)} refunded`, metadata: { amount },
    });
    setRefundAmount("");
  };

  const handleCancel = () => {
    updateOrder.mutate({ id: order.id, data: { status: "canceled" } as any });
    addActivity.mutate({
      order_id: order.id, actor_id: user?.id || null,
      actor_name: user?.email?.split("@")[0] || "Admin",
      action: "Order canceled", details: "Order was canceled by admin", metadata: {},
    });
  };

  const addr = order.shipping_address;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/admin/orders"><ArrowLeft size={18} /></Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-foreground font-mono">{order.order_number}</h1>
            <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </Button>
          {order.status !== "canceled" && order.status !== "refunded" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30"><XCircle size={14} /> Cancel Order</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                  <AlertDialogDescription>This will cancel the order. Any loyalty points earned will need to be manually reversed.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Cancel Order</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Status badges row */}
      <div className="flex flex-wrap gap-3">
        <Badge className={`text-sm px-3 py-1 ${statusStyle[order.status]}`}>Order: {formatLabel(order.status)}</Badge>
        <Badge className={`text-sm px-3 py-1 ${statusStyle[order.payment_status]}`}>Payment: {formatLabel(order.payment_status)}</Badge>
        <Badge className={`text-sm px-3 py-1 ${statusStyle[order.fulfillment_status]}`}>Fulfillment: {formatLabel(order.fulfillment_status)}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border"><h2 className="font-semibold text-foreground">Order Items ({items.length})</h2></div>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {item.image_url ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{item.product_name}</p>
                    {item.sku && <p className="text-xs text-muted-foreground font-mono">SKU: {item.sku}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-muted-foreground">{item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                    <p className="text-sm font-medium text-foreground">${Number(item.subtotal).toFixed(2)}</p>
                    {Number(item.discount_amount) > 0 && <p className="text-xs text-green-600">-${Number(item.discount_amount).toFixed(2)} discount</p>}
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">No items recorded</div>}
            </div>
            {/* Totals */}
            <div className="border-t border-border p-4 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
              {Number(order.discount_amount) > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discounts</span><span>-${Number(order.discount_amount).toFixed(2)}</span></div>}
              {Number(order.loyalty_discount) > 0 && <div className="flex justify-between text-sm text-green-600"><span>Loyalty Points ({order.loyalty_points_redeemed} pts)</span><span>-${Number(order.loyalty_discount).toFixed(2)}</span></div>}
              {Number(order.referral_discount) > 0 && <div className="flex justify-between text-sm text-green-600"><span>Referral Reward</span><span>-${Number(order.referral_discount).toFixed(2)}</span></div>}
              {Number(order.shipping_cost) > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>${Number(order.shipping_cost).toFixed(2)}</span></div>}
              {Number(order.tax_amount) > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>${Number(order.tax_amount).toFixed(2)}</span></div>}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-foreground"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
              {Number(order.refund_amount) > 0 && <div className="flex justify-between text-sm text-destructive"><span>Refunded</span><span>-${Number(order.refund_amount).toFixed(2)}</span></div>}
            </div>
          </div>

          {/* Loyalty & Referral & Discounts */}
          {(order.loyalty_points_earned > 0 || order.loyalty_points_redeemed > 0 || order.referral_reward_used || order.coupon_code || order.signup_discount_used) && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h2 className="font-semibold text-foreground">Rewards & Discounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.loyalty_points_earned > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Gift size={16} className="text-primary" />
                    <div><p className="text-sm font-medium">{order.loyalty_points_earned} points earned</p><p className="text-xs text-muted-foreground">Chamoy Points from this order</p></div>
                  </div>
                )}
                {order.loyalty_points_redeemed > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Gift size={16} className="text-green-600" />
                    <div><p className="text-sm font-medium">{order.loyalty_points_redeemed} points redeemed</p><p className="text-xs text-muted-foreground">-${Number(order.loyalty_discount).toFixed(2)} discount</p></div>
                  </div>
                )}
                {order.referral_reward_used && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Users size={16} className="text-primary" />
                    <div><p className="text-sm font-medium">Referral reward applied</p><p className="text-xs text-muted-foreground">-${Number(order.referral_discount).toFixed(2)} discount</p></div>
                  </div>
                )}
                {order.referral_triggered && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                    <Users size={16} className="text-green-600" />
                    <div><p className="text-sm font-medium">Referral reward triggered</p><p className="text-xs text-muted-foreground">This order qualified a referral reward</p></div>
                  </div>
                )}
                {order.coupon_code && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Tag size={16} className="text-primary" />
                    <div><p className="text-sm font-medium">Coupon: {order.coupon_code}</p></div>
                  </div>
                )}
                {order.signup_discount_used && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <DollarSign size={16} className="text-primary" />
                    <div><p className="text-sm font-medium">Signup discount used</p></div>
                  </div>
                )}
              </div>
              {order.discounts_stacked && <p className="text-xs text-muted-foreground">⚡ Multiple discounts were stacked on this order</p>}
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h2 className="font-semibold text-foreground">Activity Timeline</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={14} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">{a.action}</span>
                        <span className="text-xs text-muted-foreground">{a.actor_name || "System"}</span>
                      </div>
                      {a.details && <p className="text-sm text-muted-foreground mt-0.5">{a.details}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Add note */}
            <div className="pt-3 border-t border-border space-y-2">
              <Label className="text-sm">Add Internal Note</Label>
              <div className="flex gap-2">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Write a note about this order..." className="flex-1" />
                <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()} className="self-end gap-1.5">
                  <MessageSquare size={14} /> Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: sidebar */}
        <div className="space-y-6">
          {/* Status controls */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h2 className="font-semibold text-foreground">Update Status</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Order Status</Label>
                <Select value={order.status} onValueChange={(v) => handleStatusChange("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["pending","confirmed","processing","completed","canceled","refunded","partially_refunded"] as OrderStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Payment Status</Label>
                <Select value={order.payment_status} onValueChange={(v) => handleStatusChange("payment_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["unpaid","paid","refunded","partially_refunded","failed"] as PaymentStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fulfillment Status</Label>
                <Select value={order.fulfillment_status} onValueChange={(v) => handleStatusChange("fulfillment_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["unfulfilled","packed","shipped","delivered","returned"] as FulfillmentStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Shipping & Tracking</h2>
            {order.tracking_number && (
              <div className="p-2 rounded bg-muted text-sm font-mono">{order.tracking_number}</div>
            )}
            <div className="flex gap-2">
              <Input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="Enter tracking number" className="text-sm" />
              <Button size="sm" onClick={handleTrackingUpdate} disabled={!trackingInput.trim()}>
                <Truck size={14} />
              </Button>
            </div>
          </div>

          {/* Refund */}
          {order.status !== "refunded" && order.status !== "canceled" && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h2 className="font-semibold text-foreground">Refund</h2>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-destructive border-destructive/30">
                    <RefreshCw size={14} /> Full Refund (${Number(order.total).toFixed(2)})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Issue full refund?</AlertDialogTitle>
                    <AlertDialogDescription>This will refund ${Number(order.total).toFixed(2)}. Loyalty points earned from this order should be manually reversed.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRefund(true)}>Refund</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" step="0.01" min="0" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0.00" className="pl-7 text-sm" />
                </div>
                <Button size="sm" variant="outline" onClick={() => handleRefund(false)} disabled={!refundAmount || Number(refundAmount) <= 0}>
                  Partial
                </Button>
              </div>
            </div>
          )}

          {/* Customer */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Customer</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted-foreground" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} />
                <span>{order.customer_email}</span>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size={14} />
                  <span>{order.customer_phone}</span>
                </div>
              )}
            </div>
            {addr && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <div>
                      {addr.line1 && <p>{addr.line1}</p>}
                      {addr.line2 && <p>{addr.line2}</p>}
                      {(addr.city || addr.state || addr.zip) && <p>{[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}</p>}
                      {addr.country && <p>{addr.country}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}
            {order.customer_notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Customer Notes</p>
                  <p className="text-sm text-foreground">{order.customer_notes}</p>
                </div>
              </>
            )}
            {order.payment_method && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">Payment: {order.payment_method}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
