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
import { Search } from "lucide-react"; // Import icon Search từ lucide-react
export default function FollowUpReminderTable({ FollowUpReminder, onStartDate, onEndDate, onDepartment, onCompany, company }: {
    FollowUpReminder: FollowUpReminderListResType;
    onStartDate: (value: string) => void;
    onEndDate: (value: string) => void;
    onDepartment: (value: string) => void;
    onCompany: (value: string) => void;
    company: string; // Thêm prop công ty vào component con
}) {

    const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);
    const [department, setDepartment] = useState<string>(''); // Lưu giá trị mã bộ phận từ dropdown hoặc input
    const [searchQuery, setSearchQuery] = useState<string>(''); // Lưu từ khóa tìm kiếm


    // Fetch danh sách bộ phận từ API
    useEffect(() => {
        if (company) {
            fetchDepartmentsByCompany(); // Gọi hàm mà không truyền tham số vào
        }
    }, [company]);



    const handleCompanyChange = (selectedCompany: string) => {
        if (selectedCompany === "ALL") {
            onCompany(''); // Đặt lại giá trị công ty
            onDepartment(''); // Đặt lại bộ phận khi không có công ty nào được chọn
            setDepartment(''); // Đặt lại state bộ phận khi không có công ty nào được chọn
            setFilteredDepartments([]); // Xóa danh sách bộ phận
        } else {
            onCompany(selectedCompany); // Cập nhật state với công ty đã chọn
            onDepartment(''); // Đặt lại bộ phận khi người dùng chọn công ty mới
            setDepartment(''); // Đặt lại state bộ phận khi người dùng chọn công ty mới
            fetchDepartmentsByCompany(); // Lấy danh sách bộ phận dựa trên công ty đã chọn
        }
    };



    const fetchDepartmentsByCompany = async () => {
        try {
            const { payload } = await departmentApiRequest.getList(); // Không truyền tham số vào hàm getList()
            setFilteredDepartments(payload); // Cập nhật danh sách bộ phận dựa trên công ty đã chọn
        } catch (error) {
            console.error('Error fetching department list: ', error);
        }
    };



    // Hàm này xử lý cả khi chọn từ dropdown lẫn nhập vào ô tìm kiếm
    const handleDepartmentChange = (value: string) => {
        setDepartment(value); // Cập nhật mã bộ phận khi chọn từ dropdown
        setSearchQuery(value); // Đồng bộ với ô tìm kiếm
        onDepartment(value); // Gọi callback để cập nhật mã bộ phận
    };



    // Cập nhật hàm handleSearch để tìm kiếm theo mã bộ phận
    // Xử lý tìm kiếm khi người dùng nhập mã bộ phận
    const handleSearch = (query: string) => {
        setSearchQuery(query); // Cập nhật từ khóa tìm kiếm
        setDepartment(query);  // Cập nhật mã bộ phận khi nhập từ khóa
        onDepartment(query);   // Gọi callback để cập nhật mã bộ phận

        // Nếu nhập từ khóa, lọc danh sách bộ phận hiện có
        if (departmentList && query) {
            const filtered = departmentList.filter(dept =>
                dept.dp.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredDepartments(filtered); // Cập nhật danh sách bộ phận đã lọc
        } else {
            setFilteredDepartments(departmentList || []);
        }
    };






    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    // const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>()
    // const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);  // Lọc bộ phận



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


    // const handleSearch = (query: string) => {
    //     if (departmentList && query) {
    //         const filtered = departmentList.filter(dept =>
    //             dept.dpnm.toLowerCase().includes(query.toLowerCase()) || dept.dp.includes(query)
    //         );
    //         setFilteredDepartments(filtered);
    //     }
    // };

    /////////////////////////////////////////////////////////////////////////////////////////////////////

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
                    {/* Dropdown để chọn công ty */}
                    {/* Dropdown để chọn công ty */}
                    <Select
                        onValueChange={handleCompanyChange}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="--選擇公司--" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="all" value="ALL">--所有公司--</SelectItem>
                            <SelectItem key="lg" value="LG">LG</SelectItem>
                            <SelectItem key="samsung" value="Samsung">0D</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Ô nhập liệu tìm kiếm mã bộ phận */}
                    {/* <Input
                        placeholder="輸入部門代號..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`w-[200px] ${company && !department ? 'border-2 border-red-500' : ''}`} // Thêm viền đỏ khi chưa có mã bộ phận
    
                        disabled={!company} // Vô hiệu hóa nếu chưa chọn công ty
                    /> */}

                    <div className="relative w-[200px]">
                        {/* Icon tìm kiếm */}
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                        {/* Ô nhập liệu tìm kiếm */}
                        <Input
                            placeholder="輸入部門代號..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={`pr-8 pl-3 ${company && !department ? 'border-2 border-red-500' : ''}`} // Thêm padding-left cho icon
                            disabled={!company} // Vô hiệu hóa nếu chưa chọn công ty
                        />
                    </div>
                    {/* Dropdown để chọn bộ phận */}

                    <Select
                        onValueChange={handleDepartmentChange}
                        value={department || ''} // Sử dụng state department để đồng bộ
                        disabled={!company} // Vô hiệu hóa nếu chưa chọn công ty
                    >
                        <SelectTrigger className={`w-[200px] ${company && !department ? 'border-2 border-red-500' : ''}`}>
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
                    {/* Thông báo hướng dẫn chọn bộ phận nếu công ty đã chọn nhưng chưa chọn bộ phận */}
                    {/* {!company && (
                        <div className="text-red-500 mt-2">
                            Vui lòng chọn công ty trước khi tìm kiếm hoặc chọn bộ phận.
                        </div>
                    )} */}






                </div>
                {/* <Button onClick={handleExportToExcel}>Export to Excel</Button> Export Button
                 */}

                <Button onClick={handleExportToExcel} className="bg-gray-100 text-black py-2 px-4 hover:bg-gray-300 transition-colors duration-200 flex items-center">
                    <FileOutputIcon className="mr-2 h-4 w-4" /> {/* Thêm biểu tượng bảng tính */}
                    匯出到 Excel
                </Button> {/* Export Button */}


                <Toaster position="bottom-right" reverseOrder={false} />
            </div>
            <ScrollArea className={`w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border 
    ${(company && company !== 'ALL' && !department) ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="min-w-[1000px]"> {/* This ensures the table doesn't shrink below 1000px */}
                    <Table className="table-auto whitespace-nowrap">
                        <TableHeader className="custom-table-header">
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
                        <TableBody className="custom-table-body">
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
