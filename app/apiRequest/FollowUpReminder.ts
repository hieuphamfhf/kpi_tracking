import http from "@/lib/http";


export const FollowUpReminderApiRequest = {
    getList: ({department,startDate,endDate}:{department:string,startDate:string,endDate:string}) => http.get<any>(`http://10.198.170.99:5000/API/FollowUp?dp=${department}&startDate=${startDate}&endDate=${endDate}`, {
        baseUrl: "",
        cache: 'no-store',
    }),
}

// http://10.198.170.99:5000/API/FollowUp?co=LG&dp=A720&startDate=0240701&endDate=0240831