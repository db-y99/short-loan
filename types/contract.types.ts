/** Mốc thanh toán chung */
export type TMilestone = {
  moc: number;
  ngay: number;
  tongTien: string;
};

/** Dữ liệu để render Hợp đồng cầm cố tài sản */
export type TAssetPledgeContractData = {
  MA_HD: string;
  NGAY: number;
  THANG: number;
  NAM: number;
  BEN_A_TEN: string;
  BEN_A_DIA_CHI: string;
  BEN_A_DAI_DIEN: string;
  BEN_A_CHUC_VU: string;
  HO_TEN: string;
  CCCD: string;
  NGAY_CAP: string;
  NOI_CAP: string;
  DIA_CHI: string;
  SDT: string;
  LOAI_TS: string;
  CHI_TIET: string;
  IMEI: string;
  SERIAL: string;
  TINH_TRANG: string;
  SO_TIEN_VAY: string;
  LAI_SUAT: string;
  MILESTONES: TMilestone[];
  drive_folder_id: string;
  DRAFT_SIGNATURE?: string;
  OFFICIAL_SIGNATURE?: string;
};

/** Dữ liệu Hợp đồng thuê tài sản */
export type TAssetLeaseContractData = {
  MA_HD_CAM_CO: string;
  SO_HD_THUE: string;
  NGAY: number;
  THANG: number;
  NAM: number;
  BEN_A_TEN: string;
  BEN_A_DIA_CHI: string;
  BEN_A_DAI_DIEN: string;
  BEN_A_CHUC_VU: string;
  BEN_A_MST: string;
  BEN_A_SDT: string;
  HO_TEN: string;
  CCCD: string;
  NGAY_CAP: string;
  NOI_CAP: string;
  DIA_CHI: string;
  SDT: string;
  LOAI_TS: string;
  CHI_TIET: string;
  IMEI: string;
  SERIAL: string;
  MILESTONES: TMilestone[];
  NGAY_BAT_DAU: string;
  drive_folder_id: string;
  DRAFT_SIGNATURE?: string;
  OFFICIAL_SIGNATURE?: string;
};

/** Dữ liệu Xác nhận đã nhận đủ tiền */
export type TFullPaymentConfirmationData = {
  MA_HD: string;
  NGAY_HD: string;
  NGAY: number;
  THANG: number;
  NAM: number;
  BEN_GIAO_TEN: string;
  BEN_GIAO_DIA_CHI: string;
  BEN_GIAO_DAI_DIEN: string;
  BEN_GIAO_CHUC_VU: string;
  BEN_GIAO_MST: string;
  BEN_GIAO_SDT: string;
  HO_TEN: string;
  CCCD: string;
  NGAY_CAP: string;
  NOI_CAP: string;
  DIA_CHI: string;
  SDT: string;
  TAI_SAN: string;
  SO_TIEN: string;
  NGAN_HANG: string;
  SO_TAI_KHOAN: string;
  TEN_TAI_KHOAN: string;
  drive_folder_id: string;
  DRAFT_SIGNATURE?: string;
  OFFICIAL_SIGNATURE?: string;
};

/** Dữ liệu Giấy ủy quyền xử lý tài sản cầm cố */
export type TAssetDisposalAuthorizationData = {
  MA_HD: string;
  NGAY: number;
  THANG: number;
  NAM: number;
  HO_TEN: string;
  CCCD: string;
  NGAY_CAP: string;
  NOI_CAP: string;
  DIA_CHI: string;
  SDT: string;
  BEN_UU_QUYEN_TEN: string;
  BEN_UU_QUYEN_DIA_CHI: string;
  BEN_UU_QUYEN_DAI_DIEN: string;
  BEN_UU_QUYEN_MST: string;
  BEN_UU_QUYEN_SDT: string;
  LOAI_TS: string;
  CHI_TIET: string;
  IMEI: string;
  SERIAL: string;
  TINH_TRANG: string;
  drive_folder_id: string;
  DRAFT_SIGNATURE?: string;
  OFFICIAL_SIGNATURE?: string;
};

/** Union type cho tất cả contract data */
export type TContractData =
  | TAssetPledgeContractData
  | TAssetLeaseContractData
  | TFullPaymentConfirmationData
  | TAssetDisposalAuthorizationData;

/** Loan file type enum từ DB */
export const CONTRACT_TYPE = {
  ASSET_PLEDGE: "asset_pledge_contract",
  ASSET_LEASE: "asset_lease_contract",
  FULL_PAYMENT: "full_payment_confirmation",
  ASSET_DISPOSAL: "asset_disposal_authorization",
} as const;

/** Contract file info từ DB */
export type TContractFile = {
  id: string;
  name: string;
  type: string;
  fileId: string;
  provider: string;
};
