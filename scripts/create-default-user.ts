import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function createDefaultUser() {
  console.log("=== Tạo tài khoản mặc định ===\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌ Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const email = "admin@y99.com";
  const password = "Admin@123";
  const fullName = "Admin Y99";

  try {
    console.log("⏳ Đang tạo tài khoản...");

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log("\n⚠️  Tài khoản đã tồn tại!");
        console.log("\nThông tin đăng nhập:");
        console.log(`Email: ${email}`);
        console.log(`Mật khẩu: ${password}`);
        return;
      }
      console.error("❌ Lỗi:", error.message);
      process.exit(1);
    }

    console.log("\n✅ Tạo tài khoản thành công!");
    console.log("\nThông tin đăng nhập:");
    console.log(`Email: ${email}`);
    console.log(`Mật khẩu: ${password}`);
    console.log(`User ID: ${data.user.id}`);
    console.log(`Họ tên: ${fullName}`);
  } catch (err) {
    console.error("❌ Có lỗi xảy ra:", err);
    process.exit(1);
  }
}

createDefaultUser();
