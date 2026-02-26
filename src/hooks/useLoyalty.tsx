import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LoyaltyEntry {
  id: string;
  customer_id: string;
  points: number;
  balance_after: number;
  type: string;
  description: string | null;
  order_id: string | null;
  actor_id: string | null;
  created_at: string;
}

export interface LoyaltyEntryWithCustomer extends LoyaltyEntry {
  customer_name: string;
  customer_email: string;
}

export interface LoyaltyFilters {
  search: string;
  type: "all" | "earned" | "redeemed" | "manual_add" | "manual_subtract" | "reversal";
  date_from: string;
  date_to: string;
  high_value: boolean;
  sort_by: "created_at" | "points";
  sort_dir: "asc" | "desc";
}

export const defaultLoyaltyFilters: LoyaltyFilters = {
  search: "",
  type: "all",
  date_from: "",
  date_to: "",
  high_value: false,
  sort_by: "created_at",
  sort_dir: "desc",
};

export function useLoyaltyStats() {
  return useQuery({
    queryKey: ["admin-loyalty-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_ledger")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const entries = (data || []) as LoyaltyEntry[];

      let totalIssued = 0;
      let totalRedeemed = 0;

      entries.forEach((e) => {
        if (e.points > 0) totalIssued += e.points;
        else totalRedeemed += Math.abs(e.points);
      });

      // Active balances: get latest balance_after per customer
      const latestByCustomer = new Map<string, number>();
      entries.forEach((e) => {
        if (!latestByCustomer.has(e.customer_id)) {
          latestByCustomer.set(e.customer_id, e.balance_after);
        }
      });
      let totalActive = 0;
      latestByCustomer.forEach((bal) => { totalActive += Math.max(0, bal); });

      // Top customers by balance
      const topCustomers = Array.from(latestByCustomer.entries())
        .filter(([, bal]) => bal > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, bal]) => ({ customer_id: id, balance: bal }));

      return {
        totalIssued,
        totalRedeemed,
        totalActive,
        dollarValue: totalActive / 100,
        recentActivity: entries.slice(0, 10),
        topCustomers,
        totalTransactions: entries.length,
      };
    },
  });
}

export function useLoyaltyActivity(filters: LoyaltyFilters) {
  return useQuery({
    queryKey: ["admin-loyalty-activity", filters],
    queryFn: async () => {
      // Fetch all ledger entries
      let query = supabase
        .from("loyalty_ledger")
        .select("*")
        .order(filters.sort_by, { ascending: filters.sort_dir === "asc" });

      if (filters.date_from) query = query.gte("created_at", filters.date_from);
      if (filters.date_to) query = query.lte("created_at", filters.date_to + "T23:59:59");

      if (filters.type === "earned") query = query.eq("type", "earned");
      else if (filters.type === "redeemed") query = query.eq("type", "redeemed");
      else if (filters.type === "manual_add") query = query.eq("type", "manual_add");
      else if (filters.type === "manual_subtract") query = query.eq("type", "manual_subtract");
      else if (filters.type === "reversal") query = query.eq("type", "reversal");

      if (filters.high_value) query = query.or("points.gte.500,points.lte.-500");

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles for name mapping
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");
      const nameMap = new Map<string, string>();
      (profiles || []).forEach((p: any) => nameMap.set(p.user_id, p.display_name || ""));

      // Fetch email mapping from orders
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_id, customer_email");
      const emailMap = new Map<string, string>();
      (orders || []).forEach((o: any) => {
        if (o.customer_id && o.customer_email && !emailMap.has(o.customer_id))
          emailMap.set(o.customer_id, o.customer_email);
      });

      let result: LoyaltyEntryWithCustomer[] = (data || []).map((e: any) => ({
        ...e,
        customer_name: nameMap.get(e.customer_id) || "Unknown",
        customer_email: emailMap.get(e.customer_id) || "",
      }));

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (e) =>
            e.customer_name.toLowerCase().includes(q) ||
            e.customer_email.toLowerCase().includes(q) ||
            (e.description || "").toLowerCase().includes(q)
        );
      }

      return result;
    },
  });
}

export function useLoyaltyMutations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const addEntry = useMutation({
    mutationFn: async (entry: {
      customer_id: string;
      points: number;
      balance_after: number;
      type: string;
      description?: string;
      actor_id?: string;
      order_id?: string;
    }) => {
      const { error } = await supabase.from("loyalty_ledger").insert(entry as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-loyalty-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-loyalty-activity"] });
      qc.invalidateQueries({ queryKey: ["admin-customer-loyalty"] });
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast({ title: "Loyalty points updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return { addEntry };
}
