import { z } from "zod";

export const FamilyVisitSchema = z.object({
    empid: z.string(),
    nm: z.string(),
    dp: z.string(),
    dpnm: z.string(),
    newdutid: z.string(),
    newdutnm: z.string(),

})
export const FamilyVisitListRes = z.array(FamilyVisitSchema);
export type FamilyVisitListResType = z.TypeOf<typeof FamilyVisitListRes>

