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

// "co": "LG",
// "ovrdat": "0240701",
// "ovrfrhh": "1700",
// "ovrtohh": "1830",
// "ovrid": "2",
// "ovrrs": "J",
// "ovh": "1.5",

// "ofF12MK": "Y",

// "dp": "RF00",
// "dpnm": "總管理處採購部",
// "frmno": "0270174303",

// "xrem": "案件呈核",
// "empid": "VNW0000049",
// "nm": "阮氏美紅",
// "naty": "VN",
// "newdutid": "MNA3AJ",
// "newdutnm": "採購管理管理師",
// "araid": "B",
// "beorder": "Y",
// "beordeR1": "Y"