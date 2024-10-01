import { z } from "zod";

export const ForgetSenseCardSchema = z.object({
    co: z.string(),
    empid: z.string(),
    nm: z.string(),
    dp: z.string(),
    dpnm: z.string(),
    newdutid: z.string(),
    newdutnm: z.string(),
    araid: z.string(),
    kd: z.string(),
    ymd:z.string(),
    tm:z.string(),
    
})
export const ForgetSenseCardListRes = z.array(ForgetSenseCardSchema);
export type ForgetSenseCardListResType = z.TypeOf<typeof ForgetSenseCardListRes>

