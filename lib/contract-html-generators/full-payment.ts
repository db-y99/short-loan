import type { TFullPaymentConfirmationData } from "@/types/contract.types";

export function generateFullPaymentHTML(data: TFullPaymentConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; padding: 0; }
    @page { margin-top: 20mm; margin-bottom: 0; margin-left: 0; margin-right: 0; size: A4; }
    .container {
      width: 210mm;
      background-color: white;
      font-family: 'Times New Roman', serif;
      font-size: 13pt;
      line-height: 1.6;
      color: #000;
      padding: 20mm;
      min-height: 297mm;
    }
    .section { 
      margin-bottom: 20px; 
      page-break-inside: avoid;
    }
    .section.page-break-before {
      page-break-before: always;
      padding-top: 20mm;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    ul { padding-left: 40px; list-style-type: disc; margin: 0; }
    ol { padding-left: 40px; list-style-type: decimal; margin: 0; }
    li { margin-bottom: 6px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
    .signature-box { text-align: center; width: 45%; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="center" style="margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 14pt; font-weight: bold;">
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
      </h2>
      <p style="margin: 5px 0; font-size: 12pt;">
        Độc lập – Tự do – Hạnh phúc
      </p>
      <div>---o0o---</div>
    </div>

    <!-- Title -->
    <div class="center" style="margin: 24px 0;">
      <h1 style="font-size: 16pt; font-weight: bold; margin: 10px 0;">
        XÁC NHẬN ĐÃ NHẬN ĐỦ TIỀN
      </h1>
      <p style="font-size: 12pt;">
        (Kèm theo Hợp đồng cầm cố số: ${data.MA_HD} ngày ${data.NGAY_HD})
      </p>
    </div>

    <p style="margin-bottom: 20px;">
      Hôm nay, ${data.NGAY} tháng ${data.THANG} năm ${data.NAM} tại 99B Nguyễn
      Trãi, phường Tân An, Ninh Kiều, thành phố Cần Thơ.
    </p>
    <p style="margin-bottom: 16px;">Chúng tôi gồm có:</p>

    <!-- Section I -->
    <div class="section">
      <p class="bold" style="margin-bottom: 8px;">
        I. BÊN GIAO TIỀN (Bên nhận cầm cố):
      </p>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ul>
          <li>
            Tên đơn vị/Doanh nghiệp: <strong>${data.BEN_GIAO_TEN}</strong>
          </li>
          <li>
            Đại diện Ông/Bà: <strong>${data.BEN_GIAO_DAI_DIEN}</strong>
          </li>
          <li>
            Chức vụ: <strong>${data.BEN_GIAO_CHUC_VU}</strong>
          </li>
          <li>
            Địa chỉ: <strong>${data.BEN_GIAO_DIA_CHI}</strong>
          </li>
          <li>
            Mã số thuế/CMND/CCCD số: <strong>${data.BEN_GIAO_MST}</strong> cấp ngày: 14/01/2025 tại:
            Ninh Kiều - Thuế cơ sở 1 thành phố Cần Thơ
          </li>
          <li>
            Số điện thoại: <strong>${data.BEN_GIAO_SDT}</strong>
          </li>
        </ul>
      </div>
    </div>

    <!-- Section II -->
    <div class="section">
      <p class="bold" style="margin-bottom: 8px;">
        II. BÊN NHẬN TIỀN (Bên cầm cố):
      </p>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ul>
          <li>
            Họ và tên: <strong>${data.HO_TEN}</strong>
          </li>
          <li>
            CCCD: <strong>${data.CCCD}</strong>; Ngày cấp: <strong>${data.NGAY_CAP}</strong>; Nơi cấp: <strong>${data.NOI_CAP}</strong>.
          </li>
          <li>
            Địa chỉ thường trú: <strong>${data.DIA_CHI}</strong>
          </li>
          <li>
            Số điện thoại liên hệ: <strong>${data.SDT}</strong>.
          </li>
        </ul>
      </div>
    </div>

    <!-- Section III -->
    <div class="section">
      <p class="bold" style="margin-bottom: 8px;">
        III. NỘI DUNG XÁC NHẬN:
      </p>
      <p style="margin-bottom: 8px;">
        Bên Nhận Tiền xác nhận đã nhận đủ số tiền từ Bên Giao Tiền theo thỏa
        thuận tại Hợp đồng cầm cố tài sản số ${data.MA_HD} ký kết ngày ${data.NGAY_HD} với chi tiết như sau:
      </p>
      <p style="margin-bottom: 8px;">
        Tài sản cầm cố: <strong>${data.TAI_SAN}</strong>.
      </p>
      <p style="margin-bottom: 8px;">
        Số tiền vay đã nhận: <strong>${data.SO_TIEN}</strong>.
      </p>
      <p style="margin-bottom: 8px;">Hình thức nhận tiền:</p>
      <p style="margin-bottom: 4px;">
        ☐ Tiền mặt tại văn phòng giao dịch
      </p>
      <p style="margin-bottom: 8px;">
        ✓ Chuyển khoản qua tài khoản ngân hàng
      </p>
      <p style="margin-left: 20px;">
        + Ngân hàng: ${data.NGAN_HANG}
      </p>
      <p style="margin-left: 20px;">
        + Số tài khoản: ${data.SO_TAI_KHOAN}
      </p>
      <p style="margin-left: 20px; margin-bottom: 16px;">
        + Tên tài khoản: ${data.TEN_TAI_KHOAN}
      </p>
    </div>

    <!-- Section IV -->
    <div class="section">
      <p class="bold" style="margin-bottom: 8px;">IV. CAM KẾT:</p>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ol style="margin-bottom: 8px;">
          <li>
            Bên Nhận Tiền xác nhận đã nhận đủ số tiền nêu trên và không có bất kỳ
            khiếu nại nào về số tiền đã nhận.
          </li>
          <li>
            Việc giao nhận tiền hoàn toàn tự nguyện, không bị ép buộc hay lừa dối.
          </li>
          <li>
            Giấy xác nhận này là một bộ phận không tách rời của Hợp đồng cầm cố
            đã ký giữa hai bên.
          </li>
        </ol>
      </div>
    </div>

    <!-- Section V -->
    <div class="section">
      <p class="bold" style="margin-bottom: 8px;">V. HIỆU LỰC:</p>
      <p style="font-size: 12pt; margin-bottom: 60px;">
        Văn bản này được lập thành 02 bản, mỗi bên giữ 01 bản, có giá trị
        pháp lý như nhau và có hiệu lực kể từ thời điểm ký kết.
      </p>

      <!-- Signatures -->
      <div class="signatures">
        <div class="signature-box">
          <p class="bold">ĐẠI DIỆN BÊN GIAO TIỀN</p>
          <p>(Ký, ghi rõ họ tên)</p>
          <div style="height: 120px;"></div>
        </div>
        <div class="signature-box">
          <p class="bold">BÊN NHẬN TIỀN</p>
          <p>(Ký, ghi rõ họ tên)</p>
          ${data.OFFICIAL_SIGNATURE ? `
            <img src="${data.OFFICIAL_SIGNATURE}" alt="Chữ ký" style="max-width: 200px; max-height: 100px; margin: 10px auto; display: block;" />
            <p class="bold" style="margin-top: 10px;">${data.HO_TEN}</p>
            <p style="margin-top: 5px; font-size: 11pt;">Ngày ${data.NGAY}/${data.THANG}/${data.NAM}</p>
          ` : '<div style="height: 120px;"></div>'}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
