import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const REFERRAL_REWARD_AMOUNT = 10; // $10 for both parties

/** Generate a short referral code from user ID */
export function generateReferralCode(userId: string): string {
  return "CRAVE-" + userId.slice(0, 8).toUpperCase();
}

/** Get the current user's referral code */
export function useMyReferralCode(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-referral-code", userId],
    enabled: !!userId,
    queryFn: () => generateReferralCode(userId!),
  });
}

/** Get available (unused) referral reward for a customer */
export function useAvailableReferralReward(userId: string | undefined) {
  return useQuery({
    queryKey: ["available-referral-reward", userId],
    enabled: !!userId,
    queryFn: async () => {
      // Check if user has any completed referral where they were rewarded but haven't used it yet
      // As referrer: referrer_rewarded = true, check if they used it on an order
      // As referred: referred_rewarded = true, check if they used it on an order
      const { data: asReferrer } = await supabase
        .from("referrals")
        .select("id, reward_amount, status")
        .eq("referrer_id", userId!)
        .eq("referrer_rewarded", true)
        .eq("status", "completed");

      const { data: asReferred } = await supabase
        .from("referrals")
        .select("id, reward_amount, status")
        .eq("referred_id", userId!)
        .eq("referred_rewarded", true)
        .eq("status", "completed");

      // Check which rewards have already been used on orders
      const { data: usedOrders } = await supabase
        .from("orders")
        .select("id")
        .eq("customer_id", userId!)
        .eq("referral_reward_used", true);

      const usedCount = usedOrders?.length || 0;
      const totalEarned = (asReferrer?.length || 0) + (asReferred?.length || 0);
      const availableCount = Math.max(0, totalEarned - usedCount);

      if (availableCount <= 0) return null;

      // Return the first available reward amount
      const firstReward = [...(asReferrer || []), ...(asReferred || [])][0];
      return {
        available: availableCount,
        amount: Number(firstReward?.reward_amount || REFERRAL_REWARD_AMOUNT),
        totalEarned,
        totalUsed: usedCount,
      };
    },
  });
}

/** Check if a referral code is valid and return the referrer */
export function useValidateReferralCode(code: string, currentUserId: string | undefined) {
  return useQuery({
    queryKey: ["validate-referral-code", code],
    enabled: !!code && code.length >= 6 && !!currentUserId,
    queryFn: async () => {
      // Extract user ID portion from code like CRAVE-XXXXXXXX
      const match = code.toUpperCase().match(/^CRAVE-([A-F0-9]{8})$/);
      if (!match) return { valid: false, reason: "Invalid code format" };

      const prefix = match[1].toLowerCase();

      // Find a profile whose user_id starts with this prefix
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name");

      const referrer = profiles?.find(
        (p) => p.user_id.slice(0, 8).toUpperCase() === match[1]
      );

      if (!referrer) return { valid: false, reason: "Referral code not found" };
      if (referrer.user_id === currentUserId) return { valid: false, reason: "Cannot use your own referral code" };

      // Check if this user already has a referral from this referrer
      const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referrer_id", referrer.user_id)
        .eq("referred_id", currentUserId!);

      if (existing && existing.length > 0) return { valid: false, reason: "You already used this referral" };

      // Check if user already has any referral as referred (only one allowed)
      const { data: anyExisting } = await supabase
        .from("referrals")
        .select("id")
        .eq("referred_id", currentUserId!);

      if (anyExisting && anyExisting.length > 0) return { valid: false, reason: "You already have a referral on your account" };

      return {
        valid: true,
        referrerId: referrer.user_id,
        referrerName: referrer.display_name || "A friend",
      };
    },
  });
}

/**
 * Process referral completion after a successful first qualifying purchase.
 * Called from useCheckout after order creation.
 */
export async function processReferralOnFirstPurchase(
  customerId: string,
  orderId: string,
  orderNumber: string
) {
  // Check if customer has a pending referral as the referred person
  const { data: pendingReferrals } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_id", customerId)
    .eq("status", "pending");

  if (!pendingReferrals || pendingReferrals.length === 0) return null;

  const referral = pendingReferrals[0];

  // Check this is actually the customer's first successful order
  const { data: previousOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_id", customerId)
    .eq("payment_status", "paid")
    .neq("id", orderId);

  if (previousOrders && previousOrders.length > 0) {
    // Not first purchase — don't trigger
    return null;
  }

  // Complete the referral and grant rewards to both parties
  const { error: updateError } = await supabase
    .from("referrals")
    .update({
      status: "completed",
      qualifying_order_id: orderId,
      completed_at: new Date().toISOString(),
      referrer_rewarded: true,
      referred_rewarded: true,
    } as any)
    .eq("id", referral.id);

  if (updateError) {
    console.error("Failed to complete referral:", updateError);
    return null;
  }

  return {
    referralId: referral.id,
    referrerId: referral.referrer_id,
    referredId: referral.referred_id,
    rewardAmount: Number(referral.reward_amount || REFERRAL_REWARD_AMOUNT),
  };
}

/** Create a pending referral when a user enters a referral code */
export function useCreateReferral() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      referrerId,
      referredId,
      referredEmail,
    }: {
      referrerId: string;
      referredId: string;
      referredEmail?: string;
    }) => {
      const { error } = await supabase.from("referrals").insert({
        referrer_id: referrerId,
        referred_id: referredId,
        referred_email: referredEmail || null,
        referral_code: generateReferralCode(referrerId),
        status: "pending",
        reward_amount: REFERRAL_REWARD_AMOUNT,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["available-referral-reward"] });
      qc.invalidateQueries({ queryKey: ["validate-referral-code"] });
      toast({ title: "Referral applied! 🎁", description: "You'll both get $10 off after your first purchase." });
    },
    onError: (e: any) => {
      toast({ title: "Referral failed", description: e.message, variant: "destructive" });
    },
  });
}

/** Admin: get all referrals */
export function useAdminReferrals() {
  return useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get profile names
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");
      const nameMap = new Map<string, string>();
      (profiles || []).forEach((p: any) => nameMap.set(p.user_id, p.display_name || "Unknown"));

      return (data || []).map((r: any) => ({
        ...r,
        referrer_name: nameMap.get(r.referrer_id) || "Unknown",
        referred_name: r.referred_id ? nameMap.get(r.referred_id) || "Unknown" : "Pending",
      }));
    },
  });
}
