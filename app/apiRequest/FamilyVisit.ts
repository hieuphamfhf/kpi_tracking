// /app/apiRequest/FamilyVisit.ts
export const FamilyVisitApiRequest = {
    getList: async ({
        empid = '',
        nm = '',
        dp = '',
        dpnm = '',
        newdutnm = '',
    }: {
        empid?: string,
        nm?: string,
        dp?: string,
        dpnm?: string,
        newdutnm?: string,
    }) => {
        const url = `http://10.198.170.99:5000/API/EmpployeeInfo?empid=${encodeURIComponent(empid)}&NM=${encodeURIComponent(nm)}&dp=${encodeURIComponent(dp)}&dpnm=${encodeURIComponent(dpnm)}&newdutnm=${encodeURIComponent(newdutnm)}`;
        const res = await fetch(url);
        const data = await res.json();
        return { payload: data };
    }
};
