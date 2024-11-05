"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import OverTimeDutyTable from "./OverTimeDutyTable";
import { OverTimeDutyListResType } from "@/app/schemaValidations/OverTimeDuty";
import { formatDateUTC } from "@/lib/extensions";
import { OverTimeDutyApiRequest } from "@/app/apiRequest/OverTimeDuty";

export default function OverTimeDutyPage() {
    const [OverTimeDuty, setOverTimeDuty] = useState<OverTimeDutyListResType | any>();
    const [co, setCo] = useState<string>(''); // State cho công ty
    const [department, setDepartment] = useState<string>(''); // State cho bộ phận
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayFormatted = formatDateUTC(firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayFormatted = formatDateUTC(lastDay);
    const [startDate, setStartDate] = useState<string>(firstDayFormatted.substring(1));
    const [endDate, setEndDate] = useState<string>(lastDayFormatted.substring(1));
    const fetchData = async () => {
        if (!co) { // Kiểm tra xem công ty đã được chọn chưa
            console.warn("Vui lòng chọn công ty trước khi lọc dữ liệu.");
            return;
        }
    
        try {
            const queryParams = {
                co: co || '',  // Chỉ cho phép giá trị đã chọn
                department: department || '', // Cho phép bộ phận rỗng
                startDate: startDate || '',
                endDate: endDate || '',
            };
    
            const { payload } = await OverTimeDutyApiRequest.getList(queryParams);
            console.log('Dữ liệu nhận được từ API:', payload);
            setOverTimeDuty(payload);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    const handleCompanyChange = (selectedCompany: string) => {
        if (selectedCompany === "ALL") {
            setCo(''); // Đặt giá trị rỗng để chỉ ra rằng không có công ty nào được chọn
            setDepartment(''); // Đặt lại bộ phận khi công ty không được chọn
        } else {
            setCo(selectedCompany); // Cập nhật state với công ty đã chọn
        }
    };

    const handleDepartmentChange = (selectedDepartment: string) => {
        setDepartment(selectedDepartment); // Cập nhật state với bộ phận đã chọn
    };

    useEffect(() => {
        if (co) { // Chỉ gọi API nếu công ty đã được chọn
            fetchData();
        }
    }, [co, department, startDate, endDate]);

    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`加班單`}</CardTitle>
                            <CardDescription>
                                {`選擇公司和部門以篩選數據，或同時留空以顯示所有數據。您可以匯出報告到 Excel。`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <OverTimeDutyTable
                                    OverTimeDuty={OverTimeDuty}
                                    onStartDate={setStartDate}
                                    onEndDate={setEndDate}
                                    onDepartment={handleDepartmentChange}
                                    onCompany={handleCompanyChange}
                                    company={co} // Truyền giá trị của công ty xuống component con
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* {((co && !department) || (!co && department)) && (
                <div className="text-red-500 mt-2">
                    Vui lòng chọn cả công ty và bộ phận hoặc để trống cả hai để xem toàn bộ dữ liệu.
                </div>
            )} */}
        </div>
    );
}
