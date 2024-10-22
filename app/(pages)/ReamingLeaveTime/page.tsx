"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { ReamingLeaveTimeListResType } from "@/app/schemaValidations/ReamingLeaveTime";
import { formatDateUTC } from "@/lib/extensions";
import { ReamingLeaveTimeApiRequest } from "@/app/apiRequest/ReamingLeaveTime";
import ReamingLeaveTimeTable from './ReamingLeaveTimeTable';

export default function ReamingLeaveTimePage() {
    const [ReamingLeaveTime, setReamingLeaveTime] = useState<ReamingLeaveTimeListResType | any>();
    const [dp, setDp] = useState<string>('');
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayFormatted = formatDateUTC(firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayFormatted = formatDateUTC(lastDay);

    const [startYM, setstartYM] = useState<string>(firstDayFormatted.substring(1));
    const [endYM, setendYM] = useState<string>(lastDayFormatted.substring(1));
    const [department, setDepartment] = useState<string>('')

  

    const fetchData = async () => {
        try {
            console.log('Fetching data for:', { department, startYM, endYM });  // Kiểm tra tham số truyền vào
            const { payload } = await ReamingLeaveTimeApiRequest.getList({ department, startYM, endYM });
            console.log('Fetched data:', payload);  // Kiểm tra dữ liệu trả về
            setReamingLeaveTime(payload);  // Cập nhật dữ liệu vào state
        } catch (error) {
            console.error('Error fetching data:', error);  // Bắt lỗi nếu có
        }
    };

    // Khi người dùng thay đổi bộ phận, ngày bắt đầu hoặc kết thúc, gọi lại API
    useEffect(() => {
        fetchData();
    }, [department, startYM,]);

    
    // const handleDepartmentChange = (departmentValue: string) => {
    //     // Xử lý thay đổi bộ phận được truyền từ `TrainingTable`
    //     setDepartment(departmentValue);
    // };

    // const handlestartYMChange = (startYMValue: string) => {
    //     // Xử lý thay đổi ngày bắt đầu được truyền từ `TrainingTable`
    //     setstartYM(startYMValue);
    // };

    // const handleendYMChange = (endYMValue: string) => {
    //     // Xử lý thay đổi ngày kết thúc được truyền từ `TrainingTable`
    //     setendYM(endYMValue);
    // };
    
    
    const handleDepartmentChange = (departmentValue: string) => {
        // Xử lý thay đổi bộ phận được truyền từ `TrainingTable`
        setDepartment(departmentValue);
    };

    const handleStartDateChange = (startDateValue: string) => {
        // Xử lý thay đổi ngày bắt đầu được truyền từ `TrainingTable`
        setstartYM(startDateValue);
    };

    // const handleEndDateChange = (endDateValue: string) => {
    //     // Xử lý thay đổi ngày kết thúc được truyền từ `TrainingTable`
    //     endYM(endDateValue);
    // };
    const handleEndDateChange = (endDateValue: string) => {
        // Xử lý thay đổi ngày kết thúc được truyền từ `TrainingTable`
        setendYM(endDateValue); // Sửa từ `endYM` thành `setendYM`
    };
    
    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`剩餘換休未休時數報表`}</CardTitle>
                            <CardDescription>
                                {`通過篩選功能查詢並查看詳細信息。您可以匯出報告到 Excel。`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <ReamingLeaveTimeTable ReamingLeaveTime={ReamingLeaveTime}
                                     onstartYM={handleStartDateChange}
                                     onendYM={handleEndDateChange}
                                     onDepartment={handleDepartmentChange}
                                />
                            </div>
                        </CardContent>

                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}