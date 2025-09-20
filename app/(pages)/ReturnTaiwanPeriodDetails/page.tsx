"use client";
import { useEffect, useState, useMemo } from "react";
import ReturnTaiwanPeriodDetailsTable from "./ReturnTaiwanPeriodDetailsTable";
import { ReturnTaiwanPeriodDetailsApiRequest } from "@/app/apiRequest/ReturnTaiwanPeriodDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TaiwanPeriodModal from "@/components/TaiwanPeriodModal";
import { ReturnTaiwanPeriodListRes } from "@/app/schemaValidations/ReturnTaiwanPeriod";
import Pagination from "@/components/Pagination";
import { dedupeTaiwanPeriod } from "@/utils/dedupeTaiwanPeriod";
import toast from "react-hot-toast";
// import { ReturnTaiwanPeriodDetailsRes } from "@/app/apiRequest/returnTaiwanPeriodDetails";

import { getReturnTaiwanPeriodDetails } from "@/app/apiRequest/ReturnTaiwanPeriodDetails";
import { saveMemosBatch } from "@/components/saveHelp";

// ==== DayType/CellData (khớp LeaveCalendarMatrixProps) ====
export type DayType =
  | "WORK" | "WEEKLY_OFF" | "PUBLIC_HOL" | "ANNUAL"
  | "ASSIGNMENT" | "BUSINESS_TW" | "BUSINESS_VN"
  | "BEREAVEMENT" | "SPECIAL_LEAVE" | "COMP_LEAVE"
  | "LOCAL_OFF";

// + 補休


export type CellData = {
  type?: DayType;
  note?: string;
  lockedByRule?: boolean;
  badgeLabel?: string;
};
// YYYYMMDD -> YYYY-MM-DD
const ymdToISO = (s: string) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

type TaiwanPeriodItem = {
  empid: string;
  sts: string;
  backfrdat?: string;
  backtodat?: string;
  prefrdat?: string;
  pretodat?: string;
  createdtime?: string;
  deleted?: boolean;
};
// chọn bản ghi mới nhất theo createdtime (nếu API trả trùng kỳ)
// const pickLatest = (rows: TaiwanPeriodItem[]) =>
//   rows.sort((a, b) => new Date(b.createdtime || 0).getTime() - new Date(a.createdtime || 0).getTime())[0];

