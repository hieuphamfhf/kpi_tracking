import http from "@/lib/http";


export const departmentApiRequest = {
    getList: () => http.get<any>(`http://10.198.170.99:5000/API/depts`, {
        baseUrl: "",
        cache: 'no-store',
    }),
}
// http://10.198.170.99:5000/API/depts