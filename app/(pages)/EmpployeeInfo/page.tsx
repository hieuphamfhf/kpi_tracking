"use client";
import { useEffect, useState } from "react";
import EmpployeeInfoTable from "./EmpployeeInfoTable";
import { EmpployeeInfoApiRequest } from "@/app/apiRequest/EmpployeeInfo";
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TaiwanPeriodModal from "@/components/TaiwanPeriodModal";
import { ReturnTaiwanPeriodListRes } from "@/app/schemaValidations/ReturnTaiwanPeriod";
import Pagination from "@/components/Pagination"; 
import { Button } from "@/components/ui/button";
import { dedupeTaiwanPeriod } from "@/utils/dedupeTaiwanPeriod";
export default function EmpployeeInfoPage() {
    const PAGE_SIZE = 50;
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [empid, setEmpid] = useState<string>('');
    const [nm, setNm] = useState<string>('');
    const [dp, setDp] = useState<string>('');
    const [dpnm, setDpnm] = useState<string>(''); // tên phòng ban
    const [newdutnm, setNewdutnm] = useState<string>('');
    const [EmpployeeInfo, setEmpployeeInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const { payload } = await EmpployeeInfoApiRequest.getList({
                empid, nm, dp, dpnm, newdutnm,
            });
            setEmpployeeInfo(payload);
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
            // if (parsed.success) {
            //     setModalData(parsed.data);
            // } else {
            //     setModalData([]);
            // }
            if (parsed.success) {
                const deduped = dedupeTaiwanPeriod(parsed.data); // lọc trùng
                setModalData(deduped);
            } else {
                setModalData([]);
            }
        } catch {
            setModalData([]);
        }
        setModalLoading(false);
    };
    const totalPage = Math.ceil(EmpployeeInfo.length / PAGE_SIZE);
    const pageData = EmpployeeInfo.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    useEffect(() => {

        // Nếu chưa chọn gì thì không fetch
        if (!empid && !nm && !dp && !dpnm && !newdutnm) return;
        fetchData();
    }, [empid, nm, dp, dpnm, newdutnm]);


    return (

        <div>
            <Tabs defaultValue="account" className="bg-gray-50 min-h-screen">
                <TabsContent value="account" className="bg-gray-50 ">
                    <Card >
                        <CardHeader className="p-4 pb-2">
                            <CardTitle>探親單查詢畫面</CardTitle>
                            <CardDescription>
                                請使用條件篩選數據，可匯出報告到 Excel。
                            </CardDescription>

                        </CardHeader>
                        <CardContent className="pt-2 ">
                            <EmpployeeInfoTable
                                EmpployeeInfo={EmpployeeInfo}
                                // EmpployeeInfo={pageData} // 
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
                                page={page}
                                pageSize={PAGE_SIZE}

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
                            <div className="max-w-5xl mx-auto">
                                <Pagination
                                    page={page}
                                    totalPage={totalPage}
                                    totalCount={EmpployeeInfo.length}
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
