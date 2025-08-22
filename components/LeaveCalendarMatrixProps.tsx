import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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

export type LeaveCalendarMatrixWeeklyProps = {
  startDate: Date | string;
  endDate: Date | string;
  values?: Record<string, CellData>; // key = YYYY-MM-DD
  autoSundayWeeklyOff?: boolean;
  weekStartsOn?: 0 | 1; // 0: Sunday, 1: Monday (default)
};

// ===== Helpers =====
const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d));
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const zhWeekday = (d: Date) => ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
const mmddTW = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;

const floorToWeek = (d: Date, weekStartsOn: 0 | 1) => {
  const out = new Date(d);
  const day = out.getDay();
  const diff = ((day - weekStartsOn + 7) % 7);
  out.setDate(out.getDate() - diff);
  return out;
};
const ceilToWeek = (d: Date, weekStartsOn: 0 | 1) => {
  const out = new Date(d);
  const day = out.getDay();
  const diff = (weekStartsOn === 1 ? (6 - ((day + 6) % 7)) : (6 - day));
  out.setDate(out.getDate() + diff);
  return out;
};

const chunkByWeek = (start: Date, end: Date, weekStartsOn: 0 | 1) => {
  const first = floorToWeek(start, weekStartsOn);
  const last = ceilToWeek(end, weekStartsOn);
  const weeks: Date[][] = [];
  for (let d = new Date(first); d <= last;) {
    const arr: Date[] = [];
    for (let i = 0; i < 7; i++) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    weeks.push(arr);
  }
  return weeks;
};

// ===== UI parts =====
const badgeText: Record<DayType, string> = {
  WORK: "出勤",
  WEEKLY_OFF: "例假日",
  PUBLIC_HOL: "國定假日",
  ANNUAL: "特休",
  ASSIGNMENT: "派駐假",
  BUSINESS_TW: "因公返台",
  BUSINESS_VN: "因公返越",
};


const badgeStyle: Record<DayType, string> = {
  WORK: "bg-slate-100 text-slate-700 border-slate-300",
  WEEKLY_OFF: "bg-gray-100 text-gray-700 border-gray-300",
  PUBLIC_HOL: "bg-rose-100 text-rose-700 border-rose-300",
  ANNUAL: "bg-amber-100 text-amber-700 border-amber-300",
  ASSIGNMENT: "bg-violet-100 text-violet-700 border-violet-300",
  BUSINESS_TW: "bg-sky-100 text-sky-700 border-sky-300",
  BUSINESS_VN: "bg-teal-100 text-teal-700 border-teal-300",
};

