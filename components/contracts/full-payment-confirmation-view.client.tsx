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
        <div>---o0o---</div>
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
      <div style={{ fontSize: "12pt", lineHeight: 1.6 }}>
  <ul
    style={{
      paddingLeft: "40px",
      listStyleType: "disc",
      margin: 0,
    }}
  >
    <li style={{ marginBottom: "6px" }}>
      Tên đơn vị/Doanh nghiệp:{" "}
      <strong>{data.BEN_GIAO_TEN}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Đại diện Ông/Bà:{" "}
      <strong>{data.BEN_GIAO_DAI_DIEN}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Chức vụ:{" "}
      <strong>{data.BEN_GIAO_CHUC_VU}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Địa chỉ:{" "}
      <strong>{data.BEN_GIAO_DIA_CHI}</strong>
    </li>

    <li style={{ marginBottom: "6px" }}>
      Mã số thuế/CMND/CCCD số:{" "}
      <strong>{data.BEN_GIAO_MST}</strong> cấp ngày: 14/01/2025 tại:
      Ninh Kiều - Thuế cơ sở 1 thành phố Cần Thơ
    </li>

    <li>
      Số điện thoại:{" "}
      <strong>{data.BEN_GIAO_SDT}</strong>
    </li>
  </ul>
</div>
      </div>

      <div style={S.section}>
        <p style={{ ...S.bold, marginBottom: "8px" }}>
          II. BÊN NHẬN TIỀN (Bên cầm cố):
        </p>
       <div style={{ fontSize: "12pt", lineHeight: 1.6 }}>
  <ul
    style={{
      paddingLeft: "40px",
      listStyleType: "disc",
      margin: 0,
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
        <div style={{ fontSize: "12pt", lineHeight: 1.6 }}>
  <ol
    style={{
      paddingLeft: "40px",
      listStyleType: "decimal",
      marginBottom: "8px",
    }}
  >
    <li style={{ marginBottom: "6px" }}>
      Bên Nhận Tiền xác nhận đã nhận đủ số tiền nêu trên và không có bất kỳ
      khiếu nại nào về số tiền đã nhận.
    </li>

    <li style={{ marginBottom: "6px" }}>
      Việc giao nhận tiền hoàn toàn tự nguyện, không bị ép buộc hay lừa dối.
    </li>

    <li>
      Giấy xác nhận này là một bộ phận không tách rời của Hợp đồng cầm cố
      đã ký giữa hai bên.
    </li>
  </ol>
</div>
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
            <p style={{ ...S.bold }}>
              ĐẠI DIỆN BÊN GIAO TIỀN
            </p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold }}>BÊN NHẬN TIỀN</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
