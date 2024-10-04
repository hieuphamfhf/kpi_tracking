import{OverTimeDutyListResType} from "@/app/schemaValidations/OverTimeDuty";
import { cn } from "@/lib/utils";
import { DepartmentListResType } from "@/app/schemaValidations/department";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx"; // Import XLSX for Excel export
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon,FileOutputIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from 'react-hot-toast';
export default function OverTimeDutyTable({ OverTimeDuty, onStartDate, onEndDate, onDepartment }:
    {
        OverTimeDuty: OverTimeDutyListResType;
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
        onDepartment(department);
    };


    const handleExportToExcel = () => {
        try {
            // Định nghĩa headers với kiểu 'keyof OverTimeDutyListResType[0]' để chỉ rõ các khóa hợp lệ
            const headers: Record<keyof OverTimeDutyListResType[0], string> = {
                co: '公司',
                ovrdat: '加班日期',
                ovrfrhh: '加班起時',
                ovrtohh: '加班迄時',
                ovrid: 'OVRID',
                ovrrs: 'OVRRS',
                ovh: 'OVH',
                ofF12MK: 'OFF12MK',
                dp: '部門代號',
                dpnm: '部門名稱',
                frmno: '加班單編號',
                xrem: '加班原因',
                empid: 'VNW帳號',
                nm: '姓名',
                naty: '國籍',
                newdutid: '新職務代號',
                newdutnm: '新職務名稱',
                araid: 'ARAID',
                beorder: 'BEORDER',
                beordeR1: 'BEORDER1',
            };
    
            const dataWithChineseHeaders = OverTimeDuty?.map(item => {
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
            XLSX.utils.book_append_sheet(wb, ws, "5.加班單");
    
            // Ghi file Excel
            XLSX.writeFile(wb, "5.加班單.xlsx");
            toast.success('匯出 Excel 成功!');
        } catch (error) {
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
                    {/* <Select onValueChange={(value: string) => { handleChangeDepartment(value) }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="--Department--" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key={0} value={' '}>--所有--</SelectItem>
                            {departmentList?.map((item, index) => (
                                <SelectItem key={index} value={item.dpnm}>
                                    {item.dpnm}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select> */}
                    <Select onValueChange={(value: string) => { handleChangeDepartment(value) }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="--部門--" />
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
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead> {/* Fixed width for columns */}
                                <TableHead className="w-48">公司</TableHead>
                                <TableHead className="w-40">加班日期</TableHead>
                                <TableHead className="w-56">加班起時</TableHead>
                                <TableHead className="w-24">加班迄時</TableHead>
                                <TableHead className="w-24">OVRID</TableHead>
                                <TableHead className="w-36">OVRRS</TableHead>
                                <TableHead className="w-48">OVH</TableHead>
                                <TableHead className="w-40">OFF12MK</TableHead>
                                <TableHead className="w-56">部門代號</TableHead>
                                <TableHead className="w-24">部門名稱</TableHead>
                                <TableHead className="w-24">加班單編號</TableHead>
                                <TableHead className="w-36">加班原因</TableHead>
                                <TableHead className="w-48">VNW帳號</TableHead>
                                <TableHead className="w-40">姓名</TableHead>
                                <TableHead className="w-40">國籍</TableHead>
                                <TableHead className="w-40">新職務代號</TableHead>
                                <TableHead className="w-40">新職務名稱</TableHead>
                                <TableHead className="w-40">ARAID</TableHead>
                                <TableHead className="w-40">BEORDER</TableHead>
                                <TableHead className="w-56">BEORDER1</TableHead>
                               
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {OverTimeDuty?.map((item, index) => (
                                // <TableRow key={item.dp}>
                                <TableRow key={`${item.empid}-${index}`}>
                                    <TableCell>{index + 1}</TableCell> {/* Display row index */}
                                    <TableCell className="font-medium">{item.co}</TableCell>
                                    <TableCell>{item.ovrdat}</TableCell>
                                    <TableCell>{item.ovrfrhh}</TableCell>
                                    <TableCell>{item.ovrtohh}</TableCell>
                                    <TableCell>{item.ovrid}</TableCell>
                                    <TableCell>{item.ovrrs}</TableCell>
                                    <TableCell>{item.ovh}</TableCell>
                                    <TableCell>{item.ofF12MK}</TableCell>
                                    <TableCell>{item.dp}</TableCell>
                                    <TableCell>{item.dpnm}</TableCell>
                                    <TableCell>{item.frmno}</TableCell>
                                    <TableCell>{item.xrem}</TableCell>
                                    <TableCell>{item.empid}</TableCell>
                                    <TableCell>{item.nm}</TableCell>
                                    <TableCell>{item.naty}</TableCell>
                                    <TableCell>{item.newdutid}</TableCell>
                                    <TableCell>{item.newdutnm}</TableCell>
                                    <TableCell>{item.araid}</TableCell>
                                    <TableCell>{item.beorder}</TableCell>
                                    <TableCell>{item.beordeR1}</TableCell>
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
