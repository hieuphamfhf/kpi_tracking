"use client";
import { useEffect, useState } from "react";
import FamilyVisitTable from "./FamilyVisitTable";
import { FamilyVisitApiRequest } from "@/app/apiRequest/FamilyVisit";
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TaiwanPeriodModal from "@/components/TaiwanPeriodModal";
import { ReturnTaiwanPeriodListRes } from "@/app/schemaValidations/ReturnTaiwanPeriod";

import { Button } from "@/components/ui/button";


export default function FamilyVisitPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    const [empid, setEmpid] = useState<string>('');
    const [nm, setNm] = useState<string>('');
    const [dp, setDp] = useState<string>('');
    const [dpnm, setDpnm] = useState<string>(''); // tên phòng ban
    const [newdutnm, setNewdutnm] = useState<string>('');
    const [FamilyVisit, setFamilyVisit] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const { payload } = await FamilyVisitApiRequest.getList({
                empid, nm, dp, dpnm, newdutnm,
            });
            setFamilyVisit(payload);
        } catch (error) {
            // handle error
        } finally {
            setLoading(false);
        }
    };
    const handleRowClick = async (item: any) => {
        setSelectedRow(item); // Lưu thông tin dòng đang chọn
        setModalOpen(true);
        setModalLoading(true);
        try {
            const today = new Date();
            const backtodat = today.toISOString().slice(0, 10).replace(/-/g, "");
            const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            const backfrdat = lastYear.toISOString().slice(0, 10).replace(/-/g, "");

            const res = await fetch(
                `http://10.198.170.99:5000/API/ReturnTaiwanPeriod?empid=${item.empid}&backfrdat=${backfrdat}&backtodat=${backtodat}`
            );
            const data = await res.json();
            // Validate schema
            const parsed = ReturnTaiwanPeriodListRes.safeParse(data);
            if (parsed.success) {
                setModalData(parsed.data);
            } else {
                setModalData([]);
            }
        } catch {
            setModalData([]);
        }
        setModalLoading(false);
    };

    // const handleRowClick = async (item: any) => {
    //     setModalOpen(true);
    //     setModalLoading(false);
    //     setModalData(fakeModalData); // Dùng fake data
    // };

    // Fake data mẫu cho modal
    // const fakeModalData = [
    //     {
    //         empid: "TEST001",
    //         sts: "核准",
    //         backfrdat: "20240101",
    //         backtodat: "20240110",
    //         prefrdat: "20231220",
    //         pretodat: "20231231",
    //         createdtime: "2024/1/2 08:00:00",
    //     },
    //     {
    //         empid: "TEST001",
    //         sts: "核准",
    //         backfrdat: "20240201",
    //         backtodat: "20240210",
    //         prefrdat: "20240120",
    //         pretodat: "20240131",
    //         createdtime: "2024/2/2 08:00:00",
    //     },
    // ];

    // useEffect(() => {
    //     fetchData();

    // }, [empid, nm, dp, dpnm, newdutnm]); // tự động fetch lại khi filter đổi

    useEffect(() => {
        // Nếu chưa chọn gì thì không fetch
        if (!empid && !nm && !dp && !dpnm && !newdutnm) return;
        fetchData();
    }, [empid, nm, dp, dpnm, newdutnm]);


    return (

        <div>
            <Tabs defaultValue="account" className="bg-gray-50 min-h-screen">
                <TabsContent value="account" className="bg-gray-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>探親單查詢畫面</CardTitle>
                            <CardDescription>
                                請使用條件篩選數據，可匯出報告到 Excel。
                            </CardDescription>
                            {/* <Button
                                className="mb-2"
                                onClick={() => {
                                    setModalData(fakeModalData);
                                    setModalOpen(true);
                                    setModalLoading(false);
                                }}
                            >
                                Test mở modal (dữ liệu mẫu)
                            </Button> */}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {/* Đặt Table có bộ lọc style lại ở đây */}
                            <FamilyVisitTable
                                FamilyVisit={FamilyVisit}
                                onEmpidChange={setEmpid}
                                onNmChange={setNm}
                                onDpChange={setDp}
                                onDpnmChange={setDpnm}
                                onNewdutnmChange={setNewdutnm}
                                empid={empid}
                                nm={nm}
                                dp={dp}
                                dpnm={dpnm}
                                newdutnm={newdutnm}
                                loading={loading}
                                onRowClick={handleRowClick}


                            />
                            <TaiwanPeriodModal
                                open={modalOpen}
                                onClose={() => setModalOpen(false)}
                                data={modalLoading ? [] : modalData}
                                selectedRow={selectedRow}
                            />
                            {modalLoading && modalOpen && (
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                    <div className="bg-white px-8 py-4 rounded shadow">Loading...</div>
                                </div>
                            )}


                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>



    );
}
