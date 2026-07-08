-- Atomic flexible payment recording with safe cycle creation (unique loan_id + cycle_number)

CREATE OR REPLACE FUNCTION public.record_flexible_payment(
  p_loan_id uuid,
  p_amount numeric,
  p_notes text,
  p_user_id text,
  p_user_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_loan record;
  v_cycle_id uuid;
  v_payment_id uuid;
  v_total_paid numeric;
  v_note text;
  v_system_message text;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Số tiền không hợp lệ');
  END IF;

  SELECT id, status, amount, current_cycle
  INTO v_loan
  FROM public.loans
  WHERE id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không tìm thấy khoản vay');
  END IF;

  IF v_loan.status <> 'disbursed'::public.loan_status THEN
    RETURN jsonb_build_object('success', false, 'error', 'Khoản vay chưa được giải ngân');
  END IF;

  v_note := COALESCE(
    NULLIF(trim(p_notes), ''),
    'Thanh toán linh hoạt ' || p_amount::text || ' VNĐ'
  );

  INSERT INTO public.loan_payment_cycles (
    loan_id,
    cycle_number,
    principal,
    start_date,
    end_date
  ) VALUES (
    p_loan_id,
    COALESCE(v_loan.current_cycle, 1),
    v_loan.amount,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
  )
  ON CONFLICT (loan_id, cycle_number) DO NOTHING;

  SELECT id INTO v_cycle_id
  FROM public.loan_payment_cycles
  WHERE loan_id = p_loan_id
    AND cycle_number = COALESCE(v_loan.current_cycle, 1)
  FOR UPDATE;

  IF v_cycle_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Không thể tạo hoặc lấy chu kỳ thanh toán'
    );
  END IF;

  INSERT INTO public.loan_payment_transactions (
    loan_id,
    cycle_id,
    period_id,
    transaction_type,
    amount,
    payment_method,
    notes,
    created_by
  ) VALUES (
    p_loan_id,
    v_cycle_id,
    NULL,
    'fee_payment'::public.payment_transaction_type,
    p_amount,
    'cash'::public.payment_method_type,
    v_note,
    p_user_id
  )
  RETURNING id INTO v_payment_id;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_paid
  FROM public.loan_payment_transactions
  WHERE loan_id = p_loan_id;

  v_system_message := 'Đóng tiền linh hoạt ' || p_amount::text || ' VNĐ';
  IF NULLIF(trim(p_notes), '') IS NOT NULL THEN
    v_system_message := v_system_message || ' - ' || trim(p_notes);
  END IF;

  INSERT INTO public.loan_activity_logs (
    loan_id, type, user_id, user_name, system_message
  ) VALUES (
    p_loan_id,
    'system_event'::public.activity_log_type,
    p_user_id,
    p_user_name,
    v_system_message
  );

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'total_paid', v_total_paid
  );
END;
$$;

COMMENT ON FUNCTION public.record_flexible_payment(uuid, numeric, text, text, text)
IS 'Atomically record a flexible fee payment with safe cycle upsert';
