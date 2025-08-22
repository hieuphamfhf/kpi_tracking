"use client";
import { useEffect, useState } from "react";
import ReturnTaiwanPeriodDetailsTable from "./ReturnTaiwanPeriodDetailsTable";
import { ReturnTaiwanPeriodDetailsApiRequest } from "@/app/apiRequest/ReturnTaiwanPeriodDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TaiwanPeriodModal from "@/components/TaiwanPeriodModal";
import { ReturnTaiwanPeriodListRes } from "@/app/schemaValidations/ReturnTaiwanPeriod";
import Pagination from "@/components/Pagination";
import { dedupeTaiwanPeriod } from "@/utils/dedupeTaiwanPeriod";
// import { ReturnTaiwanPeriodDetailsRes } from "@/app/apiRequest/returnTaiwanPeriodDetails";

import { getReturnTaiwanPeriodDetails } from "@/app/apiRequest/ReturnTaiwanPeriodDetails";
// ==== DayType/CellData (khớp LeaveCalendarMatrixProps) ====
export type DayType =
  | "WORK"
  | "WEEKLY_OFF"
  | "PUBLIC_HOL"
  | "ANNUAL"
  | "ASSIGNMENT"
  | "BUSINESS_TW"
  | "BUSINESS_VN";

export type CellData = {
  type?: DayType;
  note?: string;
  lockedByRule?: boolean;
};

// ==== ROC(民國年) -> ISO (YYYY-MM-DD) ====
// "1140929" -> "2025-09-29"
const rocToISO = (roc: string): string => {
  if (!/^\d{7}$/.test(roc || "")) return "";
  const year = 1911 + parseInt(roc.slice(0, 3), 10);
  const mm = roc.slice(3, 5);
  const dd = roc.slice(5, 7);
  return `${year}-${mm}-${dd}`;
};

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
  const OFFID_TO_DAYTYPE: Record<string, DayType> = {
    "51": "BUSINESS_TW",   // 出差 công tác
    // TODO: thêm các mã khác khi backend cung cấp
    // "01": "PUBLIC_HOL",
    // "02": "ANNUAL",
    // "??": "ASSIGNMENT",
  };

  // Ghi chú mặc định theo DayType
const defaultNoteByType = (t?: DayType): string => {
  switch (t) {
    case "WEEKLY_OFF": return "台、越均放假"; // CHỈ cho nghỉ cuối tuần
    default:           return "—";          // các loại khác thì để "—"
  }
};
  const mapOffidToType = (id?: string): DayType | undefined =>
    id ? OFFID_TO_DAYTYPE[id.trim()] : undefined;

  // Giữ fallback theo tên (nếu offid chưa có trong bảng)
  const mapOffidnmToType = (name?: string): DayType | undefined => {
    const n = (name || "").trim();
    switch (n) {
      
      case "台、越均放假_CN": return "WEEKLY_OFF";
      case "國定假日": return "PUBLIC_HOL";
      case "特休": return "ANNUAL";
      case "派駐假": return "ASSIGNMENT";
      case "出差_": return "BUSINESS_TW"; // TODO: tách TW/VN theo rule co/dp nếu cần
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

// ==== Build matrix values (ƯU TIÊN: loại phép -> mặc định; KHÔNG dùng memo) ====
const buildCalendarValues = (rows: any[]): Record<string, CellData> => {
  const out: Record<string, CellData> = {};

  for (const r of rows) {
    const day = rocToISO(r.offdat);
    if (!day) continue;

    // type từ mã (ổn định), fallback theo tên
    let t: DayType | undefined =
      mapOffidToType(r.offid) ?? mapOffidnmToType(r.offidnm);

    // Chủ nhật: WEEKLY_OFF + khóa + note mặc định
    if (isSunday(day)) {
      out[day] = {
        type: "WEEKLY_OFF",
        note: defaultNoteByType("WEEKLY_OFF"),
        lockedByRule: true,
      };
      continue;
    }

    // NOTE: KHÔNG dùng memo
    const note = noteFromType(r, t) || defaultNoteByType(t);

    out[day] = { type: t, note };
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
      setCalendarValues(buildCalendarValues(rows));
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

  return (
    <div>
      <Tabs defaultValue="account" className="bg-gray-50 min-h-screen">
        <TabsContent value="account" className="bg-gray-50 ">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle>探親單查詢畫面</CardTitle>
              <CardDescription>請使用條件篩選數據，可匯出報告到 Excel。</CardDescription>
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
