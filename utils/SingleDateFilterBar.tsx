import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarRangeIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { departmentApiRequest } from "@/app/apiRequest/department";
import { DepartmentListResType } from "@/app/schemaValidations/department";

// Props cho FilterBar: truyền vào công ty, bộ phận, callback để thay đổi, và option để ẩn ô tìm kiếm
interface SingleDateFilterBarProps {
    company: string;
    department: string;
    onCompanyChange: (company: string) => void;
    onDepartmentChange: (department: string) => void;
    onDateChange: (selectedDate: string) => void; // Chỉ trả về 1 ngày
    showSearch?: boolean;
}


export default function SingleDateFilterBar({
    company,
    department,
    onCompanyChange,
    onDepartmentChange,
    onDateChange,
    showSearch = true,
}: SingleDateFilterBarProps) {
    // State dữ liệu bộ phận và lọc bộ phận theo công ty
    const [departmentList, setDepartmentList] = useState<DepartmentListResType>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    // State chọn ngày mặc định từ đầu tháng đến cuối tháng
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    // Cờ kiểm tra đã chọn công ty hay chưa
    const isCompanySelected = !!company;
    // Lấy danh sách tất cả bộ phận từ API một lần duy nhất
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const { payload } = await departmentApiRequest.getList();
                setDepartmentList(payload);
            } catch (err) {
                console.error("Lỗi lấy department:", err);
            }
        };

        fetchDepartments();
    }, []);
    // Khi chọn công ty, lọc danh sách bộ phận theo mã công ty
    useEffect(() => {
        if (company) {
            const filtered = departmentList.filter((d) => d.co === company);
            setFilteredDepartments(filtered);
        } else {
            setFilteredDepartments([]);
        }
    }, [company, departmentList]);

    useEffect(() => {
        setSearchQuery(department); // Cập nhật input khi chọn từ dropdown
    }, [department]);


    // Xử lý khi nhập ô tìm kiếm bộ phận
    const handleSearch = (value: string) => {
        const upper = value.toUpperCase();
        setSearchQuery(upper);
        onDepartmentChange(upper);

        const filtered = departmentList.filter(
            (d) =>
                d.co === company &&
                (d.dp.startsWith(upper) || d.dpnm.toLowerCase().includes(upper.toLowerCase()))
        );
        setFilteredDepartments(filtered);
    };
    // Xử lý khi chọn ngày
    const handleDateChange = (range: DateRange | undefined) => {
        setDate(range);
        if (range?.from) {
            const selectedDate = format(range.from, "yyyyMMdd").substring(1);
            onDateChange(selectedDate); // Chỉ truyền một ngày duy nhất
        }
    };


    return (
        <div className="flex items-center gap-4 overflow-x-auto w-full">
            {/* Dropdown chọn công ty */}
            <Select onValueChange={onCompanyChange} value={company}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="--選擇公司--" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="LG">LG</SelectItem>
                    <SelectItem value="0D">0D</SelectItem>
                    <SelectItem value="LT">LT</SelectItem>
                </SelectContent>
            </Select>

            {/* Chọn khoảng thời gian - có disabled khi chưa chọn công ty */}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        disabled={!isCompanySelected}
                        className={cn(
                            "w-[210px] h-9 px-3 py-1 text-sm flex items-center justify-between rounded-md border bg-white shadow-sm",
                            !isCompanySelected && "opacity-50 cursor-not-allowed"
                        )}

                    // disabled={!isCompanySelected}
                    >
                        {date?.from ? (
                            date.to ? (
                                `${format(date.from, "yyyy-MM-dd")} - ${format(date.to, "yyyy-MM-dd")}`
                            ) : (
                                format(date.from, "yyyy-MM-dd")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarRangeIcon className="h-4 w-4 ml-2" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="single" // Chọn ngày duy nhất
                        defaultMonth={date?.from}
                        selected={date?.from}
                        onSelect={(selectedDate) => handleDateChange({ from: selectedDate })}
                        numberOfMonths={1}
                    />

                </PopoverContent>
            </Popover>

            {/* Ô tìm kiếm mã bộ phận - có thể ẩn thông qua props */}
            {showSearch !== false && (
                <div className="relative w-[200px]">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="輸入部門代號..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pr-8 pl-3"
                        disabled={!isCompanySelected}
                    />
                </div>
            )}

            {/* Bộ phận */}
            <Select
                // onValueChange={onDepartmentChange}
                onValueChange={(value) => {
                    onDepartmentChange(value);
                    setSearchQuery(value); // Cập nhật input khi chọn dropdown
                }}

                value={department}
                disabled={!isCompanySelected}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={company ? "--選擇部門--" : "請先選擇公司"} />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                    {filteredDepartments.map((item, idx) => (
                        <SelectItem key={idx} value={item.dp}>
                            {item.dpnm} - {item.dp}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
