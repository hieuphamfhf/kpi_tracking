import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

type ExportModalInfo = {
    // 4 dòng: tiêu đề lớn, thông tin cá nhân, header bảng, dữ liệu
    title: string; // VD: '近1年返台休假資料'
    info: string; // VD: '員工編號：... 姓名：... 部門名稱：... 職稱：...'
    tableHeader: Record<string, string>; // key = key trong data, value = header hiển thị
    data: any[]; // dữ liệu table
    fileName: string;
    mergeCount?: number; // số cột muốn merge (default: 4)
};


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



export const exportModalTableExcel = ({
    title,
    info,
    tableHeader,
    data,
    fileName,
    mergeCount = 4,
}: ExportModalInfo) => {
    try {
        // Dòng tiêu đề lớn (merge đủ số cột)
        const headerRow: Record<string, any> = {};
        const infoRow: Record<string, any> = {};

        const keys = Object.keys(tableHeader);

        headerRow[keys[0]] = title;
        keys.slice(1).forEach(k => (headerRow[k] = ""));

        infoRow[keys[0]] = info;
        keys.slice(1).forEach(k => (infoRow[k] = ""));

        // Dòng tiêu đề bảng
        const tableHeaderRow = { ...tableHeader };

        // Dữ liệu bảng
        const dataForExport = data.map((item, idx) => {
            const row: Record<string, any> = {};
            keys.forEach(k => {
                row[k] = item[k];
            });
            return row;
        });
        // Gộp lại
        const excelRows = [headerRow, infoRow, tableHeaderRow, ...dataForExport];

        // Xuất file
        const ws = XLSX.utils.json_to_sheet(excelRows, { skipHeader: true });
        ws["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: mergeCount - 1 } }, // Tiêu đề lớn
            { s: { r: 1, c: 0 }, e: { r: 1, c: mergeCount - 1 } }, // Info cá nhân
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        toast.success("匯出 Excel 成功!");
    } catch (e) {
        toast.error("匯出 Excel 時發生錯誤");
    }
};



