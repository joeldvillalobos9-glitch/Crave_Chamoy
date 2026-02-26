import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CustomerProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_vip: boolean;
  tags: string[];
  internal_notes: string | null;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithStats extends CustomerProfile {
  email: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  last_order_date: string | null;
  loyalty_balance: number;
  referral_count: number;
  completed_referrals: number;
  account_status: "active" | "new" | "inactive";
}

export interface CustomerFilters {
  search: string;
  segment: "all" | "vip" | "new" | "returning" | "inactive" | "no_orders" | "has_loyalty" | "has_referrals" | "high_value" | "recent_signups";
  sort_by: "created_at" | "display_name" | "total_spent" | "total_orders";
  sort_dir: "asc" | "desc";
}

export const defaultCustomerFilters: CustomerFilters = {
  search: "",
  segment: "all",
  sort_by: "created_at",
  sort_dir: "desc",
};

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: ["admin-customers", filters],
    queryFn: async () => {
      // Fetch profiles
      let query = supabase.from("profiles").select("*").order(
        filters.sort_by === "total_spent" || filters.sort_by === "total_orders" ? "created_at" : filters.sort_by,
        { ascending: filters.sort_dir === "asc" }
      );

      if (filters.segment === "vip") query = query.eq("is_vip", true);

      const { data: profiles, error } = await query;
      if (error) throw error;

      // Fetch all orders for stats + email mapping
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_id, customer_email, total, created_at, coupon_code, loyalty_points_redeemed, referral_reward_used, signup_discount_used");

      // Fetch loyalty balances
      const { data: loyaltyData } = await supabase
        .from("loyalty_ledger")
        .select("customer_id, balance_after")
        .order("created_at", { ascending: false });

      // Fetch referral counts
      const { data: referralData } = await supabase
        .from("referrals")
        .select("referrer_id, status");

      // Build email map from orders (customer_id -> email)
      const emailMap = new Map<string, string>();
      const orderStats = new Map<string, { count: number; total: number; lastDate: string | null }>();
      (orders || []).forEach((o: any) => {
        if (!o.customer_id) return;
        if (o.customer_email && !emailMap.has(o.customer_id)) emailMap.set(o.customer_id, o.customer_email);
        const existing = orderStats.get(o.customer_id) || { count: 0, total: 0, lastDate: null };
        existing.count++;
        existing.total += Number(o.total);
        if (!existing.lastDate || o.created_at > existing.lastDate) existing.lastDate = o.created_at;
        orderStats.set(o.customer_id, existing);
      });

      const loyaltyMap = new Map<string, number>();
      (loyaltyData || []).forEach((l: any) => {
        if (!loyaltyMap.has(l.customer_id)) loyaltyMap.set(l.customer_id, l.balance_after);
      });

      const referralMap = new Map<string, { total: number; completed: number }>();
      (referralData || []).forEach((r: any) => {
        const existing = referralMap.get(r.referrer_id) || { total: 0, completed: 0 };
        existing.total++;
        if (r.status === "completed") existing.completed++;
        referralMap.set(r.referrer_id, existing);
      });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();

      let result: CustomerWithStats[] = (profiles || []).map((p: any) => {
        const stats = orderStats.get(p.user_id) || { count: 0, total: 0, lastDate: null };
        const refs = referralMap.get(p.user_id) || { total: 0, completed: 0 };
        const isNew = p.created_at >= thirtyDaysAgo;
        const isInactive = stats.lastDate ? stats.lastDate < ninetyDaysAgo : p.created_at < ninetyDaysAgo;
        return {
          ...p,
          tags: p.tags || [],
          is_vip: p.is_vip || false,
          email: emailMap.get(p.user_id) || "",
          total_orders: stats.count,
          total_spent: stats.total,
          avg_order_value: stats.count > 0 ? stats.total / stats.count : 0,
          last_order_date: stats.lastDate,
          loyalty_balance: loyaltyMap.get(p.user_id) || 0,
          referral_count: refs.total,
          completed_referrals: refs.completed,
          account_status: isNew ? "new" as const : isInactive ? "inactive" as const : "active" as const,
        };
      });

      // Search across name, email, phone
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter((c) =>
          (c.display_name || "").toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q)
        );
      }

      // Apply segment filters
      if (filters.segment === "new") result = result.filter((c) => c.created_at >= thirtyDaysAgo);
      if (filters.segment === "returning") result = result.filter((c) => c.total_orders > 1);
      if (filters.segment === "inactive") result = result.filter((c) => c.account_status === "inactive");
      if (filters.segment === "no_orders") result = result.filter((c) => c.total_orders === 0);
      if (filters.segment === "has_loyalty") result = result.filter((c) => c.loyalty_balance > 0);
      if (filters.segment === "has_referrals") result = result.filter((c) => c.referral_count > 0);
      if (filters.segment === "high_value") result = result.filter((c) => c.total_spent >= 200);
      if (filters.segment === "recent_signups") result = result.filter((c) => c.created_at >= sevenDaysAgo);

      // Sort by computed fields
      if (filters.sort_by === "total_spent") {
        result.sort((a, b) => filters.sort_dir === "asc" ? a.total_spent - b.total_spent : b.total_spent - a.total_spent);
      } else if (filters.sort_by === "total_orders") {
        result.sort((a, b) => filters.sort_dir === "asc" ? a.total_orders - b.total_orders : b.total_orders - a.total_orders);
      }

      return result;
    },
  });
}

export function useCustomerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data as CustomerProfile;
    },
  });
}

export function useCustomerOrders(customerId: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer-orders", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCustomerLoyalty(customerId: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer-loyalty", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_ledger")
        .select("*")
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCustomerReferrals(customerId: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer-referrals", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", customerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCustomerActivity(customerId: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer-activity", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_activity")
        .select("*")
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCustomerMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const updateProfile = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Record<string, any> }) => {
      const { error } = await supabase.from("profiles").update(data).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customer"] });
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast({ title: "Customer updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addActivity = useMutation({
    mutationFn: async (activity: { customer_id: string; actor_id?: string; actor_name?: string; action: string; details?: string; metadata?: any }) => {
      const { error } = await supabase.from("customer_activity").insert(activity as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-customer-activity"] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addLoyaltyEntry = useMutation({
    mutationFn: async (entry: { customer_id: string; points: number; balance_after: number; type: string; description?: string; actor_id?: string }) => {
      const { error } = await supabase.from("loyalty_ledger").insert(entry as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customer-loyalty"] });
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast({ title: "Loyalty points updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return { updateProfile, addActivity, addLoyaltyEntry };
}
