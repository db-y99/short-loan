// components/contracts/asset-lease-contract-view.tsx
"use client";

import type { TAssetLeaseContractData } from "@/types/contract.types";

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
    marginBottom: "10mm",
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
  data: TAssetLeaseContractData;
  id?: string;
};

export function AssetLeaseContractView({
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
            HỢP ĐỒNG THUÊ TÀI SẢN
          </h1>
          <p style={{ fontSize: "13pt", ...S.bold }}>(Số: {data.SO_HD_THUE})</p>
        </div>

        {/* Preamble */}
        <p style={{ fontSize: "12pt", marginBottom: "8px" }}>
          Căn cứ Bộ luật Dân sự 2015;
        </p>
        <p style={{ fontSize: "12pt", marginBottom: "8px" }}>
          Căn cứ vào quyền sở hữu/quyền quản lý tài sản hợp pháp của Bên A;
        </p>
        <p style={{ fontSize: "12pt", marginBottom: "16px" }}>
          Căn cứ nhu cầu sử dụng thực tế và sự tự nguyện thỏa thuận của các bên.
        </p>
        <p style={{ ...S.center, fontStyle: "italic", marginBottom: "16px" }}>
          Hôm nay, ngày {data.NGAY} tháng {data.THANG} năm {data.NAM}, tại 99B
          Nguyễn Trãi, Phường Ninh Kiều, Thành phố Cần Thơ, chúng tôi gồm:
        </p>

        {/* Bên A */}
        <div style={S.section}>
          <h3 style={S.heading}>BÊN CHO THUÊ (BÊN A):</h3>
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


      </div>

      {/* ================= TRANG 2 ================= */}
      <div style={S.page}>
        {/* Điều 1 */}
        {/* Bên B */}
        <div style={S.section}>
          <h3 style={S.heading}>BÊN THUÊ (BÊN B):</h3>
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

        <p style={{ marginBottom: "12px" }}>
          Hai bên thống nhất ký kết Hợp đồng thuê tài sản với các điều khoản như
          sau:
        </p>
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 1. TÀI SẢN THUÊ VÀ CƠ SỞ THUÊ</h3>
          <p style={{ marginBottom: "8px" }}>
            <strong>Tài sản thuê:</strong> Bên A đồng ý cho Bên B thuê tài sản
            (mà Bên B đã cầm cố và bàn giao quyền quản lý cho Bên A theo Hợp
            đồng cầm cố số {data.MA_HD_CAM_CO}), cụ thể:
          </p>
          <table style={{ ...S.table, border: "1px solid #000", marginBottom: "12px" }}>
            <tbody>
              <tr>
                <td style={{ width: "35%", ...S.tdBorder }}>Loại tài sản:</td>
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

          <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
            <strong>Xác nhận bàn giao:</strong> Bên B xác nhận đã nhận tài sản
            đúng mô tả và tình trạng hoạt động bình thường khi ký hợp đồng này.
          </p>
          <p style={{ marginBottom: "16px", fontSize: "12pt" }}>
            <strong>Tính chất độc lập của giao dịch:</strong> Bên B xác nhận rằng
            tài sản này đang thuộc quyền quản lý hợp pháp của Bên A theo Hợp đồng
            cầm cố. Bên B có nhu cầu thực tế sử dụng tài sản và chủ động đề nghị
            thuê. Giao dịch thuê này là độc lập, không phải là điều kiện bắt buộc
            của bất kỳ văn bản pháp lý nào khác.
          </p>
        </div>

        {/* Điều 2 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 2. CAM KẾT VỀ SỰ TỰ NGUYỆN</h3>
          <p style={{ fontSize: "12pt" }}>
            Bên B hoàn toàn tự nguyện lựa chọn phương án thuê tài sản để phục vụ
            sinh hoạt của mình, không bị ép buộc hay ràng buộc bởi bất kỳ điều
            kiện nào của khoản vay cầm cố.
          </p>
        </div>


      </div>

      {/* ================= TRANG 3 ================= */}
      <div style={S.page}>
        {/* Điều 3 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 3. MỤC ĐÍCH THUÊ VÀ PHẠM VI SỬ DỤNG</h3>
          <p style={{ marginBottom: "8px" }}>
            Bên B thuê tài sản để sử dụng phục vụ nhu cầu cá nhân / kinh doanh
            hợp pháp.
          </p>
          <p style={{ marginBottom: "8px" }}>
            Trong quá trình thuê, Bên B không được:
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
            Bán, chuyển nhượng, cho mượn, thế chấp, cầm cố tài sản cho bên thứ ba;
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
            Thay đổi kết cấu, gắn thêm thiết bị trái phép hoặc làm thay đổi hiện
            trạng tài sản;
          </p>
          <p style={{ marginBottom: "16px", marginLeft: "10px", fontSize: "12pt" }}>
            Sử dụng tài sản vào mục đích trái pháp luật.
          </p>
        </div>

        {/* Điều 4 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 4. THỜI HẠN THUÊ</h3>
          <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
            Thời hạn thuê bắt đầu từ ngày {data.NGAY_BAT_DAU} đến khi xảy ra một
            trong các sự kiện sau (tùy điều kiện nào đến trước):
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
            Hai bên thỏa thuận chấm dứt Hợp đồng thuê bằng văn bản/tin nhắn.
          </p>
          <p style={{ marginBottom: "8px", marginLeft: "10px", fontSize: "12pt" }}>
            Bên B vi phạm một trong các nghĩa vụ của hợp đồng này.
          </p>
          <p style={{ fontSize: "12pt" }}>
            Hết thời hạn thuê, Bên B có trách nhiệm hoàn trả tài sản ngay lập tức
            theo yêu cầu của Bên A.
          </p>
        </div>
        {/* Điều 5 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 5. GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN</h3>
          <p style={{ marginBottom: "10px" }}>
            <strong>Giá thuê:</strong> cụ thể theo bảng sau:
          </p>
          <table style={{ ...S.table, border: "1px solid #000", marginBottom: "12px" }}>
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
          <p style={{ fontSize: "12pt" }}>
            Việc thanh toán không đúng hạn cam kết được xem là vi phạm nghĩa vụ
            Hợp đồng.
          </p>
        </div>


      </div>

      {/* ================= TRANG 4 ================= */}
      <div style={S.page}>
        {/* Điều 6 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 6. TRÁCH NHIỆM VÀ RỦI RO</h3>
          <p style={{ marginBottom: "8px" }}>
            <strong>Trách nhiệm của Bên B (Bên thuê):</strong>
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
            Chịu toàn bộ rủi ro mất mát, hư hỏng, tai nạn đối với tài sản trong
            suốt thời gian thuê;
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
            Chịu mọi trách nhiệm pháp lý, dân sự, hình sự, hành chính phát sinh
            từ việc sử dụng tài sản;
          </p>
          <p style={{ marginBottom: "12px", marginLeft: "10px", fontSize: "12pt" }}>
            Tự chịu chi phí xăng dầu, bảo dưỡng, sửa chữa trong quá trình sử dụng.
          </p>

          <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
            <strong>Miễn trừ trách nhiệm:</strong> Bên A không chịu trách nhiệm
            đối với mọi thiệt hại về người và tài sản phát sinh trong thời gian
            Bên B sử dụng tài sản.
          </p>
          <p style={{ marginBottom: "16px", fontSize: "12pt" }}>
            Trong trường hợp Bên B có hành vi bẻ khóa, can thiệp, xâm nhập thiết
            bị; tìm cách vượt qua, vô hiệu hóa cơ chế bảo mật (iCloud, mật khẩu,
            Face ID, Touch ID, Activation Lock); thực hiện hành vi kỹ thuật trái
            hướng dẫn nhà sản xuất; thì mọi rủi ro phát sinh hoàn toàn do Bên B
            tự chịu trách nhiệm. Bên A được miễn trừ toàn bộ trách nhiệm.
          </p>
        </div>

        {/* Điều 7 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 7. THU HỒI TÀI SẢN</h3>
          <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
            Bên A có quyền đơn phương chấm dứt hợp đồng và thu hồi tài sản ngay
            lập tức nếu:
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
            Bên B chậm thanh toán tiền thuê quá 03 ngày;
          </p>
          <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
            Bên B sử dụng tài sản sai mục đích, vi phạm pháp luật;
          </p>
          <p style={{ marginBottom: "8px", marginLeft: "10px", fontSize: "12pt" }}>
            Bên B vi phạm nghiêm trọng các điều khoản.
          </p>
          <p style={{ fontSize: "12pt" }}>
            Bên B cam kết không khiếu nại, không cản trở việc thu hồi tài sản
            trong các trường hợp trên.
          </p>
        </div>

        {/* Điều 8 - Bắt đầu */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 8. CHẤM DỨT HỢP ĐỒNG</h3>
          <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
            Hợp đồng chấm dứt khi:
          </p>
        </div>
        {/* Tiếp Điều 8 */}
        <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
          Hết thời hạn thuê;
        </p>
        <p style={{ marginBottom: "4px", marginLeft: "10px", fontSize: "12pt" }}>
          Hai bên thỏa thuận chấm dứt trước hạn;
        </p>
        <p style={{ marginBottom: "16px", marginLeft: "10px", fontSize: "12pt" }}>
          Một bên vi phạm nghiêm trọng nghĩa vụ hợp đồng.
        </p>

      </div>
      {/* ================= TRANG 5 ================= */}
      <div style={S.lastPage}>
        {/* Điều 9 */}
        <div style={S.section}>
          <h3 style={S.heading}>ĐIỀU 9. GIẢI QUYẾT TRANH CHẤP</h3>
          <p style={{ fontSize: "12pt" }}>
            Mọi tranh chấp phát sinh sẽ ưu tiên giải quyết bằng thương lượng. Nếu
            không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa Án
            Nhân Dân nơi Bên A đặt trụ sở.
          </p>
        </div>

        {/* Điều 10 */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={S.heading}>ĐIỀU 10. HIỆU LỰC</h3>
          <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
            Hợp đồng này được ký kết độc lập, không phụ thuộc, không phải là điều
            kiện bắt buộc và không ảnh hưởng đến hiệu lực của bất kỳ hợp đồng nào
            khác giữa các bên.
          </p>
          <p style={{ marginBottom: "8px", fontSize: "12pt" }}>
            Việc ký hoặc không ký Hợp đồng này không làm phát sinh, thay đổi,
            chấm dứt bất kỳ quyền hoặc nghĩa vụ nào của các bên theo các hợp đồng
            khác (nếu có), trừ khi các bên có thỏa thuận khác bằng văn bản.
          </p>
          <p style={{ fontSize: "12pt" }}>
            Hợp đồng có hiệu lực kể từ ngày ký, được lập thành 02 bản có giá trị
            pháp lý như nhau, mỗi bên giữ 01 bản.
          </p>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "80px",
          }}
        >
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold, marginBottom: "100px" }}>BÊN CHO THUÊ</p>
            <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
          </div>
          <div style={{ ...S.center, width: "45%" }}>
            <p style={{ ...S.bold, marginBottom: "100px" }}>BÊN THUÊ</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}