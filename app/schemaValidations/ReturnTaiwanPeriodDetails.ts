import { z } from "zod";

/** Chuyển ROC(民國年) YYYMMDD -> ISO YYYY-MM-DD. VD: 1140929 -> 2025-09-29 */
export const rocToISO = (roc: string): string => {
  if (!/^\d{7}$/.test(roc)) return "";
  const y = 1911 + parseInt(roc.slice(0, 3), 10);
  const m = roc.slice(3, 5);
  const d = roc.slice(5, 7);
  return `${y}-${m}-${d}`;
};

/** Định dạng giờ HHmm (00:00–23:59) */
const HHmm = z
  .string()
  .regex(/^\d{4}$/, "Định dạng giờ phải là HHmm, ví dụ 0900, 2330");

/** Định dạng ngày ROC YYYMMDD, ví dụ 1140929 (= 2025-09-29) */
const ROCDate = z
  .string()
  .regex(/^\d{7}$/, "Định dạng ROC date phải là YYYMMDD, ví dụ 1140929");

export const ReturnTaiwanPeriodDetailSchema = z
  .object({
    /** Mã nhân viên, ví dụ: N000146163 */
    empid: z.string().min(1).describe("Employee ID"),

    /** Mã công ty (dùng phân TW/VN nếu có rule), ví dụ: 0D */
    co: z.string().min(1).describe("Company code"),

    /** Ngày theo hệ ROC (民國年) YYYMMDD, ví dụ: 1140929 (=2025-09-29) */
    offdat: ROCDate.describe("ROC date YYYMMDD"),

    /** Giờ bắt đầu (HHmm), ví dụ: 0000 */
    offfrhh: HHmm.describe("From time HHmm"),

    /** Mã loại phép/nghiệp vụ, ví dụ: 51 = 出差 (công tác) */
    offid: z.string().min(1).describe("Leave/business type code"),

    /** Giờ kết thúc (HHmm), ví dụ: 2330 */
    offtohh: HHmm.describe("To time HHmm"),

    /** Số giờ (nếu backend cung cấp), ví dụ: "8" hoặc "0" */
    offhrs: z.string().regex(/^\d+$/, "Giá trị giờ phải là số").describe("Total hours"),

    /** Trạng thái/phê duyệt (cần bảng tra từ backend), ví dụ: A */
    pz: z.string().describe("Approval/status flag"),

    /** Mã phòng ban, ví dụ: 2220 */
    dp: z.string().min(1).describe("Department code"),

    /** Đánh dấu/ghi chú hệ thống (nếu có), có thể rỗng */
    mk: z.string().describe("System mark"),

    /** Thời điểm phát sinh (ROC + time), ví dụ: 114/07/17 09:53:15 */
    txdat: z.string().describe("Transaction datetime (ROC)"),

    /** Người lập/duyệt hoặc phân loại nhân sự (cần xác nhận backend), ví dụ: XG */
    kinemp: z.string().describe("Maker/Kind of employee"),

    /** Tên loại hiển thị (zh-TW), ví dụ: 出差 */
    offidnm: z.string().min(1).describe("Leave/business type name"),

    /** Ghi chú người dùng, có thể rỗng */
    memo: z.string().describe("User memo/remark"),
  })
  .describe("Chi tiết nghỉ/ngày công tác theo từng ngày (1 record = 1 ngày)");

export const ReturnTaiwanPeriodDetailsRes = z.array(ReturnTaiwanPeriodDetailSchema);
export type ReturnTaiwanPeriodDetailsResType = z.infer<typeof ReturnTaiwanPeriodDetailsRes>;

/* ----------------- (Tuỳ chọn) Schema “normalized” cho UI ----------------- */

/** DayType dùng cho ma trận hiển thị */
export const DayTypeEnum = z.enum([
  "WORK",
  "WEEKLY_OFF",
  "PUBLIC_HOL",
  "ANNUAL",
  "ASSIGNMENT",
  "BUSINESS_TW",
  "BUSINESS_VN",
]);
export type DayType = z.infer<typeof DayTypeEnum>;

/** Map mã offid -> DayType (ổn định hơn offidnm). 51 = 出差 */
export const OFFID_TO_DAYTYPE: Record<string, DayType> = {
  "51": "BUSINESS_TW",
  // TODO: thêm các mã khác khi backend cung cấp
};

/** Bản đã chuẩn hoá: thêm isoDate (YYYY-MM-DD) & dayType suy ra từ offid */
export const ReturnTaiwanPeriodDetailNormalized = ReturnTaiwanPeriodDetailSchema.transform((r) => {
  const isoDate = rocToISO(r.offdat);
  const dayType = OFFID_TO_DAYTYPE[r.offid?.trim?.()] as DayType | undefined;
  return { ...r, isoDate, dayType };
});

export type ReturnTaiwanPeriodDetailNormalizedType = z.infer<
  typeof ReturnTaiwanPeriodDetailNormalized
>;
