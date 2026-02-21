"use client";

import type { TFullPaymentConfirmationData } from "@/types/contract.types";

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
  data: TFullPaymentConfirmationData;
  id?: string;
};

export function FullPaymentConfirmationView({
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

      <div style={{ ...S.center, margin: "24px 0" }}>
        <h1 style={{ fontSize: "16pt", ...S.bold, margin: "10px 0" }}>
          XÁC NHẬN ĐÃ NHẬN ĐỦ TIỀN
        </h1>
        <p style={{ fontSize: "12pt" }}>
          (Kèm theo Hợp đồng cầm cố số: {data.MA_HD} ngày {data.NGAY_HD})
        </p>
      </div>

      <p style={{ marginBottom: "20px" }}>
        Hôm nay, {data.NGAY} tháng {data.THANG} năm {data.NAM} tại 99B Nguyễn
        Trãi, phường Tân An, Ninh Kiều, thành phố Cần Thơ.
      </p>
      <p style={{ marginBottom: "16px" }}>Chúng tôi gồm có:</p>

      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "8px" }}>
          I. BÊN GIAO TIỀN (Bên nhận cầm cố):
        </p>
        <table style={S.table}>
          <tbody>
            <tr>
              <td style={{ width: "35%", ...S.td }}>Tên đơn vị/Doanh nghiệp:</td>
              <td style={{ ...S.bold, ...S.td }}>{data.BEN_GIAO_TEN}</td>
            </tr>
            <tr>
              <td style={S.td}>Đại diện Ông/Bà:</td>
              <td style={S.td}>{data.BEN_GIAO_DAI_DIEN}</td>
            </tr>
            <tr>
              <td style={S.td}>Chức vụ:</td>
              <td style={S.td}>{data.BEN_GIAO_CHUC_VU}</td>
            </tr>
            <tr>
              <td style={S.td}>Địa chỉ:</td>
              <td style={S.td}>{data.BEN_GIAO_DIA_CHI}</td>
            </tr>
            <tr>
              <td style={S.td}>Mã số thuế/CMND/CCCD số:</td>
              <td style={S.td}>
                {data.BEN_GIAO_MST} cấp ngày: 14/01/2025 tại: Ninh Kiều - Thuế
                cơ sở 1 thành phố Cần Thơ
              </td>
            </tr>
            <tr>
              <td style={S.td}>Số điện thoại:</td>
              <td style={S.td}>{data.BEN_GIAO_SDT}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "8px" }}>
          II. BÊN NHẬN TIỀN (Bên cầm cố):
        </p>
        <table style={S.table}>
          <tbody>
            <tr>
              <td style={{ width: "35%", ...S.td }}>Họ và tên:</td>
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

      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "8px" }}>
          III. NỘI DUNG XÁC NHẬN:
        </p>
        <p style={{ marginBottom: "8px" }}>
          Bên Nhận Tiền xác nhận đã nhận đủ số tiền từ Bên Giao Tiền theo thỏa
          thuận tại Hợp đồng cầm cố tài sản số {data.MA_HD} ký kết ngày{" "}
          {data.NGAY_HD} với chi tiết như sau:
        </p>
        <p style={{ marginBottom: "8px" }}>
          Tài sản cầm cố: <strong>{data.TAI_SAN}</strong>.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Số tiền vay đã nhận: <strong>{data.SO_TIEN}</strong>.
        </p>
        <p style={{ marginBottom: "8px" }}>Hình thức nhận tiền:</p>
        <p style={{ marginBottom: "4px" }}>
          ☐ Tiền mặt tại văn phòng giao dịch
        </p>
        <p style={{ marginBottom: "8px" }}>
          ✓ Chuyển khoản qua tài khoản ngân hàng
        </p>
        <p style={{ marginLeft: "20px" }}>
          + Ngân hàng: {data.NGAN_HANG}
        </p>
        <p style={{ marginLeft: "20px" }}>
          + Số tài khoản: {data.SO_TAI_KHOAN}
        </p>
        <p style={{ marginLeft: "20px", marginBottom: "16px" }}>
          + Tên tài khoản: {data.TEN_TAI_KHOAN}
        </p>
      </div>

      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "8px" }}>IV. CAM KẾT:</p>
        <p style={{ marginBottom: "8px" }}>
          Bên Nhận Tiền xác nhận đã nhận đủ số tiền nêu trên và không có bất kỳ
          khiếu nại nào về số tiền đã nhận.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Việc giao nhận tiền hoàn toàn tự nguyện, không bị ép buộc hay lừa dối.
        </p>
        <p style={{ marginBottom: "8px" }}>
          Giấy xác nhận này là một bộ phận không tách rời của Hợp đồng cầm cố
          đã ký giữa hai bên.
        </p>
      </div>

      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "8px" }}>V. HIỆU LỰC:</p>
        <p style={{ fontSize: "12pt", marginBottom: "60px" }}>
          Văn bản này được lập thành 02 bản, mỗi bên giữ 01 bản, có giá trị
          pháp lý như nhau và có hiệu lực kể từ thời điểm ký kết.
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
            <p style={{ ...S.bold, marginBottom: "60px" }}>
              ĐẠI DIỆN BÊN GIAO TIỀN
            </p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold, marginBottom: "60px" }}>BÊN NHẬN TIỀN</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
