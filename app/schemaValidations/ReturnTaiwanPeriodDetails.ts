// import { z } from "zod";

// export const ReturnTaiwanPeriodDetailsSchema = z.object({
//     empid: z.string(),
//     nm: z.string(),
//     dp: z.string(),
//     dpnm: z.string(),
//     newdutid: z.string(),
//     newdutnm: z.string(),

// })
// export const ReturnTaiwanPeriodDetailsListRes = z.array(ReturnTaiwanPeriodDetailsSchema);
// export type ReturnTaiwanPeriodDetailsListResType = z.TypeOf<typeof ReturnTaiwanPeriodDetailsListRes>

import { z } from "zod";

export const ReturnTaiwanPeriodDetailSchema = z.object({
  empid: z.string(),
  co: z.string(),
  offdat: z.string(),   // "1140929" (ROC)
  offfrhh: z.string(),  // "0000"
  offid: z.string(),
  offtohh: z.string(),  // "2330"
  offhrs: z.string(),
  pz: z.string(),
  dp: z.string(),
  mk: z.string(),
  txdat: z.string(),    // "114/07/17 09:53:15"
  kinemp: z.string(),
  offidnm: z.string(),  // "出差"
  memo: z.string(),
});

export const ReturnTaiwanPeriodDetailsRes = z.array(ReturnTaiwanPeriodDetailSchema);
export type ReturnTaiwanPeriodDetailsResType = z.infer<typeof ReturnTaiwanPeriodDetailsRes>;
