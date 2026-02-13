"use client";

import type { TAssetPledgeContractData } from "@/types/contract.types";

const CONTRACT_STYLE = {
  container: {
    width: "210mm",
    minHeight: "297mm",
    padding: "20mm",
    backgroundColor: "white",
    fontFamily: "Times New Roman, serif",
    fontSize: "13pt",
    lineHeight: 1.6,
    color: "#000",
  } as React.CSSProperties,
  center: { textAlign: "center" as const },
  bold: { fontWeight: "bold" as const },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  td: { padding: "5px 10px" },
  tdBorder: {
    padding: "8px",
    border: "1px solid #000",
  } as React.CSSProperties,
};

type TProps = {
  data: TAssetPledgeContractData;
  id?: string;
};

export function AssetPledgeContractView({
  data,
  id = "contract-content",
}: TProps) {
  return (
    <div id={id} style={CONTRACT_STYLE.container}>
      {/* Header */}
      <div style={{ ...CONTRACT_STYLE.center, marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "14pt", ...CONTRACT_STYLE.bold }}>
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </h2>
        <p style={{ margin: "5px 0", fontSize: "12pt" }}>
          Độc lập – Tự do – Hạnh phúc
        </p>
        <hr
          style={{
            width: "100px",
            margin: "10px auto",
            border: "1px solid #000",
          }}
        />
      </div>

      {/* Title */}
      <div style={{ ...CONTRACT_STYLE.center, margin: "30px 0" }}>
        <h1
          style={{
            fontSize: "18pt",
            ...CONTRACT_STYLE.bold,
            margin: "10px 0",
          }}
        >
          HỢP ĐỒNG CẦM CỐ TÀI SẢN
        </h1>
        <p style={{ fontSize: "13pt", ...CONTRACT_STYLE.bold }}>
          (Mã hợp đồng: {data.MA_HD})
        </p>
      </div>

      {/* Preamble */}
      <p style={{ fontSize: "12pt", marginBottom: "16px" }}>
        Căn cứ Bộ luật Dân sự 2015 và các văn bản hướng dẫn thi hành;
      </p>
      <p style={{ fontSize: "12pt", marginBottom: "16px" }}>
        Căn cứ thỏa thuận và nhu cầu của các bên.
      </p>
      <p
        style={{
          ...CONTRACT_STYLE.center,
          fontStyle: "italic",
          marginBottom: "20px",
        }}
      >
        Hôm nay, ngày {data.NGAY} tháng {data.THANG} năm {data.NAM}, tại 99B
        Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ, chúng tôi gồm:
      </p>

      {/* Bên A */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          BÊN NHẬN CẦM CỐ (BÊN A):
        </h3>
        <table style={CONTRACT_STYLE.table}>
          <tbody>
            <tr>
              <td style={{ width: "30%", ...CONTRACT_STYLE.td }}>
                Tên đơn vị:
              </td>
              <td style={{ ...CONTRACT_STYLE.bold, ...CONTRACT_STYLE.td }}>
                {data.BEN_A_TEN}
              </td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>Địa chỉ:</td>
              <td style={CONTRACT_STYLE.td}>{data.BEN_A_DIA_CHI}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>Đại diện bởi:</td>
              <td style={CONTRACT_STYLE.td}>{data.BEN_A_DAI_DIEN}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>Chức vụ:</td>
              <td style={CONTRACT_STYLE.td}>{data.BEN_A_CHUC_VU}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bên B */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          BÊN CẦM CỐ (BÊN B):
        </h3>
        <table style={CONTRACT_STYLE.table}>
          <tbody>
            <tr>
              <td style={{ width: "30%", ...CONTRACT_STYLE.td }}>
                Họ và tên:
              </td>
              <td style={{ ...CONTRACT_STYLE.bold, ...CONTRACT_STYLE.td }}>
                {data.HO_TEN}
              </td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>CCCD:</td>
              <td style={CONTRACT_STYLE.td}>{data.CCCD}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>Ngày cấp:</td>
              <td style={CONTRACT_STYLE.td}>{data.NGAY_CAP}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>Nơi cấp:</td>
              <td style={CONTRACT_STYLE.td}>{data.NOI_CAP}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>Địa chỉ thường trú:</td>
              <td style={CONTRACT_STYLE.td}>{data.DIA_CHI}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.td}>Số điện thoại liên hệ:</td>
              <td style={CONTRACT_STYLE.td}>{data.SDT}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ marginBottom: "16px" }}>
        Hai bên thống nhất ký kết Hợp đồng cầm cố tài sản với các điều khoản
        như sau:
      </p>

      {/* Điều 1 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 1: TÀI SẢN CẦM CỐ
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Bên B đồng ý cầm cố tài sản thuộc sở hữu của mình cho Bên A để đảm
          bảo nghĩa vụ thanh toán khoản vay, cụ thể như sau:
        </p>
        <table style={{ ...CONTRACT_STYLE.table, border: "1px solid #000" }}>
          <tbody>
            <tr>
              <td
                style={{
                  width: "28%",
                  ...CONTRACT_STYLE.tdBorder,
                }}
              >
                Loại tài sản:
              </td>
              <td style={CONTRACT_STYLE.tdBorder}>{data.LOAI_TS}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.tdBorder}>Chi tiết:</td>
              <td style={CONTRACT_STYLE.tdBorder}>{data.CHI_TIET}</td>
            </tr>
            <tr>
              <td style={CONTRACT_STYLE.tdBorder}>Tình trạng tài sản:</td>
              <td style={CONTRACT_STYLE.tdBorder}>
                {data.TINH_TRANG} (IMEI: {data.IMEI} - Serial: {data.SERIAL})
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: "10px", fontSize: "12pt" }}>
          Cam kết về tài sản: Bên B cam kết tài sản nêu trên thuộc quyền sở hữu
          hợp pháp của Bên B, không có tranh chấp, và không bị ràng buộc bởi
          bất kỳ nghĩa vụ nào đối với bên thứ ba tại thời điểm ký kết.
        </p>
      </div>

      {/* Điều 2 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 2: NỘI DUNG KHOẢN VAY VÀ PHƯƠNG THỨC THANH TOÁN
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Số tiền vay (Gốc): <strong>{data.SO_TIEN_VAY}</strong>.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Thời hạn vay: Tối đa 30 ngày kể từ ngày giải ngân.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Lãi suất: {data.LAI_SUAT}
        </p>
        <p style={{ marginBottom: "8px" }}>
          Phương thức trả nợ: Gốc trả cuối kỳ; Lãi và phí được tính dựa trên
          thời điểm tất toán thực tế theo các mốc thời gian quy định tại Điều 3.
        </p>
      </div>

      {/* Điều 3 - Bảng mốc thanh toán */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 3: QUY ĐỊNH VỀ MỐC TẤT TOÁN
        </h3>
        <p style={{ marginBottom: "10px" }}>
          Bên B có quyền tất toán khoản vay trước hạn bất cứ lúc nào. Tổng số
          tiền phải thanh toán sẽ được xác định theo bảng dưới đây:
        </p>
        <table
          style={{
            ...CONTRACT_STYLE.table,
            border: "1px solid #000",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr>
              <th style={CONTRACT_STYLE.tdBorder}>Mốc thanh toán</th>
              <th style={CONTRACT_STYLE.tdBorder}>Thời điểm tất toán</th>
              <th style={CONTRACT_STYLE.tdBorder}>
                Tổng tiền phải thanh toán
              </th>
            </tr>
          </thead>
          <tbody>
            {(data.MILESTONES ?? []).map((m) => (
              <tr key={m.moc}>
                <td style={CONTRACT_STYLE.tdBorder}>Mốc {m.moc}</td>
                <td style={CONTRACT_STYLE.tdBorder}>Ngày {m.ngay}</td>
                <td style={CONTRACT_STYLE.tdBorder}>{m.tongTien}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Điều 4 - Thuê lại */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 4: QUYỀN LỰA CHỌN THUÊ LẠI TÀI SẢN CẦM CỐ
        </h3>
        <p style={{ marginBottom: "8px" }}>
          <strong>Quyền tự do lựa chọn:</strong> Bên B (bên cầm cố tài sản) được
          quyền tự do lựa chọn việc có thuê lại hoặc không thuê lại tài sản đã
          cầm cố cho Bên A sau khi ký hợp đồng cầm cố này.
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Tính độc lập của giao dịch:</strong> Việc thuê lại tài sản (nếu
          có) sẽ được các bên thỏa thuận bằng một Hợp đồng thuê tài sản riêng
          biệt, độc lập với hợp đồng cầm cố này. Hợp đồng thuê (nếu được ký)
          không phải là điều kiện bắt buộc để hợp đồng cầm cố này có hiệu lực.
          Hợp đồng cầm cố và Hợp đồng thuê (nếu có) là hai giao dịch pháp lý độc
          lập.
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Xử lý trong trường hợp không thuê lại:</strong> Trường hợp Bên
          B không thuê lại tài sản, tài sản cầm cố sẽ được Bên A quản lý, lưu
          giữ và bảo quản tại kho của Bên A theo đúng quy định pháp luật và theo
          thỏa thuận tại Điều 5 hợp đồng này.
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Xử lý trong trường hợp thuê lại:</strong> Trường hợp Bên B có
          nhu cầu thuê lại tài sản, các bên sẽ ký hợp đồng thuê tài sản riêng,
          trong đó quy định cụ thể về: Giá thuê, phương thức thanh toán; Thời
          hạn thuê; Quyền và nghĩa vụ của các bên; Trách nhiệm bồi thường, bảo
          hiểm (nếu có).
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Xác nhận của các bên:</strong> Các bên xác nhận rằng việc thuê
          lại tài sản là hoàn toàn tự nguyện, không bị ép buộc. Việc không ký
          hợp đồng thuê lại không ảnh hưởng đến quyền và nghĩa vụ của các bên
          theo hợp đồng cầm cố này.
        </p>
      </div>

      {/* Điều 5 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 5: NGHĨA VỤ CỦA CÁC BÊN
        </h3>
        <p style={{ marginBottom: "8px" }}>
          <strong>Trách nhiệm của Bên A:</strong> Bảo quản tài sản cầm cố đúng
          theo điều kiện thực tế (Trừ trường hợp đã bàn giao lại cho Bên B thuê
          theo Điều 4). Hoàn trả lại tài sản cho Bên B ngay sau khi Bên B hoàn
          thành nghĩa vụ tài chính. Bên A không chịu trách nhiệm đối với các hao
          mòn tự nhiên, hư hỏng do tính chất cơ lý hóa của tài sản trong quá
          trình lưu kho.
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Trách nhiệm của Bên B:</strong> Thanh toán đầy đủ cả gốc và
          lãi đúng thời hạn đã cam kết. Chịu trách nhiệm về nguồn gốc và tính
          pháp lý của tài sản cầm cố.
        </p>
      </div>

      {/* Điều 6 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 6: XỬ LÝ VI PHẠM VÀ TÀI SẢN CẦM CỐ
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Trường hợp Bên B không thực hiện nghĩa vụ thanh toán đúng hạn (quá
          hạn so với Ngày 30), Bên B sẽ mất quyền hưởng các ưu đãi (nếu có).
        </p>
        <p style={{ marginBottom: "8px" }}>
          Nếu Bên B vi phạm nghĩa vụ thanh toán quá 08 (tám) ngày kể từ ngày
          đến hạn (Mốc 3), Bên A có toàn quyền xử lý tài sản cầm cố để thu hồi
          nợ (bao gồm nhưng không giới hạn: bán, thanh lý, chuyển nhượng tài
          sản).
        </p>
        <p style={{ marginBottom: "8px" }}>
          Việc xử lý tài sản được thực hiện theo thỏa thuận tại Hợp đồng này và
          quy định của pháp luật hiện hành. Bên B mặc nhiên đồng ý và không có
          quyền khiếu nại về sau.
        </p>
      </div>

      {/* Điều 7 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 7: CAM KẾT CỦA BÊN CẦM CỐ
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Bên B xác nhận và cam kết: Đã được nhân viên Bên A tư vấn, giải thích
          chi tiết và hiểu rõ về khoản vay, lãi suất, và quyền lựa chọn thuê
          lại tài sản tại Điều 4. Hoàn toàn tự nguyện ký kết hợp đồng này, không
          bị lừa dối hay ép buộc. Cam kết tuân thủ đúng nghĩa vụ trả nợ, không
          viện dẫn các lý do chủ quan (như không hiểu, không biết, nhầm lẫn...)
          để từ chối hoặc trì hoãn nghĩa vụ đã cam kết. Mọi thỏa thuận bằng
          miệng hoặc tin nhắn không được ghi trong hợp đồng này đều không có giá
          trị pháp lý.
        </p>
      </div>

      {/* Điều 8 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "14pt",
            ...CONTRACT_STYLE.bold,
            marginBottom: "10px",
          }}
        >
          ĐIỀU 8: HIỆU LỰC HỢP ĐỒNG
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Hợp đồng này có hiệu lực kể từ ngày ký.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi
          bên giữ 01 (một) bản.
        </p>
      </div>

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "60px",
        }}
      >
        <div style={{ ...CONTRACT_STYLE.center, width: "45%" }}>
          <p style={{ ...CONTRACT_STYLE.bold, marginBottom: "80px" }}>BÊN A</p>
          <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
        </div>
        <div style={{ ...CONTRACT_STYLE.center, width: "45%" }}>
          <p style={{ ...CONTRACT_STYLE.bold, marginBottom: "80px" }}>BÊN B</p>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
}
