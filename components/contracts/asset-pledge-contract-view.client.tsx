// components/contracts/asset-pledge-contract-view.tsx
"use client";

import type { TAssetPledgeContractData } from "@/types/contract.types";

const S = {
  container: {
    width: "210mm",
    backgroundColor: "white",
    fontFamily: "Times New Roman, serif",
    fontSize: "13pt",
    lineHeight: 1.6,
    color: "#000",
  } as React.CSSProperties,

  page: {
    width: "210mm",
    minHeight: "297mm",
    padding: "20mm",
    pageBreakAfter: "always",
    position: "relative" as const,
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  } as React.CSSProperties,

  lastPage: {
    width: "210mm",
    minHeight: "297mm",
    padding: "20mm",
    pageBreakAfter: "avoid",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  } as React.CSSProperties,

  center: { textAlign: "center" as const },
  bold: { fontWeight: "bold" as const },
  table: { width: "100%", borderCollapse: "collapse" as const },
  td: { padding: "5px 10px" },
  tdBorder: { padding: "8px", border: "1px solid #000" } as React.CSSProperties,
  section: { marginBottom: "16px" },
  heading: { fontSize: "14pt", fontWeight: "bold" as const, marginBottom: "10px" },
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
    <div id={id} style={S.container}>
      {/* ================= TRANG 1 ================= */}
      <div style={S.page}>
        {/* Header */}
        <div style={{ ...S.center, marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "14pt", ...S.bold }}>
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
        <div style={{ ...S.center, margin: "24px 0" }}>
          <h1 style={{ fontSize: "18pt", ...S.bold, margin: "10px 0" }}>
            HỢP ĐỒNG CẦM CỐ TÀI SẢN
          </h1>
          <p style={{ fontSize: "13pt", ...S.bold }}>
            (Mã hợp đồng: {data.MA_HD})
          </p>
        </div>

        {/* Preamble */}
        <p style={{ fontSize: "12pt", marginBottom: "8px" }}>
          Căn cứ Bộ luật Dân sự 2015 và các văn bản hướng dẫn thi hành;
        </p>
        <p style={{ fontSize: "12pt", marginBottom: "16px" }}>
          Căn cứ thỏa thuận và nhu cầu của các bên.
        </p>
        <p style={{ ...S.center, fontStyle: "italic", marginBottom: "16px" }}>
          Hôm nay, ngày {data.NGAY} tháng {data.THANG} năm {data.NAM}, tại 99B
          Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ, chúng tôi gồm:
        </p>

        {/* Bên A */}
        <div style={{ marginBottom: "16px" }}>
          <h3 style={S.heading}>BÊN NHẬN CẦM CỐ (BÊN A):</h3>
          <table style={S.table}>
            <tbody>
              <tr>
                <td style={{ width: "30%", ...S.td }}>Tên đơn vị:</td>
                <td style={{ ...S.bold, ...S.td }}>{data.BEN_A_TEN}</td>
              </tr>
              <tr>
                <td style={S.td}>Địa chỉ:</td>
                <td style={S.td}>{data.BEN_A_DIA_CHI}</td>
              </tr>
              <tr>
                <td style={S.td}>Đại diện bởi:</td>
                <td style={S.td}>{data.BEN_A_DAI_DIEN}</td>
              </tr>
              <tr>
                <td style={S.td}>Chức vụ:</td>
                <td style={S.td}>{data.BEN_A_CHUC_VU}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bên B */}
        <div style={{ marginBottom: "16px" }}>
          <h3 style={S.heading}>BÊN CẦM CỐ (BÊN B):</h3>
          <table style={S.table}>
            <tbody>
              <tr>
                <td style={{ width: "30%", ...S.td }}>Họ và tên:</td>
                <td style={{ ...S.bold, ...S.td }}>{data.HO_TEN}</td>
              </tr>
              <tr>
                <td style={S.td}>CCCD:</td>
                <td style={S.td}>{data.CCCD}</td>
              </tr>
              <tr>
                <td style={S.td}>Ngày cấp:</td>
                <td style={S.td}>{data.NGAY_CAP}</td>
              </tr>
              <tr>
                <td style={S.td}>Nơi cấp:</td>
                <td style={S.td}>{data.NOI_CAP}</td>
              </tr>
              <tr>
                <td style={S.td}>Địa chỉ thường trú:</td>
                <td style={S.td}>{data.DIA_CHI}</td>
              </tr>
              <tr>
                <td style={S.td}>Số điện thoại liên hệ:</td>
                <td style={S.td}>{data.SDT}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ marginBottom: "12px" }}>
          Hai bên thống nhất ký kết Hợp đồng cầm cố tài sản với các điều khoản
          như sau:
        </p>

        {/* Điều 1 - Phần đầu */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 1: TÀI SẢN CẦM CỐ</h3>
          <p style={{ marginBottom: "8px" }}>
            Bên B đồng ý cầm cố tài sản thuộc sở hữu của mình cho Bên A để đảm
            bảo nghĩa vụ thanh toán khoản vay, cụ thể như sau:
          </p>
        </div>
      </div>

      {/* ================= TRANG 2 ================= */}
      <div style={S.page}>
        {/* Điều 1 - Tiếp theo (Bảng tài sản) */}
        <table style={{ ...S.table, border: "1px solid #000", marginBottom: "12px" }}>
          <tbody>
            <tr>
              <td style={{ width: "28%", ...S.tdBorder }}>Loại tài sản:</td>
              <td style={S.tdBorder}>{data.LOAI_TS}</td>
            </tr>
            <tr>
              <td style={S.tdBorder}>Chi tiết:</td>
              <td style={S.tdBorder}>{data.CHI_TIET}</td>
            </tr>
            <tr>
              <td style={S.tdBorder}>Tình trạng tài sản:</td>
              <td style={S.tdBorder}>
                {data.TINH_TRANG} (IMEI: {data.IMEI} - Serial: {data.SERIAL})
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: "12pt", marginBottom: "16px" }}>
          <strong>Cam kết về tài sản:</strong> Bên B cam kết tài sản nêu trên
          thuộc quyền sở hữu hợp pháp của Bên B, không có tranh chấp, và không
          bị ràng buộc bởi bất kỳ nghĩa vụ nào đối với bên thứ ba tại thời
          điểm ký kết.
        </p>

        {/* Điều 2 */}
        <div style={S.section}>
          <h3 style={S.heading}>
            ĐIỀU 2: NỘI DUNG KHOẢN VAY VÀ PHƯƠNG THỨC THANH TOÁN
          </h3>
          <p style={{ marginBottom: "8px" }}>
            Số tiền vay (Gốc): <strong>{data.SO_TIEN_VAY}</strong>.
          </p>
          <p style={{ marginBottom: "8px" }}>
            Thời hạn vay: Tối đa 30 ngày kể từ ngày giải ngân.
          </p>
          <p style={{ marginBottom: "8px" }}>Lãi suất: {data.LAI_SUAT}</p>
          <p style={{ marginBottom: "8px" }}>
            Phương thức trả nợ: Gốc trả cuối kỳ; Lãi và phí được tính dựa trên
            thời điểm tất toán thực tế theo các mốc thời gian quy định tại Điều
            3.
          </p>
        </div>


        {/* Điều 3 - Bắt đầu */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 3: QUY ĐỊNH VỀ MỐC TẤT TOÁN</h3>
          <p style={{ marginBottom: "10px" }}>
            Bên B có quyền tất toán khoản vay trước hạn bất cứ lúc nào. Tổng số
            tiền phải thanh toán sẽ được xác định theo bảng dưới đây:
          </p>
        </div>
        <table
          style={{
            ...S.table,
            border: "1px solid #000",
            marginBottom: "16px",
          }}
        >
          <thead>
            <tr>
              <th style={S.tdBorder}>Mốc thanh toán</th>
              <th style={S.tdBorder}>Thời điểm tất toán</th>
              <th style={S.tdBorder}>Tổng tiền phải thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {(data.MILESTONES ?? []).map((m) => (
              <tr key={m.moc}>
                <td style={S.tdBorder}>Mốc {m.moc}</td>
                <td style={S.tdBorder}>Ngày {m.ngay}</td>
                <td style={S.tdBorder}>{m.tongTien}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= TRANG 3 ================= */}
      <div style={S.page}>
        {/* Điều 4 */}
        <div style={S.section}>
          <h3 style={S.heading}>
            ĐIỀU 4: QUYỀN LỰA CHỌN THUÊ LẠI TÀI SẢN CẦM CỐ
          </h3>
          <p style={{ marginBottom: "8px" }}>
            <strong>4.1. Quyền tự do lựa chọn:</strong> Bên B (bên cầm cố tài
            sản) được quyền tự do lựa chọn việc có thuê lại hoặc không thuê lại
            tài sản đã cầm cố cho Bên A sau khi ký hợp đồng cầm cố này.
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>4.2. Tính độc lập của giao dịch:</strong> Việc thuê lại tài
            sản (nếu có) sẽ được các bên thỏa thuận bằng một Hợp đồng thuê tài
            sản riêng biệt, độc lập với hợp đồng cầm cố này. Hợp đồng cầm cố và
            Hợp đồng thuê (nếu có) là hai giao dịch pháp lý độc lập.
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>4.3. Xử lý trong trường hợp không thuê lại:</strong> Trường
            hợp Bên B không thuê lại tài sản, tài sản cầm cố sẽ được Bên A quản
            lý, lưu giữ và bảo quản tại kho của Bên A theo đúng quy định pháp
            luật.
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>4.4. Xử lý trong trường hợp thuê lại:</strong> Trường hợp
            Bên B có nhu cầu thuê lại tài sản, các bên sẽ ký hợp đồng thuê tài
            sản riêng, trong đó quy định cụ thể về giá thuê, thời hạn, và trách
            nhiệm của các bên.
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>4.5. Xác nhận:</strong> Việc thuê lại tài sản là hoàn toàn
            tự nguyện. Việc không ký hợp đồng thuê không ảnh hưởng đến quyền và
            nghĩa vụ theo hợp đồng cầm cố này.
          </p>
        </div>

        {/* Điều 5 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 5: NGHĨA VỤ CỦA CÁC BÊN</h3>
          <p style={{ marginBottom: "8px" }}>
            <strong>5.1. Trách nhiệm của Bên A:</strong>
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px" }}>
            Bảo quản tài sản cầm cố đúng theo điều kiện thực tế (Trừ trường hợp
            đã bàn giao lại cho Bên B thuê theo Điều 4).
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px" }}>
            Hoàn trả lại tài sản cho Bên B ngay sau khi Bên B hoàn thành nghĩa
            vụ tài chính.
          </p>
          <p style={{ marginBottom: "8px", marginLeft: "10px" }}>
            Bên A không chịu trách nhiệm đối với các hao mòn tự nhiên, hư hỏng
            do tính chất cơ lý hóa của tài sản trong quá trình lưu kho.
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>5.2. Trách nhiệm của Bên B:</strong>
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px" }}>
            Thanh toán đầy đủ cả gốc và lãi đúng thời hạn đã cam kết.
          </p>
          <p style={{ marginLeft: "10px" }}>
            Chịu trách nhiệm về nguồn gốc và tính pháp lý của tài sản cầm cố.
          </p>
        </div>
      </div>

      {/* ================= TRANG 4 ================= */}
      <div style={S.lastPage}>
        {/* Điều 6 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 6: XỬ LÝ VI PHẠM VÀ TÀI SẢN CẦM CỐ</h3>
          <p style={{ marginBottom: "8px" }}>
            <strong>6.1.</strong> Trường hợp Bên B không thực hiện nghĩa vụ
            thanh toán đúng hạn (quá hạn so với Ngày 30), Bên B sẽ mất quyền
            hưởng các ưu đãi (nếu có).
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>6.2.</strong> Nếu Bên B vi phạm nghĩa vụ thanh toán quá 08
            (tám) ngày kể từ ngày đến hạn (Mốc 3), Bên A có toàn quyền xử lý tài
            sản cầm cố để thu hồi nợ (bao gồm nhưng không giới hạn: bán, thanh
            lý, chuyển nhượng tài sản).
          </p>
          <p style={{ marginBottom: "16px" }}>
            <strong>6.3.</strong> Việc xử lý tài sản được thực hiện theo thỏa
            thuận tại Hợp đồng này và quy định của pháp luật hiện hành. Bên B
            mặc nhiên đồng ý và không có quyền khiếu nại về sau.
          </p>
        </div>

        {/* Điều 7 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 7: CAM KẾT CỦA BÊN CẦM CỐ</h3>
          <p style={{ marginBottom: "8px" }}>Bên B xác nhận và cam kết:</p>
          <p style={{ marginBottom: "4px", marginLeft: "10px" }}>
            Đã được nhân viên Bên A tư vấn, giải thích chi tiết và hiểu rõ về
            khoản vay, lãi suất, và quyền lựa chọn thuê lại tài sản tại Điều 4.
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px" }}>
            Hoàn toàn tự nguyện ký kết hợp đồng này, không bị lừa dối hay ép
            buộc.
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px" }}>
            Cam kết tuân thủ đúng nghĩa vụ trả nợ, không viện dẫn các lý do chủ
            quan để từ chối hoặc trì hoãn nghĩa vụ đã cam kết.
          </p>
          <p style={{ marginBottom: "16px", marginLeft: "10px" }}>
            Mọi thỏa thuận bằng miệng hoặc tin nhắn không được ghi trong hợp
            đồng này đều không có giá trị pháp lý.
          </p>
        </div>

        {/* Điều 8 */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={S.heading}>ĐIỀU 8: HIỆU LỰC HỢP ĐỒNG</h3>
          <p style={{ marginBottom: "8px" }}>
            Hợp đồng này có hiệu lực kể từ ngày ký.
          </p>
          <p style={{ marginBottom: "8px" }}>
            Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau,
            mỗi bên giữ 01 (một) bản.
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
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold, marginBottom: "100px" }}>ĐẠI DIỆN BÊN A</p>
            <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
          </div>
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold, marginBottom: "100px" }}>BÊN B</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}