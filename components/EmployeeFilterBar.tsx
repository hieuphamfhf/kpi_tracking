"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarRangeIcon, IterationCcw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

// === Dữ liệu nhân viên từ API EmpployeeInfo ===
type EmpRecord = {
    empid: string;
    nm: string;
    dp: string;
    dpnm: string;
    newdutnm: string;
};

type Props = {
    empid: string;
    nm: string;
    dp: string;
    dpnm: string;
    newdutnm: string;
    onEmpidChange: (v: string) => void;
    onNmChange: (v: string) => void;
    onDpChange: (v: string) => void;
    onDpnmChange: (v: string) => void;
    onNewdutnmChange: (v: string) => void;
    showDate?: boolean;
    dateMode?: "range" | "single";
    onDateChange?: (from: string, to: string) => void;
    autoFillEmpidOnName?: boolean;
};

export default function EmployeeFilterBar({
    empid, nm, dp, dpnm, newdutnm,
    onEmpidChange, onNmChange, onDpChange, onDpnmChange, onNewdutnmChange,
    showDate = true,
    dateMode = "range",
    onDateChange,
    autoFillEmpidOnName = true,
}: Props) {

    // ===== Dropdown "Tên bộ phận" & "Tên nhân viên" phụ thuộc chức vụ =====
    const [loadingDept, setLoadingDept] = useState(false);
    const [loadingName, setLoadingName] = useState(false);

    // Dữ liệu từ EmpployeeInfo (lọc theo newdutnm, dpnm)
    const [empPoolForDept, setEmpPoolForDept] = useState<EmpRecord[]>([]);
    const [empPoolForName, setEmpPoolForName] = useState<EmpRecord[]>([]);


    const [date, setDate] = useState<DateRange | undefined>(() => {
        if (dateMode === "single") return { from: new Date(), to: undefined };
        return { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
    });

    const handleDateChange = (range: DateRange | undefined) => {
        setDate(range);
        if (!range?.from || !onDateChange) return;
        const from = format(range.from, "yyyyMMdd");
        if (dateMode === "single") {
            onDateChange(from, from);
        } else if (range?.to) {
            const to = format(range.to, "yyyyMMdd");
            onDateChange(from, to);
        }
    };
    // 1) Khi chọn/chỉnh "chức vụ" → nạp pool để suy ra danh sách TÊN BỘ PHẬN
    useEffect(() => {
        setEmpPoolForDept([]);
        setEmpPoolForName([]);
        onDpnmChange("");   // reset khi đổi chức vụ
        // không gọi nếu chưa chọn chức vụ
        if (!newdutnm) return;

        const qs = new URLSearchParams({
            empid: "", NM: "", dp: "", dpnm: "", newdutnm
        }).toString();

        (async () => {
            setLoadingDept(true);
            try {
                const res = await fetch(`http://10.198.170.99:5000/API/EmpployeeInfo?${qs}`);
                const data: EmpRecord[] = await res.json();
                setEmpPoolForDept(Array.isArray(data) ? data : []);
            } catch {
                setEmpPoolForDept([]);
            } finally {
                setLoadingDept(false);
            }
        })();
    }, [newdutnm, onDpnmChange]);

    // Rút trích danh sách TÊN BỘ PHẬN duy nhất từ empPoolForDept
    // const deptNameOptions = useMemo(() => {
    //     const map = new Map<string, string>(); // key=dpnm, val=dp (ưu tiên dp đầu tiên gặp)
    //     for (const r of empPoolForDept) {
    //         if (!map.has(r.dpnm)) map.set(r.dpnm, r.dp);
    //     }
    //     // hiển thị "Tên bộ phận — Mã"
    //     return Array.from(map.entries()).map(([name, code]) => ({ label: `${name} — ${code}`, dpnm: name, dp: code }));
    // }, [empPoolForDept]);
    const deptNameOptions = useMemo(() => {
        const map = new Map<string, string>();
        for (const r of empPoolForDept) {
            if (!map.has(r.dpnm)) map.set(r.dpnm, r.dp);
        }
        return Array.from(map.entries())
            .map(([name, code]) => ({ label: `${name} — ${code}`, dpnm: name, dp: code }))
            .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'));
    }, [empPoolForDept]);




    // 2) Khi chọn "tên bộ phận" (hoặc chỉ có chức vụ) → nạp pool để suy ra danh sách TÊN NHÂN VIÊN
    useEffect(() => {
        setEmpPoolForName([]);
        if (!newdutnm) return; // cần có chức vụ
        const qs = new URLSearchParams({
            empid: "",
            NM: "",
            dp: "",
            dpnm: dpnm || "",
            newdutnm
        }).toString();

        const t = setTimeout(async () => {
            setLoadingName(true);
            try {
                const res = await fetch(`http://10.198.170.99:5000/API/EmpployeeInfo?${qs}`);
                const data: EmpRecord[] = await res.json();
                setEmpPoolForName(Array.isArray(data) ? data : []);
            } catch {
                setEmpPoolForName([]);
            } finally {
                setLoadingName(false);
            }
        }, 250); // debounce nhẹ
        return () => clearTimeout(t);
    }, [newdutnm, dpnm]);

    // Rút trích danh sách TÊN NHÂN VIÊN duy nhất
    // const nameOptions = useMemo(() => {
    //     const set = new Set<string>();
    //     for (const r of empPoolForName) set.add(r.nm);
    //     return Array.from(set);
    // }, [empPoolForName]);
    const nameOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of empPoolForName) set.add(r.nm);
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
    }, [empPoolForName]);


    // Khi đổi tên bộ phận từ dropdown → sync cả dp (mã) cho nhất quán
    const handlePickDeptName = (pickedDpnm: string) => {
        onDpnmChange(pickedDpnm);
        const first = empPoolForDept.find(r => r.dpnm === pickedDpnm);
        onDpChange(first?.dp ?? "");
        onNmChange(""); // reset tên để user chọn lại theo bộ phận mới
    };

    // Khi đổi tên nhân viên → chỉ set nm (empid vẫn để người dùng nhập tay theo yêu cầu)
    // const handlePickName = (pickedNm: string) => {
    //     onNmChange(pickedNm);
    //     // Không tự fill empid; nếu muốn, có thể dò 1 emp trùng tên và gợi ý empid
    // };


    // Khi đổi tên nhân viên → set nm; nếu duy nhất một empid thì auto-fill empid
    // 
    const handlePickName = (pickedNm: string) => {
        onNmChange(pickedNm);

        // Lấy các bản ghi trùng tên trong pool đã được lọc theo newdutnm + dpnm
        const matches = empPoolForName.filter(r => r.nm === pickedNm);
        const uniqEmpids = Array.from(new Set(matches.map(m => m.empid)));

        if (uniqEmpids.length === 1) {
            // Tự động điền khi chỉ có 1 mã
            onEmpidChange(uniqEmpids[0]);
        } else {
            // Nhiều mã hoặc không tìm thấy -> không tự điền, clear để user chọn/nhập
            onEmpidChange("");
        }
    };

    // Thay vì onChange={(e) => onEmpidChange(e.target.value.toUpperCase())}
    const handleEmpidInput = async (raw: string) => {
        const v = raw.trim().toUpperCase();
        onEmpidChange(v);

        if (!v) { onNmChange(""); return; }

        let candidates = empPoolForName.filter(r => r.empid === v);

        if (candidates.length === 0) {
            const qs = new URLSearchParams({
                empid: v, NM: "", dp: "", dpnm: dpnm || "", newdutnm: newdutnm || ""
            }).toString();
            try {
                const res = await fetch(`http://10.198.170.99:5000/API/EmpployeeInfo?${qs}`);
                const data: EmpRecord[] = await res.json();
                candidates = Array.isArray(data) ? data : [];
            } catch { /* ignore */ }
        }

        const uniqNames = Array.from(new Set(candidates.map(c => c.nm)));
        if (uniqNames.length === 1) {
            onNmChange(uniqNames[0]);
        } else if (uniqNames.length === 0 && v) {
            //  Không tìm thấy mã → hiện toast + gợi ý reset
            // toast.error("Không tìm thấy mã nhân viên trong bộ lọc hiện tại. Vui lòng nhấn nút '重置' và chọn lại bộ lọc.");

            toast.error("當前篩選條件中找不到此員工編號，請點擊「重置」重新選擇篩選條件。", {
                position: "top-center"
            });

            onNmChange(""); // clear tên để tránh hiển thị sai
        }
    };


    return (
        <div className="flex items-center gap-4 overflow-x-auto w-full">

            {/* === Chức vụ (điểm xuất phát cho 2 dropdown) === */}
            <Select value={newdutnm} onValueChange={(v) => { onNewdutnmChange(v); }}>
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="--請選擇職級--" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="經營主管">經營主管</SelectItem>
                    <SelectItem value="一級主管">一級主管</SelectItem>
                    <SelectItem value="二級主管">二級主管</SelectItem>
                    <SelectItem value="基層主管">基層主管</SelectItem>
                    <SelectItem value="基層人員">基層人員</SelectItem>
                    <SelectItem value="基層事務人員">基層事務人員</SelectItem>
                </SelectContent>
            </Select>

            {/* === Tên bộ phận (dropdown, phụ thuộc chức vụ) === */}
            <Select
                value={dpnm}
                onValueChange={handlePickDeptName}
                disabled={!newdutnm || loadingDept}
            >
                <SelectTrigger className="w-[260px] h-9">
                    <SelectValue placeholder={!newdutnm ? "請先選擇職級" : (loadingDept ? "載入中…" : "--選擇部門名稱--")} />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                    {deptNameOptions.length === 0
                        ? <div className="px-3 py-2 text-sm text-muted-foreground">無資料</div>
                        : deptNameOptions.map(opt => (
                            <SelectItem key={`${opt.dpnm}-${opt.dp}`} value={opt.dpnm}>
                                {opt.label}
                            </SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>

            {/* === Tên nhân viên (dropdown, phụ thuộc chức vụ + bộ phận đã chọn) === */}
            <Select
                value={nm}
                onValueChange={handlePickName}
                disabled={!newdutnm || loadingName}
            >
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder={!newdutnm ? "請先選擇職級" : (loadingName ? "載入中…" : "--選擇姓名--")} />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                    {nameOptions.length === 0
                        ? <div className="px-3 py-2 text-sm text-muted-foreground">無資料</div>
                        : nameOptions.map(n => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>

            {/* === Mã nhân viên: giữ input tự do === */}
            <div className="relative w-[160px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                {/* <Input
                    value={empid}
                    onChange={(e) => onEmpidChange(e.target.value.toUpperCase())}
                    placeholder="員工編號"
                    className="h-9 pr-8"
                /> */}
                <Input
                    value={empid}
                    onChange={(e) => handleEmpidInput(e.target.value)}
                    placeholder="員工編號"
                    className="h-9 pr-8"
                    disabled={!newdutnm} // disable nếu chưa chọn chức vụ
                />

            </div>

            {/* ---- Date filter (optional) ---- */}
            {showDate && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                dateMode === "single" ? "w-[150px]" : "w-[210px]",
                                "h-9 px-3 py-1 text-sm flex items-center justify-between rounded-md border bg-white shadow-sm"
                            )}
                        >
                            {date?.from ? (
                                date.to
                                    ? `${format(date.from, "yyyy-MM-dd")} - ${format(date.to, "yyyy-MM-dd")}`
                                    : format(date.from, "yyyy-MM-dd")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarRangeIcon className="h-4 w-4 ml-2" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        {dateMode === "single" ? (
                            <Calendar
                                initialFocus
                                mode="single"
                                defaultMonth={date?.from}
                                selected={date?.from}
                                onSelect={(d) => handleDateChange({ from: d as Date })}
                                numberOfMonths={1}
                            />
                        ) : (
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(r) => handleDateChange(r as DateRange)}
                                numberOfMonths={2}
                            />
                        )}
                    </PopoverContent>
                </Popover>
            )}
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    onNewdutnmChange("");
                    onDpnmChange("");
                    onDpChange("");
                    onNmChange("");
                    onEmpidChange("");
                    // nếu bạn có state nội bộ cho options thì clear luôn:
                    // setEmpPoolForDept([]); setEmpPoolForName([]);
                }}
            >
                <IterationCcw className="h-4 w-4 mr-2" />
                重置
            </Button>
        </div>
    );
}
