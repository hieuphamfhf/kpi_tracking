import { FollowUpReminderListResType } from "@/app/schemaValidations/FollowUpReminder";
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
export default function FollowUpReminderTable({ FollowUpReminder, onStartDate, onEndDate, onDepartment }:
    {
        FollowUpReminder: FollowUpReminderListResType;
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

        console.log("Selected department:", department); // Log the selected department 
        onDepartment(department);
    };

    // Function to export table data to Excel
    // const handleExportToExcel = () => {
    //     const ws = XLSX.utils.json_to_sheet(FollowUpReminder);
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "FollowUpReminder");
    //     XLSX.writeFile(wb, "FollowUpReminder.xlsx");
    // };

    const handleExportToExcel = () => {
        try {
            const headers = {
                co: '公司',
                dp: '部門代號',
                dpnm: '部門名稱',
                empid: 'VNW帳號',
                nm: '姓名',
                cptopnm: '案件名稱',
                newdutid: '新職務代號',
                newdutnm: '新職務名稱',
                vhno: '案件編號',
                kd: '類別',
                sumr: '摘要',
                cnt: '催辦次數',
                foldat: '催辦日',
                cancdat: '銷案日',
            };

            const dataWithChineseHeaders = FollowUpReminder.map(item => ({
                [headers.co]: item.co,
                [headers.dp]: item.dp,
                [headers.dpnm]: item.dpnm,
                [headers.empid]: item.empid,
                [headers.nm]: item.nm,
                [headers.cptopnm]: item.cptopnm,
                [headers.newdutid]: item.newdutid,
                [headers.newdutnm]: item.newdutnm,
                [headers.vhno]: item.vhno,
                [headers.kd]: item.kd,
                [headers.sumr]: item.sumr,
                [headers.cnt]: item.cnt,
                [headers.foldat]: item.foldat,
                [headers.cancdat]: item.cancdat,
            }));

            const ws = XLSX.utils.json_to_sheet(dataWithChineseHeaders);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "多次催辦案件查詢");
            XLSX.writeFile(wb, "3.1催辦表.xlsx");

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
                {/* <Button onClick={handleExportToExcel}>Export to Excel</Button> Export Button
                 */}

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
                                <TableHead className="w-40">部門代號</TableHead>
                                <TableHead className="w-56">部門名稱</TableHead>
                                <TableHead className="w-24">VNW帳號</TableHead>
                                <TableHead className="w-24">姓名</TableHead>
                                <TableHead className="w-36">案件名稱</TableHead>
                                <TableHead className="w-48">新職務代號</TableHead>
                                <TableHead className="w-40">新職務名稱</TableHead>
                                <TableHead className="w-56">案件編號</TableHead>
                                <TableHead className="w-24">類別</TableHead>
                                <TableHead className="w-24">摘要</TableHead>
                                <TableHead className="w-36">催辦次數</TableHead>
                                <TableHead className="w-56">催辦日</TableHead>
                                <TableHead className="w-56">銷案日</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {FollowUpReminder?.map((item, index) => {
                                try {
                                    return (
                                        <TableRow key={`${item.empid}-${index}`}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.co}</TableCell>
                                            <TableCell>{item.dp}</TableCell>
                                            <TableCell>{item.dpnm}</TableCell>
                                            <TableCell>{item.empid}</TableCell>
                                            <TableCell>{item.nm}</TableCell>
                                            <TableCell>{item.cptopnm}</TableCell>
                                            <TableCell>{item.newdutid}</TableCell>
                                            <TableCell>{item.newdutnm}</TableCell>
                                            <TableCell>{item.vhno}</TableCell>
                                            <TableCell>{item.kd}</TableCell>
                                            <TableCell>{item.sumr}</TableCell>
                                            <TableCell>{item.cnt}</TableCell>
                                            <TableCell>{item.foldat}</TableCell>
                                            <TableCell>{item.cancdat}</TableCell>
                                        </TableRow>
                                    );
                                } catch (error) {
                                    console.error('Render error for item:', item, error);
                                    return null;
                                }
                            })}

                        </TableBody>
                    </Table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
