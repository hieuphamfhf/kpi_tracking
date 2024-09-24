import { z } from "zod";

export const TrainingSchema = z.object({
    co: z.string(),
    dp: z.string(),
    dpnm: z.string(),
    yr: z.string(),
    seq: z.string(),
    prwpes: z.string(),
    prwpesnm: z.string(),
    traid: z.string(),
    tranm: z.string(),
    tradst:z.string(),
    mon: z.string(),
    tradys: z.string(),
    trahrs: z.string(),
    traobj: z.string(),
    num: z.string(),
    trasite: z.string(),
    traf: z.string(),
    proym: z.string(),
    fnhdat: z.string(),
    tradp: z.string(),
    tradpnm: z.string(),
    xrem: z.string(),
    cancdat: z.string()
})
export const TrainingListRes = z.array(TrainingSchema);
export type TrainingListResType = z.TypeOf<typeof TrainingListRes>
