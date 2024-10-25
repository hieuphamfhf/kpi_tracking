"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import ReamingLeaveTimeTable from "./ReamingLeaveTimeTable";
import { ReamingLeaveTimeListResType } from "@/app/schemaValidations/ReamingLeaveTime";
import { formatDateUTC } from "@/lib/extensions";
import { ReamingLeaveTimeApiRequest } from "@/app/apiRequest/ReamingLeaveTime";

export default function ReamingLeaveTimePage() {
    const [ReamingLeaveTime, setReamingLeaveTime] = useState<ReamingLeaveTimeListResType | any>();
    const [co, setCo] = useState<string>(''); // State cho công ty
    const [department, setDepartment] = useState<string>(''); // State cho bộ phận
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayFormatted = formatDateUTC(firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayFormatted = formatDateUTC(lastDay);
    const [startYM, setstartYM] = useState<string>(firstDayFormatted.substring(1));
    const [endYM, setendYM] = useState<string>(lastDayFormatted.substring(1));
    const fetchData = async () => {
        try {
            // Nếu cả công ty và bộ phận đều để trống, chỉ lọc theo thời gian
            if (!co && !department) {
                if (!ReamingLeaveTime || ReamingLeaveTime.length === 0) { // Chỉ log nếu chưa có dữ liệu trước đó
                    console.log('Lọc theo thời gian mà không có bộ lọc công ty hoặc bộ phận.');
                }

                const queryParams = {
                    co: '',
                    department: '',
                    startYM: startYM || '',
                    endYM: endYM || '',
                };

                const { payload } = await ReamingLeaveTimeApiRequest.getList(queryParams);
                console.log('Dữ liệu nhận được từ API (lọc theo thời gian):', payload);
                setReamingLeaveTime(payload);
                return;
            }

            // Kiểm tra nếu cả công ty và bộ phận đều được chọn
            if (co && department) {
                const queryParams = {
                    co: co,
                    department: department,
                    startYM: startYM || '',
                    endYM: endYM || '',
                };

                console.log('Gửi yêu cầu đến API với các tham số:', queryParams);
                const { payload } = await ReamingLeaveTimeApiRequest.getList(queryParams);
                console.log('Dữ liệu nhận được từ API:', payload);
                setReamingLeaveTime(payload);
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
    }, [co, department, startYM, endYM]);

    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`剩餘換休未休時數報表`}</CardTitle>
                            <CardDescription>
                                {`選擇公司和部門以篩選數據，或同時留空以顯示所有數據。您可以匯出報告到 Excel。`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <ReamingLeaveTimeTable
                                    ReamingLeaveTime={ReamingLeaveTime}
                                    onStartYM={setstartYM}
                                    onEndYM={setendYM}
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
