// components/EmployeeFilterBar.tsx
import { Search } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type EmployeeFilterBarProps = {
    empid: string;
    nm: string;
    dp: string;
    dpnm: string;
    newdutnm: string;
    onEmpidChange: (value: string) => void;
    onNmChange: (value: string) => void;
    onDpChange: (value: string) => void;
    onDpnmChange: (value: string) => void;
    onNewdutnmChange: (value: string) => void;
};

export default function EmployeeFilterBar({
    empid,
    nm,
    dp,
    dpnm,
    newdutnm,
    onEmpidChange,
    onNmChange,
    onDpChange,
    onDpnmChange,
    onNewdutnmChange
}: EmployeeFilterBarProps) {
    return (
        <div className="flex items-center gap-4 overflow-x-auto w-full">
            {/* Dropdown chức vụ mới*/}
            <Select
                value={newdutnm === "" ? "all" : newdutnm}
                onValueChange={v => onNewdutnmChange(v === "all" ? "" : v)}
            >
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="經營主管級">經營主管級</SelectItem>
                    <SelectItem value="一級主管">一級主管</SelectItem>
                </SelectContent>
            </Select>



            {/* Mã phòng ban có icon tìm kiếm */}
            <div className="relative w-[160px]">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    value={dp}
                    onChange={e => onDpChange(e.target.value.toUpperCase())}
                    placeholder="部門代號"
                    className="border rounded h-9 pl-3 pr-8 w-full"
                />
            </div>

            {/* Tên nhân viên */}
            <div className="relative w-[160px]">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                    value={nm}
                    onChange={e => onNmChange(e.target.value)}
                    placeholder="姓名"
                    className="border rounded h-9 pl-3 pr-8 w-full"
                />
            </div>
            {/* Mã Nhân viên VNW    */}
            <div className="relative w-[160px]">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    value={empid}
                    onChange={e => onEmpidChange(e.target.value.toUpperCase())}
                    placeholder="員工編號"
                    className="border rounded h-9 pl-3 pr-8 w-full"
                />
            </div>

            {/* <input
                value={dpnm}
                onChange={e => onDpnmChange(e.target.value)}
                placeholder="部門名稱"
                className="border p-2 rounded"
            /> */}

        </div>
    );
}
