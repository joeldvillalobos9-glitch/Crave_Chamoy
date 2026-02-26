import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type OrderStatus = "pending" | "confirmed" | "processing" | "completed" | "canceled" | "refunded" | "partially_refunded";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "partially_refunded" | "failed";
export type FulfillmentStatus = "unfulfilled" | "packed" | "shipped" | "delivered" | "returned";

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: any;
  billing_address: any;
  customer_notes: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  payment_method: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  coupon_code: string | null;
  loyalty_points_earned: number;
  loyalty_points_redeemed: number;
  loyalty_discount: number;
  referral_reward_used: boolean;
  referral_discount: number;
  referral_triggered: boolean;
  signup_discount_used: boolean;
  discounts_stacked: boolean;
  discount_breakdown: any;
  tracking_number: string | null;
  internal_notes: string | null;
  item_count: number;
  refund_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
  image_url: string | null;
}

export interface OrderActivity {
  id: string;
  order_id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  details: string | null;
  metadata: any;
  created_at: string;
}

export interface OrderFilters {
  search: string;
  status: OrderStatus | "all";
  payment_status: PaymentStatus | "all";
  fulfillment_status: FulfillmentStatus | "all";
  has_discount: "all" | "yes";
  has_loyalty: "all" | "yes";
  has_referral: "all" | "yes";
  date_from: string;
  date_to: string;
  min_total: string;
  sort_by: "created_at" | "total" | "order_number";
  sort_dir: "asc" | "desc";
}

export const defaultOrderFilters: OrderFilters = {
  search: "",
  status: "all",
  payment_status: "all",
  fulfillment_status: "all",
  has_discount: "all",
  has_loyalty: "all",
  has_referral: "all",
  date_from: "",
  date_to: "",
  min_total: "",
  sort_by: "created_at",
  sort_dir: "desc",
};

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order(filters.sort_by, { ascending: filters.sort_dir === "asc" });

      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
      }
      if (filters.status !== "all") query = query.eq("status", filters.status);
      if (filters.payment_status !== "all") query = query.eq("payment_status", filters.payment_status);
      if (filters.fulfillment_status !== "all") query = query.eq("fulfillment_status", filters.fulfillment_status);
      if (filters.has_discount === "yes") query = query.gt("discount_amount", 0);
      if (filters.has_loyalty === "yes") query = query.gt("loyalty_points_redeemed", 0);
      if (filters.has_referral === "yes") query = query.eq("referral_reward_used", true);
      if (filters.date_from) query = query.gte("created_at", filters.date_from);
      if (filters.date_to) query = query.lte("created_at", filters.date_to + "T23:59:59");
      if (filters.min_total) query = query.gte("total", Number(filters.min_total));

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Order[];
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Order;
    },
  });
}

export function useOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: ["admin-order-items", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId!).order("created_at");
      if (error) throw error;
      return (data || []) as OrderItem[];
    },
  });
}

export function useOrderActivity(orderId: string | undefined) {
  return useQuery({
    queryKey: ["admin-order-activity", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_activity").select("*").eq("order_id", orderId!).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as OrderActivity[];
    },
  });
}

export function useCustomerHistory(customerId: string | null | undefined) {
  return useQuery({
    queryKey: ["customer-history", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, status, created_at")
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const orders = data || [];
      const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);
      return { orders, totalSpent, orderCount: orders.length };
    },
  });
}

export function useOrderMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Order> }) => {
      const { error } = await supabase.from("orders").update(data as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order"] });
      toast({ title: "Order updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addActivity = useMutation({
    mutationFn: async (activity: Omit<OrderActivity, "id" | "created_at">) => {
      const { error } = await supabase.from("order_activity").insert(activity as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-order-activity"] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const bulkUpdateOrders = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<Order> }) => {
      const { error } = await supabase.from("orders").update(data as any).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Orders updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createOrder = useMutation({
    mutationFn: async (order: Partial<Order> & { items?: Partial<OrderItem>[] }) => {
      const { items, ...orderData } = order;
      const { data, error } = await supabase.from("orders").insert(orderData as any).select().single();
      if (error) throw error;
      if (items && items.length > 0) {
        const itemsWithOrderId = items.map((i) => ({ ...i, order_id: data.id }));
        const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId as any);
        if (itemsError) throw itemsError;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return { updateOrder, addActivity, bulkUpdateOrders, createOrder };
}
