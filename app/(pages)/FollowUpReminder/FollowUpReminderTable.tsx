import { FollowUpReminderListResType } from "@/app/schemaValidations/FollowUpReminder";
import { FileOutputIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { exportToExcel } from "@/components/excelExportService";
import GenericTable from "@/components/GenericTable";
import FilterBar from "@/components/FilterBar";
import { Toaster } from "react-hot-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import LogoLoading from "@/components/LogoLoading";
// Component hiển thị bảng nhắc nhở follow-up và bộ lọc tìm kiếm
export default function FollowUpReminderTable({
    FollowUpReminder,
    onStartDate,
    onEndDate,
    onDepartment,
    onCompany,
    company,
    department,
    loading,
}: {
    FollowUpReminder: FollowUpReminderListResType;
    onStartDate: (value: string) => void;
    onEndDate: (value: string) => void;
    onDepartment: (value: string) => void;
    onCompany: (value: string) => void;
    company: string;
    department: string;
    loading: boolean; //  thêm kiểu cho prop
}) {
    // Header cho xuất Excel và hiển thị bảng
    const headers = {
        co: "公司",
        dp: "部門代號",
        dpnm: "部門名稱",
        empid: "VNW帳號",
        nm: "姓名",
        cptopnm: "案件名稱",
        newdutid: "新職務代號",
        newdutnm: "新職務名稱",
        vhno: "案件編號",
        kd: "類別",
        sumr: "摘要",
        cnt: "催辦次數",
        foldat: "催辦日",
        cancdat: "銷案日",
    };
    // Hàm xử lý xuất Excel từ bảng hiện tại
    const handleExportToExcel = () => {
        exportToExcel(FollowUpReminder, headers, "多次催辦案件查詢");
    };

    return (
        <>
            <div className="flex items-center py-2 justify-between">

                <FilterBar
                    company={company}
                    department={department}
                    onCompanyChange={(selected) => {
                        if (selected === "ALL") {
                            onCompany("");
                            onDepartment("");
                        } else {
                            onCompany(selected);
                            onDepartment("");// Reset bộ phận khi đổi công ty
                        }
                    }}
                    onDepartmentChange={onDepartment}
                    onDateChange={(from, to) => {
                        onStartDate(from);
                        onEndDate(to);
                    }}
                //  showSearch={false} //  Không hiển thị ô tìm kiếm
                />
                {/* Nút xuất dữ liệu ra Excel */}
                <Button
                    onClick={handleExportToExcel}
                    className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center"
                    disabled={!company}
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
                    ) : FollowUpReminder?.length ? (
                         <GenericTable headers={headers} data={FollowUpReminder || []} />
                    ) : (
                        <div className="text-center text-gray-400 py-4">Không có dữ liệu</div>
                    )}


                    {/* <GenericTable headers={headers} data={FollowUpReminder || []} /> */}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
