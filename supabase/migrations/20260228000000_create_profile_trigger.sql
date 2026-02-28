-- Function để tự động tạo profile khi user mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Lấy role_id mặc định (role 'user')
  SELECT id INTO default_role_id
  FROM public.roles
  WHERE code = 'user'
  LIMIT 1;

  -- Tạo profile mới
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    default_role_id,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger để gọi function khi có user mới
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Tự động tạo profile trong public.profiles khi user mới đăng ký trong auth.users';
