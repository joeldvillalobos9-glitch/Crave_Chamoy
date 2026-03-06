import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import {
  useCheckout,
  defaultCheckoutForm,
  type CheckoutForm,
  type SimulatedPaymentResult,
} from "@/hooks/useCheckout";
import { ShoppingBag, CreditCard, Truck, Gift, ArrowLeft } from "lucide-react";

const AddressFields = ({
  prefix,
  address,
  onChange,
}: {
  prefix: string;
  address: CheckoutForm["shippingAddress"];
  onChange: (field: string, value: string) => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="sm:col-span-2">
      <Label htmlFor={`${prefix}-line1`}>Address Line 1 *</Label>
      <Input id={`${prefix}-line1`} value={address.line1} onChange={(e) => onChange("line1", e.target.value)} placeholder="123 Main St" required />
    </div>
    <div className="sm:col-span-2">
      <Label htmlFor={`${prefix}-line2`}>Address Line 2</Label>
      <Input id={`${prefix}-line2`} value={address.line2} onChange={(e) => onChange("line2", e.target.value)} placeholder="Apt, suite, etc." />
    </div>
    <div>
      <Label htmlFor={`${prefix}-city`}>City *</Label>
      <Input id={`${prefix}-city`} value={address.city} onChange={(e) => onChange("city", e.target.value)} required />
    </div>
    <div>
      <Label htmlFor={`${prefix}-state`}>State *</Label>
      <Input id={`${prefix}-state`} value={address.state} onChange={(e) => onChange("state", e.target.value)} required />
    </div>
    <div>
      <Label htmlFor={`${prefix}-zip`}>ZIP Code *</Label>
      <Input id={`${prefix}-zip`} value={address.zip} onChange={(e) => onChange("zip", e.target.value)} required />
    </div>
    <div>
      <Label htmlFor={`${prefix}-country`}>Country</Label>
      <Input id={`${prefix}-country`} value={address.country} onChange={(e) => onChange("country", e.target.value)} />
    </div>
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { items, itemCount } = useCart();
  const { createOrder, subtotal, shippingCost, orderTotal, pointsEarned } = useCheckout();
  const [form, setForm] = useState<CheckoutForm>(defaultCheckoutForm);
  const [paymentResult, setPaymentResult] = useState<SimulatedPaymentResult>("success");
  const [step, setStep] = useState<"info" | "payment">("info");

  if (items.length === 0 && !createOrder.isSuccess) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🛒</span>
            <p className="font-display text-xl text-foreground mb-2">Your cart is empty</p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/shop">Shop Now 🍬</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const updateField = (field: keyof CheckoutForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateShipping = (field: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value },
    }));

  const updateBilling = (field: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value },
    }));

  const isInfoValid =
    form.customerName.trim() &&
    form.customerEmail.trim() &&
    form.shippingAddress.line1.trim() &&
    form.shippingAddress.city.trim() &&
    form.shippingAddress.state.trim() &&
    form.shippingAddress.zip.trim();

  const handlePlaceOrder = () => {
    createOrder.mutate(
      { form, paymentResult },
      {
        onSuccess: (order) => {
          navigate(`/order-confirmation/${order.id}`);
        },
      }
    );
  };

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="container py-8 md:py-12 max-w-5xl">
          <nav className="text-sm font-body text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link> /{" "}
            <Link to="/cart" className="hover:text-primary">Cart</Link> /{" "}
            <span className="text-foreground">Checkout</span>
          </nav>

          <h1 className="text-3xl font-display font-bold text-foreground mb-8">
            Checkout 🌶️
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Forms */}
            <div className="lg:col-span-3 space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <ShoppingBag size={20} className="text-primary" /> Customer Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} placeholder="Your full name" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.customerEmail} onChange={(e) => updateField("customerEmail", e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} placeholder="(555) 123-4567" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Truck size={20} className="text-primary" /> Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressFields prefix="ship" address={form.shippingAddress} onChange={updateShipping} />
                </CardContent>
              </Card>

              {/* Billing */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" /> Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="same-billing"
                      checked={form.billingSameAsShipping}
                      onCheckedChange={(c) => updateField("billingSameAsShipping", !!c)}
                    />
                    <Label htmlFor="same-billing" className="cursor-pointer">Same as shipping address</Label>
                  </div>
                  {!form.billingSameAsShipping && (
                    <AddressFields prefix="bill" address={form.billingAddress} onChange={updateBilling} />
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Gift size={20} className="text-primary" /> Order Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.customerNotes}
                    onChange={(e) => updateField("customerNotes", e.target.value)}
                    placeholder="Special instructions, gift messages, etc."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Placeholders */}
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <p className="font-display font-semibold text-foreground">Chamoy Points</p>
                      <p className="text-sm font-body">
                        You'll earn <span className="text-primary font-bold">{pointsEarned} points</span> with this order.
                        Redemption coming soon!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="font-display font-semibold text-foreground">Referral Rewards</p>
                      <p className="text-sm font-body">
                        Referral reward redemption coming soon!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Payment Simulation */}
              <Card className="border-2 border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2 text-accent">
                    🧪 Test Payment Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-body mb-4">
                    Stripe is not connected yet. Choose a simulated payment outcome to test the order lifecycle.
                  </p>
                  <RadioGroup
                    value={paymentResult}
                    onValueChange={(v) => setPaymentResult(v as SimulatedPaymentResult)}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="success" id="pay-success" />
                      <Label htmlFor="pay-success" className="cursor-pointer">
                        <span className="font-semibold text-foreground">✅ Payment Success</span>
                        <span className="text-sm text-muted-foreground block">Order confirmed, points earned</span>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="failure" id="pay-failure" />
                      <Label htmlFor="pay-failure" className="cursor-pointer">
                        <span className="font-semibold text-foreground">❌ Payment Failure</span>
                        <span className="text-sm text-muted-foreground block">Order pending, payment failed</span>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="canceled" id="pay-canceled" />
                      <Label htmlFor="pay-canceled" className="cursor-pointer">
                        <span className="font-semibold text-foreground">🚫 Order Canceled</span>
                        <span className="text-sm text-muted-foreground block">Order canceled before payment</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24 space-y-4">
                <h2 className="font-display font-bold text-lg text-foreground">Order Summary</h2>
                <Separator />

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold font-body text-foreground truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-display font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-primary font-body font-semibold">
                  🌟 Earn {pointsEarned} Chamoy Points!
                </p>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={!isInfoValid || createOrder.isPending}
                  onClick={handlePlaceOrder}
                >
                  {createOrder.isPending ? "Placing Order..." : "Place Order 🌶️"}
                </Button>

                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link to="/cart">
                    <ArrowLeft size={14} /> Back to Cart
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
