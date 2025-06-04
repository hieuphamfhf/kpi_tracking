
export function dedupeTaiwanPeriod(list: any[]) {
    const map: { [key: string]: any } = {};
    for (const row of list) {
        const key = `${row.empid}_${row.backfrdat}_${row.backtodat}`;
        // Nếu chưa có, hoặc nếu là "核准" thì ưu tiên giữ lại
        if (!map[key] || row.sts === "核准") {
            map[key] = row;
        }
    }
    return Object.values(map);
}
