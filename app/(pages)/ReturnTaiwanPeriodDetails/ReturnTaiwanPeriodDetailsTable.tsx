import React from "react";
import { exportToExcel } from "@/components/excelExportService";
import LogoLoading from "@/components/LogoLoading";
import FilterBar from "@/components/FilterBar";
import LeaveCalendarMatrix, { CellData } from "@/components/LeaveCalendarMatrixProps"; // ma trận tuần:contentReference[oaicite:2]{index=2}
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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


  return (
    <>
      {/* HEADER FILTER */}
      <div className="flex items-center py-2 justify-between">
        <FilterBar
          // --- Công ty (đang ẩn, nên fallback rỗng & no-op để không bắt buộc truyền) ---
          company={company ?? ""}
          onCompanyChange={onCompanyChange ?? (() => { })}
          showCompanyFilter={false}

          // --- Phòng ban (đang ẩn vì màn hình này dùng ma trận theo ngày) ---
          department={dp}
          onDepartmentChange={(v) => onDpChange(v)}
          showDepartmentFilter={false}
          showSearch={false}

          // --- Mã nhân viên (ẩn trong ma trận; để ô tên hiển thị chính) ---
          empid={empid}
          onEmpidChange={(v) => onEmpidChange(v)}
          showEmpidFilter={true}

          // --- Tên nhân viên (giữ lại nếu muốn lọc theo người) ---
          nm={nm}
          onNmChange={(v) => onNmChange(v)}
          showNmFilter={false}

          // --- Trạng thái (tuỳ chọn) ---
          status={status}
          onStatusChange={onStatusChange}
          showStatusFilter={!!onStatusChange}

          // --- Chức vụ/cấp bậc ---
          newdutnm={newdutnm}
          onNewdutnmChange={onNewdutnmChange}
          showNewdutnmFilter={false}

          // --- Khoảng ngày: dùng RANGE để vẽ ma trận ---
          dateMode="range"
          onDateChange={(from, to) => onDateChange?.(from, to)} 
        />
      </div>
      
       {/* Chỉ hiện nút Lưu & ma trận khi đã đủ filter */}
    {empid && startDate && endDate ? (
      <>
        <div className="flex items-center justify-end mb-2">
          <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
            儲存_save
          </Button>
        </div>

        <ScrollArea className="w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border">
          <div className="w-full rounded-md border">
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
              />
            )}
          </div>
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