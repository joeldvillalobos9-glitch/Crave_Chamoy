import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOrder, useOrderItems } from "@/hooks/useOrders";
import { CheckCircle, XCircle, AlertCircle, Package, ArrowLeft } from "lucide-react";

const statusDisplay: Record<string, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
  confirmed: {
    icon: <CheckCircle size={48} className="text-primary" />,
    title: "Order Confirmed! 🎉",
    desc: "Your chamoy goodies are on their way soon!",
    color: "text-primary",
  },
  pending: {
    icon: <AlertCircle size={48} className="text-secondary" />,
    title: "Order Pending",
    desc: "Payment could not be processed. Please try again or contact support.",
    color: "text-secondary",
  },
  canceled: {
    icon: <XCircle size={48} className="text-destructive" />,
    title: "Order Canceled",
    desc: "This order was canceled. No charges were made.",
    color: "text-destructive",
  },
};

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { data: items } = useOrderItems(id);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground font-body">Loading order details...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-xl text-foreground mb-4">Order not found</p>
            <Button variant="hero" asChild><Link to="/shop">Continue Shopping</Link></Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const display = statusDisplay[order.status] || statusDisplay.pending;

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="container py-8 md:py-16 max-w-2xl">
          {/* Status */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">{display.icon}</div>
            <h1 className={`text-3xl font-display font-bold mb-2 ${display.color}`}>
              {display.title}
            </h1>
            <p className="text-muted-foreground font-body">{display.desc}</p>
          </div>

          {/* Order Info */}
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-foreground text-lg">
                  Order {order.order_number}
                </span>
                <span className="text-sm text-muted-foreground font-body">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>

              <Separator />

              {/* Items */}
              <div className="space-y-3">
                {(items || []).map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {Number(order.shipping_cost) === 0 ? "Free" : `$${Number(order.shipping_cost).toFixed(2)}`}
                  </span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-${Number(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-display font-bold text-base">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              {order.status === "confirmed" && (Number(order.loyalty_points_earned) > 0 || Number(order.loyalty_points_redeemed) > 0) && (
                <>
                  <Separator />
                  <div className="space-y-1 text-sm font-body text-center">
                    {Number(order.loyalty_points_redeemed) > 0 && (
                      <p className="text-primary font-semibold">
                        🎉 Redeemed {order.loyalty_points_redeemed} points (-${Number(order.loyalty_discount).toFixed(2)})
                      </p>
                    )}
                    {Number(order.loyalty_points_earned) > 0 && (
                      <p className="text-primary font-semibold">
                        🌟 Earned {order.loyalty_points_earned} Chamoy Points!
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Shipping */}
          {order.shipping_address && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={18} className="text-primary" />
                  <span className="font-display font-semibold text-foreground">Shipping To</span>
                </div>
                <div className="text-sm font-body text-muted-foreground space-y-1">
                  <p>{(order.shipping_address as any).line1}</p>
                  {(order.shipping_address as any).line2 && <p>{(order.shipping_address as any).line2}</p>}
                  <p>
                    {(order.shipping_address as any).city}, {(order.shipping_address as any).state}{" "}
                    {(order.shipping_address as any).zip}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/shop">Continue Shopping 🍬</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/">
                <ArrowLeft size={16} /> Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
