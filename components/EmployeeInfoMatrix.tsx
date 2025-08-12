"use client";
import { addDays, format, isWeekend } from "date-fns";
import clsx from "clsx";

type StatusCode = "WORK"|"LEAVE_TW"|"LEAVE_VN"|"RETURN_TW"|"RETURN_VN"|"SPECIAL"|"PUBLIC"|"WEEKEND"|"EMPTY";
type Cell = { code: StatusCode; text?: string; note?: string };
type Row  = {
  person: { empid:string; nm:string; dp:string; dpnm:string };
  days: Record<string, Cell>; // "YYYY-MM-DD" -> Cell
  remark?: string;
};

export default function EmployeeInfoMatrix({
  dateFrom, dateTo, rows,
}: { dateFrom: Date; dateTo: Date; rows: Row[] }) {
  const days: Date[] = []; for (let d = dateFrom; d <= dateTo; d = addDays(d,1)) days.push(new Date(d));
  const codeStyle: Record<StatusCode, string> = {
    WORK:"text-gray-900", LEAVE_TW:"text-green-700 font-semibold", LEAVE_VN:"text-indigo-700 font-semibold",
    RETURN_TW:"text-emerald-700 font-bold", RETURN_VN:"text-blue-700 font-bold",
    SPECIAL:"text-rose-700 font-semibold", PUBLIC:"text-orange-700 font-semibold",
    WEEKEND:"text-gray-500", EMPTY:"text-gray-300"
  };

  return (
    <div className="overflow-x-auto border rounded bg-white">
      <table className="border-collapse min-w-max">
        <thead>
          <tr>
            {["#", "員工編號", "姓名", "部門代號", "部門名稱"].map((h,i)=>
              <th key={i} className="sticky left-0 bg-white border p-2">{h}</th>)}
            {days.map(d => (
              <th key={String(d)} className={clsx("border p-2 text-center", isWeekend(d)?"bg-amber-50":"bg-gray-50")}>
                {format(d, "MM/dd")}
              </th>
            ))}
            <th className="border p-2">備註</th>
          </tr>
          <tr>
            <th colSpan={5} className="sticky left-0 bg-white border p-1"></th>
            {days.map(d => (
              <th key={"w"+String(d)} className={clsx("border p-1 text-xs text-center", isWeekend(d)?"text-amber-700":"text-gray-600")}>
                {format(d, "EEE")}
              </th>
            ))}
            <th className="border p-1"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.person.empid} className="hover:bg-slate-50">
              <td className="sticky left-0 bg-white border p-2 text-center">{i+1}</td>
              <td className="sticky left-0 bg-white border p-2 font-mono">{r.person.empid}</td>
              <td className="sticky left-0 bg-white border p-2">{r.person.nm}</td>
              <td className="sticky left-0 bg-white border p-2">{r.person.dp}</td>
              <td className="sticky left-0 bg-white border p-2">{r.person.dpnm}</td>
              {days.map(d => {
                const k = format(d, "yyyy-MM-dd");
                const cell = r.days[k] ?? { code: isWeekend(d) ? "WEEKEND" : "EMPTY" };
                const text = cell.text ?? ({WORK:"出勤",LEAVE_TW:"返台",LEAVE_VN:"返越",RETURN_TW:"回台",RETURN_VN:"回越",SPECIAL:"特休",PUBLIC:"國公假",WEEKEND:"例假日",EMPTY:" "}[cell.code]);
                return <td key={k} className={clsx("border p-1 text-center align-top", codeStyle[cell.code])}>{text}</td>;
              })}
              <td className="border p-2">{r.remark ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
