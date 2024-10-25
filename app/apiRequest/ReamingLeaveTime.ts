import http from "@/lib/http";

export const ReamingLeaveTimeApiRequest = {
    getList: ({ co, department, startYM, endYM }: { co: string; department?: string; startYM: string; endYM: string }) => {
        let url = `http://10.198.170.99:5000/API/ReamingLeaveTime?co=${co}&startYM=${startYM}&endYM=${endYM}`;

        // Chỉ thêm department vào URL nếu có giá trị
        if (department) {
            url += `&dp=${department}`;
        }

        return http.get<any>(url, {
            baseUrl: "", 
            cache: 'no-store',
        });
    }
};
