// // /app/apiRequest/ReturnTaiwanPeriodDetails.ts
// export const ReturnTaiwanPeriodDetailsApiRequest = {
//     getList: async ({
//         empid = '',
//         nm = '',
//         dp = '',
//         dpnm = '',
//         newdutnm = '',
//     }: {
//         empid?: string,
//         nm?: string,
//         dp?: string,
//         dpnm?: string,
//         newdutnm?: string,
//     }) => {
//         const url = `http://10.198.170.99:5000/API/EmpployeeInfo?empid=${encodeURIComponent(empid)}&NM=${encodeURIComponent(nm)}&dp=${encodeURIComponent(dp)}&dpnm=${encodeURIComponent(dpnm)}&newdutnm=${encodeURIComponent(newdutnm)}`;
//         const res = await fetch(url);
//         const data = await res.json();
//         return { payload: data };
//     }
// };

import { ReturnTaiwanPeriodDetailsRes } from "@/app/schemaValidations/ReturnTaiwanPeriodDetails";

export async function getReturnTaiwanPeriodDetails(params: {
  empid: string; startdate: string; enddate: string;
}) {
  const qs = new URLSearchParams({
    empid: params.empid,
    startdate: params.startdate.trim(),
    enddate: params.enddate.trim(),
  });
  const url = `http://10.198.170.99:5000/API/ReturnTaiwanPeriodDetails?${qs.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  const parsed = ReturnTaiwanPeriodDetailsRes.safeParse(data);
  if (!parsed.success) return [];
  return parsed.data;
}

export const ReturnTaiwanPeriodDetailsApiRequest = {
  async getList(params: {
    empid?: string; nm?: string; dp?: string; dpnm?: string; newdutnm?: string;
  }): Promise<{ payload: any[] }> {
    const q = new URLSearchParams(params as any).toString();
    const res = await fetch(`http://10.198.170.99:5000/API/ReturnTaiwanPeriodDetailsList?${q}`);
    const data = await res.json();
    return data; // { payload: [...] }
  },
};

