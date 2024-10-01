import { TrainingListResType } from "@/app/schemaValidations/trainning";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, FileOutputIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DepartmentListResType } from "@/app/schemaValidations/department";
import { departmentApiRequest } from "@/app/apiRequest/department";
import * as XLSX from "xlsx"; // Import XLSX for Excel export
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input";
import { Toaster, toast } from 'react-hot-toast';
// import { FileOutputIcon } from 'lucide-react'; // Import biểu tượng

export default function TrainingTable({ trainings, onStartDate, onEndDate, onDepartment }:
    {
        trainings: TrainingListResType;
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
    // const [departmentList, setDepartmentList] = useState<DepartmentListResType>([]);  // Khởi tạo giá trị ban đầu rỗng
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
                if (payload)
                    setDepartmentList(payload);
            } catch (error) {
                console.error('edit page: ', error);
                setDepartmentList(null);
            }
        };
        fetchItem();
    }, []);

    // const handleChangeDepartment = (department: string) => {
    //     onDepartment(department);
    // };
    const handleChangeDepartment = (department: string) => {
        console.log('Selected department:', department);  // Kiểm tra giá trị dp
        onDepartment(department);  // Cập nhật state cho department trong TrainingPage
    };


    // Function to export table data to Excel
    // const handleExportToExcel = () => {
    //     const ws = XLSX.utils.json_to_sheet(trainings);
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "Trainings");
    //     XLSX.writeFile(wb, "trainings.xlsx");
    // };
    const handleExportToExcel = () => {
        try {
            // Định nghĩa tên cột bằng tiếng Trung
            const headers = {
                co: '公司',
                dp: '部門代號',
                dpnm: '部門名字',
                yr: '年',
                seq: '序',
                prwpes: '講師VNW帳號',
                prwpesnm: '講師',
                traid: '訓練代課成代碼',
                tranm: '訓練課程名稱',
                tradst: '訓練主旨',
                mon: '月份',
                tradys: '訓練天數',
                trahrs: '訓練時數',
                traobj: '受訓者',
                trasite: '地點',
                tradpnm: '訓練部門名稱',
            };

            // Chuyển đổi dữ liệu `trainings` thành tên cột tiếng Trung
            const dataWithChineseHeaders = trainings.map(item => ({
                [headers.co]: item.co,
                [headers.dp]: item.dp,
                [headers.dpnm]: item.dpnm,
                [headers.yr]: item.yr,
                [headers.seq]: item.seq,
                [headers.prwpes]: item.prwpes,
                [headers.prwpesnm]: item.prwpesnm,
                [headers.traid]: item.traid,
                [headers.tranm]: item.tranm,
                [headers.tradst]: item.tradst,
                [headers.mon]: item.mon,
                [headers.tradys]: item.tradys,
                [headers.trahrs]: item.trahrs,
                [headers.traobj]: item.traobj,
                [headers.trasite]: item.trasite,
                [headers.tradpnm]: item.tradpnm,
            }));

            // Xuất dữ liệu với các tiêu đề tiếng Trung
            const ws = XLSX.utils.json_to_sheet(dataWithChineseHeaders);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Trainings");
            XLSX.writeFile(wb, "每月訓練課程查詢.xlsx");

            // Hiển thị thông báo xuất thành công
            toast.success('匯出 Excel 成功!');

        } catch (error) {
            // Hiển thị thông báo lỗi nếu có lỗi trong quá trình xuất
            toast.error('匯出 Excel 時發生錯誤');
        }
    };




    return (
        <>
            <div className="flex items-center py-4 justify-between">
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
                    <Select onValueChange={(value: string) => { handleChangeDepartment(value) }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="--Department--" />
                        </SelectTrigger>
                        <SelectContent>
                            <Input className="w-[300px]" placeholder="按部門代號或部門名稱搜尋..." onChange={(e) => handleSearch(e.target.value)} /> {/* Thanh tìm kiếm */}
                            <SelectItem key={0} value={' '}>--所有--</SelectItem> {/* Option to select all */}
                            {filteredDepartments?.map((item, index) => (
                                <SelectItem key={index} value={item.dp}> {/* Use dp as the value */}
                                    {item.dpnm} - {item.dp}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleExportToExcel} className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center">
                    <FileOutputIcon className="mr-2 h-4 w-4" /> {/* Thêm biểu tượng bảng tính */}
                    Export to Excel
                </Button> {/* Export Button */}
                <Toaster position="bottom-right" reverseOrder={false} />
            </div>
            <ScrollArea className="w-full h-[70vh] overflow-x-auto overflow-y-auto rounded-md border">
                <div className="min-w-[1000px]"> {/* This ensures the table doesn't shrink below 1000px */}
                    <Table className="table-auto whitespace-nowrap">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead> {/* Fixed width for columns */}
                                <TableHead className="w-48">公司</TableHead>
                                <TableHead className="w-40">部門代號</TableHead>
                                <TableHead className="w-56">部門名字</TableHead>
                                <TableHead className="w-24">年</TableHead>
                                <TableHead className="w-24">月</TableHead>
                                <TableHead className="w-36">講師VNW帳號</TableHead>
                                <TableHead className="w-48">講師</TableHead>
                                <TableHead className="w-40">訓練代課成代碼</TableHead>
                                <TableHead className="w-56">訓練課程名稱</TableHead>
                                <TableHead className="w-24">訓練主旨</TableHead>
                                <TableHead className="w-24">月份</TableHead>
                                <TableHead className="w-36">訓練天數</TableHead>
                                <TableHead className="w-56">訓練時數</TableHead>
                                <TableHead className="w-24">受訓者</TableHead>
                                <TableHead className="w-24">地點</TableHead>
                                <TableHead className="w-36">訓練部門名稱</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trainings?.map((item, index) => (
                                <TableRow key={`${item.prwpes}-${index}`}> {/* Sử dụng prwpes + index để đảm bảo key duy nhất */}
                                    <TableCell>{index + 1}</TableCell> {/* Hiển thị chỉ số hàng */}
                                    <TableCell className="font-medium">{item.co}</TableCell>
                                    <TableCell>{item.dp}</TableCell>
                                    <TableCell>{item.dpnm}</TableCell>
                                    <TableCell>{item.yr}</TableCell>
                                    <TableCell>{item.seq}</TableCell>
                                    <TableCell>{item.prwpes}</TableCell>
                                    <TableCell>{item.prwpesnm}</TableCell>
                                    <TableCell>{item.traid}</TableCell>
                                    <TableCell>{item.tranm}</TableCell>
                                    <TableCell>{item.tradst}</TableCell>
                                    <TableCell>{item.mon}</TableCell>
                                    <TableCell>{item.tradys}</TableCell>
                                    <TableCell>{item.trahrs}</TableCell>
                                    <TableCell>{item.traobj}</TableCell>
                                    <TableCell>{item.trasite}</TableCell>
                                    <TableCell>{item.tradpnm}</TableCell>
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
