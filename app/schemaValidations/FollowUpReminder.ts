import { z } from "zod";

export const FollowUpReminderSchema = z.object({
    co: z.string(),
    dp: z.string(),
    dpnm: z.string(),
    empid: z.string(),
    nm: z.string(),
    cptopnm: z.string(),
    newdutid: z.string(),
    newdutnm: z.string(),
    vhno: z.string(),
    kd:z.string(),
    sumr: z.string(),
    cnt: z.string(),
    foldat: z.string(),
    cancdat: z.string(),
})
export const FollowUpReminderListRes = z.array(FollowUpReminderSchema);
export type FollowUpReminderListResType = z.TypeOf<typeof FollowUpReminderListRes>
