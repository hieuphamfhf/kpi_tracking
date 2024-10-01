import { z } from "zod";

export const BorrowCardSchema = z.object({
    co: z.string(),
    empid: z.string(),
    nm: z.string(),
    brwdat: z.string(),
    dp: z.string(),
    dpnm: z.string(),
    newdutid: z.string(),
    newdutnm: z.string(),
    tmpcid: z.string(),
    brwrs:z.string(),
    
})
export const BorrowCardListRes = z.array(BorrowCardSchema);
export type BorrowCardListResType = z.TypeOf<typeof BorrowCardListRes>
