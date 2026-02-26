
-- Add customer management fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb,
  ADD COLUMN IF NOT EXISTS billing_address jsonb;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Allow admins to update all profiles (for notes, VIP, tags)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create customer_activity table for admin audit trail
CREATE TABLE public.customer_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  actor_id uuid,
  actor_name text,
  action text NOT NULL,
  details text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer activity"
  ON public.customer_activity FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create loyalty_ledger table for points history
CREATE TABLE public.loyalty_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  order_id uuid,
  points integer NOT NULL DEFAULT 0,
  balance_after integer NOT NULL DEFAULT 0,
  type text NOT NULL, -- 'earned', 'redeemed', 'manual_add', 'manual_subtract', 'reversal'
  description text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage loyalty ledger"
  ON public.loyalty_ledger FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Customers can view own loyalty"
  ON public.loyalty_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid,
  referred_email text,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'expired', 'reversed'
  reward_amount numeric DEFAULT 10,
  referrer_rewarded boolean DEFAULT false,
  referred_rewarded boolean DEFAULT false,
  qualifying_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage referrals"
  ON public.referrals FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
