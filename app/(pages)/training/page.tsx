"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import TrainingTable from "./TrainingTable";
import { TrainingListResType } from "@/app/schemaValidations/Training";
import { formatDateUTC } from "@/lib/extensions";
import { TrainingApiRequest } from "@/app/apiRequest/Training";

export default function TrainingPage() {
    const [Training, setTraining] = useState<TrainingListResType | any>();
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
        try {
            // Nếu cả công ty và bộ phận đều để trống, chỉ lọc theo thời gian
            if (!co && !department) {
                if (!Training || Training.length === 0) { // Chỉ log nếu chưa có dữ liệu trước đó
                    console.log('Lọc theo thời gian mà không có bộ lọc công ty hoặc bộ phận.');
                }

                const queryParams = {
                    co: '',
                    department: '',
                    startDate: startDate || '',
                    endDate: endDate || '',
                };

                const { payload } = await TrainingApiRequest.getList(queryParams);
                console.log('Dữ liệu nhận được từ API (lọc theo thời gian):', payload);
                setTraining(payload);
                return;
            }

            // Kiểm tra nếu cả công ty và bộ phận đều được chọn
            if (co && department) {
                const queryParams = {
                    co: co,
                    department: department,
                    startDate: startDate || '',
                    endDate: endDate || '',
                };

                console.log('Gửi yêu cầu đến API với các tham số:', queryParams);
                const { payload } = await TrainingApiRequest.getList(queryParams);
                console.log('Dữ liệu nhận được từ API:', payload);
                setTraining(payload);
            } else {
                console.warn('Vui lòng chọn cả công ty và bộ phận để lọc chính xác.');
            }
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
        // Kiểm tra nếu tất cả các bộ lọc bị bỏ trống thì chỉ lọc theo thời gian
        if (!co && !department) {
            console.log('Lọc theo thời gian mà không có bộ lọc công ty hoặc bộ phận.');
        }
        fetchData();
    }, [co, department, startDate, endDate]);

    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`每月訓練課程查詢`}</CardTitle>
                            <CardDescription>
                                {`選擇公司和部門以篩選數據，或同時留空以顯示所有數據。您可以匯出報告到 Excel。`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <TrainingTable
                                    Training={Training}
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
            {((co && !department) || (!co && department)) && (
                <div className="text-red-500 mt-2">
                    Vui lòng chọn cả công ty và bộ phận hoặc để trống cả hai để xem toàn bộ dữ liệu.
                </div>
            )}
        </div>
    );
}
