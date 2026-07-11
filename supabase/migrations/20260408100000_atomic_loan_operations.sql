-- Atomic loan operations: approve, disburse, redeem, pay-interest
-- Adds disbursed_at, cycle uniqueness, and Postgres RPCs with FOR UPDATE

ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS disbursed_at timestamp with time zone;

COMMENT ON COLUMN public.loans.disbursed_at IS 'Thời điểm giải ngân — mốc tính lãi';

CREATE UNIQUE INDEX IF NOT EXISTS loan_payment_cycles_loan_cycle_unique_idx
ON public.loan_payment_cycles (loan_id, cycle_number);

-- Approve: pending -> approved (optimistic lock)
CREATE OR REPLACE FUNCTION public.approve_loan(p_loan_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  PERFORM id FROM public.loans WHERE id = p_loan_id FOR UPDATE;

  UPDATE public.loans
  SET
    status = 'approved'::public.loan_status,
    approved_at = now(),
    updated_at = now()
  WHERE id = p_loan_id
    AND status = 'pending'::public.loan_status;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Khoản vay không ở trạng thái chờ duyệt hoặc đã được xử lý'
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Disburse: signed -> disbursed (optimistic lock)
CREATE OR REPLACE FUNCTION public.disburse_loan(p_loan_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  PERFORM id FROM public.loans WHERE id = p_loan_id FOR UPDATE;

  UPDATE public.loans
  SET
    status = 'disbursed'::public.loan_status,
    disbursed_at = now(),
    updated_at = now()
  WHERE id = p_loan_id
    AND status = 'signed'::public.loan_status;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Khoản vay chưa được ký hợp đồng hoặc đã được giải ngân'
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Redeem: disbursed -> redeemed (atomic payments + status)
CREATE OR REPLACE FUNCTION public.redeem_loan(
  p_loan_id uuid,
  p_principal_amount numeric,
  p_interest_amount numeric,
  p_notes text,
  p_user_id text,
  p_user_name text,
  p_status_message text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_loan public.loans%ROWTYPE;
  v_cycle_id uuid;
  v_total numeric;
BEGIN
  SELECT * INTO v_loan
  FROM public.loans
  WHERE id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không tìm thấy khoản vay');
  END IF;

  IF v_loan.status <> 'disbursed'::public.loan_status THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Khoản vay chưa được giải ngân hoặc đã hoàn thành'
    );
  END IF;

  IF p_principal_amount IS NULL OR p_principal_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Số tiền gốc không hợp lệ');
  END IF;

  IF p_interest_amount IS NULL OR p_interest_amount < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Số tiền lãi không hợp lệ');
  END IF;

  IF p_principal_amount <> v_loan.amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Số tiền gốc không khớp với khoản vay'
    );
  END IF;

  SELECT id INTO v_cycle_id
  FROM public.loan_payment_cycles
  WHERE loan_id = p_loan_id
    AND cycle_number = v_loan.current_cycle
  FOR UPDATE;

  IF v_cycle_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Không tìm thấy chu kỳ thanh toán'
    );
  END IF;

  INSERT INTO public.loan_payment_transactions (
    loan_id, cycle_id, transaction_type, amount, payment_method, notes, created_by
  ) VALUES (
    p_loan_id,
    v_cycle_id,
    'principal_payment'::public.payment_transaction_type,
    p_principal_amount,
    'cash'::public.payment_method_type,
    COALESCE(p_notes, 'Chuộc đồ - Trả gốc'),
    p_user_id
  );

  IF p_interest_amount > 0 THEN
    INSERT INTO public.loan_payment_transactions (
      loan_id, cycle_id, transaction_type, amount, payment_method, notes, created_by
    ) VALUES (
      p_loan_id,
      v_cycle_id,
      'interest_payment'::public.payment_transaction_type,
      p_interest_amount,
      'cash'::public.payment_method_type,
      COALESCE(p_notes, 'Chuộc đồ - Trả lãi'),
      p_user_id
    );

    UPDATE public.loan_payment_cycles
    SET
      total_interest_paid = total_interest_paid + p_interest_amount,
      updated_at = now()
    WHERE id = v_cycle_id;
  END IF;

  UPDATE public.loans
  SET
    status = 'redeemed'::public.loan_status,
    status_message = p_status_message,
    updated_at = now()
  WHERE id = p_loan_id
    AND status = 'disbursed'::public.loan_status;

  v_total := p_principal_amount + p_interest_amount;

  INSERT INTO public.loan_activity_logs (
    loan_id, type, user_id, user_name, system_message
  ) VALUES (
    p_loan_id,
    'system_event'::public.activity_log_type,
    p_user_id,
    p_user_name,
    'Chuộc đồ thành công - Tổng: ' || v_total::text || ' VNĐ'
  );

  RETURN jsonb_build_object(
    'success', true,
    'total_amount', v_total
  );
