export const ReturnTaiwanPeriodApi = {
    getList: async ({
        empid,
        backfrdat,
        backtodat,
    }: {
        empid: string,
        backfrdat: string,
        backtodat: string,
    }) => {
        const url = `http://10.198.170.99:5000/API/ReturnTaiwanPeriod?empid=${encodeURIComponent(empid)}&backfrdat=${backfrdat}&backtodat=${backtodat}`;
        const res = await fetch(url);
        const data = await res.json();
        return { payload: data }; // hoặc { payload: data } nếu bạn thích đồng bộ format
    },
};
