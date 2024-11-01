import { z } from "zod";
export const MonthlyKPISchema = z.object({
    co: z.string(),                // 公司
    dp: z.string(),                // 部門
    dpnm: z.string(),              // 部門名稱
    heaD_COUNT: z.string(),        // 員工總數 (or equivalent description)
    borrowcarD_COUNT: z.string(),  // 借卡次數
    forgetsensecarD_COUNT: z.string(), // 忘記帶卡次數
    abnmormaL_CARD_RATE: z.string(), // 異常卡片比例
    followuP_COUNT: z.string(),    // 跟進次數
    followuP_ABNMORMAL_RATE: z.string(), // 異常跟進比例
    traininG_TOTAL_COUNT: z.string(),   // 總訓練次數
    traininG_FINISHD_COUNT: z.string(), // 完成訓練次數
    traininG_FINISHD_RATE: z.string(),  // 訓練完成比例
    overtimedutY_COUNT: z.string(),     // 加班次數
    ofF12REM: z.string(),           // 剩餘可換休時數
    ofF12REM_PREVIOUSYM: z.string() // 前一月剩餘可換休時數
    ,           // 剩餘可換休時數
    dP1NM: z.string() // 前一月剩餘可換休時數
})
export const MonthlyKPIListRes = z.array(MonthlyKPISchema);
export type MonthlyKPIListResType = z.TypeOf<typeof MonthlyKPIListRes>

