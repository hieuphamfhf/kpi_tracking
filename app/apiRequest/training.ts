import http from "@/lib/http";


export const trainingApiRequest = {
    getList: ({department,startDate,endDate}:{department:string,startDate:string,endDate:string}) => http.get<any>(`http://10.198.170.99:5000/API/training?dp=${department}&startDate=${startDate}&endDate=${endDate}`, {
        baseUrl: "",
        cache: 'no-store',
    }),
}