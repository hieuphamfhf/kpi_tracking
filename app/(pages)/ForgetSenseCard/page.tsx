"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { ForgetSenseCardListResType } from "@/app/schemaValidations/ForgetSenseCard";
import { formatDateUTC } from "@/lib/extensions";
import { ForgetSenseCardApiRequest } from "@/app/apiRequest/ForgetSenseCard";
import ForgetSenseCardTable from './ForgetSenseCardTable';

export default function ForgetSenseCardPage() {
    const [ForgetSenseCard, setForgetSenseCard] = useState<ForgetSenseCardListResType | any>();
    const [dp, setDp] = useState<string>('');
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayFormatted = formatDateUTC(firstDay);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayFormatted = formatDateUTC(lastDay);

    const [startDate, setStartDate] = useState<string>(firstDayFormatted.substring(1));
    const [endDate, setEndDate] = useState<string>(lastDayFormatted.substring(1));
    const [department, setDepartment] = useState<string>('')

    // const fetchData = async () => {

    //     try {
    //         const { payload } = await ForgetSenseCardApiRequest.getList({ department, startDate, endDate });
    //         setForgetSenseCard(payload);
    //     } catch (error) {
    //     }
    //   };
    //   useEffect(() => {
    //     fetchData();
    //   }, [endDate, startDate,department]);
    const fetchData = async () => {
        try {
            console.log('Fetching data for:', { department, startDate, endDate });  // Kiểm tra tham số truyền vào
            const { payload } = await ForgetSenseCardApiRequest.getList({ department, startDate, endDate });
            console.log('Fetched data:', payload);  // Kiểm tra dữ liệu trả về
            setForgetSenseCard(payload);  // Cập nhật dữ liệu vào state
        } catch (error) {
            console.error('Error fetching data:', error);  // Bắt lỗi nếu có
        }
    };
    
    // Khi người dùng thay đổi bộ phận, ngày bắt đầu hoặc kết thúc, gọi lại API
    useEffect(() => {
        fetchData();
    }, [department, startDate, endDate]);
    
        

    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`忘刷卡表`}</CardTitle>
                            <CardDescription>
                                {`通過篩選功能查詢並查看詳細信息。您可以匯出報告到 Excel。`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <ForgetSenseCardTable ForgetSenseCard={ForgetSenseCard}
                                    onStartDate={setStartDate}
                                    onEndDate={setEndDate}
                                    onDepartment={setDepartment}
                                />
                            </div>
                        </CardContent>

                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}