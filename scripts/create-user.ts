import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createUser() {
  console.log("=== Tạo tài khoản người dùng ===\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌ Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY"
    );
    console.log(
      "\nVui lòng thêm SUPABASE_SERVICE_ROLE_KEY vào file .env.local"
    );
    console.log(
      "Lấy service role key từ: Supabase Dashboard > Settings > API > service_role key"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const email = await question("Email: ");
    const password = await question("Mật khẩu: ");
    const fullName = await question("Họ tên: ");

    if (!email || !password || !fullName) {
      console.error("❌ Vui lòng nhập đầy đủ thông tin");
      rl.close();
      process.exit(1);
    }

    console.log("\n⏳ Đang tạo tài khoản...");

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      console.error("❌ Lỗi:", error.message);
      rl.close();
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
  } finally {
    rl.close();
  }
}

createUser();
