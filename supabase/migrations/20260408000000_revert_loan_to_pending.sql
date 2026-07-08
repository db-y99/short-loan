-- Atomic revert: approved -> pending + delete generated contracts
-- Ensures all-or-nothing when any step fails mid-operation

CREATE OR REPLACE FUNCTION public.revert_loan_to_pending(p_loan_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_status public.loan_status;
BEGIN
  SELECT status
  INTO v_status
  FROM public.loans
  WHERE id = p_loan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Không tìm thấy khoản vay'
    );
  END IF;

  IF v_status <> 'approved'::public.loan_status THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Chỉ được trả về chờ duyệt khi khoản vay đang ở trạng thái đã duyệt'
    );
  END IF;

  DELETE FROM public.loan_files
  WHERE loan_id = p_loan_id
    AND type IN (
      'asset_pledge_contract'::public.loan_file_type,
      'asset_lease_contract'::public.loan_file_type,
      'full_payment_confirmation'::public.loan_file_type,
      'asset_disposal_authorization'::public.loan_file_type
    );

  UPDATE public.loans
  SET
    status = 'pending'::public.loan_status,
    approved_at = NULL,
    updated_at = now()
  WHERE id = p_loan_id
    AND status = 'approved'::public.loan_status;

  RETURN jsonb_build_object('success', true);
END;
$$;

COMMENT ON FUNCTION public.revert_loan_to_pending(uuid) IS
  'Atomically revert an approved loan to pending and delete generated contract files.';
