"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import FollowUpReminderTable from "./FollowUpReminderTable";
import { FollowUpReminderListResType } from "@/app/schemaValidations/FollowUpReminder";
import { formatDateUTC } from "@/lib/extensions";
import { FollowUpReminderApiRequest } from "@/app/apiRequest/FollowUpReminder";
import { toast } from "react-hot-toast";

export default function FollowUpReminderPage() {
    const [FollowUpReminder, setFollowUpReminder] = useState<FollowUpReminderListResType | any>();
    const [co, setCo] = useState<string>(''); // State cho công ty
    const [department, setDepartment] = useState<string>(''); // State cho bộ phận
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayFormatted = formatDateUTC(firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayFormatted = formatDateUTC(lastDay);

    const [startDate, setStartDate] = useState<string>(firstDayFormatted.substring(1));
    const [endDate, setEndDate] = useState<string>(lastDayFormatted.substring(1));
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        if (!co) { // Kiểm tra xem công ty đã được chọn 
            return;
        }
        setLoading(true); // bật loading
        try {
            const queryParams = {
                co: co || '',  // Chỉ cho phép giá trị đã chọn
                department: department || '', // Cho phép bộ phận rỗng
                startDate: startDate || '',
                endDate: endDate || '',
            };

            const { payload } = await FollowUpReminderApiRequest.getList(queryParams);
            console.log('Dữ liệu nhận được từ API:', payload);
            //delay 1 giây để test loading
            await new Promise((resolve) => setTimeout(resolve, 100));
            setFollowUpReminder(payload);
            // Hiển thị toast nếu không có dữ liệu
            if (!payload || payload.length === 0) {
                toast.error('資料為空！'
                    , {
                        duration: 2000,
                         position: 'top-center',
                    });
            }

        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleCompanyChange = (selectedCompany: string) => {
        if (selectedCompany === "ALL") {
            setCo(''); 
            setDepartment(''); 
        } else {
            setCo(selectedCompany); 
        }
    };

    const handleDepartmentChange = (selectedDepartment: string) => {
        setDepartment(selectedDepartment);
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
                            <CardTitle>{`多次催辦案件查詢`}</CardTitle>
                            <CardDescription>
                                {`選擇公司和部門以篩選數據，或同時留空以顯示所有數據。您可以匯出報告到 Excel。`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <FollowUpReminderTable
                                    FollowUpReminder={FollowUpReminder}
                                    onStartDate={setStartDate}
                                    onEndDate={setEndDate}
                                    onDepartment={handleDepartmentChange}
                                    onCompany={handleCompanyChange}
                                    company={co} // Truyền giá trị của công ty xuống component con
                                    department={department}
                                    loading={loading}
                                />

                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    );
}
