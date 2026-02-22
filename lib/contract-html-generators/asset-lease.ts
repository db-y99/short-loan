import type { TAssetLeaseContractData } from "@/types/contract.types";

export function generateAssetLeaseHTML(data: TAssetLeaseContractData): string {
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
      <div class="center" style="margin: 20px 0;">
        <h1 style="font-size: 18pt; font-weight: bold; margin: 10px 0;">HỢP ĐỒNG THUÊ TÀI SẢN</h1>
        <p style="font-size: 13pt; font-weight: bold;">(Số: ${data.SO_HD_THUE})</p>
      </div>
      <div style="font-size: 12pt; margin-bottom: 16px;">
        <ul style="list-style-type: disc;">
          <li style="margin-bottom: 8px;">Căn cứ Bộ luật Dân sự 2015;</li>
          <li style="margin-bottom: 8px;">Căn cứ vào quyền sở hữu/quyền quản lý tài sản hợp pháp của Bên A;</li>
          <li>Căn cứ nhu cầu sử dụng thực tế và sự tự nguyện thỏa thuận của các bên.</li>
        </ul>
      </div>
      <p style="margin-bottom: 16px;">Hôm nay, ngày ${data.NGAY} tháng ${data.THANG} năm ${data.NAM}, tại 99B Nguyễn Trãi, Phường Ninh Kiều, Thành phố Cần Thơ, chúng tôi gồm:</p>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">BÊN CHO THUÊ (BÊN A):</h3>
      <div style="font-size: 12pt; margin-bottom: 16px;">
        <ul style="list-style-type: disc; line-height: 1.6;">
          <li><strong>Tên đơn vị/Doanh nghiệp:</strong> ${data.BEN_A_TEN}</li>
          <li><strong>Đại diện Ông/Bà:</strong> ${data.BEN_A_DAI_DIEN}</li>
          <li><strong>Chức vụ:</strong> ${data.BEN_A_CHUC_VU}</li>
          <li><strong>Địa chỉ:</strong> ${data.BEN_A_DIA_CHI}</li>
          <li><strong>Mã số thuế/CCCD số:</strong> ${data.BEN_A_MST} cấp ngày: 14/01/2025 tại Ninh Kiều - Thuế cơ sở 1 thành phố Cần Thơ</li>
          <li><strong>Số điện thoại:</strong> ${data.BEN_A_SDT}</li>
        </ul>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">BÊN THUÊ (BÊN B):</h3>
      <div style="font-size: 12pt; margin-bottom: 16px; line-height: 1.6;">
        <ul style="list-style-type: disc;">
          <li><strong>Họ và tên:</strong> ${data.HO_TEN}.</li>
          <li><strong>CCCD:</strong> ${data.CCCD}; <strong>Ngày cấp:</strong> ${data.NGAY_CAP}; <strong>Nơi cấp:</strong> ${data.NOI_CAP}.</li>
          <li><strong>Địa chỉ thường trú:</strong> ${data.DIA_CHI}</li>
          <li><strong>Số điện thoại liên hệ:</strong> ${data.SDT}.</li>
        </ul>
      </div>
    </div>

    <div class="section">
      <p style="margin-bottom: 12px;">Hai bên thống nhất ký kết Hợp đồng thuê tài sản với các điều khoản như sau:</p>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 1. TÀI SẢN THUÊ VÀ CƠ SỞ THUÊ</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ol style="list-style-type: decimal;">
          <li style="margin-bottom: 10px;">
            <strong>Tài sản thuê:</strong> Bên A đồng ý cho Bên B thuê tài sản (mà Bên B đã cầm cố và bàn giao quyền quản lý cho Bên A theo Hợp đồng cầm cố số ${data.MA_HD_CAM_CO}), cụ thể:
            <ul style="padding-left: 40px; margin-top: 6px; list-style-type: circle;">
              <li style="margin-bottom: 6px;">Loại tài sản: ${data.LOAI_TS}</li>
              <li>Chi tiết (Nhãn hiệu/Model): ${data.CHI_TIET} (IMEI: ${data.IMEI} - Serial: ${data.SERIAL})</li>
            </ul>
          </li>
          <li style="margin-bottom: 10px;"><strong>Xác nhận bàn giao:</strong> Bên B xác nhận đã nhận tài sản đúng mô tả và tình trạng hoạt động bình thường khi ký hợp đồng này.</li>
          <li>
            <strong>Tính chất độc lập của giao dịch:</strong>
            <ul style="padding-left: 40px; margin-top: 6px; list-style-type: circle;">
              <li style="margin-bottom: 6px;">Bên B xác nhận rằng tài sản này đang thuộc quyền quản lý hợp pháp của Bên A theo Hợp đồng cầm cố.</li>
              <li style="margin-bottom: 6px;">Bên B có nhu cầu thực tế sử dụng tài sản và chủ động đề nghị thuê.</li>
              <li>Giao dịch thuê này là độc lập, không phải là điều kiện bắt buộc của bất kỳ văn bản pháp lý nào khác.</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 2. CAM KẾT VỀ SỰ TỰ NGUYỆN</h3>
      <p style="font-size: 12pt;">Bên B hoàn toàn tự nguyện lựa chọn phương án thuê tài sản để phục vụ sinh hoạt của mình, không bị ép buộc hay ràng buộc bởi bất kỳ điều kiện nào của khoản vay cầm cố.</p>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 3. MỤC ĐÍCH THUÊ VÀ PHẠM VI SỬ DỤNG</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ol style="list-style-type: decimal;">
          <li style="margin-bottom: 10px;">Bên B thuê tài sản để sử dụng phục vụ nhu cầu cá nhân / kinh doanh hợp pháp.</li>
          <li>
            Trong quá trình thuê, Bên B <strong>không được:</strong>
            <ul style="padding-left: 40px; margin-top: 6px; list-style-type: circle;">
              <li style="margin-bottom: 6px;">Bán, chuyển nhượng, cho mượn, thế chấp, cầm cố tài sản cho bên thứ ba;</li>
              <li style="margin-bottom: 6px;">Thay đổi kết cấu, gắn thêm thiết bị trái phép hoặc làm thay đổi hiện trạng tài sản;</li>
              <li>Sử dụng tài sản vào mục đích trái pháp luật.</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 4. THỜI HẠN THUÊ</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ol style="list-style-type: decimal;">
          <li style="margin-bottom: 10px;">
            Thời hạn thuê bắt đầu từ ngày ${data.NGAY_BAT_DAU} đến khi xảy ra một trong các sự kiện sau (tùy điều kiện nào đến trước):
            <ul style="padding-left: 40px; margin-top: 6px; list-style-type: circle;">
              <li style="margin-bottom: 6px;">Hai bên thỏa thuận chấm dứt Hợp đồng thuê bằng văn bản/tin nhắn.</li>
              <li>Bên B vi phạm một trong các nghĩa vụ của hợp đồng này.</li>
            </ul>
          </li>
          <li>Hết thời hạn thuê, Bên B có trách nhiệm hoàn trả tài sản ngay lập tức theo yêu cầu của Bên A.</li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 5. GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ol style="padding-left: 22px; list-style-type: decimal;">
          <li style="margin-bottom: 12px;">
            <strong>Giá thuê:</strong> cụ thể theo bảng sau:
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr>
                  <th>Mốc thanh toán</th>
                  <th>Thời điểm tất toán</th>
                  <th>Tổng tiền phải thanh toán</th>
                </tr>
              </thead>
              <tbody>${milestonesHTML}</tbody>
            </table>
          </li>
          <li>Việc thanh toán không đúng hạn cam kết được xem là vi phạm nghĩa vụ Hợp đồng.</li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 6. TRÁCH NHIỆM VÀ RỦI RO</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ol style="list-style-type: decimal;">
          <li style="margin-bottom: 10px;">
            <strong>Trách nhiệm của Bên B (Bên thuê):</strong>
            <ul style="padding-left: 40px; margin-top: 6px; list-style-type: circle;">
              <li style="margin-bottom: 6px;">Chịu toàn bộ rủi ro mất mát, hư hỏng, tai nạn đối với tài sản trong suốt thời gian thuê;</li>
              <li style="margin-bottom: 6px;">Chịu mọi trách nhiệm pháp lý, dân sự, hình sự, hành chính phát sinh từ việc sử dụng tài sản;</li>
              <li>Tự chịu chi phí xăng dầu, bảo dưỡng, sửa chữa trong quá trình sử dụng.</li>
            </ul>
          </li>
          <li style="margin-bottom: 10px;"><strong>Miễn trừ trách nhiệm:</strong> Bên A không chịu trách nhiệm đối với mọi thiệt hại về người và tài sản phát sinh trong thời gian Bên B sử dụng tài sản.</li>
          <li>
            Trong trường hợp Bên B có hành vi hoặc có dấu hiệu thực hiện một hoặc nhiều hành vi sau:
            <ul style="padding-left: 40px; margin-top: 6px; list-style-type: circle;">
              <li style="margin-bottom: 6px;">Bẻ khóa, can thiệp, xâm nhập, sửa đổi hệ điều hành hoặc phần mềm của thiết bị;</li>
              <li style="margin-bottom: 6px;">Tìm cách vượt qua, vô hiệu hóa hoặc làm sai lệch các cơ chế bảo mật của thiết bị (bao gồm nhưng không giới hạn: iCloud, mật khẩu, Face ID, Touch ID, Activation Lock);</li>
              <li>Thực hiện hoặc nhờ bên thứ ba thực hiện các hành vi kỹ thuật trái với hướng dẫn của nhà sản xuất;</li>
            </ul>
            <p style="margin-top: 8px;">thì mọi rủi ro, tổn thất phát sinh liên quan đến việc mất mát, hư hỏng, thay đổi, lộ lọt hoặc không thể khôi phục dữ liệu trong thiết bị hoàn toàn do Bên B tự chịu trách nhiệm.</p>
            <p>Bên A được miễn trừ toàn bộ trách nhiệm dân sự, bồi thường và nghĩa vụ khắc phục liên quan đến dữ liệu trong các trường hợp nêu trên.</p>
          </li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 7. THU HỒI TÀI SẢN</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <p style="margin-bottom: 8px;">Bên A có quyền đơn phương chấm dứt hợp đồng và <strong>thu hồi tài sản ngay lập tức</strong> nếu:</p>
        <ol style="list-style-type: decimal; margin-bottom: 8px;">
          <li style="margin-bottom: 6px;">Bên B chậm thanh toán tiền thuê (hoặc các nghĩa vụ tài chính liên quan) quá <strong>03 ngày</strong>;</li>
          <li style="margin-bottom: 6px;">Bên B sử dụng tài sản sai mục đích, vi phạm pháp luật;</li>
          <li>Bên B vi phạm nghiêm trọng các điều khoản của Hợp đồng cầm cố hoặc Hợp đồng thuê này (như: mang tài sản đi cầm cố nơi khác, mất liên lạc…). Bên B cam kết không khiếu nại, không cản trở việc thu hồi tài sản trong các trường hợp trên.</li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 8. CHẤM DỨT HỢP ĐỒNG</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <p style="margin-bottom: 8px;">Hợp đồng chấm dứt khi:</p>
        <ol style="list-style-type: decimal; margin-bottom: 16px;">
          <li style="margin-bottom: 6px;">Hết thời hạn thuê;</li>
          <li style="margin-bottom: 6px;">Hai bên thỏa thuận chấm dứt trước hạn;</li>
          <li>Một bên vi phạm nghiêm trọng nghĩa vụ hợp đồng.</li>
        </ol>
      </div>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 9. GIẢI QUYẾT TRANH CHẤP</h3>
      <p style="font-size: 12pt;">Mọi tranh chấp phát sinh sẽ ưu tiên giải quyết bằng thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại <strong>Tòa Án Nhân Dân nơi Bên A đặt trụ sở.</strong></p>
    </div>

    <div class="section">
      <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">ĐIỀU 10. HIỆU LỰC</h3>
      <div style="font-size: 12pt; line-height: 1.6;">
        <ol style="list-style-type: decimal; margin-bottom: 60px;">
          <li style="margin-bottom: 8px;">Hợp đồng này được ký kết độc lập, không phụ thuộc, không phải là điều kiện bắt buộc và không ảnh hưởng đến hiệu lực của bất kỳ hợp đồng nào khác giữa các bên, dù được ký trước, cùng thời điểm hay sau thời điểm ký Hợp đồng này.</li>
          <li style="margin-bottom: 8px;">Việc ký hoặc không ký Hợp đồng này không làm phát sinh, thay đổi, chấm dứt bất kỳ quyền hoặc nghĩa vụ nào của các bên theo các hợp đồng khác (nếu có), trừ khi các bên có thỏa thuận khác bằng văn bản.</li>
          <li>Hợp đồng có hiệu lực kể từ ngày ký, được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</li>
        </ol>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <div class="center" style="width: 45%;">
          <p class="bold">BÊN CHO THUÊ</p>
          <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
        </div>
        <div class="center" style="width: 45%;">
          <p class="bold">BÊN THUÊ</p>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
