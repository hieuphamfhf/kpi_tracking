import { ReamingLeaveTimeListResType } from "@/app/schemaValidations/ReamingLeaveTime";
import { cn } from "@/lib/utils";
import { DepartmentListResType } from "@/app/schemaValidations/department";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import * as XLSX from "xlsx"; // Import XLSX for Excel export
import { Button } from "@/components/ui/button";
import { CalendarRangeIcon, FileOutputIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Toaster, toast } from 'react-hot-toast';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LogoLoading from "@/components/LogoLoading";
import GenericTable from "@/components/GenericTable";
import { exportToExcel } from "@/components/excelExportService";
export default function ReamingLeaveTimeTable({ ReamingLeaveTime, onStartYM, onEndYM, onDepartment, onCompany, company,
    loading,
    page = 1,
    pageSize = 50,
}: {
    ReamingLeaveTime: ReamingLeaveTimeListResType;
    onStartYM: (value: string) => void;
    onEndYM: (value: string) => void;
    onDepartment: (value: string) => void;
    onCompany: (value: string) => void;
    company: string;
    loading: boolean;
    page?: number,
    pageSize?: number,



}) {

    const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);
    const [department, setDepartment] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    // const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [startYear, setStartYear] = useState<string>("");
    const [startMonth, setStartMonth] = useState<string>("");
    const [endYear, setEndYear] = useState<string>("");
    const [endMonth, setEndMonth] = useState<string>("");
    const [startYM, setStartYM] = useState<string>("");
    const [endYM, setEndYM] = useState<string>("");
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const isTimeFilterSelected = startYear && startMonth && endYear && endMonth; // Kiểm tra đã chọn đủ thời gian chưa
    const isExportDisabled = !(company && department && isTimeFilterSelected);
    // const isDatePickerDisabled = !(searchQuery || department); // Bộ lọc thời gian chỉ mở khi có giá trị trong ô tìm kiếm hoặc dropdown
    const isDatePickerDisabled = false; // Để bộ chọn ngày luôn hoạt động
    const isCompanySelected = !!company; // Biến kiểm tra nếu công ty đã được chọn

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
        if (startYear && startMonth && endYear && endMonth) {
            return `從 ${startMonth}/${startYear} 到 ${endMonth}/${endYear}`;
        }
        return "選擇時間範圍";
    };

    const handleStartYearChange = (year: string) => {
        const threeDigitYear = year.slice(-3); // Lấy 3 ký tự cuối của năm
        setStartYear(year); // Cập nhật state `startYear` để hiển thị trong dropdown
        if (startMonth) {
            onStartYM(`${threeDigitYear}${startMonth}`); // Định dạng thành `yyymm`
        }
    };

    const handleStartMonthChange = (month: string) => {
        const paddedMonth = month.padStart(2, '0'); // Đảm bảo tháng có 2 ký tự
        setStartMonth(paddedMonth);
        if (startYear) {
            const threeDigitYear = startYear.slice(-3); // Lấy 3 ký tự cuối của `startYear`
            onStartYM(`${threeDigitYear}${paddedMonth}`); // Định dạng thành `yyymm`
        }
    };

    const handleEndYearChange = (year: string) => {
        const threeDigitYear = year.slice(-3); // Lấy 3 ký tự cuối của năm
        setEndYear(year); // Cập nhật state `endYear` để hiển thị trong dropdown
        if (endMonth) {
            onEndYM(`${threeDigitYear}${endMonth}`); // Định dạng thành `yyymm`
        }
    };

    const handleEndMonthChange = (month: string) => {
        const paddedMonth = month.padStart(2, '0'); // Đảm bảo tháng có 2 ký tự
        setEndMonth(paddedMonth);
        if (endYear) {
            const threeDigitYear = endYear.slice(-3); // Lấy 3 ký tự cuối của `endYear`
            onEndYM(`${threeDigitYear}${paddedMonth}`); // Định dạng thành `yyymm`
        }
    };
    const handleCompanyChange = (selectedCompany: string) => {
        if (selectedCompany === "ALL") {
            onCompany('');
            onDepartment('');
            setDepartment('');
            setSearchQuery('');
            setFilteredDepartments([]);
        } else {
            onCompany(selectedCompany);
            onDepartment('');
            setDepartment('');
            setSearchQuery('');
            fetchDepartmentsByCompany();
        }
    };

    // Hàm này xử lý cả khi chọn từ dropdown lẫn nhập vào ô tìm kiếm
    const handleDepartmentChange = (value: string) => {
        setDepartment(value);
        setSearchQuery(value);
        onDepartment(value);
    };
    // Xử lý tìm kiếm khi người dùng nhập mã bộ phận
    const handleSearch = (upperCaseQuery: string) => {
        setDepartment(upperCaseQuery);
        onDepartment(upperCaseQuery);

        // Nếu nhập từ khóa, lọc danh sách bộ phận hiện có theo công ty đã chọn
        if (departmentList && upperCaseQuery) {
            const filtered = departmentList.filter(dept =>
                dept.co === company &&
                (dept.dpnm.toLowerCase().startsWith(upperCaseQuery.toLowerCase()) || dept.dp.startsWith(upperCaseQuery))
            );
            setFilteredDepartments(filtered);
        } else {
            setFilteredDepartments(departmentList?.filter(dept => dept.co === company) || []); // Lọc theo công ty đã chọn
        }
    };
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

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

    const handleChangeDepartment = (department: string) => {

        console.log("Selected department:", department);
        onDepartment(department);
    };

    const handleDateSelect = (newDate: DateRange | undefined) => {
        setDate(newDate);

        if (newDate?.from) {
            const formattedStartYM = format(newDate.from, "yyyyMM");
            onStartYM(formattedStartYM.substring(1)); // Set the start date
        }

        if (newDate?.to) {
            const formattedEndYM = format(newDate.to, "yyyyMMdd");
            onEndYM(formattedEndYM.substring(1)); // Set the end date
        }
    };
    const handleExportToExcel = () => {
        exportToExcel(ReamingLeaveTime, headers, "1_剩餘換休未休時數報表");
    };

    // Header cho xuất Excel và hiển thị bảng
    const headers = {
        ym: '考勤週期',
        co: '公司',
        dp: '部門',
        pz: '廠區',
        nm: '姓名',
        empid: '人員代號',
        jp: '職位別',
        naty: '國籍',
        ofF12REM6: '前5個月換休時數',
        ofF12REM5: '前4個月換休時數',
        ofF12REM4: '前3個月換休時數',
        ofF12REM3: '上上月換休時數',
        ofF12REM2: '上月換休時數',
        ofF12REM1: '本月換休時數',
        ofF12REM_ALL: '總可換休時數',
        ofF12HRS: '本月已換休時數',
        ofF12REM: '剩餘可換休時數',
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
                            <SelectItem key="0D" value="0D">0D</SelectItem>
                            <SelectItem key="LT" value="LT">LT</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Dropdown để chọn khoảng thời gian */}
                    <Popover open={isPopoverOpen && !!company} // Chỉ mở Popover nếu có công ty
                        onOpenChange={(open) => setIsPopoverOpen(open)}>
                        <PopoverTrigger asChild>
                            <Button
                                disabled={!company} // Vô hiệu hóa nút khi chưa chọn công ty
                                // className={`w-[200px] py-2 px-4 flex items-center transition-colors duration-200 bg-gray-100 text-black hover:bg-gray-300 ${company && !isTimeFilterSelected ? 'border-2 border-red-500' : ''
                                //     } ${!company ? 'cursor-not-allowed' : ''}`}
                                className="w-[200px] py-2 px-4 flex items-center transition-colors duration-200 bg-gray-100 text-black hover:bg-gray-300"
                            >
                                {getSelectedDateRange()}
                                <CalendarRangeIcon className="ml-2 h-5 w-5" /> {/* Icon đồng hồ bên trái */}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent>
                            {/* Nhóm thời gian bắt đầu */}
                            <div className="mb-4">
                                <p className="font-semibold">從</p>
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

                            {/* Nhóm thời gian kết thúc */}
                            <div className="mb-4">
                                <p className="font-semibold">到</p>
                                <div className="flex gap-2">
                                    <Select onValueChange={handleEndYearChange} value={endYear}>
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

                                    <Select onValueChange={handleEndMonthChange} value={endMonth}>
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
                            className="pr-8 pl-3"
                            disabled={!isCompanySelected} // Vô hiệu hóa khi chưa chọn công ty
                        />
                    </div>
                    {/* Dropdown để chọn bộ phận */}
                    <Select
                        onValueChange={handleDepartmentChange}
                        value={department || ''} // Đồng bộ với state department
                        disabled={!isCompanySelected} // Vô hiệu hóa khi chưa chọn công ty
                    >
                        <SelectTrigger className="w-[300px]">
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
                </div>
                <Button onClick={handleExportToExcel} className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center"
                    disabled={!isCompanySelected} >
                    <FileOutputIcon className="mr-2 h-4 w-4" /> {/* Thêm biểu tượng bảng tính */}
                    匯出到 Excel
                </Button> {/* Export Button */}

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
                        // <GenericTable headers={headers} data={ReamingLeaveTime || []} />
                        <GenericTable
                            headers={headers}
                            data={(ReamingLeaveTime ?? []).slice((page - 1) * pageSize, page * pageSize)}
                            page={page}
                            pageSize={pageSize}
                        />

                    )}
                    {/* <GenericTable headers={headers} data={FollowUpReminder || []} /> */}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
