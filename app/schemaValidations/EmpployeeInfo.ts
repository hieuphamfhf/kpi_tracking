import { z } from "zod";

export const EmpployeeInfoSchema = z.object({
    empid: z.string(),
    nm: z.string(),
    dp: z.string(),
    dpnm: z.string(),
    newdutid: z.string(),
    newdutnm: z.string(),

})
export const EmpployeeInfoListRes = z.array(EmpployeeInfoSchema);
export type EmpployeeInfoListResType = z.TypeOf<typeof EmpployeeInfoListRes>

