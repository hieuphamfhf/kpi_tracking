import http from "@/lib/http";

export const ReamingLeaveTimeApiRequest = {
    getList: ({ department, startYM, endYM }: { department: string, startYM: string, endYM: string }) => 
        http.get<any>(`http://10.198.170.99:5000/API/ReamingLeaveTime?dp=${department}&startYM=${startYM}&endYM=${endYM}`, {
            baseUrl: "",
            cache: 'no-store',
        }),
}


// http://10.198.170.99:5000/API/FollowUp?co=LG&dp=A720&startDate=0240701&endDate=0240831
// http://10.198.170.99:5000/API/BorrowCard?dp=A720&startDate=0240701&endDate=0240831
// http://10.198.170.99:5000/API/ForgetSenseCard?dp=A720&startDate=0240701&endDate=0240831