import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { processReferralOnFirstPurchase, REFERRAL_REWARD_AMOUNT } from "@/hooks/useReferrals";

export interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes: string;
  shippingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingSameAsShipping: boolean;
}

export const emptyAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
};

export const defaultCheckoutForm: CheckoutForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerNotes: "",
  shippingAddress: { ...emptyAddress },
  billingAddress: { ...emptyAddress },
  billingSameAsShipping: true,
};

export type SimulatedPaymentResult = "success" | "failure" | "canceled";

// Loyalty constants
export const POINTS_PER_DOLLAR = 10;
export const POINTS_PER_DOLLAR_OFF = 100;

export function useCustomerLoyaltyBalance(customerId: string | undefined) {
  return useQuery({
    queryKey: ["customer-loyalty-balance", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_ledger")
        .select("balance_after")
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data && data.length > 0 ? Math.max(0, data[0].balance_after) : 0;
    },
  });
}

export function useCheckout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [useReferralReward, setUseReferralReward] = useState(false);

  const shippingCost = total >= 35 ? 0 : 4.99;
  const subtotal = total;

  // Loyalty discount from redeemed points
  const loyaltyDiscount = Math.floor(pointsToRedeem) / POINTS_PER_DOLLAR_OFF;
  // Referral discount
  const referralDiscount = useReferralReward ? REFERRAL_REWARD_AMOUNT : 0;
  const totalDiscount = loyaltyDiscount + referralDiscount;
  const orderTotal = Math.max(0, subtotal + shippingCost - totalDiscount);
  const pointsEarned = Math.floor(orderTotal * POINTS_PER_DOLLAR);

  // Max redeemable: can't reduce order below $0 (accounting for referral discount too)
  const maxRedeemableByOrder = Math.floor(Math.max(0, subtotal + shippingCost - referralDiscount) * POINTS_PER_DOLLAR_OFF);

  const createOrderMutation = useMutation({
    mutationFn: async ({
      form,
      paymentResult,
      redeemPoints,
      applyReferralReward,
    }: {
      form: CheckoutForm;
      paymentResult: SimulatedPaymentResult;
      redeemPoints: number;
      applyReferralReward: boolean;
    }) => {
      const orderNumber = "CC-" + String(Math.floor(Math.random() * 999999)).padStart(6, "0");

      const billingAddr = form.billingSameAsShipping
        ? form.shippingAddress
        : form.billingAddress;

      const paymentStatus = (
        paymentResult === "success"
          ? "paid"
          : paymentResult === "failure"
          ? "failed"
          : "unpaid"
      ) as "paid" | "failed" | "unpaid";

      const orderStatus = (
        paymentResult === "success"
          ? "confirmed"
          : paymentResult === "canceled"
          ? "canceled"
          : "pending"
      ) as "confirmed" | "canceled" | "pending";

      const isSuccess = paymentResult === "success";
      const actualLoyaltyDiscount = isSuccess ? loyaltyDiscount : 0;
      const actualReferralDiscount = isSuccess && applyReferralReward ? referralDiscount : 0;
      const actualPointsRedeemed = isSuccess ? redeemPoints : 0;
      const actualPointsEarned = isSuccess ? pointsEarned : 0;
      const actualTotalDiscount = actualLoyaltyDiscount + actualReferralDiscount;
      const actualTotal = isSuccess ? orderTotal : subtotal + shippingCost;

      const orderData = {
        order_number: orderNumber,
        customer_id: user?.id || null,
        customer_name: form.customerName,
        customer_email: form.customerEmail,
        customer_phone: form.customerPhone || null,
        customer_notes: form.customerNotes || null,
        shipping_address: form.shippingAddress,
        billing_address: billingAddr,
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: 0,
        discount_amount: actualTotalDiscount,
        total: actualTotal,
        item_count: items.reduce((s, i) => s + i.quantity, 0),
        status: orderStatus,
        payment_status: paymentStatus,
        fulfillment_status: "unfulfilled" as const,
        payment_method: "test_simulation",
        loyalty_points_earned: actualPointsEarned,
        loyalty_points_redeemed: actualPointsRedeemed,
        loyalty_discount: actualLoyaltyDiscount,
        referral_reward_used: isSuccess && applyReferralReward,
        referral_discount: actualReferralDiscount,
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();
      if (error) throw error;

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: null as string | null,
        product_name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unit_price: item.product.price,
        discount_amount: 0,
        subtotal: item.product.price * item.quantity,
        image_url: item.product.image,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      // Loyalty ledger entries for successful orders only
      if (isSuccess && user?.id) {
        const { data: lastEntry } = await supabase
          .from("loyalty_ledger")
          .select("balance_after")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        let currentBalance = lastEntry && lastEntry.length > 0 ? lastEntry[0].balance_after : 0;

        if (actualPointsRedeemed > 0) {
          const newBalance = currentBalance - actualPointsRedeemed;
          await supabase.from("loyalty_ledger").insert({
            customer_id: user.id,
            points: -actualPointsRedeemed,
            balance_after: newBalance,
            type: "redeemed",
            description: `Redeemed ${actualPointsRedeemed} points ($${actualLoyaltyDiscount.toFixed(2)} off) on order ${orderNumber}`,
            order_id: order.id,
          });
          currentBalance = newBalance;
        }

        if (actualPointsEarned > 0) {
          const newBalance = currentBalance + actualPointsEarned;
          await supabase.from("loyalty_ledger").insert({
            customer_id: user.id,
            points: actualPointsEarned,
            balance_after: newBalance,
            type: "earned",
            description: `Earned ${actualPointsEarned} points from order ${orderNumber} ($${actualTotal.toFixed(2)})`,
            order_id: order.id,
          });
        }

        // Process referral completion on first qualifying purchase
        const referralResult = await processReferralOnFirstPurchase(user.id, order.id, orderNumber);
        if (referralResult) {
          // Update order to mark referral triggered
          await supabase.from("orders").update({
            referral_triggered: true,
          } as any).eq("id", order.id);
        }
      }

      // Log activity
      const discountParts: string[] = [];
      if (actualPointsRedeemed > 0) discountParts.push(`redeemed ${actualPointsRedeemed} pts`);
      if (actualPointsEarned > 0) discountParts.push(`earned ${actualPointsEarned} pts`);
      if (actualReferralDiscount > 0) discountParts.push(`used $${actualReferralDiscount} referral reward`);

      await supabase.from("order_activity").insert({
        order_id: order.id,
        action: "order_created",
        details: `Order ${orderNumber} created via checkout (payment: ${paymentResult})${discountParts.length > 0 ? " — " + discountParts.join(", ") : ""}`,
        actor_id: user?.id || null,
        actor_name: form.customerName,
      });

      return order;
    },
    onSuccess: (order) => {
      setLastOrderId(order.id);
      setPointsToRedeem(0);
      setUseReferralReward(false);
      clearCart();
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-loyalty-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-loyalty-activity"] });
      qc.invalidateQueries({ queryKey: ["customer-loyalty-balance"] });
      qc.invalidateQueries({ queryKey: ["available-referral-reward"] });
      qc.invalidateQueries({ queryKey: ["admin-referrals"] });
      toast({ title: "Order placed! 🎉", description: `Order ${order.order_number} created.` });
    },
    onError: (e: any) => {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
    },
  });

  return {
    createOrder: createOrderMutation,
    lastOrderId,
    subtotal,
    shippingCost,
    loyaltyDiscount,
    referralDiscount,
    orderTotal,
    pointsEarned,
    pointsToRedeem,
    setPointsToRedeem,
    maxRedeemableByOrder,
    useReferralReward,
    setUseReferralReward,
    items,
  };
}
