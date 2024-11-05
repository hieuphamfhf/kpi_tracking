import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { format } from 'date-fns';

type Department = {
    dp: string;
    dpnm: string;
};

interface FilterSectionProps {
    company: string;
    department: string;
    date: DateRange | undefined;
    searchQuery: string;
    isCompanySelected: boolean;
    filteredDepartments: Department[];

    onCompanyChange: (value: string) => void;
    onDepartmentChange: (value: string) => void;
    onDateSelect: (value: DateRange | undefined) => void;
    onSearchChange: (value: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
    company,
    department,
    date,
    searchQuery,
    isCompanySelected,
    filteredDepartments,
    onCompanyChange,
    onDepartmentChange,
    onDateSelect,
    onSearchChange,
}) => {
    return (
        <div className="flex gap-5">
            {/* Dropdown để chọn công ty */}
            <Select onValueChange={onCompanyChange}>
                <SelectTrigger className="w-[150px] ">
                    <SelectValue placeholder="--選擇公司--" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem key="lg" value="LG">LG</SelectItem>
                    <SelectItem key="OD" value="OD">OD</SelectItem>
                    <SelectItem key="LT" value="LT">LT</SelectItem>
                </SelectContent>
            </Select>

            {/* Dropdown để chọn khoảng thời gian */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={`w-[200px] justify-start text-left font-normal ${!date ? 'text-muted-foreground' : ''}`}
                        disabled={!isCompanySelected} // Vô hiệu hóa khi chưa chọn công ty
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "yyyy-MM-dd")} - {format(date.to, "yyyy-MM-dd")}
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
                        onSelect={onDateSelect}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            {/* Ô nhập liệu tìm kiếm */}
            <div className="relative w-[200px]">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    placeholder="輸入部門代號..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
                    className="pr-8 pl-3"
                    disabled={!isCompanySelected}
                />
            </div>

            {/* Dropdown để chọn bộ phận */}
            <Select onValueChange={onDepartmentChange} value={department || ''} disabled={!isCompanySelected}>
                <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder={company ? "--選擇部門--" : "請先選擇公司"} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                    <div className="max-h-48 overflow-y-auto">
                        {filteredDepartments.map((item, index) => (
                            <SelectItem key={index} value={item.dp}>
                                {item.dpnm} - {item.dp}
                            </SelectItem>
                        ))}
                    </div>
                </SelectContent>
            </Select>
        </div>
    );
};

export default FilterSection;
