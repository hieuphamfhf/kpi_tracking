"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import ManagerReturnStatusTable from "./ManagerReturnStatusTable";
import { ManagerReturnStatusApiRequest } from "@/app/apiRequest/ManagerReturnStatus";
import { toast } from "react-hot-toast";

// Hàm lấy ngày hiện tại dạng yyyyMMdd
const getTodayString = () => {
    const d = new Date();
    return d.toISOString().slice(0,10).replace(/-/g,"");
};

export default function ManagerReturnStatusPage() {
    const [ManagerReturnStatus, setManagerReturnStatus] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    // Các state filter mới
    const [empid, setEmpid] = useState("");
    const [qrydat, setQrydat] = useState(getTodayString());
    const [status, setStatus] = useState("ALL");  // "ALL" nghĩa là không lọc
    const [JPNM, setJPNM] = useState("");         // Chức vụ, truyền "" nếu muốn "tất cả"

    // Hàm fetchData mới dùng API mới
    const fetchData = async () => {
        setLoading(true);
        try {
            const { payload } = await ManagerReturnStatusApiRequest.getList({
                empid,
                qrydat,
                status,
                JPNM,
            });
            setManagerReturnStatus(payload || []);
            if (!payload || payload.length === 0) {
                toast.error('資料為空！', { duration: 2000, position: 'top-center' });
            }
        } catch (error) {
            toast.error('Lỗi khi lấy dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại mỗi khi filter đổi
    useEffect(() => {
        fetchData();
    }, [empid, qrydat, status, JPNM]);

    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>高階主管行蹤查詢</CardTitle>
                            <CardDescription>
                                查詢在台灣期間，請選擇過濾條件。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <ManagerReturnStatusTable
                                    ManagerReturnStatus={ManagerReturnStatus}
                                    loading={loading}
                                    empid={empid}
                                    setEmpid={setEmpid}
                                    qrydat={qrydat}
                                    setQrydat={setQrydat}
                                    status={status}
                                    setStatus={setStatus}
                                    JPNM={JPNM}
                                    setJPNM={setJPNM}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
