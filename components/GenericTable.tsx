import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast"; 

type TableProps = {
    headers: Record<string, string>;
    data: any[];
};

const GenericTable = ({ headers, data }: TableProps) => (
    <Table className="table-auto whitespace-nowrap">
        <TableHeader>
            <TableRow>
                <TableHead>#</TableHead>
                {Object.values(headers).map((title) => (
                    <TableHead
                        key={title}
                        className="bg-gray-100 text-base font-semibold text-gray-800 uppercase  border-x"
                    >
                        {title}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.map((item, index) => (
                <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    {Object.keys(headers).map((key) => (
                        <TableCell key={key}
                            className="text-sm text-gray-700  border-x"
                        >
                            {item[key]}</TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

export default GenericTable;
