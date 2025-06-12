import http from "@/lib/http";

// /app/apiRequest/ManagerReturnStatus.ts

export const ManagerReturnStatusApiRequest = {
    getList: async ({
        empid = '',
        qrydat,
        status,
        JPNM,
    }: {
        empid?: string,
        qrydat: string, // yyyyMMdd
        status: string,
        JPNM: string,
    }) => {
        // Map status ALL => "" nếu người dùng chọn "全部狀態"
        const statusForApi = status === "ALL" ? "" : status;

        const url = `http://10.198.170.99:5000/API/ReturnTaiwanPeriodbyDate?empid=${encodeURIComponent(empid)}&qrydat=${encodeURIComponent(qrydat)}&status=${encodeURIComponent(statusForApi)}&JPNM=${encodeURIComponent(JPNM)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        return { payload: data };
    }
};
