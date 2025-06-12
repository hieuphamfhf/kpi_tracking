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
interface FilterBarProps {
    company: string;
    department: string;
    status?: string; //
    newdutnm: string;
    dateMode?: 'range' | 'single';
    showSearch?: boolean;
    showStatusFilter?: boolean; // kiểm soát hiện/ẩn dropdown
    showNewdutnmFilter?: boolean;
    showCompanyFilter?: boolean;
    showEmpidFilter?: boolean;
    showNmFilter?: boolean;
   
    empid?: string;
    nm?: string;
    onEmpidChange?: (v: string) => void;
    onNmChange?: (v: string) => void;

    onStatusChange?: (status: string) => void; // 
    onCompanyChange: (company: string) => void;
    onDepartmentChange: (department: string) => void;
    onDateChange: (from: string, to: string) => void;
    onNewdutnmChange: (value: string) => void;
}

export default function FilterBar({
    company,
    department,
    onCompanyChange,
    onDepartmentChange,
    onDateChange,
    showSearch = true,
    dateMode = 'range',
    onStatusChange,
    newdutnm = "",
    onNewdutnmChange,
    showNewdutnmFilter = false,
    showStatusFilter = false,
    showCompanyFilter = true,
    showEmpidFilter = false,
    showNmFilter = false,
    empid = "",
    nm = "",
    onEmpidChange,
    onNmChange,


}: FilterBarProps) {
    // State dữ liệu bộ phận và lọc bộ phận theo công ty
    const [departmentList, setDepartmentList] = useState<DepartmentListResType>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [date, setDate] = useState<DateRange | undefined>(() => {
        if (dateMode === 'single') {
            return { from: new Date(), to: undefined }; // default là hôm nay
        }
        return { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
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

//     useEffect(() => {
//     // Nếu không có filter company, lấy toàn bộ phòng ban
//     if (!company) {
//         setFilteredDepartments(departmentList);
//     } else {
//         setFilteredDepartments(departmentList.filter((d) => d.co === company));
//     }
// }, [company, departmentList]);


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

    const handleDateChange = (range: DateRange | undefined) => {
        setDate(range);
        if (range?.from && (dateMode === 'single' || range?.to)) {
            const from = format(range.from, "yyyyMMdd").substring(1);
            const to = dateMode === 'single' ? from : format(range.to!, "yyyyMMdd").substring(1);
            onDateChange(from, to);
        }
    };


    return (
        <div className="flex items-center gap-4 overflow-x-auto w-full">
            {/* Dropdown chọn công ty */}
            {showCompanyFilter !== false && (
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
            )}

            {/* Dropdown chức vụ mới*/}
            {showNewdutnmFilter !== false && onNewdutnmChange && (
                <Select
                    value={newdutnm}
                    onValueChange={v => onNewdutnmChange(v)}
                >
                    <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="--請選擇--" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="經營主管級">經營主管級</SelectItem>
                        <SelectItem value="一級主管">一級主管</SelectItem>
                    </SelectContent>
                </Select>
            )}

            {/* Dropdown chọn showStatusFilter */}
            {showStatusFilter !== false && onStatusChange && (
                <Select onValueChange={onStatusChange} >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="--選擇狀態--" />
                    </SelectTrigger>
                    {/* <SelectContent>
                <SelectItem value="">全部狀態</SelectItem>
                <SelectItem value="TW">搭乘包機返台</SelectItem>
                <SelectItem value="VN">搭乘包機返越</SelectItem>
                <SelectItem value="ING">目前返台中</SelectItem>
                </SelectContent> */}
                    <SelectContent>
                        <SelectItem value="ALL">全部狀態</SelectItem>
                        <SelectItem value="TW">搭乘包機返台</SelectItem>
                        <SelectItem value="VN">搭乘包機返越</SelectItem>
                        <SelectItem value="ING">目前返台中</SelectItem>
                    </SelectContent>

                </Select>
            )}


            {/* Chọn khoảng thời gian - có disabled khi chưa chọn công ty */}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        // disabled={!isCompanySelected}
                        className={cn(
                            dateMode === 'single' ? "w-[150px]" : "w-[210px]",
                            "h-9 px-3 py-1 text-sm flex items-center justify-between rounded-md border bg-white shadow-sm"
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
                    {dateMode === 'single' ? (
                        <Calendar
                            initialFocus
                            mode="single"
                            defaultMonth={date?.from}
                            selected={date?.from}
                            onSelect={selected => handleDateChange({ from: selected as Date })}
                            numberOfMonths={1}
                        />
                    ) : (
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={selected => handleDateChange(selected as DateRange)}
                            numberOfMonths={2}
                        />
                    )}
                </PopoverContent>
            </Popover>

            {/* Ô tìm kiếm mã bộ phận - có thể ẩn thông qua props */}
            {showSearch !== false && (
                <div className="relative w-[150px]">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="輸入部門代號..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pr-8 pl-3"
                    // disabled={!isCompanySelected}
                    />
                </div>
            )}
            {showNmFilter !== false && onNmChange && (
                <div className="relative w-[160px]">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                        value={nm}
                        onChange={e => onNmChange(e.target.value)}
                        placeholder="姓名"
                        className="border rounded h-9 pl-3 pr-8 w-full"
                    />
                </div>
            )}
            {showEmpidFilter !== false && onEmpidChange && (
                <div className="relative w-[160px]">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                        value={empid}
                        onChange={e => onEmpidChange(e.target.value.toUpperCase())}
                        placeholder="員工編號"
                        className="border rounded h-9 pl-3 pr-8 w-full"
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
            // disabled={!isCompanySelected}
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
