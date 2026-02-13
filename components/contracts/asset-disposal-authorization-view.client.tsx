"use client";

import type { TAssetDisposalAuthorizationData } from "@/types/contract.types";

const S = {
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
  table: { width: "100%", borderCollapse: "collapse" as const },
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
      <div style={{ ...S.center, marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "14pt", ...S.bold }}>
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </h2>
        <p style={{ margin: "5px 0", fontSize: "12pt" }}>
          Độc lập – Tự do – Hạnh phúc
        </p>
        <hr style={{ width: "100px", margin: "10px auto", border: "1px solid #000" }} />
      </div>

      <div style={{ ...S.center, margin: "30px 0" }}>
        <h1 style={{ fontSize: "16pt", ...S.bold, margin: "10px 0" }}>
          GIẤY ỦY QUYỀN XỬ LÝ TÀI SẢN CẦM CỐ
        </h1>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p style={{ ...S.bold, marginBottom: "10px" }}>BÊN ỦY QUYỀN</p>
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

      <div style={{ marginBottom: "20px" }}>
        <p style={{ ...S.bold, marginBottom: "10px" }}>BÊN ĐƯỢC ỦY QUYỀN</p>
        <table style={S.table}>
          <tbody>
            <tr>
              <td style={{ width: "30%", ...S.td }}>
                Tên đơn vị/Doanh nghiệp:
              </td>
              <td style={{ ...S.bold, ...S.td }}>{data.BEN_UU_QUYEN_TEN}</td>
            </tr>
            <tr>
              <td style={S.td}>Đại diện Ông/Bà:</td>
              <td style={S.td}>{data.BEN_UU_QUYEN_DAI_DIEN}</td>
            </tr>
            <tr>
              <td style={S.td}>Chức vụ:</td>
              <td style={S.td}>Giám đốc</td>
            </tr>
            <tr>
              <td style={S.td}>Địa chỉ:</td>
              <td style={S.td}>{data.BEN_UU_QUYEN_DIA_CHI}</td>
            </tr>
            <tr>
              <td style={S.td}>Mã số thuế:</td>
              <td style={S.td}>
                {data.BEN_UU_QUYEN_MST} cấp ngày 14/01/2025 tại Ninh Kiều -
                Thuế cơ sở 1 thành phố Cần Thơ.
              </td>
            </tr>
            <tr>
              <td style={S.td}>Số điện thoại:</td>
              <td style={S.td}>{data.BEN_UU_QUYEN_SDT}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 1. Tài sản ủy quyền xử lý
        </h3>
        <table style={S.table}>
          <tbody>
            <tr>
              <td style={{ width: "28%", padding: "8px", border: "1px solid #000" }}>
                Loại tài sản:
              </td>
              <td style={{ padding: "8px", border: "1px solid #000" }}>
                {data.LOAI_TS}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", border: "1px solid #000" }}>
                Chi tiết:
              </td>
              <td style={{ padding: "8px", border: "1px solid #000" }}>
                {data.CHI_TIET} (IMEI: {data.IMEI} - Serial: {data.SERIAL})
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", border: "1px solid #000" }}>
                Tình trạng tài sản:
              </td>
              <td style={{ padding: "8px", border: "1px solid #000" }}>
                {data.TINH_TRANG} (IMEI: {data.IMEI} - Serial: {data.SERIAL})
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 2. Phạm vi ủy quyền
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Bên ủy quyền ủy quyền cho Bên được ủy quyền thực hiện các hành vi
          thu hồi, bán, chuyển nhượng, sang tên và cấn trừ nghĩa vụ nợ đối với
          tài sản nêu tại Điều 1 chỉ trong trường hợp Bên ủy quyền vi phạm nghĩa
          vụ thanh toán theo Hợp đồng cầm cố.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Ủy quyền này không được đơn phương chấm dứt trong thời gian Bên ủy
          quyền chưa hoàn thành đầy đủ nghĩa vụ tài chính theo Hợp đồng cầm cố.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Trước khi thực hiện việc xử lý tài sản, Bên được ủy quyền có trách
          nhiệm thông báo cho Bên ủy quyền trong thời hạn hợp lý theo quy định
          pháp luật, trừ trường hợp pháp luật có quy định khác.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 3. Thời hạn ủy quyền
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Có hiệu lực đến khi nghĩa vụ được thanh toán xong.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          Điều 4. Xác nhận tự nguyện và đã được giải thích đầy đủ
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Bên ủy quyền xác nhận rằng việc ký kết Giấy ủy quyền này là hoàn toàn
          tự nguyện, không bị ép buộc, đe dọa, lừa dối hoặc nhầm lẫn.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Bên ủy quyền xác nhận đã được Bên được ủy quyền giải thích đầy đủ, rõ
          ràng và dễ hiểu về nội dung, phạm vi, quyền, nghĩa vụ và hậu quả pháp
          lý phát sinh từ việc ký Giấy ủy quyền này, bao gồm cả quyền xử lý tài
          sản cầm cố trong trường hợp vi phạm nghĩa vụ.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Bên ủy quyền hiểu rõ và đồng ý rằng việc ủy quyền xử lý tài sản cầm
          cố là nhằm bảo đảm thực hiện nghĩa vụ theo Hợp đồng cầm cố đã ký, và
          không làm thay đổi quyền sở hữu tài sản cho đến khi tài sản bị xử lý
          hợp pháp theo quy định pháp luật.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "60px",
        }}
      >
        <div style={{ ...S.center, width: "45%" }}>
          <p style={{ ...S.bold, marginBottom: "80px" }}>
            BÊN ĐƯỢC ỦY QUYỀN
          </p>
          <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
        </div>
        <div style={{ ...S.center, width: "45%" }}>
          <p style={{ ...S.bold, marginBottom: "80px" }}>BÊN ỦY QUYỀN</p>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
}
