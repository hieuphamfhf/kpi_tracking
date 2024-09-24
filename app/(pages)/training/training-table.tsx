import { TrainingListResType } from "@/app/schemaValidations/trainning";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DepartmentListResType } from "@/app/schemaValidations/department";
import { departmentApiRequest } from "@/app/apiRequest/department";
import * as XLSX from "xlsx"; // Import XLSX for Excel export
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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

    // Function to export table data to Excel
    const handleExportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(trainings);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Trainings");
        XLSX.writeFile(wb, "trainings.xlsx");
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
                            <SelectItem key={0} value={' '}>--所有--</SelectItem>
                            {departmentList?.map((item, index) => (
                                <SelectItem key={index} value={item.dpnm}>
                                    {item.dpnm}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleExportToExcel}>Export to Excel</Button> {/* Export Button */}
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
                                <TableRow key={item.prwpes}>
                                    <TableCell>{index + 1}</TableCell> {/* Display row index */}
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
