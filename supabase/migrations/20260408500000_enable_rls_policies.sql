-- Enable Row Level Security for all public business tables.
-- Policies mirror current app behavior: authenticated active users retain full access;
-- anonymous users are blocked; service_role and SECURITY DEFINER functions keep working.

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to avoid RLS recursion on profiles)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_authenticated() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user() TO authenticated;

COMMENT ON FUNCTION public.is_authenticated() IS 'Returns true when request has a valid auth.uid()';
COMMENT ON FUNCTION public.is_active_user() IS 'Returns true when auth user has an active, non-deleted profile';

-- ---------------------------------------------------------------------------
-- Revoke dangerous anonymous access on public tables
-- ---------------------------------------------------------------------------

REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.branches FROM anon;
REVOKE ALL ON TABLE public.customers FROM anon;
REVOKE ALL ON TABLE public.loans FROM anon;
REVOKE ALL ON TABLE public.loan_references FROM anon;
REVOKE ALL ON TABLE public.loan_assets FROM anon;
REVOKE ALL ON TABLE public.loan_files FROM anon;
REVOKE ALL ON TABLE public.loan_activity_logs FROM anon;
REVOKE ALL ON TABLE public.loan_payment_cycles FROM anon;
REVOKE ALL ON TABLE public.loan_payment_periods FROM anon;
REVOKE ALL ON TABLE public.loan_interest_payments FROM anon;
REVOKE ALL ON TABLE public.loan_payment_transactions FROM anon;
REVOKE ALL ON TABLE public.app_sequences FROM anon;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payment_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payment_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_interest_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_sequences ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles (special: own row always readable; active users manage all)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_select_active_users ON public.profiles;
CREATE POLICY profiles_select_active_users
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_active_user());

DROP POLICY IF EXISTS profiles_update_active_users ON public.profiles;
CREATE POLICY profiles_update_active_users
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- branches
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS branches_active_users_all ON public.branches;
CREATE POLICY branches_active_users_all
  ON public.branches
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

-- ---------------------------------------------------------------------------
-- loan domain tables (active authenticated users — matches current app scope)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS customers_active_users_all ON public.customers;
CREATE POLICY customers_active_users_all
  ON public.customers
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loans_active_users_all ON public.loans;
CREATE POLICY loans_active_users_all
  ON public.loans
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_references_active_users_all ON public.loan_references;
CREATE POLICY loan_references_active_users_all
  ON public.loan_references
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_assets_active_users_all ON public.loan_assets;
CREATE POLICY loan_assets_active_users_all
  ON public.loan_assets
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_files_active_users_all ON public.loan_files;
CREATE POLICY loan_files_active_users_all
  ON public.loan_files
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_activity_logs_active_users_all ON public.loan_activity_logs;
CREATE POLICY loan_activity_logs_active_users_all
  ON public.loan_activity_logs
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_payment_cycles_active_users_all ON public.loan_payment_cycles;
CREATE POLICY loan_payment_cycles_active_users_all
  ON public.loan_payment_cycles
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_payment_periods_active_users_all ON public.loan_payment_periods;
CREATE POLICY loan_payment_periods_active_users_all
  ON public.loan_payment_periods
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_interest_payments_active_users_all ON public.loan_interest_payments;
CREATE POLICY loan_interest_payments_active_users_all
  ON public.loan_interest_payments
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS loan_payment_transactions_active_users_all ON public.loan_payment_transactions;
CREATE POLICY loan_payment_transactions_active_users_all
  ON public.loan_payment_transactions
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

-- app_sequences: no direct client access (only via SECURITY DEFINER get_next_contract_seq)

NOTIFY pgrst, 'reload schema';
