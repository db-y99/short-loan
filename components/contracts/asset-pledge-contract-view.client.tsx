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
    padding: "20mm",
    minHeight: "297mm",
  } as React.CSSProperties,

  section: {
    marginBottom: "20px",
    pageBreakInside: "avoid" as const,
  } as React.CSSProperties,

  center: { textAlign: "center" as const },
  bold: { fontWeight: "bold" as const },
  table: { 
    width: "100%", 
    borderCollapse: "collapse" as const,
    pageBreakInside: "avoid" as const,
  },
  td: { padding: "5px 10px" },
  tdBorder: { padding: "8px", border: "1px solid #000" } as React.CSSProperties,
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
      {/* Header */}
      <div style={S.section}>
        <div style={{ ...S.center, marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "14pt", ...S.bold }}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </h2>
          <p style={{ margin: "5px 0", fontSize: "12pt" }}>
            Độc lập – Tự do – Hạnh phúc
          </p>
          <div>---o0o---</div>
        </div>

        {/* Title */}
        <div style={{ ...S.center, margin: "24px 0" }}>
          <h1 style={{ fontSize: "18pt", ...S.bold, margin: "4px 0" }}>
            HỢP ĐỒNG CẦM CỐ TÀI SẢN
          </h1>
          <p style={{ fontSize: "13pt", ...S.bold }}>
            (Mã hợp đồng: {data.MA_HD})
          </p>
        </div>

        {/* Preamble */}
       <ul
        style={{
          fontSize: "12pt",
          marginBottom: "16px",
          paddingLeft: "40px",
              listStyleType: "disc",
        }}
      >
        <li style={{ marginBottom: "6px" }}>
          Căn cứ Bộ luật Dân sự 2015 và các văn bản hướng dẫn thi hành;
        </li>
        <li>
          Căn cứ thỏa thuận và nhu cầu của các bên.
        </li>
      </ul>
        <p style={{ marginBottom: "16px" }}>
          Hôm nay, ngày {data.NGAY} tháng {data.THANG} năm {data.NAM}, tại 99B
          Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ, chúng tôi gồm:
        </p>
      </div>

      {/* Bên A */}
      <div style={S.section}>
        <h3 style={S.heading}>BÊN NHẬN CẦM CỐ (BÊN A):</h3>
       <ul
  style={{
    fontSize: "12pt",
    marginBottom: "16px",
    paddingLeft: "40px",
 listStyleType: "disc",
  }}
>
  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Tên đơn vị:</span>{" "}
    {data.BEN_A_TEN}
  </li>

  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Địa chỉ:</span>{" "}
    {data.BEN_A_DIA_CHI}
  </li>

  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Đại diện bởi:</span>{" "}
    <span style={{ fontWeight: "bold" }}>
      {data.BEN_A_DAI_DIEN}
    </span>
  </li>

  <li>
    <span style={{ fontWeight: "bold" }}>Chức vụ:</span>{" "}
    {data.BEN_A_CHUC_VU}
  </li>
</ul>
      </div>

      {/* Bên B */}
      <div style={S.section}>
        <h3 style={S.heading}>BÊN CẦM CỐ (BÊN B):</h3>
       <ul
  style={{
    fontSize: "12pt",
    marginBottom: "16px",
    paddingLeft: "40px",
     listStyleType: "disc",
  }}
>
  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Họ và tên:</span>{" "}
    <span style={{ fontWeight: "bold" }}>{data.HO_TEN}</span>.
  </li>

  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>CCCD:</span> {data.CCCD};{" "}
    <span style={{ fontWeight: "bold" }}>Ngày cấp:</span> {data.NGAY_CAP};{" "}
    <span style={{ fontWeight: "bold" }}>Nơi cấp:</span> {data.NOI_CAP}.
  </li>

  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Địa chỉ thường trú:</span>{" "}
    {data.DIA_CHI}.
  </li>

  <li>
    <span style={{ fontWeight: "bold" }}>Số điện thoại liên hệ:</span>{" "}
    {data.SDT}.
  </li>
