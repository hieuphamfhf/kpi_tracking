// components/EmployeeFilterBar.tsx

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
        <div className="flex gap-2 mb-4">
            {/* <input
                value={empid}
                onChange={e => onEmpidChange(e.target.value)}
                placeholder="員工編號"
                className="border p-2 rounded"
            /> */}
            <input
                value={nm}
                onChange={e => onNmChange(e.target.value)}
                placeholder="姓名"
                className="border p-2 rounded"
            />
            <input
                value={dp}
                onChange={e => onDpChange(e.target.value)}
                placeholder="部門代號"
                className="border p-2 rounded"
            />
            {/* <input
                value={dpnm}
                onChange={e => onDpnmChange(e.target.value)}
                placeholder="部門名稱"
                className="border p-2 rounded"
            /> */}
            <input
                value={newdutnm}
                onChange={e => onNewdutnmChange(e.target.value)}
                placeholder="新職稱名稱"
                className="border p-2 rounded"
            />
        </div>
    );
}
