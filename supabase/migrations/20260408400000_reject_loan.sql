-- Reject loan: pending -> rejected (atomic status update + activity log)

CREATE OR REPLACE FUNCTION public.reject_loan(
  p_loan_id uuid,
  p_reason text DEFAULT NULL,
  p_user_id text DEFAULT NULL,
  p_user_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
  v_status_message text;
  v_system_message text;
BEGIN
  PERFORM id FROM public.loans WHERE id = p_loan_id FOR UPDATE;

  v_status_message := 'Từ chối khoản vay';
  v_system_message := v_status_message;

  IF p_reason IS NOT NULL AND btrim(p_reason) <> '' THEN
    v_status_message := v_status_message || ' - ' || btrim(p_reason);
    v_system_message := v_status_message;
  END IF;

  UPDATE public.loans
  SET
    status = 'rejected'::public.loan_status,
    status_message = v_status_message,
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

  INSERT INTO public.loan_activity_logs (
    loan_id, type, user_id, user_name, system_message
  ) VALUES (
    p_loan_id,
    'approval'::public.activity_log_type,
    p_user_id,
    p_user_name,
    v_system_message
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

COMMENT ON FUNCTION public.reject_loan(uuid, text, text, text) IS
  'Atomically reject a pending loan and log the rejection reason.';

NOTIFY pgrst, 'reload schema';
