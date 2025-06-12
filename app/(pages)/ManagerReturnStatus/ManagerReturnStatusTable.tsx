import { FileOutputIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { exportToExcel } from "@/components/excelExportService";
import GenericTable from "@/components/GenericTable";
import FilterBar from "@/components/FilterBar";
import { Toaster } from "react-hot-toast";
import LogoLoading from "@/components/LogoLoading";

// Định nghĩa header cho xuất excel và bảng
const headers = {
    empid: "員工編號",
    nm: "姓名",
    dp: "部門代號",
    dpnm: "部門名稱",
    newdutnm: "職稱",
    backfrdat: "在台起日",
    backtodat: "在台迄日",
    // Thêm các trường khác nếu muốn
};

export default function ManagerReturnStatusTable({
    ManagerReturnStatus,
    loading,
    empid,
    setEmpid,
    qrydat,
    setQrydat,
    status,
    setStatus,
    JPNM,
    setJPNM,
}: {
    ManagerReturnStatus: any[];
    loading: boolean;
    empid: string;
    setEmpid: (v: string) => void;
    qrydat: string;
    setQrydat: (v: string) => void;
    status: string;
    setStatus: (v: string) => void;
    JPNM: string;
    setJPNM: (v: string) => void;
}) {
    // Xuất excel
    const handleExportToExcel = () => {
        exportToExcel(ManagerReturnStatus, headers, "高階主管行蹤查詢");
    };

    return (
        <>
            <div className="flex items-center py-2 justify-between">
                <FilterBar
                    // ====== Bộ lọc mã nhân viên ======
                    empid={empid}
                    onEmpidChange={setEmpid}
                    showEmpidFilter={true}

                    // ====== Bộ lọc trạng thái ======
                    status={status}
                    onStatusChange={setStatus}
                    showStatusFilter={true}

                    // ====== Bộ lọc chức vụ/cấp bậc ======
                    newdutnm={JPNM}
                    onNewdutnmChange={setJPNM}
                    showNewdutnmFilter={true}

                    // ====== Bộ lọc ngày tra cứu ======
                    dateMode="single"
                    onDateChange={from => setQrydat(from)}

                    // ====== Ẩn các bộ lọc không dùng (bắt buộc truyền để không lỗi) ======
                    showCompanyFilter={false}
                    showDepartmentFilter={false}
                    showNmFilter={false}
                    showSearch={false}
                    company=""
                    onCompanyChange={() => { }}
                    department=""
                    onDepartmentChange={() => { }}
                    // ====== HẾT PHẦN BẮT BUỘC ======
                />


                <Button
                    onClick={handleExportToExcel}
                    className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center"
                >
                    <FileOutputIcon className="mr-2 h-4 w-4" />
                    匯出到 Excel
                </Button>
                <Toaster position="bottom-right" reverseOrder={false} />
            </div>
            <ScrollArea className="w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border">
                <div className="min-w-[1000px]">
                    {loading ? (
                        <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
                            <LogoLoading />
                        </div>
                    ) : (
                        <GenericTable headers={headers} data={ManagerReturnStatus || []} />
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
