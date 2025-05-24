// app/components/TaiwanPeriodModal.tsx
import React, { useEffect } from "react";
import { ReturnTaiwanPeriodListResType } from "@/app/schemaValidations/ReturnTaiwanPeriod";
import { exportToExcel } from "@/components/excelExportService";
import { Button } from "@/components/ui/button"; // Nếu bạn dùng Button từ shadcn/ui
import { toast } from "react-hot-toast"; // Thêm dòng này nếu chưa có

import * as XLSX from "xlsx"; // nhớ import ở đầu file nếu chưa có
type Props = {
    open: boolean;
    onClose: () => void;
    data: ReturnTaiwanPeriodListResType;
    selectedRow?: any; // Thêm dòng này!
};

const TaiwanPeriodModal: React.FC<Props> = ({ open, onClose, data, selectedRow }) => {
    if (!open) return null;

    const handleExportModalExcel = () => {
        if (!data || data.length === 0) {
            toast.error('資料為空！', { duration: 2000 });
            return;
        }
        const tableHeaderRow = {
            項次: "項次",
            backfrdat: "起日",
            backtodat: "迄日",
            sts: "狀態"
        };

        const headerRow = { 項次: "近1年返台休假資料", backfrdat: "", backtodat: "", sts: "" };
        const infoRow = {
            項次:
                `員工編號：${selectedRow?.empid ?? ""}   ` +
                `姓名：${selectedRow?.nm ?? ""}   ` +
                `部門名稱：${selectedRow?.dpnm ?? ""}   ` +
                `職稱：${selectedRow?.newdutnm ?? ""}`,
            backfrdat: "",
            backtodat: "",
            sts: ""
        };

        const dataForExport = data.map((item, idx) => ({
            項次: idx + 1,
            backfrdat: item.backfrdat,
            backtodat: item.backtodat,
            sts: item.sts
        }));

        // GỘP ĐÚNG THỨ TỰ: tiêu đề lớn, thông tin, header bảng, dữ liệu
        const excelRows = [headerRow, infoRow, tableHeaderRow, ...dataForExport];

        try {
            // Tạo worksheet và workbook
            const ws = XLSX.utils.json_to_sheet(excelRows, { skipHeader: true });
            // Gộp 4 ô tiêu đề thành 1 (A1:D1)
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // merge dòng tiêu đề lớn
                { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }  // merge dòng thông tin cá nhân
            ];


            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            XLSX.writeFile(
                wb,
                `近1年返台休假資料_${selectedRow?.empid || ""}_${selectedRow?.nm || ""}.xlsx`
            );
            toast.success("匯出 Excel 成功!");
        } catch (err) {
            toast.error("匯出 Excel 時發生錯誤");
        }
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
                                <td className={`border px-2 text-center 
  ${item.sts === "核准" ? "text-green-600" : item.sts === "撤單" ? "text-red-500" : ""}
`}>
                                    {item.sts}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mb-2 flex justify-end">
                    <Button
                        size="sm"
                        className="bg-gray-100 text-black px-3 py-1 hover:bg-gray-300"
                        onClick={handleExportModalExcel}
                    >
                        匯出Excel
                    </Button>

                </div>

            </div>
        </div>
    );
};

export default TaiwanPeriodModal;
