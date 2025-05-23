"use client";
import { useEffect, useState } from "react";
import FamilyVisitTable from "./FamilyVisitTable";
import { FamilyVisitApiRequest } from "@/app/apiRequest/FamilyVisit";
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function FamilyVisitPage() {
    const [empid, setEmpid] = useState<string>('');
    const [nm, setNm] = useState<string>('');
    const [dp, setDp] = useState<string>('');
    const [dpnm, setDpnm] = useState<string>(''); // tên phòng ban
    const [newdutnm, setNewdutnm] = useState<string>('');
    const [FamilyVisit, setFamilyVisit] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        fetchData();
    }, [empid, nm, dp, dpnm, newdutnm]); // tự động fetch lại khi filter đổi

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
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>


    );
}
