import { MonthlyKPIListResType } from "@/app/schemaValidations/MonthlyKPI";
import { cn } from "@/lib/utils";
import { DepartmentListResType } from "@/app/schemaValidations/department";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx"; // Import XLSX for Excel export
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CalendarRangeIcon, FileOutputIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth, format } from 'date-fns';
// import { endOfMonth, format, startOfMonth } from 'date-fns';
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Toaster, toast } from 'react-hot-toast';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Import icon Search từ lucide-react
import { useMemo } from "react";
export default function MonthlyKPITable({ MonthlyKPI, onStartYM, onDepartment, onCompany, company }: {
    MonthlyKPI: MonthlyKPIListResType;
    onStartYM: (value: string) => void;
    // onEndYM: (value: string) => void;
    onDepartment: (value: string) => void;
    onCompany: (value: string) => void;
    company: string; // Thêm prop công ty vào component con
}) {

    const [departmentList, setDepartmentList] = useState<DepartmentListResType | null>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentListResType>([]);
    const [department, setDepartment] = useState<string>(''); // Lưu giá trị mã bộ phận từ dropdown hoặc input
    const [searchQuery, setSearchQuery] = useState<string>('2'); // Lưu từ khóa tìm kiếm
    const isDatePickerDisabled = !(searchQuery || department); // Bộ lọc thời gian chỉ mở khi có giá trị trong ô tìm kiếm hoặc dropdown
    // const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    // const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState<string>(""); // Không có giá trị mặc định cho năm
    const [selectedMonth, setSelectedMonth] = useState<string>(""); // Không có giá trị mặc định cho tháng
    const [startYear, setStartYear] = useState<string>(""); // Năm bắt đầu
    const [startMonth, setStartMonth] = useState<string>(""); // Tháng bắt đầu
    // const [endYear, setEndYear] = useState<string>(""); // Năm kết thúc
    // const [endMonth, setEndMonth] = useState<string>(""); // Tháng kết thúc
    const [startYM, setStartYM] = useState<string>(""); // Không đặt giá trị mặc định
    const [endYM, setEndYM] = useState<string>(""); // Không đặt giá trị mặc định
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const isTimeFilterSelected = startYear && startMonth; // Kiểm tra đã chọn đủ thời gian chưa
    const isExportDisabled = !(company && department && isTimeFilterSelected);
    // Hàm tạo tiêu đề cột với tháng và năm đã chọn
    const getDynamicColumnTitle = () => {
        return ` ${startMonth} 月份`;
    };

    const getPreviousMonthTitle = () => {
        if (!startMonth) {
            return "月份";
        }
        let previousMonth = parseInt(startMonth, 10) - 1;
        let displayMonth = previousMonth > 0 ? String(previousMonth).padStart(2, '0') : '12';
        return ` ${displayMonth} 月份`;
    };




    // Fetch danh sách bộ phận từ API
    useEffect(() => {
        handleSearch('2'); // Gọi hàm tìm kiếm với giá trị mặc định là "2"
        if (company) {
            fetchDepartmentsByCompany(); // Gọi hàm mà không truyền tham số vào
        }
    }, [company]);

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

    const groupedData = useMemo(() => {
        // if (!MonthlyKPI) {
        //     return {}; // Trả về một object rỗng nếu MonthlyKPI không tồn tại
        // }
        // tra ve mot cau truc mac dinh ngay cả khi MonthlyKPI không tồn tại, để tránh undefined.
        if (!MonthlyKPI) {
            return { groups: {}, overallAverage: { abnmormaL_CARD_RATE: 0, followuP_ABNMORMAL_RATE: 0, traininG_FINISHD_RATE: 0, sumOvertimeDutyCount: 0 } };
        }

        const groups = MonthlyKPI.reduce((acc, item) => {
            const groupKey = item.dp[0]; // Nhóm theo ký tự đầu tiên của `dp`

            if (!acc[groupKey]) {
                acc[groupKey] = {
                    items: [],
                    totals: {
                        ofF12REM: 0,
                        ofF12REM_PREVIOUSYM: 0,
                        abnmormaL_CARD_RATE: 0,
                        followuP_ABNMORMAL_RATE: 0,
                        traininG_FINISHD_RATE: 0,
                        overtimedutY_COUNT: 0,
                    },
                    count: 0, // Đếm số lượng để tính trung bình
                    average: {
                        abnmormaL_CARD_RATE: 0,
                        followuP_ABNMORMAL_RATE: 0,
                        traininG_FINISHD_RATE: 0,
                    },
                };
            }

            // Thêm item vào nhóm
            acc[groupKey].items.push(item);

            // Cộng dồn các giá trị vào totals
            acc[groupKey].totals.ofF12REM += parseFloat(item.ofF12REM) || 0;
            acc[groupKey].totals.ofF12REM_PREVIOUSYM += parseFloat(item.ofF12REM_PREVIOUSYM) || 0;
            acc[groupKey].totals.abnmormaL_CARD_RATE += parseFloat(item.abnmormaL_CARD_RATE) || 0;
            acc[groupKey].totals.followuP_ABNMORMAL_RATE += parseFloat(item.followuP_ABNMORMAL_RATE) || 0;
            acc[groupKey].totals.traininG_FINISHD_RATE += parseFloat(item.traininG_FINISHD_RATE) || 0;
            acc[groupKey].totals.overtimedutY_COUNT += parseFloat(item.overtimedutY_COUNT) || 0;

            // Tăng số lượng phần tử trong nhóm để tính trung bình sau
            acc[groupKey].count += 1;

            return acc;
        }, {} as Record<string, { items: MonthlyKPIListResType; totals: Record<string, number>; count: number; average: Record<string, number> }>);
        // Sắp xếp các mục trong từng nhóm theo `dp`
        Object.keys(groups).forEach(groupKey => {
            groups[groupKey].items.sort((a, b) => a.dp.localeCompare(b.dp));
        });
        // Tính trung bình tổng và tổng `overtimedutY_COUNT` cho tất cả các nhóm
        Object.keys(groups).forEach(groupKey => {
            const group = groups[groupKey];
            group.average.abnmormaL_CARD_RATE = group.count > 0 ? group.totals.abnmormaL_CARD_RATE / group.count : 0;
            group.average.followuP_ABNMORMAL_RATE = group.count > 0 ? group.totals.followuP_ABNMORMAL_RATE / group.count : 0;
            group.average.traininG_FINISHD_RATE = group.count > 0 ? group.totals.traininG_FINISHD_RATE / group.count : 0;
        });
        // Tính trung bình tổng cho tất cả các nhóm
        const overallAverage = {
            abnmormaL_CARD_RATE: 0,
            followuP_ABNMORMAL_RATE: 0,
            traininG_FINISHD_RATE: 0,
            sumOvertimeDutyCount: 0,
        };
        let groupCount = Object.keys(groups).length;
        // Tính tổng trung bình của mỗi nhóm rồi chia cho số nhóm
        overallAverage.abnmormaL_CARD_RATE = groupCount > 0
            ? Object.values(groups).reduce((sum, group) => sum + group.average.abnmormaL_CARD_RATE, 0) / groupCount
            : 0;
        overallAverage.followuP_ABNMORMAL_RATE = groupCount > 0
            ? Object.values(groups).reduce((sum, group) => sum + group.average.followuP_ABNMORMAL_RATE, 0) / groupCount
            : 0;
        overallAverage.traininG_FINISHD_RATE = groupCount > 0
            ? Object.values(groups).reduce((sum, group) => sum + group.average.traininG_FINISHD_RATE, 0) / groupCount
            : 0;
        // Tính tổng `overtimedutY_COUNT` cho tất cả các nhóm
        overallAverage.sumOvertimeDutyCount = Object.values(groups).reduce((sum, group) => sum + group.totals.overtimedutY_COUNT, 0);


        return { groups, overallAverage };
    }, [MonthlyKPI]);



    // Hàm xử lý nút hiển thị thời gian đã chọn
    const getSelectedDateRange = () => {
        if (startYear && startMonth) {
            return `從 ${startMonth}/${startYear}`;
        }
        return "選擇時間";
    };

    /**
     * Chuyển đổi số giờ thập phân thành chuỗi định dạng "X ngày Y giờ Z phút"
     * @param {number} hoursDecimal - Số giờ ở dạng thập phân
     * @returns {string} Chuỗi định dạng "X ngày Y giờ Z phút"
     */
    const formatDaysHoursMinutes = (hoursDecimal: number): string => {
        // Kiểm tra nếu đầu vào không hợp lệ (không phải số hoặc nhỏ hơn 0)
        if (isNaN(hoursDecimal) || hoursDecimal < 0) {
            return "Dữ liệu không hợp lệ";
        }

        // Tính số ngày và số giờ còn lại
        const days = Math.floor(hoursDecimal / 24);
        const remainingHoursDecimal = hoursDecimal % 24; // Giờ còn lại sau khi lấy phần ngày
        const hours = Math.floor(remainingHoursDecimal); // Lấy phần nguyên làm giờ
        const minutes = Math.round((remainingHoursDecimal - hours) * 60); // Phần thập phân chuyển thành phút

        // Tạo chuỗi kết quả với ngày, giờ và phút
        let result = "";
        if (days > 0) result += `${days} ngày `;
        result += `${hours} giờ ${minutes} phút`;

        return result;
    };


    // Hàm cập nhật thời gian bắt đầu
    const handleStartYearChange = (year: string) => {
        console.log("Selected Year:", year); // Log để kiểm tra
        setStartYear(year);
        if (startMonth) {
            const threeDigitYear = year.slice(-3);
            onStartYM(`${threeDigitYear}${startMonth}`);
        }
    };

    const handleStartMonthChange = (month: string) => {
        console.log("Selected Month:", month); // Log để kiểm tra
        const paddedMonth = month.padStart(2, '0');
        setStartMonth(paddedMonth);
        if (startYear) {
            const threeDigitYear = startYear.slice(-3);
            onStartYM(`${threeDigitYear}${paddedMonth}`);
        }
    };




    const handleCompanyChange = (selectedCompany: string) => {
        if (selectedCompany === "ALL") {
            onCompany(''); // Reset công ty
            onDepartment(''); // Reset bộ phận
            setDepartment(''); // Xóa lựa chọn bộ phận
            // setSearchQuery(''); // Xóa từ khóa tìm kiếm
            setSearchQuery('2'); // Đặt lại `searchQuery` về "2" khi chọn công ty mới
            setFilteredDepartments([]); // Xóa danh sách bộ phận
        } else {
            onCompany(selectedCompany); // Cập nhật công ty đã chọn
            onDepartment(''); // Xóa bộ phận khi chọn công ty mới
            setDepartment(''); // Reset state bộ phận
            setSearchQuery('2'); // Đặt lại `searchQuery` về "2" khi chọn công ty mới
            // setSearchQuery(''); // Reset state từ khóa tìm kiếm
            fetchDepartmentsByCompany(); // Lấy bộ phận theo công ty đã chọn
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

    const [date, setDate] = useState<Date | undefined>(startOfMonth(new Date()));


    const handleChangeDepartment = (department: string) => {

        console.log("Selected department:", department); // Log the selected department 
        onDepartment(department);
    };

    // Hàm cập nhật ngày khi người dùng chọn ngày bắt đầu
    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate); // Đảm bảo `newDate` là một `Date` hoặc `undefined`

        if (newDate) {
            const formattedStartYM = format(newDate, "yyyyMM");
            onStartYM(formattedStartYM.substring(1)); // Chỉ cần cập nhật ngày bắt đầu
        }
    };


    const handleExportToExcel = () => {
        try {
            const headerRow1 = [
                "部門", "廠處代碼", "廠", "剩餘換休未休時數", "", "借用臨時卡及忘刷卡查詢", "",
                "多次催辦案件查詢", "", "訓練計畫完成率", "", "加班未於事前填單異常次數", ""
            ];

            const headerRow2 = [
                "", "", "", `${getPreviousMonthTitle()}`, `${getDynamicColumnTitle()}`,
                "廠處", "全公司平均值",
                "廠處", "全公司平均值",
                "廠處", "全公司平均值",
                "廠處", "全公司合計"
            ];

            const excelData = [headerRow1, headerRow2];
            // const mergeRanges = [];  // Lưu trữ các phạm vi ô cần hợp nhất
            // Định nghĩa kiểu cho mergeRanges
            const mergeRanges: XLSX.Range[] = []; // Lưu trữ các phạm vi ô cần hợp nhất

            if (!groupedData.groups) {
                return; // Thoát sớm nếu groupedData.groups là undefined
            }

            let currentRow = 2; // Bắt đầu từ hàng thứ ba sau hai hàng tiêu đề

            Object.entries(groupedData.groups).forEach(([groupKey, group]) => {
                // Hợp nhất các ô trong cột "部門" cho nhóm này
                mergeRanges.push({
                    s: { r: currentRow, c: 0 }, // Điểm bắt đầu hợp nhất
                    e: { r: currentRow + group.items.length - 1, c: 0 } // Điểm kết thúc hợp nhất
                });

                group.items.forEach((item, index) => {
                    excelData.push([
                        index === 0 ? item.dP1NM : "",  // Chỉ điền tên nhóm ở hàng đầu tiên
                        item.dp || '',
                        item.dpnm || '',
                        parseFloat(item.ofF12REM_PREVIOUSYM).toFixed(3) || '',
                        parseFloat(item.ofF12REM).toFixed(3) || '',
                        parseFloat(item.abnmormaL_CARD_RATE).toFixed(3) + '%' || '',
                        groupedData.overallAverage.abnmormaL_CARD_RATE.toFixed(3) + '%',
                        parseFloat(item.followuP_ABNMORMAL_RATE).toFixed(3) + '%' || '',
                        groupedData.overallAverage.followuP_ABNMORMAL_RATE.toFixed(3) + '%',
                        parseFloat(item.traininG_FINISHD_RATE).toFixed(3) + '%' || '',
                        groupedData.overallAverage.traininG_FINISHD_RATE.toFixed(3) + '%',
                        parseFloat(item.overtimedutY_COUNT).toFixed(0) || '',
                        groupedData.overallAverage.sumOvertimeDutyCount.toFixed(0)
                    ]);
                    currentRow++;
                });

                // Thêm hàng "Total" cho từng nhóm
                excelData.push([
                    `${group.items[0].dP1NM} - ${groupKey} / 群組總計 / 平均`, "", "",
                    group.totals.ofF12REM_PREVIOUSYM.toFixed(3),
                    group.totals.ofF12REM.toFixed(3),
                    group.average.abnmormaL_CARD_RATE.toFixed(3) + '%',
                    "",
                    group.average.followuP_ABNMORMAL_RATE.toFixed(3) + '%',
                    "",
                    group.average.traininG_FINISHD_RATE.toFixed(3) + '%',
                    "",
                    group.totals.overtimedutY_COUNT.toFixed(0),
                    ""
                ]);
                currentRow++;
            });

            // Thêm hàng "Overall Average" vào cuối bảng
            excelData.push([
                "Overall Average", "", "",
                "", "",
                groupedData.overallAverage.abnmormaL_CARD_RATE.toFixed(3) + '%',
                "",
                groupedData.overallAverage.followuP_ABNMORMAL_RATE.toFixed(3) + '%',
                "",
                groupedData.overallAverage.traininG_FINISHD_RATE.toFixed(3) + '%',
                "", "", ""
            ]);

            const ws = XLSX.utils.aoa_to_sheet(excelData);

            // Thêm các phạm vi hợp nhất vào sheet
            ws['!merges'] = [
                ...mergeRanges,  // Hợp nhất các ô của `dP1NM` cho từng nhóm
                { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } },
                { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } },
                { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } },
                { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } },
                { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } }
            ];

            const headerCellStyle = {
                font: { bold: true },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "FFFFAA00" } }
            };

            const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
            for (let row = 0; row <= 1; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!ws[cellAddress]) ws[cellAddress] = {};
                    ws[cellAddress].s = headerCellStyle;
                }
            }

            ws['!freeze'] = { xSplit: 0, ySplit: 2 };

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "6_剩餘換休未休時數報表");
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
                            {/* <SelectItem key="all" value="ALL">--所有公司--</SelectItem> */}
                            <SelectItem key="lg" value="LG">LG</SelectItem>
                            <SelectItem key="0D" value="0D">0D</SelectItem>
                            <SelectItem key="LT" value="LT">LT</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Ô nhập liệu tìm kiếm */}

                    {/* <div className="relative w-[200px]">
                        // Icon tìm kiếm
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="輸入部門代號..."
                            value={searchQuery} // Hiển thị giá trị hiện tại của `searchQuery`
                            onChange={(e) => {
                                const upperCaseValue = e.target.value.toUpperCase(); // Chuyển thành chữ hoa ngay khi người dùng nhập
                                setSearchQuery(upperCaseValue); // Cập nhật giá trị vào state
                                handleSearch(upperCaseValue);  // Gọi hàm tìm kiếm với giá trị đã chuyển đổi
                            }}
                            className={`pr-8 pl-3 ${company && !department ? 'border-2 border-red-500' : ''}`} // Thêm padding-left cho icon
                            disabled={!company} // Vô hiệu hóa nếu chưa chọn công ty
                        />
                    </div> */}

                    {/* Dropdown để chọn bộ phận */}
                    {/* <Select
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
                    </Select> */}

                    {/* Dropdown để chọn khoảng thời gian */}

                    <Popover open={isPopoverOpen && !!company} // Chỉ mở Popover nếu có công ty
                        onOpenChange={(open) => setIsPopoverOpen(open)}>
                        <PopoverTrigger asChild>
                            <Button
                                disabled={!company} // Vô hiệu hóa nút khi chưa chọn công ty
                                className={`w-[200px] py-2 px-4 flex items-center transition-colors duration-200 bg-gray-100 text-black hover:bg-gray-300 ${company && !isTimeFilterSelected ? 'border-2 border-red-500' : ''
                                    } ${!company ? 'cursor-not-allowed' : ''}`}
                            >
                                {getSelectedDateRange()}
                                <CalendarRangeIcon className="ml-2 h-5 w-5" /> {/* Icon đồng hồ bên trái */}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent>
                            {/* Nhóm thời gian bắt đầu */}
                            <div className="mb-4">
                                <p className="font-semibold">開始時間</p>
                                <div className="flex gap-2">
                                    <Select onValueChange={handleStartYearChange} value={startYear}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="年" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(5)].map((_, idx) => {
                                                const year = String(new Date().getFullYear() - idx);
                                                return <SelectItem key={year} value={year}>{year}</SelectItem>;
                                            })}
                                        </SelectContent>
                                    </Select>

                                    <Select onValueChange={handleStartMonthChange} value={startMonth}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="月" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                    {`月 ${i + 1}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                </div>
                <Button
                    onClick={handleExportToExcel}
                    className={`py-2 px-4 transition-colors duration-200 flex items-center ${!(company && department && isTimeFilterSelected) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-black hover:bg-gray-300'}`}
                    disabled={!(company && department && isTimeFilterSelected)}
                >
                    <FileOutputIcon className="mr-2 h-4 w-4" />
                    匯出到 Excel
                </Button>

                <Toaster position="bottom-right" reverseOrder={false} />
            </div>

            <ScrollArea
                className={`w-full h-[calc(100vh-16rem)] overflow-y-auto rounded-md border 
    ${(company && company !== 'ALL' && !department) ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <div className="min-w-[1000px]"> {/* Đảm bảo bảng không thu nhỏ dưới 1000px */}
                    <Table className="table-auto whitespace-nowrap">
                        <TableHeader className="custom-table-header">

                            <TableRow>
                                {/* <TableHead className="w-16" rowSpan={2}>#</TableHead> Cố định chiều rộng cho các cột */}
                                <TableHead className="w-48" rowSpan={2}>部門</TableHead>

                                <TableHead className="w-48" rowSpan={2}>廠處代碼</TableHead>
                                <TableHead className="w-48" rowSpan={2}>廠</TableHead>
                                <TableHead colSpan={2} className="w-96 text-center">剩餘換休未休時數</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">識別證異常率</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">文書案件催辦率</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">訓練計畫完成率</TableHead> {/* Cột cha gộp hai cột con */}
                                <TableHead colSpan={2} className="w-96 text-center">加班未於事前填單異常次數</TableHead> {/* Cột cha gộp hai cột con */}

                            </TableRow>
                            <TableRow>
                                {/* <TableHead className="w-48">剩餘可換休時數_ofF12REM</TableHead> */}
                                <TableHead className="w-48">{getPreviousMonthTitle()}</TableHead>
                                <TableHead className="w-48">{getDynamicColumnTitle()}</TableHead>

                                {/* <TableHead className="w-48">前一月剩餘可換休時數_ofF12REM_PREVIOUSYM</TableHead> */}
                                {/* CARD_RATE */}
                                <TableHead className="w-48">廠處</TableHead>
                                <TableHead className="w-48">全公司平均值</TableHead>
                                {/* followuP */}
                                <TableHead className="w-48">廠處</TableHead>
                                <TableHead className="w-48">全公司平均值</TableHead>
                                {/* traininG */}
                                <TableHead className="w-48">廠處</TableHead>
                                <TableHead className="w-48">全公司平均值</TableHead>
                                {/* overtimedutY */}
                                <TableHead className="w-48">廠處</TableHead>
                                <TableHead className="w-48">全公司合计</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="custom-table-body">
                            {groupedData.groups && Object.entries(groupedData.groups).map(([groupKey, group]) => (
                                <>
                                    {group.items.map((item, index) => (
                                        <TableRow key={`${item.co}-${item.dp}`} >
                                            {/* <TableCell>{index + 1}</TableCell> */}
                                            {/* <TableCell>{item.dP1NM}</TableCell> Hiển thị dP1NM */}
                                            {/* Gộp ô dP1NM cho nhóm, chỉ hiển thị ở dòng đầu tiên */}
                                            {index === 0 && (
                                                <TableCell rowSpan={group.items.length}>{item.dP1NM}</TableCell>
                                            )}
                                            <TableCell>{item.dp}</TableCell>
                                            <TableCell>{item.dpnm}</TableCell>
                                            <TableCell>{parseFloat(item.ofF12REM_PREVIOUSYM).toFixed(3)}</TableCell>
                                            <TableCell>{parseFloat(item.ofF12REM).toFixed(3)}</TableCell>


                                            {/* <TableCell>{item.abnmormaL_CARD_RATE}</TableCell> */}
                                            {/* Hiển thị abnmormaL_CARD_RATE trực tiếp kèm ký hiệu % */}
                                            <TableCell>{parseFloat(item.abnmormaL_CARD_RATE).toFixed(3)}%</TableCell>
                                            <TableCell className="font-bold bg-gray-100">{groupedData.overallAverage.abnmormaL_CARD_RATE.toFixed(3)}%</TableCell>  {/* Trung bình abnmormaL_CARD_RATE */}
                                            {/* <TableCell></TableCell> */}
                                            <TableCell>{parseFloat(item.followuP_ABNMORMAL_RATE).toFixed(3)}%</TableCell>
                                            <TableCell className="font-bold bg-gray-100"><TableCell>{groupedData.overallAverage.followuP_ABNMORMAL_RATE.toFixed(3)}%</TableCell></TableCell> {/* Trung bình followuP_ABNMORMAL_RATE */}
                                            {/* <TableCell></TableCell> */}
                                            <TableCell>{parseFloat(item.traininG_FINISHD_RATE).toFixed(3)}%</TableCell>
                                            <TableCell className="font-bold bg-gray-100">{groupedData.overallAverage.traininG_FINISHD_RATE.toFixed(3)}%</TableCell> {/* Trung bình traininG_FINISHD_RATE */}
                                            {/* <TableCell></TableCell> */}
                                            <TableCell>{item.overtimedutY_COUNT}</TableCell>
                                            <TableCell className="font-bold bg-gray-100">{groupedData.overallAverage.sumOvertimeDutyCount}</TableCell> {/* Tổng overtimedutY_COUNT */}
                                            {/* <TableCell></TableCell> */}
                                        </TableRow>
                                    ))}
                                    {/* Hàng Total cho nhóm */}
                                    <TableRow className="font-bold bg-gray-100 ">
                                        {/* <TableCell colSpan={3}>Total/Average for group/{groupKey}</TableCell> */}

                                        <TableCell className="bg-gray-100"></TableCell>
                                        <TableCell className="bg-gray-100" colSpan={2}> {groupKey} / 群組總計 / 平均 </TableCell>
                                        <TableCell className="bg-gray-100">{group.totals.ofF12REM_PREVIOUSYM.toFixed(2)}</TableCell>
                                        <TableCell className="bg-gray-100">{group.totals.ofF12REM.toFixed(2)}</TableCell>
                                        <TableCell className="font-bold bg-gray-100">{group.average.abnmormaL_CARD_RATE.toFixed(3)}%</TableCell> {/* Trung bình followuP_ABNMORMAL_RATE */}
                                        <TableCell className="bg-gray-100"></TableCell>
                                        <TableCell className="font-bold bg-gray-100">{group.average.followuP_ABNMORMAL_RATE.toFixed(3)}%</TableCell> {/* Trung bình followuP_ABNMORMAL_RATE */}
                                        <TableCell className="bg-gray-100"></TableCell>
                                        <TableCell className="font-bold bg-gray-100">{group.average.traininG_FINISHD_RATE.toFixed(3)}%</TableCell> {/* Trung bình traininG_FINISHD_RATE */}
                                        <TableCell className="bg-gray-100"></TableCell>
                                        <TableCell className="bg-gray-100">{group.totals.overtimedutY_COUNT}</TableCell>
                                        <TableCell className="bg-gray-100"></TableCell>
                                    </TableRow>
                                </>
                            ))}
                        </TableBody>


                    </Table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </>
    );
}
