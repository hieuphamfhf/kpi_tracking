import React from "react";
import { exportToExcel } from "@/components/excelExportService";
import LogoLoading from "@/components/LogoLoading";
import FilterBar from "@/components/FilterBar";
import LeaveCalendarMatrix, { CellData } from "@/components/LeaveCalendarMatrixProps"; // ma trận tuần:contentReference[oaicite:2]{index=2}
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

  // --- tuỳ chọn khác (đã có sẵn nhưng để optional để không bắt buộc truyền từ page.tsx) ---
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
  calendarValues
}: Props) {

  // (tuỳ chọn) nếu cần export ma trận sau này có thể dùng service này
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
  const computeDefaultRange = () => {
    const today = new Date();
    const s = new Date(today);
    s.setDate(s.getDate() - (s.getDay() === 0 ? 6 : s.getDay() - 1)); // về thứ 2
    const e = new Date(s);
    e.setDate(e.getDate() + 27); // 4 tuần
    return { s, e };
  };

  const { s, e } = computeDefaultRange();


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
          showNmFilter={true}

          // --- Trạng thái (tuỳ chọn) ---
          status={status}
          onStatusChange={onStatusChange}
          showStatusFilter={!!onStatusChange}

          // --- Chức vụ/cấp bậc ---
          newdutnm={newdutnm}
          onNewdutnmChange={onNewdutnmChange}
          showNewdutnmFilter={true}

          // --- Khoảng ngày: dùng RANGE để vẽ ma trận ---
          dateMode="range"
          onDateChange={(from, to) => onDateChange?.(from, to)}  // giá trị yyyyMMdd bắn lên; bạn map ở page.tsx:contentReference[oaicite:3]{index=3}
        />
      </div>
      <ScrollArea className="w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border">
        <div className="w-full rounded-md border">
          {loading ? (
            <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
              <LogoLoading />
            </div>
          ) : (
            <LeaveCalendarMatrix
              startDate={startDate ?? s}     // có thể truyền từ page.tsx
              endDate={endDate ?? e}
              values={calendarValues ?? {}}  // map dữ liệu API -> Record<YYYY-MM-DD, CellData>
              autoSundayWeeklyOff
            />
          )}
        </div>
      </ScrollArea>
      {/*  THAY BẢNG CŨ BẰNG MA TRẬN TUẦN */}

    </>
  );
}
