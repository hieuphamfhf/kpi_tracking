import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";


export const exportToExcel = (data: any[], headers: Record<string, string>, fileName: string) => {
    try {
        // Tạo mảng dữ liệu với các tiêu đề tiếng Trung (hoặc tiêu đề tùy chỉnh)
        const dataWithHeaders = data.map(item => {
            const formattedItem: Record<string, any> = {};
            for (const key in headers) {
                // Nếu item có thuộc tính key, gán vào tiêu đề tương ứng trong headers
                formattedItem[headers[key]] = item[key];
            }
            return formattedItem;
        });

        // Tạo worksheet và workbook cho file Excel
        const ws = XLSX.utils.json_to_sheet(dataWithHeaders);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Xuất file Excel
        XLSX.writeFile(wb, `${fileName}.xlsx`);
       // Show success notification
       toast.success('匯出 Excel 成功!');

    } catch (error) {
         // Show error notification if export fails
         toast.error('匯出 Excel 時發生錯誤');
    }
};