import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testConnection() {
  console.log("=== Kiểm tra kết nối Supabase ===\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("URL:", supabaseUrl);
  console.log("Service Key:", supabaseServiceKey ? "✓ Có" : "✗ Không có");
  console.log();

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Thiếu biến môi trường");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    console.log("⏳ Đang kiểm tra kết nối...");
    
    // Test simple query
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      console.error("❌ Lỗi kết nối:", error.message);
      console.error("Chi tiết:", JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log("✅ Kết nối thành công!");
    console.log(`Số user hiện tại: ${data.users.length > 0 ? "Có dữ liệu" : "Chưa có user"}`);
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
}

testConnection();