</ul>
      </div>

      <div style={S.section}>
        <p style={{ marginBottom: "12px" }}>
          Hai bên thống nhất ký kết Hợp đồng cầm cố tài sản với các điều khoản
          như sau:
        </p>
      </div>

      {/* Điều 1 */}
      <div style={S.section}>
        <h3 style={S.heading}>ĐIỀU 1: TÀI SẢN CẦM CỐ</h3>
        <p style={{ marginBottom: "8px" }}>
          Bên B đồng ý cầm cố tài sản thuộc sở hữu của mình cho Bên A để đảm
          bảo nghĩa vụ thanh toán khoản vay, cụ thể như sau:
        </p>
        <ul
  style={{
    fontSize: "12pt",
    marginBottom: "16px",
    paddingLeft: "40px",
     listStyleType: "disc",
  }}
>
  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Loại tài sản:</span>{" "}
    {data.LOAI_TS}
  </li>

  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Chi tiết:</span>{" "}
    {data.CHI_TIET}
  </li>

  <li>
    <span style={{ fontWeight: "bold" }}>Tình trạng tài sản:</span>{" "}
    {data.TINH_TRANG}
  </li>
</ul>
        <p style={{ fontSize: "12pt", marginBottom: "16px" }}>
          <strong>Cam kết về tài sản:</strong> Bên B cam kết tài sản nêu trên
          thuộc quyền sở hữu hợp pháp của Bên B, không có tranh chấp, và không
          bị ràng buộc bởi bất kỳ nghĩa vụ nào đối với bên thứ ba tại thời
          điểm ký kết.
        </p>
      </div>

      {/* Điều 2 */}
      <div style={S.section}>
        <h3 style={S.heading}>
          ĐIỀU 2: NỘI DUNG KHOẢN VAY VÀ PHƯƠNG THỨC THANH TOÁN
        </h3>
     <ol
  style={{
    fontSize: "12pt",
    marginBottom: "16px",
    paddingLeft: "40px",
        listStyleType: "decimal",
  }}
>
  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>
      Số tiền vay (Gốc): {data.SO_TIEN_VAY}
    </span>.
  </li>

  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Thời hạn vay:</span>{" "}
    Tối đa 30 ngày kể từ ngày giải ngân.
  </li>

  <li style={{ marginBottom: "6px" }}>
    <span style={{ fontWeight: "bold" }}>Lãi suất:</span>{" "}
    {data.LAI_SUAT}.
  </li>

  <li>
    <span style={{ fontWeight: "bold" }}>Phương thức trả nợ:</span>{" "}
    Gốc trả cuối kỳ; Lãi và phí được tính dựa trên thời điểm tất toán thực tế
    theo các mốc thời gian quy định tại Điều 3.
  </li>
</ol>
      </div>

      {/* Điều 3 */}
      <div style={S.section}>
        <h3 style={S.heading}>ĐIỀU 3: QUY ĐỊNH VỀ MỐC TẤT TOÁN</h3>
        <p style={{ marginBottom: "10px" }}>
          Bên B có quyền tất toán khoản vay trước hạn bất cứ lúc nào. Tổng số
          tiền phải thanh toán sẽ được xác định theo bảng dưới đây:
        </p>
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

      {/* Điều 4 */}
      <div style={S.section}>
        <h3 style={S.heading}>
          ĐIỀU 4: QUYỀN LỰA CHỌN THUÊ LẠI TÀI SẢN CẦM CỐ
        </h3>
<ol
  style={{
    fontSize: "12pt",
    marginBottom: "16px",
    paddingLeft: "40px",
        listStyleType: "decimal",
  }}
