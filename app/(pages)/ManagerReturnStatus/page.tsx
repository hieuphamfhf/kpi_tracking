"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import ManagerReturnStatusTable from "./ManagerReturnStatusTable";
import { ManagerReturnStatusApiRequest } from "@/app/apiRequest/ManagerReturnStatus";
import { toast } from "react-hot-toast";
import Pagination from "@/components/Pagination";

// Hàm lấy ngày hiện tại dạng yyyyMMdd
const getTodayString = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10).replace(/-/g, "");
};
let currentRequestId = 0;

export default function ManagerReturnStatusPage() {
    const [ManagerReturnStatus, setManagerReturnStatus] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    // Các state filter mới
    const [empid, setEmpid] = useState("");
    const [qrydat, setQrydat] = useState(getTodayString());
    const [status, setStatus] = useState("");
    const [JPNM, setJPNM] = useState("經營主管");        
    // ====== KHAI BÁO PHÂN TRANG ======
    const PAGE_SIZE = 50;
    const [page, setPage] = useState(1);
    const totalPage = Math.ceil(ManagerReturnStatus.length / PAGE_SIZE);
    // const pageData = ManagerReturnStatus.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Hàm fetchData mới dùng API mới
    const fetchData = async () => {
        setManagerReturnStatus([]);   // <-- clear data trước khi loading
        setLoading(true);
        const requestId = ++currentRequestId; // Mỗi lần gọi tăng requestId lên
        console.log('[fetchData] Call API:', { empid, qrydat, status, JPNM });
        try {
            const { payload } = await ManagerReturnStatusApiRequest.getList({
                empid,
                qrydat,
                status,
                JPNM,
            });
            // Chỉ cập nhật kết quả nếu là request mới nhất
            if (requestId === currentRequestId) {
                setManagerReturnStatus(payload || []);
                if (!payload || payload.length === 0) {
                    toast.error('資料為空！', { duration: 2000, position: 'top-center' });
                }
            }
        } catch (error) {
            toast.error('ERROR GET DATA FROM API!');
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại mỗi khi filter đổi
    useEffect(() => {
        fetchData();
    }, [empid, qrydat, status, JPNM]);

    // ====== RESET VỀ TRANG 1 KHI FILTER ĐỔI ======
    useEffect(() => {
        setPage(1); 
    }, [empid, qrydat, status, JPNM]);

    return (
        <div>
            <Tabs defaultValue="account" className="bg-gray-50">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle>探親單查詢(依據日期)</CardTitle>
                            <CardDescription>
                                查詢在台灣期間，請選擇過濾條件。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <ManagerReturnStatusTable
                                    ManagerReturnStatus={ManagerReturnStatus}  // truyền toàn bộ data!
                                    page={page}
                                    pageSize={PAGE_SIZE}
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
                            {/* ====== PHÂN TRANG ====== */}
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    page={page}
                                    totalPage={totalPage}
                                    totalCount={ManagerReturnStatus.length}
                                    onPageChange={setPage}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
