import type { TAssetDisposalAuthorizationData } from "@/types/contract.types";

export function generateAssetDisposalHTML(data: TAssetDisposalAuthorizationData): string {
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
    ul { padding-left: 40px; list-style-type: disc; margin: 0; font-size: 12pt; line-height: 1.6; }
    ol { padding-left: 40px; list-style-type: decimal; margin: 0; font-size: 12pt; line-height: 1.6; }
    li { margin-bottom: 6px; }
    h3 { font-size: 14pt; font-weight: bold; margin-bottom: 10px; }
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
    <div class="center" style="margin: 20px 0;">
      <h1 style="font-size: 16pt; font-weight: bold; margin: 10px 0;">
        GIẤY ỦY QUYỀN XỬ LÝ TÀI SẢN CẦM CỐ
      </h1>
    </div>

    <!-- Bên ủy quyền -->
    <div class="section">
      <p class="bold" style="margin-bottom: 10px;">BÊN ỦY QUYỀN</p>
      <div style="margin-bottom: 20px;">
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

    <!-- Bên được ủy quyền -->
    <div class="section">
      <p class="bold" style="margin-bottom: 10px;">BÊN ĐƯỢC ỦY QUYỀN</p>
      <ul>
        <li>
          Tên đơn vị/Doanh nghiệp: <strong>${data.BEN_UU_QUYEN_TEN}</strong>
        </li>
        <li>
          Đại diện Ông/Bà: <strong>${data.BEN_UU_QUYEN_DAI_DIEN}</strong>
        </li>
        <li>
          Chức vụ: <strong>Giám đốc</strong>
        </li>
        <li>
          Địa chỉ: <strong>${data.BEN_UU_QUYEN_DIA_CHI}</strong>
        </li>
        <li>
          Mã số thuế: <strong>${data.BEN_UU_QUYEN_MST}</strong> cấp ngày <strong>14/01/2025</strong> tại Ninh Kiều - Thuế cơ sở 1 thành phố Cần Thơ.
        </li>
        <li>
          Số điện thoại: <strong>${data.BEN_UU_QUYEN_SDT}</strong>
        </li>
      </ul>
    </div>

    <!-- Điều 1 -->
    <div class="section">
      <h3>Điều 1. Tài sản ủy quyền xử lý</h3>
      <ul>
        <li>
          Loại tài sản: <strong>${data.LOAI_TS}</strong>
        </li>
        <li>
          Chi tiết: <strong>${data.CHI_TIET}</strong> (IMEI: <strong>${data.IMEI}</strong> - Serial: <strong>${data.SERIAL}</strong>)
        </li>
        <li>
          Tình trạng tài sản: <strong>${data.TINH_TRANG}</strong>
        </li>
      </ul>
    </div>

    <!-- Điều 2 -->
    <div class="section">
      <h3>Điều 2. Phạm vi ủy quyền</h3>
      <ol>
        <li style="margin-bottom: 8px;">
          Bên ủy quyền ủy quyền cho Bên được ủy quyền thực hiện các hành vi
          thu hồi, bán, chuyển nhượng, sang tên và cấn trừ nghĩa vụ nợ đối với
          tài sản nêu tại Điều 1 <strong>chỉ trong trường hợp Bên ủy quyền vi phạm nghĩa vụ thanh toán theo Hợp
          đồng cầm cố</strong>.
        </li>
        <li style="margin-bottom: 8px;">
          Ủy quyền này không được đơn phương chấm dứt <strong>trong thời gian Bên ủy quyền chưa hoàn thành đầy đủ nghĩa vụ tài chính</strong> theo Hợp đồng cầm cố.
        </li>
        <li>
          Trước khi thực hiện việc xử lý tài sản, Bên được ủy quyền có trách
          nhiệm thông báo cho Bên ủy quyền trong thời hạn hợp lý theo quy định
          pháp luật, trừ trường hợp pháp luật có quy định khác.
        </li>
      </ol>
    </div>

    <!-- Điều 3 -->
    <div class="section">
      <h3>Điều 3. Thời hạn ủy quyền</h3>
      <p style="margin-bottom: 8px;">
        Có hiệu lực đến khi nghĩa vụ được thanh toán xong.
      </p>
    </div>

    <!-- Điều 4 -->
    <div class="section">
      <h3>Điều 4. Xác nhận tự nguyện và đã được giải thích đầy đủ</h3>
      <p style="margin-bottom: 8px;">
        Bên ủy quyền xác nhận rằng việc ký kết Giấy ủy quyền này là <strong>hoàn toàn
        tự nguyện</strong>, không bị ép buộc, đe dọa, lừa dối hoặc nhầm lẫn.
      </p>
      <p style="margin-bottom: 8px;">
        Bên ủy quyền xác nhận đã được Bên được ủy quyền <strong>giải thích đầy đủ, rõ
        ràng và dễ hiểu</strong> về nội dung, phạm vi, quyền, nghĩa vụ và hậu quả pháp
        lý phát sinh từ việc ký Giấy ủy quyền này, bao gồm cả quyền xử lý tài
        sản cầm cố trong trường hợp vi phạm nghĩa vụ.
      </p>
      <p style="margin-bottom: 60px;">
        Bên ủy quyền hiểu rõ và đồng ý rằng việc ủy quyền xử lý tài sản cầm
        cố là nhằm bảo đảm thực hiện nghĩa vụ theo Hợp đồng cầm cố đã ký, và
        không làm thay đổi quyền sở hữu tài sản cho đến khi tài sản bị xử lý
        hợp pháp theo quy định pháp luật.
      </p>

      <!-- Signatures -->
      <div class="signatures">
        <div class="signature-box">
          <p class="bold">BÊN ĐƯỢC ỦY QUYỀN</p>
          <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
          <div style="height: 120px;"></div>
        </div>
        <div class="signature-box">
          <p class="bold">BÊN ỦY QUYỀN</p>
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
