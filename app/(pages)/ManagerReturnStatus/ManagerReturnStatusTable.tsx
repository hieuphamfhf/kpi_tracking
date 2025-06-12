import { ManagerReturnStatusListResType } from "@/app/schemaValidations/ManagerReturnStatus";
import { FileOutputIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { exportToExcel } from "@/components/excelExportService";
import GenericTable from "@/components/GenericTable";
import FilterBar from "@/components/FilterBar";
import { Toaster } from "react-hot-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import LogoLoading from "@/components/LogoLoading";
import { useState } from "react"; // Đảm bảo đã import
// Component hiển thị bảng nhắc nhở follow-up và bộ lọc tìm kiếm
export default function ManagerReturnStatusTable({
    ManagerReturnStatus,
    onStartDate,
    onEndDate,
    onDepartment,
    onCompany,
    company,
    department,
    loading,
    empid,
    setEmpid,
    nm,
    setNm,
}: {
    ManagerReturnStatus: ManagerReturnStatusListResType;
    onStartDate: (value: string) => void;
    onEndDate: (value: string) => void;
    onDepartment: (value: string) => void;
    onCompany: (value: string) => void;
    company: string;
    department: string;
    loading: boolean; //  thêm kiểu cho prop
    empid: string;
    setEmpid: (v: string) => void;
    nm: string;
    setNm: (v: string) => void;
}) {
    // Header cho xuất Excel và hiển thị bảng
    const headers = {
        empid: "員工編號 (Mã nhân viên)",
        nm: "姓名 (Họ tên)",
        foldat: "職稱 (Chức vụ)",
        dp: "部門代號 (Mã bộ phận)",
        dpnm: "部門名稱 (Tên bộ phận)",
        cancdat: "返台探親起訖日_startDay_endDay",
        // newdutid: "新職務代號",
        // newdutnm: "新職務名稱",
        // vhno: "案件編號",
        // kd: "類別",
        // sumr: "摘要",
        // cnt: "催辦次數",
        // foldat: "催辦日",
        // cancdat: "銷案日",
    };
    // Hàm xử lý xuất Excel từ bảng hiện tại
    const handleExportToExcel = () => {
        exportToExcel(ManagerReturnStatus, headers, "高階主管行蹤查詢");
    };
    const [status, setStatus] = useState<string>("");
    const [newdutnm, setNewdutnm] = useState("");

    return (
        <>
            <div className="flex items-center py-2 justify-between">
                <FilterBar
                    // company={company}
                    department={department}
                    company=""
                    onCompanyChange={() => { }}
                    showCompanyFilter={false}
                    onDepartmentChange={onDepartment}
                    onDateChange={(from, to) => {
                        onStartDate(from);
                        onEndDate(to);
                    }}
                    dateMode="single"
                    // showSearch={false} //  Không hiển thị ô tìm kiếm

                    empid={empid}
                    onEmpidChange={setEmpid}
                    showEmpidFilter={true}
                    nm={nm}
                    onNmChange={setNm}
                    showNmFilter={true}

                    showStatusFilter={true}
                    status={status}
                    onStatusChange={setStatus}
                    newdutnm={newdutnm}
                    onNewdutnmChange={setNewdutnm}
                    showNewdutnmFilter={true}
                />

                {/* Nút xuất dữ liệu ra Excel */}
                <Button
                    onClick={handleExportToExcel}
                    className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center"
                // disabled={!company}
                >
                    <FileOutputIcon className="mr-2 h-4 w-4" />
                    匯出到 Excel
                </Button>
                <Toaster position="bottom-right" reverseOrder={false} />
            </div>
            {/* Bảng dữ liệu hiển thị với scroll ngang */}
            <ScrollArea className="w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border">
                <div className="min-w-[1000px]">
                    {loading ? (
                        <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
                            <LogoLoading />
                        </div>
                    ) : (
                        <GenericTable headers={headers} data={ManagerReturnStatus || []} />
                    )}



                    {/* <GenericTable headers={headers} data={ManagerReturnStatus || []} /> */}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