// Gom nhóm theo (backfrdat, backtodat) và giữ bản mới nhất mỗi nhóm
const dedupeByPeriod = (rows: TaiwanPeriodItem[]) => {
  const groups = new Map<string, TaiwanPeriodItem[]>();
  for (const r of rows) {
    const key = `${r.backfrdat || ""}-${r.backtodat || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  return Array.from(groups.values()).map(arr =>
    arr.sort((a, b) =>
      new Date(b.createdtime || 0).getTime() - new Date(a.createdtime || 0).getTime()
    )[0]
  );
};

const eachDayISO = (fromISO: string, toISO: string) => {
  const out: string[] = [];
  const start = new Date(`${fromISO}T00:00:00`);
  const end = new Date(`${toISO}T00:00:00`);
  // đi từ ngày +1 đến ngày -1 để tránh ghi đè 返台/返越 (nếu muốn inclusive thì điều chỉnh)
  for (let d = new Date(start); ;) {
    d.setDate(d.getDate() + 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (iso >= toISO) break;
    out.push(iso);
  }
  return out;
};


// Lấy map { "YYYY-MM-DD": { note: "返台" | "返越" } }
async function fetchReturnTaiwanPeriodNotes(emp: string, fromISO: string, toISO: string) {
  // Cộng/trừ THÁNG cho ISO yyyy-mm-dd
  const addMonthsISO = (iso: string, months: number) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setMonth(d.getMonth() + months);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  const queryFrom = addMonthsISO(fromISO, -2);
  const queryTo = addMonthsISO(toISO, +2);

  // const url = `http://10.198.170.99:5000/API/ReturnTaiwanPeriod?empid=${emp}&backfrdat=${fromISO.replace(/-/g, "")}&backtodat=${toISO.replace(/-/g, "")}`;
  const url = `http://10.198.170.99:5000/API/ReturnTaiwanPeriod?empid=${emp}`
    + `&backfrdat=${queryFrom.replace(/-/g, "")}`
    + `&backtodat=${queryTo.replace(/-/g, "")}`;
  const res = await fetch(url);
  const data: TaiwanPeriodItem[] = await res.json();

  const valid = (data || []).filter(r => r.sts === "核准" && r.deleted === false);
  const deduped = dedupeByPeriod(valid);

  const noteMap: Record<string, CellData> = {};
  const periods: Array<{ from: string; to: string; origFrom: string; origTo: string }> = [];

  const inRange = (iso: string) => iso >= fromISO && iso <= toISO;



  for (const r of deduped) {
    if (r.backfrdat) {
      const iso = ymdToISO(r.backfrdat);
      if (inRange(iso)) noteMap[iso] = { note: "返台" };
    }
    if (r.backtodat) {
      const iso = ymdToISO(r.backtodat);
      if (inRange(iso)) noteMap[iso] = { note: "返越" };
    }
    if (r.backfrdat && r.backtodat) {
      const origFrom = ymdToISO(r.backfrdat);
      const origTo = ymdToISO(r.backtodat);
      // chỉ push nếu giao với [fromISO, toISO]
      if (!(origTo < fromISO || origFrom > toISO)) {
        periods.push({
          from: origFrom < fromISO ? fromISO : origFrom,
          to: origTo > toISO ? toISO : origTo,
          origFrom, origTo,
        });
      }
    }
  }
  return { noteMap, periods };
}

// ==== ROC(民國年) -> ISO (YYYY-MM-DD) ====
// "1140929" -> "2025-09-29"
// const rocToISO = (roc: string): string => {
//   if (!/^\d{7}$/.test(roc || "")) return "";
//   const year = 1911 + parseInt(roc.slice(0, 3), 10);
//   const mm = roc.slice(3, 5);
//   const dd = roc.slice(5, 7);
//   return `${year}-${mm}-${dd}`;
// };

// ==== offdat(7 ký tự) -> ISO (YYYY-MM-DD) ====
// Hỗ trợ cả 2 kiểu:
// - ROC:   "1140929" -> "2025-09-29"
// - Now:   "0250825" -> "2025-08-25"
const rocToISO = (s: string): string => {
  if (!/^\d{7}$/.test(s || "")) return "";
  const y3 = s.slice(0, 3);
  const mm = s.slice(3, 5);
  const dd = s.slice(5, 7);

  const y3Num = parseInt(y3, 10);
  // Nếu dạng mới bắt đầu bằng '0' (025 -> 2025)
  const year = y3.startsWith("0") ? (2000 + y3Num) : (1911 + y3Num);

  return `${year}-${mm}-${dd}`;
};



// const isoKeySort = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
// const plusDays = (iso: string, n: number) => {
//   const d = new Date(`${iso}T00:00:00`);
//   d.setDate(d.getDate() + n);
//   const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${dd}`;
// };
// function addAssignmentOrdinal(vals: Record<string, CellData>) {
//   const days = Object.keys(vals).filter(k => vals[k].type === "ASSIGNMENT").sort(isoKeySort);
//   let seq = 0;
//   let prev: string | null = null;
//   for (const d of days) {
//     // nếu không liền kề ngày trước đó -> reset về 1
//     if (!prev || d !== plusDays(prev, 1)) seq = 1;
//     else seq += 1;
//     vals[d] = { ...vals[d], note: `派駐假${seq}` };
//     prev = d;
//   }
//   return vals;
// }

const dayOfWeek = (iso: string) => new Date(`${iso}T00:00:00`).getDay();
const isoKeySort = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const plusDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Đếm liên tục 派駐假1..N; KHÔNG reset nếu giữa hai ngày chỉ rơi vào Chủ nhật va...
// function addAssignmentOrdinal(vals: Record<string, CellData>) {
//   const days = Object.keys(vals)
//     .filter(k => vals[k].type === "ASSIGNMENT")
//     .sort(isoKeySort);

//   let seq = 0;
//   let prev: string | null = null;

//   for (const d of days) {
//     if (!prev) {
//       seq = 1;
//     } else {
//       const next1 = plusDays(prev, 1);
//       const next2 = plusDays(prev, 2);
//       if (d === next1) {
//         seq += 1;
//       } else if (d === next2 && dayOfWeek(next1) === 0) {
//         // bỏ qua đúng 1 ngày và ngày đó là Chủ nhật -> vẫn tăng
//         seq += 1;
//       } else {
//         seq = 1;
//       }
//     }
//     vals[d] = { ...vals[d], note: `派駐假${seq}` };
//     prev = d;
//   }
//   return vals;
// }
const ASSIGNMENT_GAP_MAX = 6; // số ngày tối đa cho phép để KHÔNG reset

const diffDays = (aISO: string, bISO: string) =>
  Math.round(
    (new Date(`${bISO}T00:00:00`).getTime() - new Date(`${aISO}T00:00:00`).getTime()) /
    86400000
  );
function addAssignmentOrdinal(vals: Record<string, CellData>) {
  const days = Object.keys(vals)
    .filter(k => vals[k].type === "ASSIGNMENT")
    .sort(isoKeySort); // đã có trong file

  let seq = 0;
  let prev: string | null = null;

  for (const d of days) {
    if (!prev) {
      seq = 1; // ngày 派駐假 đầu tiên
    } else {
      const gap = diffDays(prev, d);  // số ngày cách nhau
      seq = gap > ASSIGNMENT_GAP_MAX ? 1 : (seq + 1);
    }
    // vals[d] = { ...vals[d], note: `派駐假${seq}` };
    vals[d] = { ...vals[d], badgeLabel: `派駐假${seq}` };
    prev = d;
  }
  return vals;
}

// ==== Map loại nghỉ (zh-TW) -> DayType ====
const mapOffidnmToType = (name: string, opts?: { co?: string; dp?: string }): DayType | undefined => {
  const n = (name || "").trim();
  switch (n) {
    case "國定假日": return "PUBLIC_HOL";
    case "特休": return "ANNUAL";
    case "派駐假": return "ASSIGNMENT";
    case "出差": return "BUSINESS_TW"; // sửa logic nếu cần phân TW/VN
    default: return undefined;
  }
};


// helpers
const dashToYmd = (s: string) => s?.replace(/-/g, "") ?? "";
const ymdToDash = (s: string) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

export default function ReturnTaiwanPeriodDetailsPage() {
  const PAGE_SIZE = 50;

  // -------- Pagination
  const [page, setPage] = useState(1);

  // -------- Filters (employee)
  const [empid, setEmpid] = useState<string>("");
  const [nm, setNm] = useState<string>("");
  const [dp, setDp] = useState<string>("");
  const [dpnm, setDpnm] = useState<string>("");
  const [newdutnm, setNewdutnm] = useState<string>("");

  // -------- Data (list)
  const [ReturnTaiwanPeriodDetails, setReturnTaiwanPeriodDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // -------- Modal (period history)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // -------- Date range & matrix values
  const [fromDate, setFromDate] = useState<string>("");   // yyyy-MM-dd
  const [toDate, setToDate] = useState<string>("");       // yyyy-MM-dd
  const [calendarValues, setCalendarValues] = useState<Record<string, CellData>>({});

  useEffect(() => {
    if (fromDate || toDate) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const start = new Date(y, m, 1);            // đầu tháng
    const end = new Date(y, m + 1, 0);        // cuối tháng

    const toISO = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    setFromDate(toISO(start));
    setToDate(toISO(end));
  }, []); // chạy 1 lần khi vào trang
  // Fetch list (ReturnTaiwanPeriodDetails)
  const fetchData = async () => {
    setLoading(true);
    try {
      const { payload } = await ReturnTaiwanPeriodDetailsApiRequest.getList({
        empid, nm, dp, dpnm, newdutnm,
        // Nếu muốn lọc server theo ngày từ FilterBar:
        // backfrdat: fromDate ? dashToYmd(fromDate) : undefined,
        // backtodat: toDate ? dashToYmd(toDate) : undefined,
      });
      setReturnTaiwanPeriodDetails(payload);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // Row click -> legacy ReturnTaiwanPeriod (lịch sử 1 năm)
  // const handleRowClick = async (item: any) => {
  //   setSelectedRow(item);
  //   setModalOpen(true);
  //   setModalLoading(true);
  //   try {
  //     const today = new Date();
  //     const backtodat = today.toISOString().slice(0, 10).replace(/-/g, "");
  //     const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  //     const backfrdat = lastYear.toISOString().slice(0, 10).replace(/-/g, "");
  //     const res = await fetch(
  //       `http://10.198.170.99:5000/API/ReturnTaiwanPeriod?empid=${item.empid}&backfrdat=${backfrdat}&backtodat=${backtodat}`
  //     );
  //     const data = await res.json();
  //     const parsed = ReturnTaiwanPeriodListRes.safeParse(data);
  //     setModalData(parsed.success ? dedupeTaiwanPeriod(parsed.data) : []);
  //   } catch {
  //     setModalData([]);
  //   }
  //   setModalLoading(false);
  // };

  // ==== Map theo offid (ổn định hơn) ====
  // const OFFID_TO_DAYTYPE: Record<string, DayType> = {
  //   "51": "BUSINESS_TW",   // 出差
  //   "58": "BUSINESS_VN",   // 駐越假
  //   "52": "ASSIGNMENT",    // 派駐假
  //   "03": "SPECIAL_LEAVE", // 特別休假  
  //   "10": "BEREAVEMENT",   // 喪假
  //   "08": "COMP_LEAVE",    // 補休 
  // };
  const OFFID_TO_DAYTYPE: Record<string, DayType> = {
  "51": "BUSINESS_TW",   // 出差
  "58": "BUSINESS_VN",   // 駐越假
  "52": "ASSIGNMENT",    // 派駐假
  "03": "ANNUAL",        // 特休   edit 03 SPECIAL_LEAVE
  "10": "BEREAVEMENT",   // 喪假
  "08": "COMP_LEAVE",    // 補休
};


  // Ghi chú mặc định theo DayType
  const defaultNoteByType = (t?: DayType): string => {
    switch (t) {
      case "WEEKLY_OFF": return "台、越均放假"; // CHỈ cho nghỉ cuối tuần
      default: return "";          // các loại khác thì để "—"
    }
  };
  const mapOffidToType = (id?: string): DayType | undefined =>
    id ? OFFID_TO_DAYTYPE[id.trim()] : undefined;

  // Ghi chú mặc định theo từng offidnm đặc thù
  const SPECIAL_NOTE_BY_OFFIDNM: Record<string, string> = {
    "因公返台": "在台上班",
    // "特別休假": "在台上班_test",
  };
;;;;;
  // Giữ fallback theo tên (nếu offid chưa có trong bảng)
  const mapOffidnmToType = (name?: string): DayType | undefined => {
    const n = (name || "").trim();
    switch (n) {
      case "國定假日": return "PUBLIC_HOL";
      case "特休": return "ANNUAL";
      case "派駐假": return "ASSIGNMENT";
      case "駐越假": return "BUSINESS_VN";
      case "喪假": return "BEREAVEMENT";
      case "特別休假": return "SPECIAL_LEAVE";
      case "補休": return "COMP_LEAVE";
      case "出差": return "BUSINESS_TW";
      default: return undefined;
    }
  };


  // Chủ nhật → WEEKLY_OFF + khóa

  const isSunday = (iso: string) => new Date(`${iso}T00:00:00`).getDay() === 0;

  // Lấy note theo loại phép (ưu tiên cao nhất)
  const noteFromType = (r: any, t?: DayType): string => {
    // Ưu tiên mã (ổn định nhất)
    if (r?.offid?.trim?.() === "51") return "出差";
    // Fallback tên loại nếu backend gửi
    const nm = (r?.offidnm && String(r.offidnm).trim()) || "";
    return nm;
  };
 const OFFID_PRIORITY: Record<string, number> = {
  "52": 100, // 派駐假 — cao nhất | Nghỉ phái trú / phái cử (Overseas assignment leave)
  // "58": 90,  // 駐越假 | Nghỉ trú/đóng tại Việt Nam (Stationed in Vietnam leave)
  // "10": 85,  // 喪假 | Nghỉ tang (Bereavement leave)
  // "51": 80,  // 出差 | Nghỉ công tác (Business trip)
  // "08": 60,  // 補休 | Nghỉ bù (Compensatory leave)     
  // "03": 50,  // 特別休假 | Nghỉ đặc biệt (Special leave)
  // loại khác mặc định = 50 | Các loại chưa định nghĩa sẽ có mức ưu tiên thấp nhất
};


  const buildCalendarValues = (rows: any[]): Record<string, CellData> => {
    const out: Record<string, CellData> = {};
    const chosenPrio: Record<string, number> = {}; // lưu priority đã chọn cho từng ngày

    for (const r of rows) {
      const day = rocToISO(r.offdat);
      if (!day) continue;

      // CN → WEEKLY_OFF (khóa), luôn thắng mọi ưu tiên
      if (isSunday(day)) {
        out[day] = {
          type: "WEEKLY_OFF",
          note: defaultNoteByType("WEEKLY_OFF"),
          lockedByRule: true,
        };
        chosenPrio[day] = 9999;
        continue;
      }

      const t: DayType | undefined =
        mapOffidToType(r.offid) ?? mapOffidnmToType(r.offidnm);

      const prio = OFFID_PRIORITY[(r.offid || "").trim()] ?? 50;
      const note = String(r?.memo ?? "").trim();
      const badgeLabel = (r?.offidnm || "").trim();

      // chỉ ghi nếu chưa có hoặc priority cao hơn
      if (!chosenPrio[day] || prio > chosenPrio[day]) {
        out[day] = { type: t, note, badgeLabel };
        chosenPrio[day] = prio;
      }
    }
    return out;
  };



  // Fetch details (ReturnTaiwanPeriodDetails) whenever empid/from/to change
  const fetchDetailsForMatrix = async (emp: string, fromISO: string, toISO: string) => {
    if (!emp || !fromISO || !toISO) { setCalendarValues({}); return; }
    try {
      const rows = await getReturnTaiwanPeriodDetails({
        empid: emp,
        startdate: dashToYmd(fromISO),
        enddate: dashToYmd(toISO),
      });
      // setCalendarValues(buildCalendarValues(rows));

      const base = buildCalendarValues(rows);

      const { noteMap, periods } = await fetchReturnTaiwanPeriodNotes(emp, fromISO, toISO);
      const merged: Record<string, CellData> = { ...base };

      // 1) ghép note 返台 / 返越 (giữ nguyên logic cũ)
      for (const [k, v] of Object.entries(noteMap)) {
        const prev = (merged[k]?.note || "").trim();
        merged[k] = { ...(merged[k] || {}), note: prev ? `${prev} / ${v.note}` : v.note };
      }

      // 2) Tô “駐地放假” cho các ngày trống nằm giữa backfrdat → backtodat
      // for (const p of periods) {
      //   for (const iso of eachDayISO(p.from, p.to)) {
      //     const cur = merged[iso] || {};
      //     const isSunday = new Date(`${iso}T00:00:00`).getDay() === 0;
      //     // chỉ gán nếu: chưa có type & không phải CN (CN đang bị khoá là WEEKLY_OFF)
      //     if (!cur.type && !isSunday) {
      //       merged[iso] = { ...cur, type: "LOCAL_OFF" }; // ← 駐地放假
      //     }
      //   }
      // }

      // inclusive: duyệt cả from và to
      const eachDayISOInclusive = (fromISO: string, toISO: string) => {
        const out: string[] = [];
        const start = new Date(`${fromISO}T00:00:00`);
        const end = new Date(`${toISO}T00:00:00`);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          out.push(iso);
        }
        return out;
      };

      for (const p of periods) {
        for (const iso of eachDayISOInclusive(p.from, p.to)) {
          if (iso === p.origFrom || iso === p.origTo) continue; // KHÔNG đè 返台/返越 thật
          const cur = merged[iso] || {};
          const isSun = new Date(`${iso}T00:00:00`).getDay() === 0;
          if (!cur.type && !isSun) merged[iso] = { ...cur, type: "LOCAL_OFF" }; // 駐地放假
        }
      }


      // 3) Đánh số 派駐假 như hiện tại
      addAssignmentOrdinal(merged);

      setCalendarValues(merged);

    } catch {
      setCalendarValues({});
    }
  };

  // Auto fetch list when basic filters change (giữ nguyên flow cũ) 
  useEffect(() => {
    if (!empid && !nm && !dp && !dpnm && !newdutnm) return;
    fetchData();
  }, [empid, nm, dp, dpnm, newdutnm]);

  // Auto fetch matrix details when empid & date range change
  useEffect(() => {
    if (!empid || !fromDate || !toDate) return;
    fetchDetailsForMatrix(empid, fromDate, toDate);
  }, [empid, fromDate, toDate]);

  const totalPage = Math.ceil(ReturnTaiwanPeriodDetails.length / PAGE_SIZE);
  const originalNotes = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [k, v] of Object.entries(calendarValues)) m[k] = v.note ?? "";
    return m;
  }, [calendarValues]);

  const handleSaveNotes = async (edited: Record<string, string>) => {
    if (!empid || !fromDate || !toDate) return;
    const { ok, fail } = await saveMemosBatch({
      baseUrl: "http://10.198.170.99:5000",
      empid,
      originalNotes,
      editedNotes: edited,
      concurrency: 4,
    });
    // (tùy chọn) hiện toast theo ok/fail
    await fetchDetailsForMatrix(empid, fromDate, toDate); // refresh lại ma trận
  };
  return (
    <div>
      <Tabs defaultValue="account" className="bg-gray-50 min-h-screen">
        <TabsContent value="account" className="bg-gray-50 ">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle>探親單詳細內容查詢(日曆)</CardTitle>
              {/* <CardDescription>探親單詳細內容查詢(日曆)</CardDescription> */}
            </CardHeader>

            <CardContent className="pt-2 ">
              <ReturnTaiwanPeriodDetailsTable
                ReturnTaiwanPeriodDetails={ReturnTaiwanPeriodDetails}
                onEmpidChange={setEmpid}
                onNmChange={setNm}
                onDpChange={setDp}
                onDpnmChange={setDpnm}
                onNewdutnmChange={setNewdutnm}
                empid={empid}
                nm={nm}
                dp={dp}
                dpnm={dpnm}
                newdutnm={newdutnm}
                loading={loading}
                // onRowClick={handleRowClick}
                page={page}
                pageSize={PAGE_SIZE}

                // nhận (from,to) từ FilterBar (ReturnTaiwanPeriodDetailsTable forward)
                onDateChange={(from, to) => {
                  setFromDate(ymdToDash(from));
                  setToDate(ymdToDash(to));
                }}

                // đồng bộ matrix range với FilterBar
                startDate={fromDate || undefined}
                endDate={toDate || undefined}

                // dữ liệu chi tiết theo ngày từ ReturnTaiwanPeriodDetails
                calendarValues={calendarValues}
                onSaveNotes={handleSaveNotes}
              />

              <TaiwanPeriodModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                data={modalLoading ? [] : modalData}
                selectedRow={selectedRow}
              />

              {modalLoading && modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white px-8 py-4 rounded shadow">Loading...</div>
                </div>
              )}

              <div className="max-w-5xl mx-auto">
                <Pagination
                  page={page}
                  totalPage={totalPage}
                  totalCount={ReturnTaiwanPeriodDetails.length}
                  onPageChange={setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
