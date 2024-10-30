import { MonthlyKPIListResType } from "@/app/schemaValidations/MonthlyKPI";
import { cn } from "@/lib/utils";
import { DepartmentListResType } from "@/app/schemaValidations/department";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx"; // Import XLSX for Excel export
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CalendarRangeIcon, FileOutputIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth, format } from 'date-fns';
// import { endOfMonth, format, startOfMonth } from 'date-fns';
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Toaster, toast } from 'react-hot-toast';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Import icon Search từ lucide-react
export default function MonthlyKPITable({ MonthlyKPI, onStartYM, onDepartment, onCompany, company }: {
    MonthlyKPI: MonthlyKPIListResType;
    onStartYM: (value: string) => void;
    // onEndYM: (value: string) => void;
    onDepartment: (value: string) => void;
    onCompany: (value: string) => void;
    company: string; // Thêm prop công ty vào component con
}) {

    const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);
    const [department, setDepartment] = useState<string>(''); // Lưu giá trị mã bộ phận từ dropdown hoặc input
    const [searchQuery, setSearchQuery] = useState<string>(''); // Lưu từ khóa tìm kiếm
    const isDatePickerDisabled = !(searchQuery || department); // Bộ lọc thời gian chỉ mở khi có giá trị trong ô tìm kiếm hoặc dropdown
    // const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    // const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState<string>(""); // Không có giá trị mặc định cho năm
    const [selectedMonth, setSelectedMonth] = useState<string>(""); // Không có giá trị mặc định cho tháng
    const [startYear, setStartYear] = useState<string>(""); // Năm bắt đầu
    const [startMonth, setStartMonth] = useState<string>(""); // Tháng bắt đầu
    // const [endYear, setEndYear] = useState<string>(""); // Năm kết thúc
    // const [endMonth, setEndMonth] = useState<string>(""); // Tháng kết thúc
    const [startYM, setStartYM] = useState<string>(""); // Không đặt giá trị mặc định
    const [endYM, setEndYM] = useState<string>(""); // Không đặt giá trị mặc định
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const isTimeFilterSelected = startYear && startMonth; // Kiểm tra đã chọn đủ thời gian chưa
    const isExportDisabled = !(company && department && isTimeFilterSelected);


    // Fetch danh sách bộ phận từ API
    useEffect(() => {
        if (company) {
            fetchDepartmentsByCompany(); // Gọi hàm mà không truyền tham số vào
        }
    }, [company]);

    type Department = {
        co: string;  // Mã công ty
        dp: string;  // Mã bộ phận
        dpnm: string; // Tên bộ phận
    };

    const fetchDepartmentsByCompany = async () => {
        try {
            const { payload }: { payload: Department[] } = await departmentApiRequest.getList();
            const filtered = payload.filter((department: Department) => department.co === company); // Sử dụng code công ty dưới dạng chuỗi
            setFilteredDepartments(filtered); // Cập nhật danh sách bộ phận
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bộ phận: ', error);
        }
    };
    // Hàm xử lý nút hiển thị thời gian đã chọn
    const getSelectedDateRange = () => {
        if (startYear && startMonth) {
            return `從 ${startMonth}/${startYear}`;
        }
        return "選擇時間";
    };

    /**
     * Chuyển đổi số giờ thập phân thành chuỗi định dạng "X ngày Y giờ Z phút"
     * @param {number} hoursDecimal - Số giờ ở dạng thập phân
     * @returns {string} Chuỗi định dạng "X ngày Y giờ Z phút"
     */
    const formatDaysHoursMinutes = (hoursDecimal: number): string => {
        // Kiểm tra nếu đầu vào không hợp lệ (không phải số hoặc nhỏ hơn 0)
        if (isNaN(hoursDecimal) || hoursDecimal < 0) {
            return "Dữ liệu không hợp lệ";
        }

        // Tính số ngày và số giờ còn lại
        const days = Math.floor(hoursDecimal / 24);
        const remainingHoursDecimal = hoursDecimal % 24; // Giờ còn lại sau khi lấy phần ngày
        const hours = Math.floor(remainingHoursDecimal); // Lấy phần nguyên làm giờ
        const minutes = Math.round((remainingHoursDecimal - hours) * 60); // Phần thập phân chuyển thành phút

        // Tạo chuỗi kết quả với ngày, giờ và phút
        let result = "";
        if (days > 0) result += `${days} ngày `;
        result += `${hours} giờ ${minutes} phút`;

        return result;
    };


    // Hàm cập nhật thời gian bắt đầu
    const handleStartYearChange = (year: string) => {
        console.log("Selected Year:", year); // Log để kiểm tra
        setStartYear(year);
        if (startMonth) {
            const threeDigitYear = year.slice(-3);
            onStartYM(`${threeDigitYear}${startMonth}`);
        }
    };

    const handleStartMonthChange = (month: string) => {
        console.log("Selected Month:", month); // Log để kiểm tra
        const paddedMonth = month.padStart(2, '0');
        setStartMonth(paddedMonth);
        if (startYear) {
            const threeDigitYear = startYear.slice(-3);
            onStartYM(`${threeDigitYear}${paddedMonth}`);
        }
    };




    const handleCompanyChange = (selectedCompany: string) => {
        if (selectedCompany === "ALL") {
            onCompany(''); // Reset công ty
            onDepartment(''); // Reset bộ phận
            setDepartment(''); // Xóa lựa chọn bộ phận
            setSearchQuery(''); // Xóa từ khóa tìm kiếm
            setFilteredDepartments([]); // Xóa danh sách bộ phận
        } else {
            onCompany(selectedCompany); // Cập nhật công ty đã chọn
            onDepartment(''); // Xóa bộ phận khi chọn công ty mới
            setDepartment(''); // Reset state bộ phận
            setSearchQuery(''); // Reset state từ khóa tìm kiếm
            fetchDepartmentsByCompany(); // Lấy bộ phận theo công ty đã chọn
        }
    };

    // Hàm này xử lý cả khi chọn từ dropdown lẫn nhập vào ô tìm kiếm
    const handleDepartmentChange = (value: string) => {
        setDepartment(value); // Cập nhật mã bộ phận khi chọn từ dropdown
        setSearchQuery(value); // Đồng bộ với ô tìm kiếm
        onDepartment(value); // Gọi callback để cập nhật mã bộ phận
    };
    // Xử lý tìm kiếm khi người dùng nhập mã bộ phận
    const handleSearch = (upperCaseQuery: string) => {
        setDepartment(upperCaseQuery);  // Cập nhật mã bộ phận với giá trị đã chuyển thành chữ hoa
        onDepartment(upperCaseQuery);   // Gọi callback để cập nhật mã bộ phận

        // Nếu nhập từ khóa, lọc danh sách bộ phận hiện có theo công ty đã chọn
        if (departmentList && upperCaseQuery) {
            const filtered = departmentList.filter(dept =>
                dept.co === company && // Chỉ lấy bộ phận thuộc công ty đã chọn
                (dept.dpnm.toLowerCase().startsWith(upperCaseQuery.toLowerCase()) || dept.dp.startsWith(upperCaseQuery))
            );
            setFilteredDepartments(filtered); // Cập nhật danh sách bộ phận đã lọc
        } else {
            setFilteredDepartments(departmentList?.filter(dept => dept.co === company) || []); // Lọc theo công ty đã chọn
        }
    };


    useEffect(() => {
        const fetchItem = async () => {
            try {
                const { payload } = await departmentApiRequest.getList();
                if (payload)
                    setDepartmentList(payload);
            } catch (error) {
                console.error('edit page: ', error);
                setDepartmentList(null);
            }
        };
        fetchItem();
    }, []);

    const [date, setDate] = useState<Date | undefined>(startOfMonth(new Date()));


    const handleChangeDepartment = (department: string) => {

        console.log("Selected department:", department); // Log the selected department 
        onDepartment(department);
    };

    // Hàm cập nhật ngày khi người dùng chọn ngày bắt đầu
    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate); // Đảm bảo `newDate` là một `Date` hoặc `undefined`

        if (newDate) {
            const formattedStartYM = format(newDate, "yyyyMM");
            onStartYM(formattedStartYM.substring(1)); // Chỉ cần cập nhật ngày bắt đầu
        }
    };


    const handleExportToExcel = () => {
        try {
            const headerRow1 = [
                "公司", "部門", "部門名稱", "剩餘換休未休時數", "", "識別證異常率(借用臨時卡及忘刷卡查詢)", "", 
                "文書催辦率(多次催辦案件查詢)", "", "訓練計畫完成率", "", "加班未於事前填單異常次數", ""
            ];
            
            const headerRow2 = [
                "", "", "", "剩餘可換休時數_ofF12REM", "前一月剩餘可換休時數_ofF12REM_PREVIOUSYM",
                "異常卡率_abnmormaL_CARD_RATE", "公司平均值", 
                "跟進異常率_followuP_ABNMORMAL_RATE_", "公司平均值", 
                "訓練完成率_traininG_FINISHD_RATE", "公司平均值", 
                "加班未於事前填單查詢_overtimedutY_COUNT", "公司合計T"
            ];
    
            const data = MonthlyKPI?.map((item, index) => [
                index + 1,
                item.dp || '',
                item.dpnm || '',
                item.ofF12REM || '',
                item.ofF12REM_PREVIOUSYM || '',
                item.abnmormaL_CARD_RATE || '',
                '',  
                item.followuP_ABNMORMAL_RATE || '',
                '',  
                item.traininG_FINISHD_RATE || '',
                '',  
                item.overtimedutY_COUNT || '',
                ''   
            ]);
    
            const wsData = [headerRow1, headerRow2, ...data];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
    
            ws['!merges'] = [
                { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, 
                { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } },
                { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } },
                { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } },
                { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } }
            ];
    
            const refValue = ws['!ref'] || "A1";
            const range = XLSX.utils.decode_range(refValue);
    
            const headerCellStyle = {
                font: { bold: true },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "FFFFAA00" } }
            };
    
            for (let row = 0; row <= 1; row++) {  
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!ws[cellAddress]) ws[cellAddress] = {};  
                    ws[cellAddress].s = headerCellStyle;
                }
            }
    
            ws['!freeze'] = { xSplit: 0, ySplit: 2 };
    
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "6_剩餘換休未休時數報表");
            XLSX.writeFile(wb, "6_剩餘換休未休時數報表.xlsx");
            toast.success('匯出 Excel 成功!');
        } catch (error) {
            toast.error('匯出 Excel 時發生錯誤');
        }
    };
    
        
    


    return (
        <>
            <div className="flex items-center py-2 justify-between">
                <div className="flex gap-5">

                    {/* Dropdown để chọn công ty */}
                    <Select
                        onValueChange={handleCompanyChange}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="--選擇公司--" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* <SelectItem key="all" value="ALL">--所有公司--</SelectItem> */}
                            <SelectItem key="lg" value="LG">LG</SelectItem>
                            <SelectItem key="OD" value="OD">OD</SelectItem>
                            <SelectItem key="LT" value="LT">LT</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Ô nhập liệu tìm kiếm */}
                    <div className="relative w-[200px]">
                        {/* Icon tìm kiếm */}
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="輸入部門代號..."
                            value={searchQuery}
                            onChange={(e) => {
                                const upperCaseValue = e.target.value.toUpperCase(); // Chuyển thành chữ hoa ngay khi người dùng nhập
                                setSearchQuery(upperCaseValue); // Cập nhật giá trị vào state
                                handleSearch(upperCaseValue);  // Gọi hàm tìm kiếm với giá trị đã chuyển đổi
                            }}
                            className={`pr-8 pl-3 ${company && !department ? 'border-2 border-red-500' : ''}`} // Thêm padding-left cho icon
                            disabled={!company} // Vô hiệu hóa nếu chưa chọn công ty
                        />
                    </div>
                    {/* Dropdown để chọn bộ phận */}
                    <Select
                        onValueChange={handleDepartmentChange}
                        value={department || ''} // Đồng bộ với state department
                        disabled={!company} // Vô hiệu hóa nếu chưa chọn công ty
                    >
                        <SelectTrigger className={`w-[300px] ${company && !department ? 'border-2 border-red-500' : ''}`}>
                            <SelectValue placeholder={company ? "--選擇部門--" : "請先選擇公司"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                            <div className="max-h-48 overflow-y-auto">
                                {filteredDepartments?.map((item, index) => (
                                    <SelectItem key={index} value={item.dp}>
                                        {item.dpnm} - {item.dp}
                                    </SelectItem>
                                ))}
                            </div>
                        </SelectContent>
                    </Select>
                    {/* Dropdown để chọn khoảng thời gian */}
                    <Popover open={isPopoverOpen && !!company} // Chỉ mở Popover nếu có công ty
                        onOpenChange={(open) => setIsPopoverOpen(open)}>
                        <PopoverTrigger asChild>
                            <Button
                                disabled={!company} // Vô hiệu hóa nút khi chưa chọn công ty
                                className={`w-[200px] py-2 px-4 flex items-center transition-colors duration-200 bg-gray-100 text-black hover:bg-gray-300 ${company && !isTimeFilterSelected ? 'border-2 border-red-500' : ''
                                    } ${!company ? 'cursor-not-allowed' : ''}`}
                            >
                                {getSelectedDateRange()}
                                <CalendarRangeIcon className="ml-2 h-5 w-5" /> {/* Icon đồng hồ bên trái */}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent>
                            {/* Nhóm thời gian bắt đầu */}
                            <div className="mb-4">
                                <p className="font-semibold">開始時間</p>
                                <div className="flex gap-2">
                                    <Select onValueChange={handleStartYearChange} value={startYear}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="年" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(5)].map((_, idx) => {
                                                const year = String(new Date().getFullYear() - idx);
                                                return <SelectItem key={year} value={year}>{year}</SelectItem>;
                                            })}
                                        </SelectContent>
                                    </Select>

                                    <Select onValueChange={handleStartMonthChange} value={startMonth}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="月" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                    {`月 ${i + 1}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                </div>
                <Button
                    onClick={handleExportToExcel}
                    className={`py-2 px-4 transition-colors duration-200 flex items-center ${!(company && department && isTimeFilterSelected) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-black hover:bg-gray-300'}`}
                    disabled={!(company && department && isTimeFilterSelected)}
                >
                    <FileOutputIcon className="mr-2 h-4 w-4" />
                    匯出到 Excel
                </Button>

                <Toaster position="bottom-right" reverseOrder={false} />
            </div>

            <ScrollArea
                className={`w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border 
    ${(company && company !== 'ALL' && !department) ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <div className="min-w-[1000px]"> {/* Đảm bảo bảng không thu nhỏ dưới 1000px */}
                    <Table className="table-auto whitespace-nowrap">
                        <TableHeader className="custom-table-header">

                            <TableRow>
                                <TableHead className="w-16" rowSpan={2}>#</TableHead> {/* Cố định chiều rộng cho các cột */}
                                <TableHead className="w-48" rowSpan={2}>部門_dp</TableHead>
                                <TableHead className="w-48" rowSpan={2}>部門名稱_dpnm</TableHead>
                                <TableHead colSpan={2} className="w-96 text-center">剩餘換休未休時數</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">識別證異常率(借用臨時卡及忘刷卡查詢)</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">文書催辦率(多次催辦案件查詢)</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">訓練計畫完成率</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">加班未於事前填單異常次數</TableHead> {/* Cột cha gộp hai cột con */}

                            </TableRow>
                            <TableRow>
                                <TableHead className="w-48">剩餘可換休時數_ofF12REM</TableHead>
                                <TableHead className="w-48">前一月剩餘可換休時數_ofF12REM_PREVIOUSYM</TableHead>
                                {/* CARD_RATE */}
                                <TableHead className="w-48">異常卡率_abnmormaL_CARD_RATE</TableHead>
                                <TableHead className="w-48">公司平均值</TableHead>
                                {/* followuP */}
                                <TableHead className="w-48">跟進異常率_followuP_ABNMORMAL_RATE_</TableHead>
                                <TableHead className="w-48">公司平均值</TableHead>
                                {/* traininG */}
                                <TableHead className="w-48">訓練完成率_traininG_FINISHD_RATE</TableHead>
                                <TableHead className="w-48">公司平均值</TableHead>
                                {/* overtimedutY */}
                                <TableHead className="w-48">加班未於事前填單查詢_overtimedutY_COUNT</TableHead>
                                <TableHead className="w-48">公司合計T</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="custom-table-body">
                            {MonthlyKPI?.map((item, index) => (
                                <TableRow key={`${item.co}-${item.dp}`}>
                                    <TableCell>{index + 1}</TableCell> {/* Display row index */}
                                    {/* <TableCell>{item.co}</TableCell> */}
                                    <TableCell>{item.dp}</TableCell>
                                    <TableCell>{item.dpnm}</TableCell>
                                    <TableCell>{item.ofF12REM}</TableCell>
                                    <TableCell>{item.ofF12REM_PREVIOUSYM}</TableCell>
                                    <TableCell>{item.abnmormaL_CARD_RATE}</TableCell>
                                    <TableCell>{ }</TableCell>
                                    <TableCell>{item.followuP_ABNMORMAL_RATE}</TableCell>
                                    <TableCell>{ }</TableCell>

                                    <TableCell>{item.traininG_FINISHD_RATE}</TableCell>
                                    <TableCell>{ }</TableCell>
                                    {/* overtimedutY */}
                                    <TableCell>{item.overtimedutY_COUNT}</TableCell>
                                    <TableCell>{ }</TableCell>
                                    {/* Thêm ký tự `%` cho trường `abnmormaL_CARD_RATE` */}
                                    {/* <TableCell>{`${parseFloat(item.abnmormaL_CARD_RATE).toFixed(2)}%`}</TableCell> */}
                                    {/* <TableCell>{item.abnmormaL_CARD_RATE}</TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