>
  <li style={{ marginBottom: "8px" }}>
    <span style={{ fontWeight: "bold" }}>Quyền tự do lựa chọn:</span>{" "}
    Bên B (bên cầm cố tài sản) được quyền tự do lựa chọn việc có thuê lại
    hoặc không thuê lại tài sản đã cầm cố cho Bên A sau khi ký hợp đồng
    cầm cố này.
  </li>

  <li style={{ marginBottom: "8px" }}>
    <span style={{ fontWeight: "bold" }}>Tính độc lập của giao dịch:</span>

    <ul
      style={{
        marginTop: "6px",
        paddingLeft: "40px",
        listStyleType: "circle",
      }}
    >
      <li style={{ marginBottom: "4px" }}>
        Việc thuê lại tài sản (nếu có) sẽ được các bên thỏa thuận bằng
        một Hợp đồng thuê tài sản riêng biệt, độc lập với hợp đồng cầm
        cố này.
      </li>
      <li style={{ marginBottom: "4px" }}>
        Hợp đồng thuê (nếu được ký) không phải là điều kiện bắt buộc để
        hợp đồng cầm cố này có hiệu lực.
      </li>
      <li>
        Hợp đồng cầm cố và Hợp đồng thuê (nếu có) là hai giao dịch pháp
        lý độc lập.
      </li>
    </ul>
  </li>

  <li style={{ marginBottom: "8px" }}>
    <span style={{ fontWeight: "bold" }}>
      Xử lý trong trường hợp không thuê lại:
    </span>{" "}
    Trường hợp Bên B không thuê lại tài sản, tài sản cầm cố sẽ được
    Bên A quản lý, lưu giữ và bảo quản tại kho của Bên A theo đúng
    quy định pháp luật và theo thỏa thuận tại Điều 5 hợp đồng này.
  </li>

  <li style={{ marginBottom: "8px" }}>
    <span style={{ fontWeight: "bold" }}>
      Xử lý trong trường hợp thuê lại:
    </span>{" "}
    Trường hợp Bên B có nhu cầu thuê lại tài sản, các bên sẽ ký hợp
    đồng thuê tài sản riêng, trong đó quy định cụ thể về:

    <ul
      style={{
        marginTop: "6px",
        paddingLeft: "40px",
        listStyleType: "circle",
      }}
    >
      <li>Giá thuê, phương thức thanh toán;</li>
      <li>Thời hạn thuê;</li>
      <li>Quyền và nghĩa vụ của các bên;</li>
      <li>Trách nhiệm bồi thường, bảo hiểm (nếu có).</li>
    </ul>
  </li>

  <li>
    <span style={{ fontWeight: "bold" }}>Xác nhận của các bên:</span>{" "}
    Các bên xác nhận rằng việc thuê lại tài sản là hoàn toàn tự
    nguyện, không bị ép buộc. Việc không ký hợp đồng thuê lại không
    ảnh hưởng đến quyền và nghĩa vụ của các bên theo hợp đồng cầm cố này.
  </li>
</ol>
      </div>

      {/* Điều 5 */}
      <div style={S.section}>
        <h3 style={S.heading}>ĐIỀU 5: NGHĨA VỤ CỦA CÁC BÊN</h3>
        <div style={{ fontSize: "12pt", marginBottom: "16px" }}>
  <p style={{ fontWeight: "bold", marginBottom: "6px" }}>
    Trách nhiệm của Bên A:
  </p>

  <ul
    style={{
      paddingLeft: "40px",
      marginBottom: "12px",
      listStyleType: "disc",
    }}
  >
    <li style={{ marginBottom: "6px" }}>
      Bảo quản tài sản cầm cố đúng theo điều kiện thực tế
      (Trừ trường hợp đã bàn giao lại cho Bên B thuê theo Điều 4).
    </li>
    <li style={{ marginBottom: "6px" }}>
      Hoàn trả lại tài sản cho Bên B ngay sau khi Bên B hoàn thành
      nghĩa vụ tài chính.
    </li>
    <li>
      Bên A không chịu trách nhiệm đối với các hao mòn tự nhiên,
      hư hỏng do tính chất cơ lý hóa của tài sản trong quá trình lưu kho.
    </li>
  </ul>

  <p style={{ fontWeight: "bold", marginBottom: "6px" }}>
    Trách nhiệm của Bên B:
  </p>

  <ul
    style={{
      paddingLeft: "40px",
      listStyleType: "disc",
    }}
  >
    <li style={{ marginBottom: "6px" }}>
      Thanh toán đầy đủ cả gốc và lãi đúng thời hạn đã cam kết.
    </li>
    <li>
      Chịu trách nhiệm về nguồn gốc và tính pháp lý của tài sản cầm cố.
    </li>
  </ul>
