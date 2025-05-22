"use client";

import { useEffect, useState } from "react";
import FamilyVisitTable from "./FamilyVisitTable";
import { FamilyVisitListResType } from "@/app/schemaValidations/FamilyVisit";
import { FamilyVisitApiRequest } from "@/app/apiRequest/FamilyVisit";
import { toast } from "react-hot-toast";

export default function FamilyVisitPage() {
    const [nm, setNm] = useState<string>('');
    const [dp, setDp] = useState<string>('');
    const [newdutnm, setNewdutnm] = useState<string>('');
    const [FamilyVisit, setFamilyVisit] = useState<FamilyVisitListResType | any>();
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { payload } = await FamilyVisitApiRequest.getList({
                nm,
                dp,
                newdutnm,
            });
             console.log("DATA FROM API:", payload); // <--- Thêm dòng này
            setFamilyVisit(payload);
            if (!payload || payload.length === 0) {
                toast.error('Không có dữ liệu!', {
                    duration: 2000,
                    position: 'top-center',
                });
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [nm, dp, newdutnm]);

    return (
        <FamilyVisitTable
            FamilyVisit={FamilyVisit}
            onNmChange={setNm}
            onDpChange={setDp}
            onNewdutnmChange={setNewdutnm}
            nm={nm}
            dp={dp}
            newdutnm={newdutnm}
            loading={loading}
        />
    );
}