const TypeBadge: React.FC<{ t?: DayType; locked?: boolean; labelOverride?: string }> = ({ t, locked, labelOverride }) => {
  // Không có type => coi là ngày đi làm bình thường
  if (!t) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-slate-50 text-slate-500 border-slate-200">
        出勤
      </span>
    );
  }
  const style = badgeStyle[t] || "bg-slate-100 text-slate-700 border-slate-300";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${style} ${locked ? "opacity-70" : ""}`}>
      {labelOverride ?? badgeText[t]}
      {locked && t === "WEEKLY_OFF" && <span className="ml-1 text-[10px] opacity-70">(固定)</span>}
    </span>
  );
};

const HCell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="flex-1 basis-0 min-w-[120px] h-12 flex items-center justify-center border-l last:border-r">
    {children}
  </div>
);
const StickyLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="sticky left-0 z-20 bg-white font-medium text-gray-700 border-y border-l px-3 min-w-[96px] flex items-center">
    {label}
  </div>
);

const WeekBlock: React.FC<{
  week: Date[];
  values: Record<string, CellData>;
  autoSundayWeeklyOff: boolean;
}> = ({ week, values, autoSundayWeeklyOff }) => {
  const from = week[0];
  const to = week[6];
  return (
    <div className="mb-3 border rounded-xl overflow-hidden">
      {/* header tuần */}
      <div className="flex items-center justify-start gap-4 px-4 py-2 text-sm font-semibold
    bg-slate-200 border-y border-slate-300 text-slate-800">

        週期：<span className="font-semibold">{from.toLocaleDateString("zh-TW")}</span>
        <span className="mx-1">→</span>
        <span className="font-semibold">{to.toLocaleDateString("zh-TW")}</span>
      </div>

      {/* 4 hàng như ảnh bạn mô tả */}
      <div className="overflow-x-auto">
        {/* 日期 */}
        <div className="flex">
          <StickyLabel label="日期" />
          {week.map((d) => (
            <HCell key={keyOf(d)}>{mmddTW(d)}</HCell>
          ))}
        </div>
        {/* 星期 */}
        <div className="flex border-t">
          <StickyLabel label="星期" />
          {week.map((d) => (
            <HCell key={keyOf(d)}>{zhWeekday(d)}</HCell>
          ))}
        </div>

        {/* 申請假別 - loai phep nghĩ*/}
        <div className="flex border-t">
          <StickyLabel label="申請假別" />
          {week.map((d) => {
            const k = keyOf(d);
            const v = values[k] || {};
            const locked = autoSundayWeeklyOff && d.getDay() === 0 && !v.type;
            const t = (locked ? "WEEKLY_OFF" : v.type) as DayType | undefined;

            // offid === "51" (BUSINESS_TW)  hiện đúng chữ 出差
            const labelOverride = t === "BUSINESS_TW" ? "出差" : undefined;

            return (
              <HCell key={k}>
                <TypeBadge t={t} locked={locked || v.lockedByRule} labelOverride={labelOverride} />
              </HCell>
            );
          })}
        </div>



        {/* 備註 - ghi chu */}
        <div className="flex border-t">
          <StickyLabel label="備註" />
          {week.map((d) => {
            const k = keyOf(d);
            const v = values[k] || {};
            const isSunday = d.getDay() === 0;
            const locked = autoSundayWeeklyOff && isSunday; // CN khoá

            //  Nếu type là BUSINESS_TW và note = "出差" thì không hiển thị lại ở 備註
            const noteToShow =
              v.type === "BUSINESS_TW" && v.note?.trim() === "出差"
                ? "—"
                : (v.note || "—");

            return (
              <HCell key={k}>
                {locked ? (
                  <span className="opacity-70">{noteToShow}</span>
                ) : (
                  <input
                    type="text"
                    value={noteToShow === "—" ? "" : noteToShow}
                    onChange={() => {
                      /* TODO: cập nhật state nếu cần cho editable */
                    }}
                    className="w-full h-10 px-2 bg-transparent outline-none focus:ring-2 focus:ring-slate-300 rounded-md text-sm"
                  />
                )}
              </HCell>
            );
          })}
        </div>

      </div>
    </div>
  );
};

const LeaveCalendarMatrixWeekly: React.FC<LeaveCalendarMatrixWeeklyProps> = ({
  startDate,
  endDate,
  values = {},
  autoSundayWeeklyOff = true,
  weekStartsOn = 1,
}) => {
  const s = toDate(startDate);
  const e = toDate(endDate);
  const weeks = useMemo(() => chunkByWeek(s, e, weekStartsOn), [startDate, endDate, weekStartsOn]);
  const totalDays = weeks.reduce((n, w) => n + w.length, 0);

  return (
    <Card className="w-full">
      {/* tiêu đề tổng */}
      <div className="flex items-center justify-between px-4 py-2 text-sm border-b bg-white">
        <div>
          期間：<span className="font-semibold">{s.toLocaleDateString("zh-TW")}</span>
          <span className="mx-1">→</span>
          <span className="font-semibold">{e.toLocaleDateString("zh-TW")}</span>
          <span className="ml-2 text-gray-500">（共{totalDays}日）</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> 匯出Excel
        </Button>
      </div>

      <CardContent className="p-3 overflow-y-auto max-h-[70vh]">
        {weeks.map((w, idx) => (
          <WeekBlock key={idx} week={w} values={values} autoSundayWeeklyOff={autoSundayWeeklyOff} />
        ))}
      </CardContent>
    </Card>
  );
};

export default LeaveCalendarMatrixWeekly;

// Demo usage
export const Demo = () => {
  const sample: Record<string, CellData> = {
    "2025-08-25": { type: "BUSINESS_TW", note: "返台" },
    "2025-08-30": { type: "PUBLIC_HOL", note: "台、越均放假" },
    "2025-09-02": { type: "ANNUAL" },
    "2025-09-06": { note: "—" },
    "2025-09-11": { type: "ASSIGNMENT", note: "派駐假6" },
    "2025-09-20": { type: "WEEKLY_OFF" },
  };
  return (
    <div className="p-4">
      <LeaveCalendarMatrixWeekly startDate="2025-08-25" endDate="2025-09-21" values={sample} />
    </div>
  );
};
