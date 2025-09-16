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
  | "BUSINESS_VN"
  | "BEREAVEMENT"
  | "SPECIAL_LEAVE"
  | "COMP_LEAVE"
  | "LOCAL_OFF";  // 新增：補休


export type CellData = {
  type?: DayType;
  note?: string;
  lockedByRule?: boolean;
  badgeLabel?: string;
};

export type LeaveCalendarMatrixWeeklyProps = {
  startDate: Date | string;
  endDate: Date | string;
  values?: Record<string, CellData>; // key = YYYY-MM-DD
  autoSundayWeeklyOff?: boolean;
  weekStartsOn?: 0 | 1; // 0: Sunday, 1: Monday (default)
  onNoteChange?: (isoDate: string, value: string) => void;
  editedNotes?: Record<string, string>;
  summaryCounts?: Partial<Record<DayType, number>>;

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

const inRange = (d: Date, s: Date, e: Date) => d >= s && d <= e;


// ===== UI parts =====

export const badgeText: Record<DayType, string> = {
  WORK: "出勤",
  WEEKLY_OFF: "例假日",
  PUBLIC_HOL: "國定假日",
  ANNUAL: "特休",
  ASSIGNMENT: "派駐假",
  BUSINESS_TW: "出差",
  BUSINESS_VN: "駐越假",
  BEREAVEMENT: "喪假",
  SPECIAL_LEAVE: "特別休假",
  COMP_LEAVE: "補休",
  LOCAL_OFF: "駐地放假",
};

export const badgeStyle: Record<DayType, string> = {
  WORK: "bg-slate-100 text-slate-700 border-slate-300",
  WEEKLY_OFF: "bg-gray-100 text-gray-700 border-gray-300",           // xám: CHỈ cho CN
  PUBLIC_HOL: "bg-rose-100 text-rose-700 border-rose-300",           // 國定假日
  ANNUAL: "bg-amber-100 text-amber-700 border-amber-300",            // 特休
  ASSIGNMENT: "bg-violet-100 text-violet-700 border-violet-300",     // 派駐假
  BUSINESS_TW: "bg-sky-100 text-sky-700 border-sky-300",             // 出差
  BUSINESS_VN: "bg-teal-100 text-teal-700 border-teal-300",          // 駐越假
  BEREAVEMENT: "bg-red-100 text-red-700 border-red-300",             // 喪假 (tránh xám)
  SPECIAL_LEAVE: "bg-emerald-100 text-emerald-700 border-emerald-300",// 特別休假 (xanh lục rõ)
  COMP_LEAVE: "bg-indigo-100 text-indigo-700 border-indigo-300",     // 補休
  LOCAL_OFF: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
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
  editedNotes?: Record<string, string>;
  onNoteChange?: (isoDate: string, value: string) => void;
  s: Date;
  e: Date;
}> = ({ week, values, autoSundayWeeklyOff, editedNotes, onNoteChange, s, e }) => {
  const from = week[0];
  const to = week[6];

  // const inRange = (d: Date, s: Date, e: Date) => d >= s && d <= e;

  return (
    <div className="mb-3 border rounded-xl overflow-hidden">
      {/* header tuần */}
      <div className="flex items-center justify-start gap-4 px-4 py-2 text-sm font-semibold
    bg-slate-200 border-y border-slate-300 text-slate-800">

        週期：<span className="font-semibold">{from.toLocaleDateString("zh-TW")}</span>
        <span className="mx-1">→</span>
        <span className="font-semibold">{to.toLocaleDateString("zh-TW")}</span>
      </div>

      
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
            const isIn = inRange(d, s, e); // dùng s/e từ props

            if (!isIn) {
              return <HCell key={k}>
                <span className="text-gray-300 select-none"> </span>
              </HCell>;
            }
            const locked = autoSundayWeeklyOff && d.getDay() === 0 && !v.type;

            const t = (locked ? "WEEKLY_OFF" : v.type) as DayType | undefined;
            // const label = (v.note && v.note.trim()) || ""; // offidnm được gửi từ page
            // const label = v.type ? badgeText[v.type] : ""; // hoặc r.offidnm nếu muốn raw text
            const label =
              v.type === "ASSIGNMENT"
                ? (v as any).badgeLabel || badgeText[v.type]   //  ưu tiên badgeLabel
                : (v.type ? badgeText[v.type] : "");
            return (
              <HCell key={k}>
                {t ? (
                  // Có type: dùng màu theo type, text override = offidnm (nếu có)
                  <TypeBadge t={t} locked={locked || v.lockedByRule} labelOverride={label || undefined} />
                ) : label ? (
                  // Không có type nhưng có nhãn -> badge trung tính
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-slate-50 text-slate-500 border-slate-200">
                    {label}
                  </span>
                ) : (
                  // Không có gì -> mặc định 出勤
                  <TypeBadge t={undefined} locked={locked || v.lockedByRule} />
                )}
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
            const locked = autoSundayWeeklyOff && isSunday;

            
            const baseNote = (v.note ?? "").trim();
            const isIn = inRange(d, s, e); // dùng s/e từ props

            if (!isIn) {
              return <HCell key={k}>
                <div className="w-full h-7 rounded bg-gray-50/70" />
              </HCell>;
            }
            // Nếu Chủ nhật bị khóa mà chưa có note -> dùng mặc định
            const sundayDefault = "台、越均放假";
            const withDefault = locked && !baseNote ? sundayDefault : baseNote;

            // Nếu không locked thì ưu tiên note đang gõ; locked thì hiển thị withDefault
            const noteToShow = locked ? withDefault : (editedNotes?.[k] ?? withDefault);

            return (
              <HCell key={k}>
                {locked ? (
                  <span className="opacity-70" style={{ whiteSpace: "pre-wrap" }}>
                    {noteToShow}
                  </span>
                ) : (
                  <input
                    className="w-[95%] px-2 py-1 border rounded text-sm outline-none focus:ring"
                    value={noteToShow}
                    onChange={(e) => onNoteChange?.(k, e.target.value)}
                    placeholder="輸入備註…"
                    maxLength={60}
                    onKeyDown={(e) => e.stopPropagation()}
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
  editedNotes,
  onNoteChange,
  summaryCounts,
}) => {
  const s = toDate(startDate);
  const e = toDate(endDate);
  const weeks = useMemo(() => chunkByWeek(s, e, weekStartsOn), [startDate, endDate, weekStartsOn]);
  // const totalDays = weeks.reduce((n, w) => n + w.length, 0);
  const totalDays = weeks.flat().filter(d => inRange(d, s, e)).length;

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

        {/* badge tổng hợp */}
        <div className="flex flex-wrap items-center gap-2 ml-4">
          {Object.entries(summaryCounts ?? {}).map(([t, n]) =>
            n && n > 0 ? (
              <span
                key={t}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${badgeStyle[t as DayType]}`}
              >
                {badgeText[t as DayType]}
                <span className="ml-1 font-semibold">{n}</span>
              </span>
            ) : null
          )}

        </div>
        {/* <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> 匯出Excel
        </Button> */}
      </div>


      <CardContent className="p-3 overflow-y-auto max-h-[70vh]">
        {weeks.map((w, idx) => (
          <WeekBlock
            key={idx}
            week={w}
            values={values}
            autoSundayWeeklyOff={autoSundayWeeklyOff}
            editedNotes={editedNotes}
            onNoteChange={onNoteChange}
            s={s}
            e={e}
          />
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
