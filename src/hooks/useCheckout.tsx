import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

export function useCheckout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const shippingCost = total >= 35 ? 0 : 4.99;
  const subtotal = total;
  const orderTotal = subtotal + shippingCost;
  const pointsEarned = Math.floor(orderTotal * 10);

  const createOrderMutation = useMutation({
    mutationFn: async ({
      form,
      paymentResult,
    }: {
      form: CheckoutForm;
      paymentResult: SimulatedPaymentResult;
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
        discount_amount: 0,
        total: orderTotal,
        item_count: items.reduce((s, i) => s + i.quantity, 0),
        status: orderStatus,
        payment_status: paymentStatus,
        fulfillment_status: "unfulfilled" as const,
        payment_method: "test_simulation",
        loyalty_points_earned: paymentResult === "success" ? pointsEarned : 0,
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();
      if (error) throw error;

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

      // Log activity
      await supabase.from("order_activity").insert({
        order_id: order.id,
        action: "order_created",
        details: `Order ${orderNumber} created via checkout (payment: ${paymentResult})`,
        actor_id: user?.id || null,
        actor_name: form.customerName,
      });

      return order;
    },
    onSuccess: (order) => {
      setLastOrderId(order.id);
      clearCart();
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
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
    orderTotal,
    pointsEarned,
    items,
  };
}
