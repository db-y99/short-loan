import type { TLoanDetails } from "@/types/loan.types";

// Sample data based on the user's provided loan information
export const SAMPLE_LOAN_DETAILS: TLoanDetails = {
  id: "hd-001",
  code: "HD-2026-0208-001",
  signedAt: "2026-02-08T11:55:00+07:00",
  originalFileUrl: "#",
  notes: "Có nợ chú ý (theo lời khách nói), khách vay FE với bên HDSaison",
  isSigned: true,
  originalFiles: [
    {
      id: "file-001",
      name: "HĐ Chính",
      url: "#",
    },
    {
      id: "file-002",
      name: "XN Đủ Tiền",
      url: "#",
    },
    {
      id: "file-003",
      name: "UQ Xử Lý",
      url: "#",
    },
    {
      id: "file-004",
      name: "HD Thuê",
      url: "#",
    },
  ],

  customer: {
    fullName: "NGUYỄN THỊ HUẾ KHÂU",
    cccd: "092178013341",
    phone: "0973787986",
    address: "137/63 Hoàng văn Thụ, phường Ninh Kiều, Thành phố Cần Thơ",
    cccdIssueDate: "14/08/2021",
    cccdIssuePlace: "Cục cảnh sát QLHC về TTXH",
    facebookUrl: "https://www.facebook.com/share/18EEPmr4Ld/",
    job: "Nấu Cơm Cho Cty",
    income: 7500000,
  },

  loanAmount: 12000000,
  loanType: "Gói 3: Gốc cuối kỳ + Giữ TS",
  appraisalFeePercentage: 5,

  references: [
    {
      id: "ref-001",
      full_name: "Trần Ngọc Bảo Châu",
      phone: "0774857449",
      relationship: "Con Gái",
    },
  ],

  asset: {
    type: "Điện thoại",
    name: "Iphone 13 promax - LL/A - 128GB",
    imei: "357447881615563",
    serial: "X3X2Y3192M",
    images: [
      "https://picsum.photos/id/1/300/500",
      "https://picsum.photos/id/19/300/500",
      "https://picsum.photos/id/20/200/300",
    ],
  },

  bank: {
    name: "Vietcombank",
    accountNumber: "0111000187396",
    accountHolder: "NGUYỄN THỊ HUẾ KHÂU",
  },

  currentPeriod: {
    title: "Kỳ hiện tại",
    subtitle: "Hiện tại",
    milestones: [
      {
        days: 7,
        date: "2026-02-15",
        interestAndFee: 62500,
        totalRedemption: 5062500,
      },
      {
        days: 18,
        date: "2026-02-26",
        interestAndFee: 175000,
        totalRedemption: 5175000,
      },
      {
        days: 30,
        date: "2026-03-10",
        interestAndFee: 250000,
        totalRedemption: 5250000,
      },
    ],
  },

  nextPeriod: {
    title: "Kỳ kế tiếp",
    subtitle: "Nếu gia hạn (Đóng lãi ngày 30)",
    milestones: [
      {
        days: 7,
        date: "2026-03-17",
        interestAndFee: 62500,
        totalRedemption: 5062500,
      },
      {
        days: 18,
        date: "2026-03-28",
        interestAndFee: 175000,
        totalRedemption: 5175000,
      },
      {
        days: 30,
        date: "2026-04-09",
        interestAndFee: 250000,
        totalRedemption: 5250000,
      },
    ],
  },

  status: "pending",
  statusMessage:
    "Khách đã ký HĐ. Chờ giải ngân. Vui lòng liên hệ Kế toán (.act) để giải ngân.",

  // Activity Log (Trao đổi & Nhật ký)
  activityLog: [
    {
      id: "log-001",
      type: "system_event",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T10:45:00+07:00",
      systemMessage: "Gửi yêu cầu mới (Gói 2: Gốc cuối kỳ (Theo mốc)).",
    },
    {
      id: "log-002",
      type: "image_upload",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T10:51:00+07:00",
      systemMessage: "ĐÃ UPLOAD THÊM 24 ẢNH.",
    },
    {
      id: "log-003",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T10:51:00+07:00",
      links: [
        "https://www.facebook.com/photo.php",
        "https://www.facebook.com/ongoclananh.2024",
        "https://www.facebook.com/ngoquang.vinh.2010",
        "https://www.facebook.com/my.bao.511945",
        "https://www.facebook.com/thu.dien.148",
      ],
    },
    {
      id: "log-004",
      type: "message",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:03:00+07:00",
      content: "hình này hình mới hay e lấy hình cũ up lại v ?",
      mentions: ["Lâm Hải Nam"],
    },
    {
      id: "log-005",
      type: "approval",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:04:00+07:00",
      systemMessage:
        "ĐÃ PHÊ DUYỆT (Bước 1): Đã duyệt (Chờ tạo file). Tình trạng: iPhone 12 Promax 128GB (IMEI: 351330884638889 - Serial: F2MFR30J0D42)",
    },
    {
      id: "log-006",
      type: "message",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:07:00+07:00",
      mentions: ["Lâm Hải Nam"],
    },
    {
      id: "log-007",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:08:00+07:00",
      content: "Dạ em up lại á có cccd em chụp lại mới",
    },
    {
      id: "log-008",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:08:01+07:00",
      content: "Có được không chị để em chụp lại",
    },
    {
      id: "log-009",
      type: "message",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:09:00+07:00",
      content:
        "đt tình trạng sao á e\nđiện thoại tình trạng với bên trong đồ sao",
    },
    {
      id: "log-010",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:09:30+07:00",
      content: "dạ em ktra bth hết á chị",
    },
    {
      id: "log-011",
      type: "message",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:09:45+07:00",
      content:
        "lỡ up rui thì thôi\nnhưng em check coi đúng hiện trạng trên hình ko r báo lại c là đc",
    },
    {
      id: "log-012",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:11:00+07:00",
      images: ["https://picsum.photos/id/4/300/500"],
    },
    {
      id: "log-013",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:12:00+07:00",
      content: "Dạ điện thoại em kiểm tra rồi á chị bth như lúc ban đầu",
      images: ["https://picsum.photos/id/5/300/500"],
    },
    {
      id: "log-014",
      type: "message",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:12:30+07:00",
      content:
        "bên ngoài á\nc duyệt r\nđợi admin cho hợp đồng ạ\nc gửi thông tin cho kế toán rui",
    },
    {
      id: "log-015",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:13:00+07:00",
      content: "dạ bên ngoài ok hết á chị",
    },
    {
      id: "log-016",
      type: "contract_created",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:13:30+07:00",
      systemMessage: "ĐÃ TẠO BỘ HỢP ĐỒNG (4 file).",
    },
    {
      id: "log-017",
      type: "message",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:14:00+07:00",
      images: ["https://picsum.photos/id/6/300/500"],
    },
    {
      id: "log-018",
      type: "message",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T11:15:00+07:00",
      content: "OKI",
    },
    {
      id: "log-019",
      type: "message",
      userId: "thuytd.act",
      userName: "thuytd.act",
      timestamp: "2026-02-06T11:15:30+07:00",
      content: "e đã lock iCloud máy của khách chưa e?",
      mentions: ["Lâm Hải Nam"],
    },
    {
      id: "log-020",
      type: "contract_created",
      userId: "loantt.act",
      userName: "loantt.act",
      timestamp: "2026-02-06T11:21:00+07:00",
      systemMessage: "ĐÃ TẠO BỘ HỢP ĐỒNG (4 file).",
    },
    {
      id: "log-021",
      type: "contract_signed",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:39:00+07:00",
      systemMessage: "KHÁCH ĐÃ KÝ (Có ký nháy & Ký chính).",
    },
    {
      id: "log-022",
      type: "contract_created",
      userId: "namlh.cs",
      userName: "namlh.cs",
      timestamp: "2026-02-06T11:40:00+07:00",
      systemMessage: "ĐÃ TẠO BỘ HỢP ĐỒNG (4 file).",
    },
    {
      id: "log-023",
      type: "disbursement",
      userId: "nguyen.quyen",
      userName: "nguyen.quyen",
      timestamp: "2026-02-06T15:24:00+07:00",
      systemMessage:
        "KẾ TOÁN ĐÃ GIẢI NGÂN & KÍCH HOẠT HỢP ĐỒNG. Ghi chú: Đã chuyển khoản",
    },
  ],
};
