/**
 * Script để tạo payment cycles cho các loan chưa có
 * Chạy: npx tsx scripts/migrate-payment-cycles.ts
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load env
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePaymentCycles() {
  console.log("🔄 Starting payment cycles migration...\n");

  try {
    // 1. Lấy tất cả loans
    const { data: loans, error: loansError } = await supabase
      .from("loans")
      .select("id, code, amount, loan_type, signed_at, created_at, current_cycle")
      .order("created_at", { ascending: true });

    if (loansError) {
      throw new Error(`Failed to fetch loans: ${loansError.message}`);
    }

    if (!loans || loans.length === 0) {
      console.log("✅ No loans found");
      return;
    }

    console.log(`📊 Found ${loans.length} loans\n`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const loan of loans) {
      try {
        // 2. Kiểm tra xem loan đã có payment cycle chưa
        const { data: existingCycle } = await supabase
          .from("loan_payment_cycles")
          .select("id")
          .eq("loan_id", loan.id)
          .eq("cycle_number", loan.current_cycle || 1)
          .single();

        if (existingCycle) {
          console.log(`⏭️  Skipped ${loan.code} - already has cycle`);
          skipped++;
          continue;
        }

        // 3. Tạo payment cycle mới
        const startDate = new Date(loan.signed_at || loan.created_at)
          .toISOString()
          .split("T")[0];
        const endDate = new Date(
          new Date(loan.signed_at || loan.created_at).getTime() +
            30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0];

        const { data: cycle, error: cycleError } = await supabase
          .from("loan_payment_cycles")
          .insert({
            loan_id: loan.id,
            cycle_number: loan.current_cycle || 1,
            principal: loan.amount,
            start_date: startDate,
            end_date: endDate,
          })
          .select("id")
          .single();

        if (cycleError) {
          throw new Error(`Failed to create cycle: ${cycleError.message}`);
        }

        console.log(`✅ Created cycle for ${loan.code} (cycle_id: ${cycle.id})`);
        created++;

        // 4. Tạo payment periods (optional - có thể tính động)
        // Bỏ qua bước này vì có thể tính động khi cần
      } catch (error) {
        console.error(
          `❌ Failed to process ${loan.code}:`,
          error instanceof Error ? error.message : error
        );
        failed++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${loans.length}\n`);

    if (failed > 0) {
      console.log("⚠️  Some loans failed to migrate. Check errors above.");
      process.exit(1);
    } else {
      console.log("✅ Migration completed successfully!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migratePaymentCycles();
