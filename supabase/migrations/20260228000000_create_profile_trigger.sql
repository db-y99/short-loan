-- Function để tự động tạo profile khi user mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Tạo profile mới với role mặc định là 'user'
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'user',
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
