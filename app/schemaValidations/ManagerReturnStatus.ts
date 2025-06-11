import { z } from "zod";

export const ManagerReturnStatusSchema = z.object({
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
export const ManagerReturnStatusListRes = z.array(ManagerReturnStatusSchema);
export type ManagerReturnStatusListResType = z.TypeOf<typeof ManagerReturnStatusListRes>