</div>
      </div>

      {/* Điều 6 */}
      <div style={S.section}>
        <h3 style={S.heading}>ĐIỀU 6: XỬ LÝ VI PHẠM VÀ TÀI SẢN CẦM CỐ</h3>
       <div style={{ marginBottom: "16px", fontSize: "12pt", lineHeight: 1.6 }}>
  <ol
    style={{
      paddingLeft: "40px",
      margin: 0,
          listStyleType: "decimal",
    }}
  >
    <li style={{ marginBottom: "8px" }}>
      Trường hợp Bên B không thực hiện nghĩa vụ thanh toán đúng hạn
      (quá hạn so với Ngày 30), Bên B sẽ mất quyền hưởng các ưu đãi (nếu có).
    </li>

    <li style={{ marginBottom: "8px" }}>
      Nếu Bên B vi phạm nghĩa vụ thanh toán quá 08 (tám) ngày kể từ
      ngày đến hạn (Mốc 3), Bên A có toàn quyền xử lý tài sản cầm cố
      để thu hồi nợ (bao gồm nhưng không giới hạn: bán, thanh lý,
      chuyển nhượng tài sản).
    </li>

    <li>
      Việc xử lý tài sản được thực hiện theo thỏa thuận tại Hợp đồng này
      và quy định của pháp luật hiện hành. Bên B mặc nhiên đồng ý và
      không có quyền khiếu nại về sau.
    </li>
  </ol>
</div>
      </div>

      {/* Điều 7 */}
      <div style={S.section}>
        <h3 style={S.heading}>ĐIỀU 7: CAM KẾT CỦA BÊN CẦM CỐ</h3>
        <p style={{ marginBottom: "8px" }}>Bên B xác nhận và cam kết:</p>
      <ol
    style={{
      paddingLeft: "40px",
      margin: 0,
          listStyleType: "decimal",
    }}
  >
    <li style={{ marginBottom: "8px" }}>
      Đã được nhân viên Bên A tư vấn, giải thích chi tiết và hiểu rõ về
      khoản vay, lãi suất và quyền lựa chọn thuê lại tài sản tại Điều 4.
    </li>

    <li style={{ marginBottom: "8px" }}>
      Hoàn toàn tự nguyện ký kết hợp đồng này, không bị lừa dối hay ép buộc.
    </li>

    <li style={{ marginBottom: "8px" }}>
      Cam kết tuân thủ đúng nghĩa vụ trả nợ, không viện dẫn các lý do chủ quan
      (như không hiểu, không biết, nhầm lẫn…) để từ chối hoặc trì hoãn nghĩa vụ
      đã cam kết.
    </li>

    <li>
      Mọi thỏa thuận bằng miệng hoặc tin nhắn không được ghi trong hợp đồng này
      đều không có giá trị pháp lý.
    </li>
  </ol>
      </div>

      {/* Điều 8 with signatures */}
      <div style={S.section}>
        <h3 style={S.heading}>ĐIỀU 8: HIỆU LỰC HỢP ĐỒNG</h3>
        <p style={{ marginBottom: "8px" }}>
          Hợp đồng này có hiệu lực kể từ ngày ký.
        </p>
        <p style={{ marginBottom: "60px" }}>
          Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau,
          mỗi bên giữ 01 (một) bản.
        </p>

        {/* Signatures - keep with section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "40px",
          }}
        >
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold}}>ĐẠI DIỆN BÊN A</p>
            <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
            {data.DRAFT_SIGNATURE && (
              <div style={{ marginTop: "10px" }}>
                <img 
                  src={data.DRAFT_SIGNATURE} 
                  alt="Chữ ký Bên A" 
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              </div>
            )}
          </div>
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold }}>BÊN B</p>
            <p>(Ký, ghi rõ họ tên)</p>
            {data.OFFICIAL_SIGNATURE && (
              <div style={{ marginTop: "10px" }}>
                <img 
                  src={data.OFFICIAL_SIGNATURE} 
                  alt="Chữ ký Bên B" 
                  style={{ maxWidth: "200px", height: "auto" }}
                />
                <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                  {data.HO_TEN?.toUpperCase()}
                </p>
                <p>Ngày {data.SIGNED_DATE}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
