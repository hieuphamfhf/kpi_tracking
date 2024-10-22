import { z } from "zod";

export const ReamingLeaveTimeSchema = z.object({
    ym: z.string(),           // 考勤週期
    co: z.string(),           // 公司
    dp: z.string(),           // 部門
    pz: z.string(),           // 廠區
    nm: z.string(),           // 姓名
    empid: z.string(),        // 人員代號
    jp: z.string(),           // 職位別
    naty: z.string(),         // 國籍
    ofF12REM6: z.string(),    // 前5個月換休時數
    ofF12REM5: z.string(),    // 前4個月換休時數
    ofF12REM4: z.string(),    // 前3個月換休時數
    ofF12REM3: z.string(),    // 上上月換休時數
    ofF12REM2: z.string(),    // 上月換休時數
    ofF12REM1: z.string(),    // 本月換休時數
    ofF12REM_ALL: z.string(), // 總可換休時數
    ofF12HRS: z.string(),     // 本月已換休時數
    ofF12REM: z.string(),     // 剩餘可換休時數
    
})
export const ReamingLeaveTimeListRes = z.array(ReamingLeaveTimeSchema);
export type ReamingLeaveTimeListResType = z.TypeOf<typeof ReamingLeaveTimeListRes>
