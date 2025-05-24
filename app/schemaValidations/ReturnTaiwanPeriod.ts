import { z } from "zod";

// Schema cho 1 lần về Đài Loan
export const ReturnTaiwanPeriodSchema = z.object({
    empid: z.string(),
    sts: z.string(),         // Trạng thái (核准...)
    backfrdat: z.string(),   // Ngày bắt đầu nghỉ (yyyymmdd)
    backtodat: z.string(),   // Ngày kết thúc nghỉ (yyyymmdd)
    prefrdat: z.string(),    // Ngày trước đó (nếu có)
    pretodat: z.string(),    // Ngày trước đó (nếu có)
    createdtime: z.string(), // Thời gian tạo bản ghi
});

// Schema cho mảng các lần về Đài Loan
export const ReturnTaiwanPeriodListRes = z.array(ReturnTaiwanPeriodSchema);

// Type cho typescript
export type ReturnTaiwanPeriodListResType = z.TypeOf<typeof ReturnTaiwanPeriodListRes>;
