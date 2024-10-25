import { z } from "zod";

export const OverTimeDutySchema = z.object({
    co: z.string(),
    ovrdat: z.string(),
    ovrfrhh: z.string(),
    ovrtohh: z.string(),
    ovrid: z.string(),
    ovrrs: z.string(),
    ovh: z.string(),
    ofF12MK: z.string(),
    dp: z.string(),
    dpnm:z.string(),
    frmno:z.string(),
    xrem: z.string(),
    empid: z.string(),
    nm: z.string(),
    naty: z.string(),
    newdutid: z.string(),
    newdutnm: z.string(),
    araid: z.string(),
    beorder: z.string(),
    beordeR1: z.string(),
    
})
export const OverTimeDutyListRes = z.array(OverTimeDutySchema);
export type OverTimeDutyListResType = z.TypeOf<typeof OverTimeDutyListRes>
