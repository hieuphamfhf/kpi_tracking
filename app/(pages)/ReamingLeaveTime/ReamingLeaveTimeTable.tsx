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
import { Input } from "@/components/ui/input";
import { Toaster, toast } from 'react-hot-toast';
import { Search } from "lucide-react"; // Import icon Search từ lucide-react
export default function ReamingLeaveTimeTable({ ReamingLeaveTime, onstartYM, onendYM, onDepartment }:
    {
        ReamingLeaveTime: ReamingLeaveTimeListResType;
        onstartYM: (value: string) => void;
        onendYM: (value: string) => void;
        onDepartment: (value: string) => void;
    }
) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>()
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);  // Lọc bộ phận
    const [selectedDepartment, setSelectedDepartment] = useState<string>(''); // Lưu giá trị bộ phận đã chọn
    const [isSearchActive, setIsSearchActive] = useState(false); // Trạng thái để bật tắt bộ lọc thời gian
    const [isDataEmpty, setIsDataEmpty] = useState(true); // Ban đầu bảng dữ liệu sẽ trống

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const { payload } = await departmentApiRequest.getList();
                if (payload) {
                    setDepartmentList(payload); // Lưu toàn bộ danh sách
                    setFilteredDepartments(payload); // Hiển thị danh sách mặc định khi lần đầu truy cập
                }
            } catch (error) {
                console.error('Error fetching department list:', error);
                setDepartmentList(null);
            }
        };
        fetchItem();
    }, []);

    // Hàm xử lý lọc danh sách bộ phận theo từ khóa
    const handleSearch = (query: string) => {
        if (departmentList && query) {
            // Lọc danh sách, chỉ hiển thị các bộ phận bắt đầu bằng từ khóa nhập vào
            const filtered = departmentList.filter(dept =>
                dept.dpnm.toLowerCase().startsWith(query.toLowerCase()) || dept.dp.startsWith(query)
            );
            setFilteredDepartments(filtered);
            setIsSearchActive(true); // Kích hoạt trạng thái tìm kiếm khi có từ khóa
            setIsDataEmpty(false); // Hiển thị bảng dữ liệu khi có tìm kiếm

            // Áp dụng bộ lọc thời gian ngay lập tức khi có từ khóa
            if (date) {
                handleDateSelect(date); // Áp dụng bộ lọc thời gian với giá trị đã chọn
            }
        } else {
            // Nếu từ khóa trống, xóa danh sách bộ phận và reset trạng thái
            setFilteredDepartments([]);
            setIsSearchActive(false); // Không kích hoạt trạng thái tìm kiếm nếu không có từ khóa
            setIsDataEmpty(true); // Bảng dữ liệu sẽ trống nếu không có từ khóa

            // Bỏ qua việc gọi API lọc theo thời gian nếu không có từ khóa
            onstartYM('');
            onendYM('');
        }
    };

    const handleDateSelect = (newDate: DateRange | undefined) => {
        setDate(newDate);  // Giữ giá trị thời gian đã chọn

        // Kiểm tra điều kiện trước khi gọi API
        if (selectedDepartment || isSearchActive) {  // Gọi API nếu có tìm kiếm hoặc chọn bộ phận
            if (newDate?.from) {
                const formattedstartYM = format(newDate.from, "yyyyMM");
                onstartYM(formattedstartYM.substring(1)); // Gọi API với ngày bắt đầu
            }
            if (newDate?.to) {
                const formattedendYM = format(newDate.to, "yyyyMM");
                onendYM(formattedendYM.substring(1)); // Gọi API với ngày kết thúc
            }
        } else {
            console.log("Bỏ qua lọc thời gian vì không có từ khóa hoặc bộ phận.");
        }
    };


    // Hàm chọn bộ phận từ dropdown
    const handleChangeDepartment = (department: string) => {
        setSelectedDepartment(department); // Cập nhật giá trị bộ phận đã chọn
        setIsSearchActive(!!department); // Kích hoạt trạng thái tìm kiếm nếu có bộ phận được chọn
        onDepartment(department);
        setIsDataEmpty(!department); // Bảng dữ liệu sẽ trống nếu không có bộ phận

        // Khi có bộ phận hợp lệ, áp dụng lại bộ lọc thời gian nếu đã chọn
        if (department && date) {
            handleDateSelect(date); // Áp dụng bộ lọc thời gian với giá trị đã chọn
        } else {
            // Bỏ qua việc gọi API lọc theo thời gian
            onstartYM('');
            onendYM('');
        }
    };


    // Hàm đồng bộ ô tìm kiếm với dropdown
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const value = e.target.value;
        const value = e.target.value.toUpperCase();  // Chuyển từ khóa người dùng nhập về chữ hoa
        handleSearch(value);
        setSelectedDepartment(value); // Cập nhật giá trị của dropdown theo từ khóa
        onDepartment(value); // Gửi giá trị của department
    };


    ///////////////////////////////////20241019

    const [isSearching, setIsSearching] = useState(false);
    // const [resultCount, setResultCount] = useState(0); // Khai báo trạng thái lưu số lượng kết quả
    const [isNoResults, setIsNoResults] = useState(false); // Trạng thái để kiểm tra không có kết quả

    const handleSearchByParentDepartment = (parentCode: string) => {
        if (departmentList && parentCode) {
            const filtered = departmentList.filter(dept =>
                dept.dp.startsWith(parentCode) // Lọc các bộ phận bắt đầu với mã bộ phận cha
            );
            setFilteredDepartments(filtered);
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

                    {/* Thêm ô tìm kiếm mã bộ phận */}
                    <div className="relative w-[150px]">
                        {/* Icon tìm kiếm */}
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            className="w-[150px]"
                            placeholder="輸入部門代號..."
                            value={selectedDepartment}
                            onChange={handleInputChange}
                        />
                    </div>

                    <Select
                        onValueChange={handleChangeDepartment}
                        value={selectedDepartment}
                    >   <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="--部門--" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64"> {/* Đặt chiều cao tối đa của danh sách */}
                            <div className="sticky top-0 bg-white z-10 p-2"> {/* Giữ cố định ô tìm kiếm ở đầu */}
                                <Input
                                    className="w-full px-2 py-1 mb-2 border-b"
                                    placeholder="搜尋部門..."
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {/* <SelectItem key={0} value={' '}>--所有--</SelectItem> Option to select all */}
                            </div>
                            <div className="max-h-48 overflow-y-auto"> {/* Danh sách các bộ phận có thể cuộn */}
                                {/* <SelectItem key="all" value="ALL">--Tất cả bộ phận--</SelectItem> */}
                                {filteredDepartments?.map((item, index) => (
                                    <SelectItem key={index} value={item.dp}>
                                        {item.dpnm} - {item.dp}
                                    </SelectItem>
                                ))}
                            </div>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[250px] justify-start text-left font-normal",
                                    (!selectedDepartment && !isSearchActive) && "text-muted-foreground cursor-not-allowed"
                                )}
                                disabled={!selectedDepartment && !isSearchActive} // Vô hiệu hóa nếu không có tìm kiếm hoặc chọn bộ phận
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
                                    <span>Pick Day</span>
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
                {/* <Button onClick={handleExportToExcel}>Export to Excel</Button> Export Button */}
                <Button onClick={handleExportToExcel} className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center">
                    <FileOutputIcon className="mr-2 h-4 w-4" /> {/* Thêm biểu tượng bảng tính */}
                    匯出到 Excel
                </Button> {/* Export Button */}

                <Toaster position="bottom-right" reverseOrder={false} />

            </div>
            <ScrollArea className="w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border">
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
