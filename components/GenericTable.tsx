import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Danh sách các key cho phép sort
const SORTABLE_KEYS = ["dp", "nm", "newdutnm","empid","dpnm"];

type TableProps = {
    headers: Record<string, string>;
    data: any[];
};

type SortDirection = "asc" | "desc";

const GenericTable = ({ headers, data }: TableProps) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    // Hàm sort lại data dựa vào column & direction
    const sortedData = React.useMemo(() => {
        if (!sortColumn) return data;
        // Cẩn thận nếu data null hoặc undefined
        return [...data].sort((a, b) => {
            const aVal = a[sortColumn] ?? "";
            const bVal = b[sortColumn] ?? "";
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [data, sortColumn, sortDirection]);

    // Khi click header
    const handleSort = (key: string) => {
        if (sortColumn === key) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(key);
            setSortDirection("asc");
        }
    };

    return (
        <Table className="table-auto whitespace-nowrap">
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    {Object.entries(headers).map(([key, title]) => (
                        <TableHead
                            key={key}
                            className={
                                SORTABLE_KEYS.includes(key)
                                    ? "bg-gray-100 text-base font-semibold text-gray-800 uppercase border-x cursor-pointer select-none"
                                    : "bg-gray-100 text-base font-semibold text-gray-800 uppercase border-x"
                            }
                            onClick={() => SORTABLE_KEYS.includes(key) && handleSort(key)}
                        >
                            <span className="flex items-center gap-1">
                                {title}
                                {SORTABLE_KEYS.includes(key) && (
                                    <span className="ml-1">
                                        {sortColumn === key ? (
                                            <span className={sortDirection === "asc" ? "text-black" : "text-black"}>
                                                {sortDirection === "asc" ? "▲" : "▼"}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">△▽</span>
                                        )}
                                    </span>
                                )}
                            </span>
                        </TableHead>

                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedData.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        {Object.keys(headers).map((key) => (
                            <TableCell key={key} className="text-sm text-gray-700 border-x">
                                {item[key]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default GenericTable;
