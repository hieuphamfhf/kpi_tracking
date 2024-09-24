import http from "@/lib/http";


export const departmentApiRequest = {
    getList: () => http.get<any>(`https://66e5305d5cc7f9b6273c95ef.mockapi.io/TrainingTracking/departments`, {
        baseUrl: "",
        cache: 'no-store',
    }),
}