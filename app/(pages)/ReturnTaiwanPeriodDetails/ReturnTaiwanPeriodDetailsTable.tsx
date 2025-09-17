import React, { useMemo } from "react";
import { exportToExcel } from "@/components/excelExportService";
import LogoLoading from "@/components/LogoLoading";
import FilterBar from "@/components/FilterBar";
import LeaveCalendarMatrix, { CellData, DayType, badgeText, badgeStyle } from "@/components/LeaveCalendarMatrixProps";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileOutputIcon, SaveIcon } from "lucide-react";
import EmployeeFilterBar from "@/components/EmployeeFilterBar";

type Props = {
  ReturnTaiwanPeriodDetails: any[];
  // --- các handler filter nhân sự ---
  onEmpidChange: (v: string) => void;
  onNmChange: (v: string) => void;
  onDpChange: (v: string) => void;
  onDpnmChange: (v: string) => void;
  onNewdutnmChange: (v: string) => void;

  // --- giá trị filter hiện tại ---
  empid: string;
  nm: string;
  dp: string;
  dpnm: string;
  newdutnm: string;

  // --- trạng thái tải dữ liệu ---
  loading: boolean;


  onRowClick?: (item: any) => void;
  page?: number;
  pageSize?: number;

  // thêm các prop tuỳ chọn cho FilterBar & ma trận tuần
  onCompanyChange?: (v: string) => void;
  onStatusChange?: (v: string) => void;
  onDateChange?: (from: string, to: string) => void;
  company?: string;
  status?: string;

  // khoảng ngày & dữ liệu để vẽ ma trận
  startDate?: string | Date;
  endDate?: string | Date;
  calendarValues?: Record<string, CellData>;
  onSaveNotes?: (edited: Record<string, string>) => Promise<void>;
};

export default function ReturnTaiwanPeriodDetailsTable({
  ReturnTaiwanPeriodDetails,
  onEmpidChange, onNmChange, onDpChange, onDpnmChange, onNewdutnmChange,
  empid, nm, dp, dpnm, newdutnm,
  loading,
  // optional
  onRowClick,
  page = 1,
  pageSize = 50,
  // optional cho FilterBar
  onCompanyChange,
  onStatusChange,
  onDateChange,
  company,
  status,
  // dữ liệu cho ma trận
  startDate,
  endDate,
  calendarValues,
  onSaveNotes
}: Props) {

  const headers = {
    empid: "員工編號",
    nm: "姓名",
    dp: "部門代號",
    dpnm: "部門名稱",
    newdutid: "新職稱代號",
    newdutnm: "新職稱名稱"
  };
  const handleExportToExcel = () => {
    exportToExcel(ReturnTaiwanPeriodDetails, headers, "8_探親單查詢畫面");
  };


  // fallback khoảng ngày nếu cha chưa truyền: 4 tuần bắt đầu từ tuần hiện tại
  // const computeDefaultRange = () => {
  //   const today = new Date();
  //   const s = new Date(today);
  //   s.setDate(s.getDate() - (s.getDay() === 0 ? 6 : s.getDay() - 1)); // về thứ 2
  //   const e = new Date(s);
  //   e.setDate(e.getDate() + 27); // 4 tuần
  //   return { s, e };
  // };

  // const { s, e } = computeDefaultRange();

  const [editedNotes, setEditedNotes] = React.useState<Record<string, string>>({});

  const onNoteChange = (iso: string, v: string) => {
    setEditedNotes(prev => ({ ...prev, [iso]: v }));
  };

  const handleSave = async () => {
    if (!onSaveNotes) return;
    await onSaveNotes(editedNotes);
    setEditedNotes({}); // clear sau khi lưu
  };


  // const summaryCounts = useMemo(() => {
  //   const counts: Partial<Record<DayType, number>> = {};
  //   Object.values(calendarValues ?? {}).forEach(v => {
  //     if (!v?.type) return;
  //     if (v.type === "WEEKLY_OFF") return; // chỉ bỏ Chủ nhật
  //     counts[v.type] = (counts[v.type] ?? 0) + 1;
  //   });
  //   return counts;
  // }, [calendarValues]);

  const countWorkingDaysInRange = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate as any);
    const e = new Date(endDate as any);
    let n = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) n++; // bỏ Chủ nhật
    }
    return n;
  }, [startDate, endDate]);

  const summaryCounts = React.useMemo(() => {
    // const counts: Partial<Record<DayType, number>> = {};
    // // Đếm tất cả loại phép (bỏ CN)
    // Object.values(calendarValues ?? {}).forEach(v => {
    //   if (!v?.type) return;
    //   if (v.type === "WEEKLY_OFF") return; // bỏ Chủ nhật
    //   counts[v.type] = (counts[v.type] ?? 0) + 1;
    // });
    
    const counts: Record<string, number> = {};
    Object.values(calendarValues ?? {}).forEach(v => {
      if (v?.type === "WEEKLY_OFF") return;
      if (v?.type) {
        counts[v.type] = (counts[v.type] ?? 0) + 1;
      } else if (v?.badgeLabel) {
        const key = v.badgeLabel.trim(); // mỗi offidnm = 1 key riêng
        counts[key] = (counts[key] ?? 0) + 1;
      }
    });

    // WORK = (tổng ngày làm việc trong khoảng, bỏ CN) - (mọi ngày có type khác WORK)
    const nonWorkDays =
      Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
    const workDays = Math.max(0, countWorkingDaysInRange - nonWorkDays);

    if (startDate && endDate) {
      counts.WORK = workDays as any; // hiển thị badge “出勤”
    }
    return counts;
  }, [calendarValues, startDate, endDate, countWorkingDaysInRange]);

  return (
    <>
      {/* HEADER FILTER */}
      <div className="flex items-center py-2 justify-between">
        <EmployeeFilterBar
          empid={empid}
          nm={nm}
          dp={dp}
          dpnm={dpnm}
          newdutnm={newdutnm}
          onEmpidChange={onEmpidChange}
          onNmChange={onNmChange}
          onDpChange={onDpChange}
          onDpnmChange={onDpnmChange}
          onNewdutnmChange={onNewdutnmChange}
          showDate
          dateMode="range"
          onDateChange={(from, to) => onDateChange?.(from, to)}

        />
      </div>



      {/* Chỉ hiện nút Lưu & ma trận khi đã đủ filter */}
      {empid && startDate && endDate ? (
        <>
          <div className="flex items-center justify-end mb-2">
            <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
              <SaveIcon className=" h-4 w-4" />
              儲存
            </Button>
          </div>

          <ScrollArea className="w-full h-[calc(100vh-16rem)] rounded-md border overflow-auto">
            <div className="min-w-[1100px]">
              {loading ? (
                <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
                  <LogoLoading />
                </div>
              ) : (
                <LeaveCalendarMatrix
                  startDate={startDate}
                  endDate={endDate}
                  values={calendarValues ?? {}}
                  autoSundayWeeklyOff
                  onNoteChange={onNoteChange}
                  editedNotes={editedNotes}
                  summaryCounts={summaryCounts}
                />
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

        </>
      ) : (
        // Placeholder khi chưa nhập filter
        <div className="mt-3 p-4 rounded border bg-white text-sm text-gray-600">
          請先輸入 <span className="font-semibold">員工編號</span> 並選擇 <span className="font-semibold">期間</span> 才能顯示資料與備註欄位。
        </div>
      )}
    </>
  );
}