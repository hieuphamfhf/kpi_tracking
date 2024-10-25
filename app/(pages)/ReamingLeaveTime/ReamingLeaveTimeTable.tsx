import { ReamingLeaveTimeListResType } from "@/app/schemaValidations/ReamingLeaveTime";
import { cn } from "@/lib/utils";
import { DepartmentListResType } from "@/app/schemaValidations/department";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx"; // Import XLSX for Excel export
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FileOutputIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Toaster, toast } from 'react-hot-toast';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Import icon Search từ lucide-react
export default function ReamingLeaveTimeTable({ ReamingLeaveTime, onStartYM, onEndYM, onDepartment, onCompany, company }: {
    ReamingLeaveTime: ReamingLeaveTimeListResType;
    onStartYM: (value: string) => void;
    onEndYM: (value: string) => void;
    onDepartment: (value: string) => void;
    onCompany: (value: string) => void;
    company: string; // Thêm prop công ty vào component con
}) {

    const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);
    const [department, setDepartment] = useState<string>(''); // Lưu giá trị mã bộ phận từ dropdown hoặc input
    const [searchQuery, setSearchQuery] = useState<string>(''); // Lưu từ khóa tìm kiếm
    const isDatePickerDisabled = !(searchQuery || department); // Bộ lọc thời gian chỉ mở khi có giá trị trong ô tìm kiếm hoặc dropdown

    // Fetch danh sách bộ phận từ API
    useEffect(() => {
        if (company) {
            fetchDepartmentsByCompany(); // Gọi hàm mà không truyền tham số vào
        }
    }, [company]);

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

        console.log("Selected department:", department); // Log the selected department 
        onDepartment(department);
    };

    const handleDateSelect = (newDate: DateRange | undefined) => {
        setDate(newDate);

        if (newDate?.from) {
            const formattedStartYM = format(newDate.from, "yyyyMMdd");
            onStartYM(formattedStartYM.substring(1)); // Set the start date
        }

        if (newDate?.to) {
            const formattedEndYM = format(newDate.to, "yyyyMMdd");
            onEndYM(formattedEndYM.substring(1)); // Set the end date
        }
    };

    const handleExportToExcel = () => {
        try {
            // Định nghĩa headers với kiểu 'keyof ReamingLeaveTimeListResType[0]' để chỉ rõ các khóa hợp lệ
            const headers: Record<keyof ReamingLeaveTimeListResType[0], string> = {
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

            const dataWithChineseHeaders = ReamingLeaveTime?.map(item => {
                const mappedItem: Record<string, string> = {};
                // Sử dụng Object.keys và ép kiểu với keyof typeof headers để tránh lỗi
                (Object.keys(headers) as (keyof typeof headers)[]).forEach((key) => {
                    mappedItem[headers[key]] = item[key] || ''; // Đảm bảo rằng chỉ số là hợp lệ
                });
                return mappedItem;
            });

            const ws = XLSX.utils.json_to_sheet(dataWithChineseHeaders);



            // Kiểm tra và xử lý giá trị ws['!ref']
            const refValue = ws['!ref'] || "A1"; // Cung cấp giá trị mặc định nếu !ref là undefined
            const range = XLSX.utils.decode_range(refValue);

            // Làm đậm hàng tiêu đề và căn giữa
            const headerCellStyle = {
                font: { bold: true },
                alignment: { horizontal: 'center' },
                fill: { fgColor: { rgb: "FFFFAA00" } } // Màu nền vàng cho tiêu đề
            };
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
                ws[cellRef].s = headerCellStyle;
            }

            // Đóng băng hàng tiêu đề
            ws['!freeze'] = { xSplit: 0, ySplit: 1 }; // Đóng băng hàng đầu tiên

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "6_剩餘換休未休時數報表");

            // Ghi file Excel
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
                            <SelectItem key="all" value="ALL">--所有公司--</SelectItem>
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[200px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                disabled={isDatePickerDisabled} // Vô hiệu hóa khi chưa nhập hoặc chọn bộ phận
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "yyyy-MM-dd")} -{" "}
                                            {format(date.to, "yyyy-MM-dd")}
                                        </>
                                    ) : (
                                        format(date.from, "yyyy-MM-dd")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={handleDateSelect}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <Button
                    onClick={handleExportToExcel}
                    className={`py-2 px-4 transition-colors duration-200 flex items-center ${!(company && department) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-black hover:bg-gray-300'}`}
                    disabled={!(company && department)}
                >
                    <FileOutputIcon className="mr-2 h-4 w-4" />
                    匯出到 Excel
                </Button>

                <Toaster position="bottom-right" reverseOrder={false} />
            </div>
            <ScrollArea className={`w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border 
    ${(company && company !== 'ALL' && !department) ? 'opacity-50 pointer-events-none' : ''}`}>

                <div className="min-w-[1000px]"> {/* This ensures the table doesn't shrink below 1000px */}
                    <Table className="table-auto whitespace-nowrap">
                        <TableHeader className="custom-table-header">
                            <TableRow>
                                <TableHead className="w-16">#</TableHead> {/* Fixed width for columns */}
                                <TableHead className="w-48">考勤週期</TableHead>
                                <TableHead className="w-48">公司</TableHead>
                                <TableHead className="w-48">部門</TableHead>
                                <TableHead className="w-48">廠區</TableHead>
                                <TableHead className="w-48">姓名</TableHead>
                                <TableHead className="w-48">人員代號</TableHead>
                                <TableHead className="w-48">職位別</TableHead>
                                <TableHead className="w-48">國籍</TableHead>
                                <TableHead className="w-48">前5個月換休時數</TableHead>
                                <TableHead className="w-48">前4個月換休時數</TableHead>
                                <TableHead className="w-48">前3個月換休時數</TableHead>
                                <TableHead className="w-48">上上月換休時數</TableHead>
                                <TableHead className="w-48">上月換休時數</TableHead>
                                <TableHead className="w-48">本月換休時數</TableHead>
                                <TableHead className="w-48">總可換休時數</TableHead>
                                <TableHead className="w-48">本月已換休時數</TableHead>
                                <TableHead className="w-48">剩餘可換休時數</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="custom-table-body">
                            {ReamingLeaveTime?.map((item, index) => (
                                <TableRow key={`${item.empid}-${index}`}>
                                    <TableCell>{index + 1}</TableCell> {/* Display row index */}
                                    <TableCell>{item.ym}</TableCell>
                                    <TableCell>{item.co}</TableCell>
                                    <TableCell>{item.dp}</TableCell>
                                    <TableCell>{item.pz}</TableCell>
                                    <TableCell>{item.nm}</TableCell>
                                    <TableCell>{item.empid}</TableCell>
                                    <TableCell>{item.jp}</TableCell>
                                    <TableCell>{item.naty}</TableCell>
                                    <TableCell>{item.ofF12REM6}</TableCell>
                                    <TableCell>{item.ofF12REM5}</TableCell>
                                    <TableCell>{item.ofF12REM4}</TableCell>
                                    <TableCell>{item.ofF12REM3}</TableCell>
                                    <TableCell>{item.ofF12REM2}</TableCell>
                                    <TableCell>{item.ofF12REM1}</TableCell>
                                    <TableCell>{item.ofF12REM_ALL}</TableCell>
                                    <TableCell>{item.ofF12HRS}</TableCell>
                                    <TableCell>{item.ofF12REM}</TableCell>
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
