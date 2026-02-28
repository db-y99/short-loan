import type { TAssetPledgeContractData } from "@/types/contract.types";

export function generateAssetPledgeHTML(data: TAssetPledgeContractData): string {
  const draftSignatureHTML = data.DRAFT_SIGNATURE 
    ? `<img src="${data.DRAFT_SIGNATURE}" alt="Chữ ký nháy" style="max-width: 80px; max-height: 40px; vertical-align: middle; margin-left: 8px;" />` 
    : '';
  
  const milestonesHTML = (data.MILESTONES ?? [])
    .map(
      (m) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #000;">Mốc ${m.moc}</td>
        <td style="padding: 8px; border: 1px solid #000;">Ngày ${m.ngay}</td>
        <td style="padding: 8px; border: 1px solid #000;">${m.tongTien}</td>
      </tr>
    `,
    )
    .join("");

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
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #000; padding: 8px; }
    ul, ol { padding-left: 40px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="section">
      <div class="center" style="margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 14pt; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
        <p style="margin: 5px 0; font-size: 12pt;">Độc lập – Tự do – Hạnh phúc</p>
        <div>---o0o---</div>
      </div>
      <div class="center" style="margin: 24px 0;">
        <h1 style="font-size: 18pt; font-weight: bold; margin: 4px 0;">HỢP ĐỒNG CẦM CỐ TÀI SẢN</h1>
        <p style="font-size: 13pt; font-weight: bold;">(Mã hợp đồng: ${data.MA_HD})</p>
      </div>
      <ul style="font-size: 12pt; margin-bottom: 16px; list-style-type: disc;">
        <li>Căn cứ Bộ luật Dân sự 2015 và các văn bản hướng dẫn thi hành;</li>
        <li>Căn cứ thỏa thuận và nhu cầu của các bên.</li>
      </ul>
      <p style="margin-bottom: 16px;">Hôm nay, ngày ${data.NGAY} tháng ${data.THANG} năm ${data.NAM}, tại 99B Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ, chúng tôi gồm:</p>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">BÊN NHẬN CẦM CỐ (BÊN A):</h3>
      <ul style="font-size: 12pt; list-style-type: disc;">
        <li><span class="bold">Tên đơn vị:</span> ${data.BEN_A_TEN}</li>
        <li><span class="bold">Địa chỉ:</span> ${data.BEN_A_DIA_CHI}</li>
        <li><span class="bold">Đại diện bởi:</span> <span class="bold">${data.BEN_A_DAI_DIEN}</span></li>
        <li><span class="bold">Chức vụ:</span> ${data.BEN_A_CHUC_VU}</li>
      </ul>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">BÊN CẦM CỐ (BÊN B):</h3>
      <ul style="font-size: 12pt; list-style-type: disc;">
        <li><span class="bold">Họ và tên:</span> <span class="bold">${data.HO_TEN}</span>.</li>
        <li><span class="bold">CCCD:</span> ${data.CCCD}; <span class="bold">Ngày cấp:</span> ${data.NGAY_CAP}; <span class="bold">Nơi cấp:</span> ${data.NOI_CAP}.</li>
        <li><span class="bold">Địa chỉ thường trú:</span> ${data.DIA_CHI}.</li>
        <li><span class="bold">Số điện thoại liên hệ:</span> ${data.SDT}.</li>
      </ul>
    </div>

    <div class="section">
      <p style="margin-bottom: 12px;">Hai bên thống nhất ký kết Hợp đồng cầm cố tài sản với các điều khoản như sau:</p>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 1: TÀI SẢN CẦM CỐ</h3>
      <p style="margin-bottom: 8px;">Bên B đồng ý cầm cố tài sản thuộc sở hữu của mình cho Bên A để đảm bảo nghĩa vụ thanh toán khoản vay, cụ thể như sau:</p>
      <ul style="font-size: 12pt; list-style-type: disc;">
        <li><span class="bold">Loại tài sản:</span> ${data.LOAI_TS}</li>
        <li><span class="bold">Chi tiết:</span> ${data.CHI_TIET}</li>
        <li><span class="bold">Tình trạng tài sản:</span> ${data.TINH_TRANG}</li>
      </ul>
      <p style="font-size: 12pt; margin-bottom: 16px;"><strong>Cam kết về tài sản:</strong> Bên B cam kết tài sản nêu trên thuộc quyền sở hữu hợp pháp của Bên B, không có tranh chấp, và không bị ràng buộc bởi bất kỳ nghĩa vụ nào đối với bên thứ ba tại thời điểm ký kết.</p>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 2: NỘI DUNG KHOẢN VAY VÀ PHƯƠNG THỨC THANH TOÁN</h3>
      <ol style="font-size: 12pt; list-style-type: decimal;">
        <li><span class="bold">Số tiền vay (Gốc): ${data.SO_TIEN_VAY}</span>.</li>
        <li><span class="bold">Thời hạn vay:</span> Tối đa 30 ngày kể từ ngày giải ngân.</li>
        <li><span class="bold">Lãi suất:</span> ${data.LAI_SUAT}.</li>
        <li><span class="bold">Phương thức trả nợ:</span> Gốc trả cuối kỳ; Lãi và phí được tính dựa trên thời điểm tất toán thực tế theo các mốc thời gian quy định tại Điều 3.</li>
      </ol>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 3: QUY ĐỊNH VỀ MỐC TẤT TOÁN</h3>
      <p style="margin-bottom: 10px;">Bên B có quyền tất toán khoản vay trước hạn bất cứ lúc nào. Tổng số tiền phải thanh toán sẽ được xác định theo bảng dưới đây:</p>
      <table>
        <thead>
          <tr>
            <th>Mốc thanh toán</th>
            <th>Thời điểm tất toán</th>
            <th>Tổng tiền phải thanh toán ${draftSignatureHTML}</th>
          </tr>
        </thead>
        <tbody>${milestonesHTML}</tbody>
      </table>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 4: QUYỀN LỰA CHỌN THUÊ LẠI TÀI SẢN CẦM CỐ</h3>
      <ol style="font-size: 12pt; list-style-type: decimal;">
        <li style="margin-bottom: 8px;">
          <span class="bold">Quyền tự do lựa chọn:</span> Bên B (bên cầm cố tài sản) được quyền tự do lựa chọn việc có thuê lại hoặc không thuê lại tài sản đã cầm cố cho Bên A sau khi ký hợp đồng cầm cố này.
        </li>
        <li style="margin-bottom: 8px;">
          <span class="bold">Tính độc lập của giao dịch:</span>
          <ul style="margin-top: 6px; padding-left: 40px; list-style-type: circle;">
            <li style="margin-bottom: 4px;">Việc thuê lại tài sản (nếu có) sẽ được các bên thỏa thuận bằng một Hợp đồng thuê tài sản riêng biệt, độc lập với hợp đồng cầm cố này.</li>
            <li style="margin-bottom: 4px;">Hợp đồng thuê (nếu được ký) không phải là điều kiện bắt buộc để hợp đồng cầm cố này có hiệu lực.</li>
            <li>Hợp đồng cầm cố và Hợp đồng thuê (nếu có) là hai giao dịch pháp lý độc lập.</li>
          </ul>
        </li>
        <li style="margin-bottom: 8px;">
          <span class="bold">Xử lý trong trường hợp không thuê lại:</span> Trường hợp Bên B không thuê lại tài sản, tài sản cầm cố sẽ được Bên A quản lý, lưu giữ và bảo quản tại kho của Bên A theo đúng quy định pháp luật và theo thỏa thuận tại Điều 5 hợp đồng này.
        </li>
        <li style="margin-bottom: 8px;">
          <span class="bold">Xử lý trong trường hợp thuê lại:</span> Trường hợp Bên B có nhu cầu thuê lại tài sản, các bên sẽ ký hợp đồng thuê tài sản riêng, trong đó quy định cụ thể về:
          <ul style="margin-top: 6px; padding-left: 40px; list-style-type: circle;">
            <li>Giá thuê, phương thức thanh toán;</li>
            <li>Thời hạn thuê;</li>
            <li>Quyền và nghĩa vụ của các bên;</li>
            <li>Trách nhiệm bồi thường, bảo hiểm (nếu có).</li>
          </ul>
        </li>
        <li>
          <span class="bold">Xác nhận của các bên:</span> Các bên xác nhận rằng việc thuê lại tài sản là hoàn toàn tự nguyện, không bị ép buộc. Việc không ký hợp đồng thuê lại không ảnh hưởng đến quyền và nghĩa vụ của các bên theo hợp đồng cầm cố này.
        </li>
      </ol>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 5: NGHĨA VỤ CỦA CÁC BÊN</h3>
      <div style="font-size: 12pt; margin-bottom: 16px;">
        <p class="bold" style="margin-bottom: 6px;">Trách nhiệm của Bên A:</p>
        <ul style="padding-left: 40px; margin-bottom: 12px; list-style-type: disc;">
          <li style="margin-bottom: 6px;">Bảo quản tài sản cầm cố đúng theo điều kiện thực tế (Trừ trường hợp đã bàn giao lại cho Bên B thuê theo Điều 4).</li>
          <li style="margin-bottom: 6px;">Hoàn trả lại tài sản cho Bên B ngay sau khi Bên B hoàn thành nghĩa vụ tài chính.</li>
          <li>Bên A không chịu trách nhiệm đối với các hao mòn tự nhiên, hư hỏng do tính chất cơ lý hóa của tài sản trong quá trình lưu kho.</li>
        </ul>
        <p class="bold" style="margin-bottom: 6px;">Trách nhiệm của Bên B:</p>
        <ul style="padding-left: 40px; list-style-type: disc;">
          <li style="margin-bottom: 6px;">Thanh toán đầy đủ cả gốc và lãi đúng thời hạn đã cam kết.</li>
          <li>Chịu trách nhiệm về nguồn gốc và tính pháp lý của tài sản cầm cố.</li>
        </ul>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 6: XỬ LÝ VI PHẠM VÀ TÀI SẢN CẦM CỐ</h3>
      <div style="margin-bottom: 16px; font-size: 12pt; line-height: 1.6;">
        <ol style="padding-left: 40px; margin: 0; list-style-type: decimal;">
          <li style="margin-bottom: 8px;">Trường hợp Bên B không thực hiện nghĩa vụ thanh toán đúng hạn (quá hạn so với Ngày 30), Bên B sẽ mất quyền hưởng các ưu đãi (nếu có).</li>
          <li style="margin-bottom: 8px;">Nếu Bên B vi phạm nghĩa vụ thanh toán quá 08 (tám) ngày kể từ ngày đến hạn (Mốc 3), Bên A có toàn quyền xử lý tài sản cầm cố để thu hồi nợ (bao gồm nhưng không giới hạn: bán, thanh lý, chuyển nhượng tài sản).</li>
          <li>Việc xử lý tài sản được thực hiện theo thỏa thuận tại Hợp đồng này và quy định của pháp luật hiện hành. Bên B mặc nhiên đồng ý và không có quyền khiếu nại về sau.</li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 7: CAM KẾT CỦA BÊN CẦM CỐ</h3>
      <p style="margin-bottom: 8px;">Bên B xác nhận và cam kết:</p>
      <ol style="padding-left: 40px; margin: 0; list-style-type: decimal;">
        <li style="margin-bottom: 8px;">Đã được nhân viên Bên A tư vấn, giải thích chi tiết và hiểu rõ về khoản vay, lãi suất và quyền lựa chọn thuê lại tài sản tại Điều 4.</li>
        <li style="margin-bottom: 8px;">Hoàn toàn tự nguyện ký kết hợp đồng này, không bị lừa dối hay ép buộc.</li>
        <li style="margin-bottom: 8px;">Cam kết tuân thủ đúng nghĩa vụ trả nợ, không viện dẫn các lý do chủ quan (như không hiểu, không biết, nhầm lẫn…) để từ chối hoặc trì hoãn nghĩa vụ đã cam kết.</li>
        <li>Mọi thỏa thuận bằng miệng hoặc tin nhắn không được ghi trong hợp đồng này đều không có giá trị pháp lý.</li>
      </ol>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 8: HIỆU LỰC HỢP ĐỒNG</h3>
      <p style="margin-bottom: 8px;">Hợp đồng này có hiệu lực kể từ ngày ký.</p>
      <p style="margin-bottom: 60px;">Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.</p>

      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <div class="center" style="width: 45%;">
          <p class="bold">ĐẠI DIỆN BÊN A</p>
          <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
          <div style="height: 120px;"></div>
        </div>
        <div class="center" style="width: 45%;">
          <p class="bold">BÊN B</p>
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
