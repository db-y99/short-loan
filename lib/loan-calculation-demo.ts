/**
 * 📊 DEMO - Loan Calculation Examples
 * Minh họa kết quả tính toán cho 3 gói vay
 */

import {
  calculateLoan,
  formatMoney,
  getTotalPaymentInstallment,
  type TInstallmentPeriod,
  type TBulletPayment,
} from "./loan-calculation";
import { LOAN_TYPES } from "@/constants/loan";

/* =========================
   DEMO DATA
========================== */

const DEMO_LOAN_AMOUNT = 10_000_000; // 10 triệu VND

/* =========================
   DEMO FUNCTIONS
========================== */

function printInstallmentDetails(installments: TInstallmentPeriod[]) {
  console.log("\n📋 CHI TIẾT TỪNG KỲ:");
  console.log("─".repeat(80));

  installments.forEach((period) => {
    console.log(`\n🔹 KỲ ${period.period} - Đáo hạn ngày ${period.dueDay}:`);
    console.log(`   Tiền gốc:           ${formatMoney(period.principal)}`);
    console.log(`   Tiền lãi (0.033%):  ${formatMoney(period.interest)}`);
    console.log(`   Phí thuê TS:        ${formatMoney(period.rentalFee)}`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   TỔNG PHẢI TRẢ:      ${formatMoney(period.total)}`);
    console.log(
      `   (Mục tiêu lợi nhuận: ${formatMoney(period.targetProfit)})`,
    );
  });

  const grandTotal = getTotalPaymentInstallment(installments);
  console.log("\n" + "═".repeat(80));
  console.log(`💰 TỔNG CỘNG CẢ 3 KỲ: ${formatMoney(grandTotal)}`);
  console.log(
    `📊 Lợi nhuận tổng: ${formatMoney(grandTotal - DEMO_LOAN_AMOUNT)} (${((grandTotal / DEMO_LOAN_AMOUNT - 1) * 100).toFixed(2)}%)`,
  );
}

function printBulletPaymentDetails(
  payments: TBulletPayment[],
  packageName: string,
) {
  console.log(`\n📋 ${packageName}:`);
  console.log("─".repeat(80));

  payments.forEach((payment) => {
    const profit = payment.total - DEMO_LOAN_AMOUNT;
    console.log(
      `\n🔹 MỐC ${payment.milestone} - ${payment.days} ngày (${(payment.rate * 100).toFixed(2)}%):`,
    );
    console.log(`   Tổng chuộc: ${formatMoney(payment.total)}`);
    console.log(`   Lợi nhuận:  ${formatMoney(profit)}`);
  });
}

/* =========================
   MAIN DEMO
========================== */

export function runLoanCalculationDemo() {
  console.log("╔" + "═".repeat(78) + "╗");
  console.log("║" + " ".repeat(20) + "DEMO TÍNH TOÁN 3 GÓI VAY" + " ".repeat(33) + "║");
  console.log("╚" + "═".repeat(78) + "╝");
  console.log(`\n💵 Số tiền vay: ${formatMoney(DEMO_LOAN_AMOUNT)}\n`);

  /* =========================
     GÓI 1: TRẢ GÓP 3 KỲ
  ========================== */

  console.log("\n" + "█".repeat(80));
  console.log("█  GÓI 1: VAY TRẢ GÓP (3 KỲ)");
  console.log("█".repeat(80));

  const goi1 = calculateLoan(DEMO_LOAN_AMOUNT, LOAN_TYPES.INSTALLMENT_3_PERIODS);

  console.log(`\n📌 Phí thẩm định (5%): ${formatMoney(goi1.appraisalFee)}`);
  console.log(`💸 Tiền khách thực nhận: ${formatMoney(goi1.netAmount)}`);

  if (goi1.installments) {
    printInstallmentDetails(goi1.installments);
  }

  console.log("\n📝 Giải thích:");
  console.log("   • Lãi suất: 0.033%/ngày (tính trên số dư gốc còn lại)");
  console.log("   • Phí thuê: Bù vào để đạt mục tiêu lợi nhuận (3%, 5%, 7%)");
  console.log("   • Công thức: Tổng = Gốc + Lãi + Phí thuê");

  /* =========================
     GÓI 2: GỐC CUỐI KỲ (THEO MỐC)
  ========================== */

  console.log("\n\n" + "█".repeat(80));
  console.log("█  GÓI 2: GỐC CUỐI KỲ (THEO MỐC)");
  console.log("█  → Khách giữ tài sản để sử dụng (xe máy/ô tô)");
  console.log("█".repeat(80));

  const goi2 = calculateLoan(
    DEMO_LOAN_AMOUNT,
    LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE,
  );

  console.log(`\n📌 Phí thẩm định: ${formatMoney(goi2.appraisalFee)} (Không áp dụng)`);
  console.log(`💸 Tiền khách thực nhận: ${formatMoney(goi2.netAmount)}`);

  if (goi2.bulletPayments) {
    printBulletPaymentDetails(goi2.bulletPayments, "CÁC MỐC THANH TOÁN");
  }

  console.log("\n📝 Đặc điểm:");
  console.log("   • Khách được sử dụng tài sản → Phí cao hơn");
  console.log("   • Trả 1 lần gốc + phí tại mốc đáo hạn");
  console.log("   • Phí: 5% (7 ngày), 8% (18 ngày), 12% (30 ngày)");

  /* =========================
     GÓI 3: GỐC CUỐI KỲ + GIỮ TS
  ========================== */

  console.log("\n\n" + "█".repeat(80));
  console.log("█  GÓI 3: GỐC CUỐI KỲ + GIỮ TÀI SẢN");
  console.log("█  → Tài sản lưu kho tại cửa hàng");
  console.log("█".repeat(80));

  const goi3 = calculateLoan(
    DEMO_LOAN_AMOUNT,
    LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD,
  );

  console.log(`\n📌 Phí thẩm định: ${formatMoney(goi3.appraisalFee)} (Không áp dụng)`);
  console.log(`💸 Tiền khách thực nhận: ${formatMoney(goi3.netAmount)}`);

  if (goi3.bulletPayments) {
    printBulletPaymentDetails(goi3.bulletPayments, "CÁC MỐC THANH TOÁN");
  }

  console.log("\n📝 Đặc điểm:");
  console.log("   • Tài sản được giữ tại cửa hàng → Phí thấp hơn Gói 2");
  console.log("   • Trả 1 lần gốc + phí tại mốc đáo hạn");
  console.log("   • Phí: 1.25% (7 ngày), 3.5% (18 ngày), 5% (30 ngày)");

  /* =========================
     SO SÁNH 3 GÓI
  ========================== */

  console.log("\n\n" + "█".repeat(80));
  console.log("█  SO SÁNH 3 GÓI VAY (Mốc 30 ngày)");
  console.log("█".repeat(80));

  const goi1Total30 = goi1.installments
    ? getTotalPaymentInstallment(goi1.installments)
    : 0;
  const goi2Total30 = goi2.bulletPayments?.[2].total ?? 0;
  const goi3Total30 = goi3.bulletPayments?.[2].total ?? 0;

  console.log(`\n🔹 Gói 1 (Trả góp 3 kỳ):        ${formatMoney(goi1Total30)}`);
  console.log(`🔹 Gói 2 (Gốc cuối + Dùng TS):  ${formatMoney(goi2Total30)}`);
  console.log(`🔹 Gói 3 (Gốc cuối + Giữ TS):   ${formatMoney(goi3Total30)}`);

  console.log("\n📊 Lợi nhuận so với vốn gốc:");
  console.log(
    `   Gói 1: ${((goi1Total30 / DEMO_LOAN_AMOUNT - 1) * 100).toFixed(2)}%`,
  );
  console.log(
    `   Gói 2: ${((goi2Total30 / DEMO_LOAN_AMOUNT - 1) * 100).toFixed(2)}%`,
  );
  console.log(
    `   Gói 3: ${((goi3Total30 / DEMO_LOAN_AMOUNT - 1) * 100).toFixed(2)}%`,
  );

  console.log("\n" + "═".repeat(80));
  console.log("✅ DEMO HOÀN TẤT");
  console.log("═".repeat(80) + "\n");
}

/* =========================
   EXPORT FOR TESTING
========================== */

export const demoExamples = {
  goi1: calculateLoan(DEMO_LOAN_AMOUNT, LOAN_TYPES.INSTALLMENT_3_PERIODS),
  goi2: calculateLoan(
    DEMO_LOAN_AMOUNT,
    LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE,
  ),
  goi3: calculateLoan(
    DEMO_LOAN_AMOUNT,
    LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD,
  ),
};

// Uncomment để chạy demo:
// runLoanCalculationDemo();
