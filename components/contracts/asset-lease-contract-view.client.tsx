"use client";

import type { TAssetLeaseContractData } from "@/types/contract.types";

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
  tdBorder: { padding: "8px", border: "1px solid #000" } as React.CSSProperties,
};

type TProps = {
  data: TAssetLeaseContractData;
  id?: string;
};

export function AssetLeaseContractView({ data, id = "contract-content" }: TProps) {
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
        <h1 style={{ fontSize: "18pt", ...S.bold, margin: "10px 0" }}>
          HỢP ĐỒNG THUÊ TÀI SẢN
        </h1>
        <p style={{ fontSize: "13pt", ...S.bold }}>(Số: {data.SO_HD_THUE})</p>
      </div>

      <p style={{ fontSize: "12pt", marginBottom: "8px" }}>
        Căn cứ Bộ luật Dân sự 2015;
      </p>
      <p style={{ fontSize: "12pt", marginBottom: "8px" }}>
        Căn cứ vào quyền sở hữu/quyền quản lý tài sản hợp pháp của Bên A;
      </p>
      <p style={{ fontSize: "12pt", marginBottom: "16px" }}>
        Căn cứ nhu cầu sử dụng thực tế và sự tự nguyện thỏa thuận của các bên.
      </p>
      <p style={{ ...S.center, fontStyle: "italic", marginBottom: "20px" }}>
        Hôm nay, ngày {data.NGAY} tháng {data.THANG} năm {data.NAM}, tại 99B
        Nguyễn Trãi, Phường Ninh Kiều, Thành phố Cần Thơ, chúng tôi gồm:
      </p>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          BÊN CHO THUÊ (BÊN A):
        </h3>
        <table style={S.table}>
          <tbody>
            <tr>
              <td style={{ width: "35%", ...S.td }}>Tên đơn vị/Doanh nghiệp:</td>
              <td style={{ ...S.bold, ...S.td }}>{data.BEN_A_TEN}</td>
            </tr>
            <tr>
              <td style={S.td}>Đại diện Ông/Bà:</td>
              <td style={S.td}>{data.BEN_A_DAI_DIEN}</td>
            </tr>
            <tr>
              <td style={S.td}>Chức vụ:</td>
              <td style={S.td}>{data.BEN_A_CHUC_VU}</td>
            </tr>
            <tr>
              <td style={S.td}>Địa chỉ:</td>
              <td style={S.td}>{data.BEN_A_DIA_CHI}</td>
            </tr>
            <tr>
              <td style={S.td}>Mã số thuế/CCCD số:</td>
              <td style={S.td}>
                {data.BEN_A_MST} cấp ngày: 14/01/2025 tại Ninh Kiều - Thuế cơ
                sở 1 thành phố Cần Thơ
              </td>
            </tr>
            <tr>
              <td style={S.td}>Số điện thoại:</td>
              <td style={S.td}>{data.BEN_A_SDT}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          BÊN THUÊ (BÊN B):
        </h3>
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

      <p style={{ marginBottom: "16px" }}>
        Hai bên thống nhất ký kết Hợp đồng thuê tài sản với các điều khoản như
        sau:
      </p>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 1. TÀI SẢN THUÊ VÀ CƠ SỞ THUÊ
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Tài sản thuê: Bên A đồng ý cho Bên B thuê tài sản (mà Bên B đã cầm
          cố và bàn giao quyền quản lý cho Bên A theo Hợp đồng cầm cố số{" "}
          {data.MA_HD_CAM_CO}), cụ thể:
        </p>
        <table style={{ ...S.table, border: "1px solid #000" }}>
          <tbody>
            <tr>
              <td style={{ width: "28%", ...S.tdBorder }}>Loại tài sản:</td>
              <td style={S.tdBorder}>{data.LOAI_TS}</td>
            </tr>
            <tr>
              <td style={S.tdBorder}>Chi tiết (Nhãn hiệu/Model):</td>
              <td style={S.tdBorder}>
                {data.CHI_TIET} (IMEI: {data.IMEI} - Serial: {data.SERIAL})
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: "10px", fontSize: "12pt" }}>
          Xác nhận bàn giao: Bên B xác nhận đã nhận tài sản đúng mô tả và tình
          trạng hoạt động bình thường khi ký hợp đồng này.
        </p>
        <p style={{ marginTop: "8px", fontSize: "12pt" }}>
          Tính chất độc lập của giao dịch: Bên B xác nhận rằng tài sản này đang
          thuộc quyền quản lý hợp pháp của Bên A theo Hợp đồng cầm cố. Bên B có
          nhu cầu thực tế sử dụng tài sản và chủ động đề nghị thuê. Giao dịch
          thuê này là độc lập, không phải là điều kiện bắt buộc của bất kỳ văn
          bản pháp lý nào khác.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 2. CAM KẾT VỀ SỰ TỰ NGUYỆN
        </h3>
        <p style={{ fontSize: "12pt" }}>
          Bên B hoàn toàn tự nguyện lựa chọn phương án thuê tài sản để phục vụ
          nhu sinh hoạt của mình, không bị ép buộc hay ràng buộc bởi bất kỳ điều
          kiện nào của khoản vay cầm cố.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 3. MỤC ĐÍCH THUÊ VÀ PHẠM VI SỬ DỤNG
        </h3>
        <p style={{ marginBottom: "8px" }}>
          Bên B thuê tài sản để sử dụng phục vụ nhu cầu cá nhân / kinh doanh
          hợp pháp.
        </p>
        <p style={{ marginBottom: "8px" }}>Trong quá trình thuê, Bên B không được:</p>
        <ul style={{ marginLeft: "20px", marginBottom: "8px" }}>
          <li>Bán, chuyển nhượng, cho mượn, thế chấp, cầm cố tài sản cho bên thứ ba;</li>
          <li>
            Thay đổi kết cấu, gắn thêm thiết bị trái phép hoặc làm thay đổi hiện
            trạng tài sản;
          </li>
          <li>Sử dụng tài sản vào mục đích trái pháp luật.</li>
        </ul>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 4. THỜI HẠN THUÊ
        </h3>
        <p style={{ fontSize: "12pt" }}>
          Thời hạn thuê bắt đầu từ ngày {data.NGAY_BAT_DAU} đến khi xảy ra một
          trong các sự kiện sau (tùy điều kiện nào đến trước): Hai bên thỏa thuận
          chấm dứt Hợp đồng thuê bằng văn bản/tin nhắn. Bên B vi phạm một trong
          các nghĩa vụ của hợp đồng này. Hết thời hạn thuê, Bên B có trách nhiệm
          hoàn trả tài sản ngay lập tức theo yêu cầu của Bên A.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 5. GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN
        </h3>
        <p style={{ marginBottom: "10px" }}>Giá thuê: cụ thể theo bảng sau:</p>
        <table style={{ ...S.table, border: "1px solid #000" }}>
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
        <p style={{ marginTop: "10px", fontSize: "12pt" }}>
          Việc thanh toán không đúng hạn cam kết được xem là vi phạm nghĩa vụ
          Hợp đồng.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 6. TRÁCH NHIỆM VÀ RỦI RO
        </h3>
        <p style={{ marginBottom: "8px" }}>
          <strong>Trách nhiệm của Bên B (Bên thuê):</strong> Chịu toàn bộ rủi ro
          mất mát, hư hỏng, tai nạn đối với tài sản trong suốt thời gian thuê;
          Chịu mọi trách nhiệm pháp lý, dân sự, hình sự, hành chính phát sinh từ
          việc sử dụng tài sản; Tự chịu chi phí xăng dầu, bảo dưỡng, sửa chữa
          trong quá trình sử dụng.
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Miễn trừ trách nhiệm:</strong> Bên A không chịu trách nhiệm đối
          với mọi thiệt hại về người và tài sản phát sinh trong thời gian Bên B
          sử dụng tài sản.
        </p>
        <p style={{ fontSize: "12pt" }}>
          Trong trường hợp Bên B có hành vi bẻ khóa, can thiệp, xâm nhập thiết
          bị; tìm cách vượt qua, vô hiệu hóa cơ chế bảo mật (iCloud, mật khẩu,
          Face ID, Touch ID, Activation Lock); thực hiện hành vi kỹ thuật trái
          hướng dẫn nhà sản xuất; thì mọi rủi ro phát sinh hoàn toàn do Bên B
          tự chịu trách nhiệm. Bên A được miễn trừ toàn bộ trách nhiệm.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 7. THU HỒI TÀI SẢN
        </h3>
        <p style={{ fontSize: "12pt" }}>
          Bên A có quyền đơn phương chấm dứt hợp đồng và thu hồi tài sản ngay
          lập tức nếu: Bên B chậm thanh toán tiền thuê quá 03 ngày; Bên B sử
          dụng tài sản sai mục đích, vi phạm pháp luật; Bên B vi phạm nghiêm
          trọng các điều khoản. Bên B cam kết không khiếu nại, không cản trở
          việc thu hồi tài sản trong các trường hợp trên.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 8. CHẤM DỨT HỢP ĐỒNG
        </h3>
        <p style={{ fontSize: "12pt" }}>
          Hợp đồng chấm dứt khi: Hết thời hạn thuê; Hai bên thỏa thuận chấm dứt
          trước hạn; Một bên vi phạm nghiêm trọng nghĩa vụ hợp đồng.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 9. GIẢI QUYẾT TRANH CHẤP
        </h3>
        <p style={{ fontSize: "12pt" }}>
          Mọi tranh chấp phát sinh sẽ ưu tiên giải quyết bằng thương lượng. Nếu
          không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa Án
          Nhân Dân nơi Bên A đặt trụ sở.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14pt", ...S.bold, marginBottom: "10px" }}>
          ĐIỀU 10. HIỆU LỰC
        </h3>
        <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
          Hợp đồng này được ký kết độc lập, không phụ thuộc, không phải là điều
          kiện bắt buộc và không ảnh hưởng đến hiệu lực của bất kỳ hợp đồng nào
          khác giữa các bên.
        </p>
        <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
          Việc ký hoặc không ký Hợp đồng này không làm phát sinh, thay đổi, chấm
          dứt bất kỳ quyền hoặc nghĩa vụ nào của các bên theo các hợp đồng khác
          (nếu có), trừ khi các bên có thỏa thuận khác bằng văn bản.
        </p>
        <p style={{ fontSize: "12pt" }}>
          Hợp đồng có hiệu lực kể từ ngày ký, được lập thành 02 bản có giá trị
          pháp lý như nhau, mỗi bên giữ 01 bản.
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
          <p style={{ ...S.bold, marginBottom: "80px" }}>BÊN CHO THUÊ</p>
          <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
        </div>
        <div style={{ ...S.center, width: "45%" }}>
          <p style={{ ...S.bold, marginBottom: "80px" }}>BÊN THUÊ</p>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
}
