// app/components/TaiwanPeriodModal.tsx
import React, { useEffect } from "react";
import { ReturnTaiwanPeriodListResType } from "@/app/schemaValidations/ReturnTaiwanPeriod";
import { exportToExcel } from "@/components/excelExportService";
import { Button } from "@/components/ui/button"; // Nếu bạn dùng Button từ shadcn/ui
import { toast } from "react-hot-toast"; // Thêm dòng này nếu chưa có
import { exportModalTableExcel } from "@/components/excelExportService";
import * as XLSX from "xlsx"; // nhớ import ở đầu file nếu chưa có
import { FileOutputIcon } from "lucide-react";
import { useRouter } from "next/navigation"; // thêm
type Props = {
    open: boolean;
    onClose: () => void;
    data: ReturnTaiwanPeriodListResType;
    selectedRow?: any;
};

const TaiwanPeriodModal: React.FC<Props> = ({ open, onClose, data, selectedRow }) => {
    if (!open) return null;
    const router = useRouter(); // thêm
    if (!open) return null;

    const goToDetail = () => {
        if (!selectedRow?.empid) return;
        // Đóng modal trước khi điều hướng (tránh overlay còn treo)
        onClose?.();
           router.push(`/ReturnTaiwanPeriodDetails?admin_key=secret123&empid=${encodeURIComponent(selectedRow.empid)}`);
        // router.push(`/ReturnTaiwanPeriodDetails?admin_key=secret123?empid=${encodeURIComponent(selectedRow.empid)}`);
    };
    const handleExportModalExcel = () => {
        if (!data || data.length === 0) {
            toast.error('資料為空！', { duration: 2000 });
            return;
        }

        const tableHeader = {
            項次: "項次",
            backfrdat: "起日",
            backtodat: "迄日",
            sts: "狀態"
        };

        exportModalTableExcel({
            title: "近1年返台休假資料",
            info:
                `員工編號：${selectedRow?.empid ?? ""}   ` +
                `姓名：${selectedRow?.nm ?? ""}   ` +
                `部門名稱：${selectedRow?.dpnm ?? ""}   ` +
                `職稱：${selectedRow?.newdutnm ?? ""}`,
            tableHeader,
            data: data.map((item, idx) => ({
                項次: idx + 1,
                backfrdat: item.backfrdat,
                backtodat: item.backtodat,
                sts: item.sts
            })),
            fileName: `近1年返台休假資料_${selectedRow?.empid || ""}_${selectedRow?.nm || ""}`,
            mergeCount: 4, // số cột merge
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-xl min-w-[400px]">
                <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-lg">近1年返台休假資料</div>
                    {/* <button onClick={onClose} className="text-xl font-bold">&times;</button> */}
                    <button
                        onClick={onClose}
                        className="text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition"
                    >
                        &times;
                    </button>
                </div>
                {/* Đặt phần thông tin cá nhân ngay dưới tiêu đề */}
                {selectedRow && (
                    <div className="mb-2 px-1 text-base text-gray-700">
                        <span className="font-bold ml-8 font-bold">員工編號：</span>{selectedRow.empid}
                        <span className="ml-4 font-bold ml-8 font-bold">姓名：</span>{selectedRow.nm}
                        <span className="ml-4 font-bold ml-8 font-bold" >部門名稱：</span>{selectedRow.dpnm}
                        <span className="ml-4 font-bold ml-8 font-bold">職稱：</span>{selectedRow.newdutnm}
                    </div>
                )}
                <hr className="my-2" />
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2 border px-2 bg-gray-100">項次</th>
                            <th className="border px-2 border px-2 bg-gray-100">起日</th>
                            <th className="border px-2  border px-2 bg-gray-100">迄日</th>
                            <th className="border px-2 border px-2 bg-gray-100">狀態</th>

                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 text-center">{idx + 1}</td>
                                <td className="border px-2 text-center">{item.backfrdat}</td>
                                <td className="border px-2 text-center">{item.backtodat}</td>
                                {/* <td className="border px-2 text-center">{item.sts}</td> */}
                                <td className={`border px-2 text-center ${item.sts === "核准" ? "text-green-600" : item.sts === "撤單" ? "text-red-500" : ""}`}>
                                    {item.sts}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={goToDetail}
                        className="bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 transition-colors duration-200"
                    >
                        查看詳細
                    </Button>
                    <Button
                        onClick={handleExportModalExcel}
                        className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center"
                    >
                        <FileOutputIcon className="mr-2 h-4 w-4" />
                        匯出到 Excel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TaiwanPeriodModal;
