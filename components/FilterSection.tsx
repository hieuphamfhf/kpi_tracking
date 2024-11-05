import { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { endOfMonth, startOfMonth, format } from 'date-fns';

// Định nghĩa kiểu cho các props
type FilterSectionProps = {
    onCompany: (value: string) => void;
    onDepartment: (value: string) => void;
    onStartDate: (value: string) => void;
    onEndDate: (value: string) => void;
    companyList: { value: string; label: string }[];
    departmentList: { dp: string; dpnm: string }[];
};

export default function FilterSection({
    onCompany,
    onDepartment,
    onStartDate,
    onEndDate,
    companyList,
    departmentList
}: FilterSectionProps) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [company, setCompany] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleCompanyChange = (selectedCompany: string) => {
        setCompany(selectedCompany);
        onCompany(selectedCompany);
        setDepartment(''); // Reset department when company changes
    };

    const handleDepartmentChange = (value: string) => {
        setDepartment(value);
        onDepartment(value);
    };

    const handleDateSelect = (newDate: DateRange | undefined) => {
        setDate(newDate);
        if (newDate?.from) onStartDate(format(newDate.from, "yyyyMMdd"));
        if (newDate?.to) onEndDate(format(newDate.to, "yyyyMMdd"));
    };

    return (
        <div className="flex gap-5">
            {/* Company Select */}
            <Select onValueChange={handleCompanyChange}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="--選擇公司--" />
                </SelectTrigger>
                <SelectContent>
                    {companyList.map((comp) => (
                        <SelectItem key={comp.value} value={comp.value}>{comp.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button className="w-[200px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from && date?.to ? `${format(date.from, "yyyy-MM-dd")} - ${format(date.to, "yyyy-MM-dd")}` : 'Pick a date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <Calendar mode="range" selected={date} onSelect={handleDateSelect} />
                </PopoverContent>
            </Popover>

            {/* Department Search */}
            <Input
                placeholder="輸入部門代號..."
                value={searchQuery}
                onChange={(e) => {
                    const upperCaseValue = e.target.value.toUpperCase();
                    setSearchQuery(upperCaseValue);
                    onDepartment(upperCaseValue);
                }}
                className="w-[200px]"
            />
            
            {/* Department Dropdown */}
            <Select onValueChange={handleDepartmentChange} value={department}>
                <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="--選擇部門--" />
                </SelectTrigger>
                <SelectContent>
                    {departmentList.map((dept) => (
                        <SelectItem key={dept.dp} value={dept.dp}>
                            {dept.dpnm} - {dept.dp}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
