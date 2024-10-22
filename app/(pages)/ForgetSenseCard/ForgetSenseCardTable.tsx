import { ForgetSenseCardListResType } from "@/app/schemaValidations/ForgetSenseCard";
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
export default function ForgetSenseCardTable({ ForgetSenseCard, onStartDate, onEndDate, onDepartment }:
    {
        ForgetSenseCard: ForgetSenseCardListResType;
        onStartDate: (value: string) => void;
        onEndDate: (value: string) => void;
        onDepartment: (value: string) => void;
    }
) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>()
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);  // Lọc bộ phận

    const handleSearch = (query: string) => {
        if (departmentList && query) {
            const filtered = departmentList.filter(dept =>
                dept.dpnm.toLowerCase().includes(query.toLowerCase()) || dept.dp.includes(query)
            );
            setFilteredDepartments(filtered);
        }
    };

    const handleDateSelect = (newDate: DateRange | undefined) => {
        setDate(newDate);

        if (newDate?.from) {
            const formattedStartDate = format(newDate.from, "yyyyMMdd");
            onStartDate(formattedStartDate.substring(1)); // Set the start date
        }

        if (newDate?.to) {
            const formattedEndDate = format(newDate.to, "yyyyMMdd");
            onEndDate(formattedEndDate.substring(1)); // Set the end date
        }
    };

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

    const handleChangeDepartment = (department: string) => {
        onDepartment(department);
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


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Cập nhật trạng thái tìm kiếm
        setIsSearching(value.trim().length > 0); // Chỉ chuyển thành `true` nếu có nội dung nhập vào
        // Gửi giá trị tìm kiếm đến TrainingPage thông qua callback
        onDepartment(value); // Cập nhật giá trị department từ ô tìm kiếm
    };

    const handleExportToExcel = () => {
        try {
            // Define the column headers in Chinese
            const headers = {
                co: '公司',
                empid: 'VNW帳號',
                nm: '姓名',
                dp: '部門代號',
                dpnm: '部門名稱',
                newdutid: '新職務代號',
                newdutnm: '新職務名稱',
                araid: 'ARAID',
                kd: 'KD',
                ymd: '日期',
                tm: 'TM',
            };

            // Map the data to the Chinese headers
            const dataWithChineseHeaders = ForgetSenseCard.map(item => ({
                [headers.co]: item.co,
                [headers.empid]: item.empid,
                [headers.nm]: item.nm,
                [headers.dp]: item.dp,
                [headers.dpnm]: item.dpnm,
                [headers.newdutid]: item.newdutid,
                [headers.newdutnm]: item.newdutnm,
                [headers.araid]: item.araid,
                [headers.kd]: item.kd,
                [headers.ymd]: item.ymd,
                [headers.tm]: item.tm,
            }));

            // Export data to Excel with Chinese headers
            const ws = XLSX.utils.json_to_sheet(dataWithChineseHeaders);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "4.2忘刷卡表");
            XLSX.writeFile(wb, "4.2忘刷卡表.xlsx");

            // Show success notification
            toast.success('匯出 Excel 成功!');

        } catch (error) {
            // Show error notification if export fails
            toast.error('匯出 Excel 時發生錯誤');
        }
    };

    return (
        <>
            <div className="flex items-center py-2 justify-between">
                <div className="flex gap-5">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
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

                    <Select
                        onValueChange={(value: string) => { handleChangeDepartment(value) }}
                        disabled={isSearching} // Khóa dropdown khi người dùng đang nhập
                    > <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="--部門--" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64"> {/* Đặt chiều cao tối đa của danh sách */}
                            <div className="sticky top-0 bg-white z-10 p-2"> {/* Giữ cố định ô tìm kiếm ở đầu */}
                                <Input
                                    className="w-full px-2 py-1 mb-2 border-b"
                                    placeholder="搜尋部門..."
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <SelectItem key={0} value={' '}>--所有--</SelectItem> {/* Option to select all */}
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
                    {/* Thêm ô tìm kiếm mã bộ phận */}
                    <Input
                        className="w-[150px]"
                        placeholder="輸入部門代號..."
                        onChange={handleInputChange}
                    />
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
                                <TableHead className="w-48">公司</TableHead>
                                <TableHead className="w-40">VNW帳號</TableHead>
                                <TableHead className="w-56">姓名</TableHead>
                                <TableHead className="w-24">部門代號</TableHead>
                                <TableHead className="w-24">部門名稱</TableHead>
                                <TableHead className="w-36">新職務代號</TableHead>
                                <TableHead className="w-48">新職務名稱</TableHead>
                                <TableHead className="w-40">ARAID</TableHead>
                                <TableHead className="w-56">KD</TableHead>
                                <TableHead className="w-24">日期</TableHead>
                                <TableHead className="w-40">TM</TableHead>
                                {/* <TableHead className="w-24">摘要</TableHead>
                                <TableHead className="w-36">催辦次數</TableHead>
                                <TableHead className="w-56">催辦日</TableHead>
                                <TableHead className="w-56">銷案日</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="custom-table-body">
                            {ForgetSenseCard?.map((item, index) => (
                                <TableRow key={`${item.empid}-${index}`}>
                                    <TableCell>{index + 1}</TableCell> {/* Display row index */}
                                    <TableCell className="font-medium">{item.co}</TableCell>
                                    <TableCell>{item.empid}</TableCell>
                                    <TableCell>{item.nm}</TableCell>
                                    <TableCell>{item.dp}</TableCell>
                                    <TableCell>{item.dpnm}</TableCell>
                                    <TableCell>{item.newdutid}</TableCell>
                                    <TableCell>{item.newdutnm}</TableCell>
                                    <TableCell>{item.araid}</TableCell>
                                    <TableCell>{item.kd}</TableCell>
                                    <TableCell>{item.ymd}</TableCell>
                                    <TableCell>{item.tm}</TableCell>
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
