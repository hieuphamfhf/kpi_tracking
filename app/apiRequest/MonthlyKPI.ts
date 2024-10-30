import http from "@/lib/http";

// export const MonthlyKPIApiRequest = {
//     getList: ({ co, department, startYM, endYM }: { co: string; department?: string; startYM: string; endYM: string }) => {
//         let url = `http://10.198.170.99:5000/API/MonthlyKPI?co=${co}&startYM=${startYM}&endYM=${endYM}`;

//         // Chỉ thêm department vào URL nếu có giá trị
//         if (department) {
//             url += `&dp=${department}`;
//         }

//         return http.get<any>(url, {
//             baseUrl: "",
//             cache: 'no-store',
//         });
//     }
// };



// export const MonthlyKPIApiRequest = {
//     getList: ({ co, dpLength, YM }: { co: string; dpLength?: string; YM: string }) => {
//         // Cấu trúc URL theo yêu cầu API mới
//         let url = `http://10.198.170.99:5000/API/AllKPI?co=${co}&YM=${YM}`;

//         // Chỉ thêm dpLength vào URL nếu có giá trị
//         if (dpLength) {
//             url += `&dpLength=${dpLength}`;
//         }

//         return http.get<any>(url, {
//             baseUrl: "",
//             cache: 'no-store',
//         });
//     }
// };
export const MonthlyKPIApiRequest = {
    getList: ({ co, dpLength, YM }: { co: string; dpLength: string; YM: string }) => {
        // Tạo URL với tất cả các tham số đều bắt buộc
        const url = `http://10.198.170.99:5000/API/AllKPI?co=${co}&dpLength=${dpLength}&YM=${YM}`;

        return http.get<any>(url, {
            baseUrl: "",
            cache: 'no-store',
        });
    }
};

