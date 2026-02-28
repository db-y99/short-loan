-- Backfill: Tạo profiles cho các users đã tồn tại nhưng chưa có profile
DO $$
DECLARE
  default_role_id uuid;
  user_record RECORD;
BEGIN
  -- Lấy role_id mặc định (role 'user')
  SELECT id INTO default_role_id
  FROM public.roles
  WHERE code = 'user'
  LIMIT 1;

  -- Tìm tất cả users chưa có profile
  FOR user_record IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Tạo profile cho user này
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role_id,
      created_at,
      updated_at
    )
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', SPLIT_PART(user_record.email, '@', 1)),
      default_role_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created profile for user: %', user_record.email;
  END LOOP;
END $$;
