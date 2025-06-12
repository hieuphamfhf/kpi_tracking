import { z } from "zod";

export const ManagerReturnStatusSchema = z.object({
    empid: z.string(),
    sts: z.string(),
    backfrdat: z.string(),
    backtodat: z.string(),
    prefdrat: z.string(),
    pretodat: z.string(),
    createdtime: z.string(),
    deleted: z.boolean(),
    nm: z.string(),
    dp: z.string(),
    newdutid: z.string(),
    newdutnm: z.string(),
    dpnm: z.string(),
    empID_TW: z.string(),
    jpnm: z.string(),
});

export const ManagerReturnStatusListRes = z.array(ManagerReturnStatusSchema);
export type ManagerReturnStatusListResType = z.infer<typeof ManagerReturnStatusListRes>;