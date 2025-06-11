import http from "@/lib/http";
export const ManagerReturnStatusApiRequest = {
    getList: ({ co, department, startDate, endDate }: { co: string; department?: string; startDate: string; endDate: string }) => {
        let url = `http://10.198.170.99:5000/API/FollowUp?co=${co}&startDate=${startDate}&endDate=${endDate}`;

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