END;
$$;

-- Pay interest: atomic transaction + cycle + optional period update
CREATE OR REPLACE FUNCTION public.record_interest_payment(
  p_loan_id uuid,
  p_cycle_id uuid,
  p_period_id uuid,
  p_amount numeric,
  p_notes text,
  p_user_id text,
  p_user_name text,
  p_new_period_status public.payment_period_status,
  p_system_message text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_loan_status public.loan_status;
  v_new_total numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Số tiền không hợp lệ');
  END IF;

  SELECT status INTO v_loan_status
  FROM public.loans
  WHERE id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không tìm thấy khoản vay');
  END IF;

  IF v_loan_status <> 'disbursed'::public.loan_status THEN
    RETURN jsonb_build_object('success', false, 'error', 'Khoản vay chưa được giải ngân');
  END IF;

  PERFORM id FROM public.loan_payment_cycles
  WHERE id = p_cycle_id AND loan_id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không tìm thấy chu kỳ thanh toán');
  END IF;

  INSERT INTO public.loan_payment_transactions (
    loan_id, cycle_id, period_id, transaction_type, amount, payment_method, notes, created_by
  ) VALUES (
    p_loan_id,
    p_cycle_id,
    p_period_id,
    'interest_payment'::public.payment_transaction_type,
    p_amount,
    'cash'::public.payment_method_type,
    p_notes,
    p_user_id
  );

  UPDATE public.loan_payment_cycles
  SET
    total_interest_paid = total_interest_paid + p_amount,
    updated_at = now()
  WHERE id = p_cycle_id
  RETURNING total_interest_paid INTO v_new_total;

  IF p_period_id IS NOT NULL THEN
    PERFORM id FROM public.loan_payment_periods
    WHERE id = p_period_id AND cycle_id = p_cycle_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PERIOD_NOT_FOUND';
    END IF;

    UPDATE public.loan_payment_periods
    SET
      paid_amount = paid_amount + p_amount,
      status = p_new_period_status
    WHERE id = p_period_id;
  END IF;

  INSERT INTO public.loan_activity_logs (
    loan_id, type, user_id, user_name, system_message
  ) VALUES (
    p_loan_id,
    'system_event'::public.activity_log_type,
    p_user_id,
    p_user_name,
    p_system_message
  );

  RETURN jsonb_build_object(
    'success', true,
    'total_interest_paid', v_new_total
  );
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM = 'PERIOD_NOT_FOUND' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Không tìm thấy kỳ thanh toán');
    END IF;
    RAISE;
END;
$$;

COMMENT ON FUNCTION public.approve_loan(uuid) IS 'Atomically approve a pending loan';
COMMENT ON FUNCTION public.disburse_loan(uuid) IS 'Atomically disburse a signed loan';
COMMENT ON FUNCTION public.redeem_loan(uuid, numeric, numeric, text, text, text, text) IS 'Atomically redeem a disbursed loan';
COMMENT ON FUNCTION public.record_interest_payment(uuid, uuid, uuid, numeric, text, text, text, public.payment_period_status, text) IS 'Atomically record interest payment';

-- Refresh PostgREST schema cache so new column/RPCs are visible to the API
NOTIFY pgrst, 'reload schema';
