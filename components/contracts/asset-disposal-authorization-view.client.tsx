// components/contracts/asset-disposal-authorization-view.tsx
"use client";

import type { TAssetDisposalAuthorizationData } from "@/types/contract.types";

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
};

type TProps = {
  data: TAssetDisposalAuthorizationData;
  id?: string;
};

export function AssetDisposalAuthorizationView({
  data,
  id = "contract-content",
}: TProps) {
  return (
    <div id={id} style={S.container}>
      {/* Header */}
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
      <div style={{ ...S.center, margin: "20px 0" }}>
        <h1 style={{ fontSize: "16pt", ...S.bold, margin: "10px 0" }}>
          GIẤY ỦY QUYỀN XỬ LÝ TÀI SẢN CẦM CỐ
        </h1>
      </div>

      {/* Bên ủy quyền */}
      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "10px" }}>BÊN ỦY QUYỀN</p>
        <div style={{ marginBottom: "20px" }}>

  <ul
    style={{
      paddingLeft: "40px",
      listStyleType: "disc",
      margin: 0,
      fontSize: "12pt",
      lineHeight: 1.6,
    }}
  >
    <li style={{ marginBottom: "6px" }}>
      Họ và tên: <strong>{data.HO_TEN}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      CCCD: <strong>{data.CCCD}</strong>; Ngày cấp:{" "}
      <strong>{data.NGAY_CAP}</strong>; Nơi cấp:{" "}
      <strong>{data.NOI_CAP}</strong>.
    </li>

    <li style={{ marginBottom: "6px" }}>
      Địa chỉ thường trú: <strong>{data.DIA_CHI}</strong>
    </li>

    <li>
      Số điện thoại liên hệ: <strong>{data.SDT}</strong>.
    </li>
  </ul>
</div>
      </div>

      {/* Bên được ủy quyền */}
      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "10px" }}>BÊN ĐƯỢC ỦY QUYỀN</p>
        <ul
    style={{
      paddingLeft: "40px",
      listStyleType: "disc",
      margin: 0,
      fontSize: "12pt",
      lineHeight: 1.6,
    }}
  >
    <li style={{ marginBottom: "6px" }}>
      Tên đơn vị/Doanh nghiệp:{" "}
      <strong>{data.BEN_UU_QUYEN_TEN}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Đại diện Ông/Bà:{" "}
      <strong>{data.BEN_UU_QUYEN_DAI_DIEN}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Chức vụ: <strong>Giám đốc</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Địa chỉ: <strong>{data.BEN_UU_QUYEN_DIA_CHI}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Mã số thuế: <strong>{data.BEN_UU_QUYEN_MST}</strong> cấp ngày{" "}
      <strong>14/01/2025</strong> tại Ninh Kiều - Thuế cơ sở 1 thành phố Cần Thơ.
    </li>

    <li>
      Số điện thoại: <strong>{data.BEN_UU_QUYEN_SDT}</strong>
    </li>
  </ul>
      </div>

      {/* Điều 1 */}
      <div style={S.section}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 1. Tài sản ủy quyền xử lý
        </h3>
       <ul
    style={{
      paddingLeft: "40px",
      listStyleType: "disc",
      margin: 0,
      fontSize: "12pt",
      lineHeight: 1.6,
    }}
  >
    <li style={{ marginBottom: "6px" }}>
      Loại tài sản: <strong>{data.LOAI_TS}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Chi tiết: <strong>{data.CHI_TIET}</strong>
    </li>

    <li>
      Tình trạng tài sản: <strong>{data.TINH_TRANG}</strong>
    </li>
  </ul>
      </div>

      {/* Điều 2 */}
      <div style={S.section}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 2. Phạm vi ủy quyền
        </h3>
      <div style={{ fontSize: "12pt", lineHeight: 1.6 }}>
  <ol
    style={{
      paddingLeft: "40px",
      listStyleType: "decimal",
      margin: 0,
    }}
  >
    <li style={{ marginBottom: "8px" }}>
      Bên ủy quyền ủy quyền cho Bên được ủy quyền thực hiện các hành vi
      thu hồi, bán, chuyển nhượng, sang tên và cấn trừ nghĩa vụ nợ đối với
      tài sản nêu tại Điều 1{" "}
      <strong>
        chỉ trong trường hợp Bên ủy quyền vi phạm nghĩa vụ thanh toán theo Hợp
        đồng cầm cố
      </strong>.
    </li>

    <li style={{ marginBottom: "8px" }}>
      Ủy quyền này không được đơn phương chấm dứt{" "}
      <strong>
        trong thời gian Bên ủy quyền chưa hoàn thành đầy đủ nghĩa vụ tài chính
      </strong>{" "}
      theo Hợp đồng cầm cố.
    </li>

    <li>
      Trước khi thực hiện việc xử lý tài sản, Bên được ủy quyền có trách
      nhiệm thông báo cho Bên ủy quyền trong thời hạn hợp lý theo quy định
      pháp luật, trừ trường hợp pháp luật có quy định khác.
    </li>
  </ol>
</div>
      </div>

      {/* Điều 3 */}
      <div style={S.section}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 3. Thời hạn ủy quyền
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Có hiệu lực đến khi nghĩa vụ được thanh toán xong.
        </p>
      </div>

      {/* Điều 4 */}
      <div style={S.section}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 4. Xác nhận tự nguyện và đã được giải thích đầy đủ
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Bên ủy quyền xác nhận rằng việc ký kết Giấy ủy quyền này là <strong>hoàn toàn
          tự nguyện</strong>, không bị ép buộc, đe dọa, lừa dối hoặc nhầm lẫn.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Bên ủy quyền xác nhận đã được Bên được ủy quyền <strong>giải thích đầy đủ, rõ
          ràng và dễ hiểu</strong> về nội dung, phạm vi, quyền, nghĩa vụ và hậu quả pháp
          lý phát sinh từ việc ký Giấy ủy quyền này, bao gồm cả quyền xử lý tài
          sản cầm cố trong trường hợp vi phạm nghĩa vụ.
        </p>
        <p style={{ marginBottom: "60px" }}>
          Bên ủy quyền hiểu rõ và đồng ý rằng việc ủy quyền xử lý tài sản cầm
          cố là nhằm bảo đảm thực hiện nghĩa vụ theo Hợp đồng cầm cố đã ký, và
          không làm thay đổi quyền sở hữu tài sản cho đến khi tài sản bị xử lý
          hợp pháp theo quy định pháp luật.
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
            <p style={{ ...S.bold}}>
              BÊN ĐƯỢC ỦY QUYỀN
            </p>
            <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
          </div>
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold }}>BÊN ỦY QUYỀN</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}