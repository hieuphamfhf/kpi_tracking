import { FamilyVisitListResType } from "@/app/schemaValidations/FamilyVisit";
import { FileOutputIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { exportToExcel } from "@/components/excelExportService";
import GenericTable from "@/components/GenericTable";
import { Toaster } from "react-hot-toast";
import LogoLoading from "@/components/LogoLoading";
import EmployeeFilterBar from "@/components/EmployeeFilterBar";

export default function FamilyVisitTable({
    FamilyVisit,
    onEmpidChange,
    onNmChange,
    onDpChange,
    onDpnmChange,
    onNewdutnmChange,
    empid,
    nm,
    dp,
    dpnm,
    newdutnm,
    loading,
    onRowClick, // Thêm prop này
}: {
    FamilyVisit: any[],
    onEmpidChange: (v: string) => void,
    onNmChange: (v: string) => void,
    onDpChange: (v: string) => void,
    onDpnmChange: (v: string) => void,
    onNewdutnmChange: (v: string) => void,
    empid: string,
    nm: string,
    dp: string,
    dpnm: string,
    newdutnm: string,
    loading: boolean,
     onRowClick?: (item: any) => void; // Khai báo type prop mới
}) {
    // Header cho xuất Excel và hiển thị bảng
    const headers = {
        empid: "員工編號",      // Mã nhân viên
        nm: "姓名",            // Tên nhân viên
        dp: "部門代號",         // Mã phòng ban
        dpnm: "部門名稱",       // Tên phòng ban
        newdutid: "新職稱代號", // Mã chức vụ mới
        newdutnm: "新職稱名稱"  // Tên chức vụ mới
    };

    // Hàm xử lý xuất Excel từ bảng hiện tại
    const handleExportToExcel = () => {
        exportToExcel(FamilyVisit, headers, "8_探親單查詢畫面");
    };

    return (
        <>
            <div className="flex items-center py-2 justify-between">
                {/* Bộ lọc tìm kiếm */}
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
                />
                {/* Nút xuất Excel */}
                <Button
                    onClick={handleExportToExcel}
                    className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center"
                    disabled={loading}
                >
                    <FileOutputIcon className="mr-2 h-4 w-4" />
                    匯出到 Excel
                </Button>
                <Toaster position="bottom-right" reverseOrder={false} />
            </div>
            {/* Bảng dữ liệu */}
            <ScrollArea className="w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border">
                <div className="min-w-[1000px]">
                    {loading ? (
                        <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
                            <LogoLoading />
                        </div>
                    ) : (
                        // <GenericTable headers={headers} data={FamilyVisit || []} />
                        <GenericTable headers={headers} data={FamilyVisit || []} onRowClick={onRowClick} />
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
