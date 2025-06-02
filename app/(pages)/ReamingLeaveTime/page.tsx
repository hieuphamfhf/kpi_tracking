"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import ReamingLeaveTimeTable from "./ReamingLeaveTimeTable";
import { ReamingLeaveTimeListResType } from "@/app/schemaValidations/ReamingLeaveTime";
import { formatDateUTC } from "@/lib/extensions";
import { ReamingLeaveTimeApiRequest } from "@/app/apiRequest/ReamingLeaveTime";
import { toast } from "react-hot-toast";
import Pagination from "@/components/Pagination"; // import đường dẫn đúng với cấu trúc dự án
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
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        if (!co) { // Kiểm tra xem công ty đã được chọn chưa
            console.warn("Vui lòng chọn công ty trước khi lọc dữ liệu.");
            return;
        }
        setLoading(true); // bật loading
        try {
            const queryParams = {
                co: co || '',  // Chỉ cho phép giá trị đã chọn
                department: department || '', // Cho phép bộ phận rỗng
                startYM: startYM || '',
                endYM: endYM || '',
            };

            const { payload } = await ReamingLeaveTimeApiRequest.getList(queryParams);
            console.log('Dữ liệu nhận được từ API:', payload);
            //delay 1 giây để test loading
            // await new Promise((resolve) => setTimeout(resolve, 100));
            setReamingLeaveTime(payload);
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
            setCo(''); // Đặt giá trị rỗng để chỉ ra rằng không có công ty nào được chọn
            setDepartment(''); // Đặt lại bộ phận khi công ty không được chọn
        } else {
            setCo(selectedCompany); // Cập nhật state với công ty đã chọn
        }
    };

    const handleDepartmentChange = (selectedDepartment: string) => {
        setDepartment(selectedDepartment); // Cập nhật state với bộ phận đã chọn
    };

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const totalPage = Math.ceil((ReamingLeaveTime?.length || 0) / pageSize);
    const pageData = (ReamingLeaveTime || []).slice((page - 1) * pageSize, page * pageSize);
    // Reset page về 1 khi filter đổi
    useEffect(() => { setPage(1); }, [co, department, startYM, endYM]);
    useEffect(() => {
        if (co) { // Chỉ gọi API nếu công ty đã được chọn
            fetchData();
        }
    }, [co, department, , startYM, endYM]);

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
                                    // ReamingLeaveTime={pageData}
                                    ReamingLeaveTime={ReamingLeaveTime} //  FULL DATA

                                    page={page}
                                    pageSize={pageSize}
                                    onStartYM={setstartYM}
                                    onEndYM={setendYM}
                                    onDepartment={handleDepartmentChange}
                                    onCompany={handleCompanyChange}
                                    company={co} // Truyền giá trị của công ty xuống component con
                                    loading={loading}
                                />
                            </div>
                            <div className="max-w-5xl mx-auto">
                                <div className="max-w-5xl mx-auto">
                                    <Pagination
                                        page={page}
                                        totalPage={totalPage}
                                        totalCount={ReamingLeaveTime?.length || 0}
                                        onPageChange={setPage}
                                    />
                                </div>
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
