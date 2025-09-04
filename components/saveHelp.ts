// components/saveHelp.ts
// Service lưu memo cho ReturnTaiwanPeriodDetails

export type SaveResult = { isoDate: string; ok: boolean; raw: string };

export const isoToROC = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(n => parseInt(n, 10));
  const rocYear = y - 1911;
  return `${String(rocYear).padStart(3, "0")}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
};

export const isSundayISO = (iso: string) =>
  new Date(`${iso}T00:00:00`).getDay() === 0;

export const sanitizeNote = (s: string) =>
  (s ?? "").trim().slice(0, 60); // giới hạn độ dài

export async function saveMemoOnce(
  baseUrl: string, // "http://10.198.170.99:5000"
  empid: string,
  isoDate: string,
  note: string
): Promise<SaveResult> {
//   const roc = isoToROC(isoDate);
//   const value = encodeURIComponent(sanitizeNote(note));
//   const url = `${baseUrl}/API/ReturnTaiwanPeriodDetails/${empid}/${roc}/MEMO${value}`;
// const url = `${baseUrl}/API/ReturnTaiwanPeriodDetails/${empid}/${roc}/${value}`;
const ymd = isoDate.replace(/-/g, "");               // "2025-08-21" -> "20250821"
const value = encodeURIComponent((note ?? "").trim());
const url = `${baseUrl}/API/ReturnTaiwanPeriodDetails/${empid}/${ymd}/${value}`;

  const res = await fetch(url, { method: "POST" });
  const txt = await res.text();
  const ok = res.ok && (txt === "1" || txt === "1\n");
  return { isoDate, ok, raw: txt };
}

/**
 * Lưu hàng loạt (bỏ Chủ nhật & bỏ ngày không thay đổi)
 * @param originalNotes - map ghi chú gốc theo isoDate
 * @param editedNotes - map ghi chú đã sửa theo isoDate
 */
export async function saveMemosBatch(opts: {
  baseUrl: string;
  empid: string;
  originalNotes: Record<string, string>;
  editedNotes: Record<string, string>;
  concurrency?: number; // mặc định 4
}) {
  const { baseUrl, empid, originalNotes, editedNotes, concurrency = 4 } = opts;

  // chọn các ngày thực sự thay đổi và không phải Chủ nhật
  const tasks = Object.entries(editedNotes)
    .filter(([iso, val]) => !isSundayISO(iso))
    .filter(([iso, val]) => (originalNotes[iso] ?? "").trim() !== sanitizeNote(val));

  // chạy theo "cửa sổ" concurrency để tránh spam server
  const results: SaveResult[] = [];
  let i = 0;
  const run = async () => {
    while (i < tasks.length) {
      const idx = i++;
      const [iso, note] = tasks[idx];
      try {
        results.push(await saveMemoOnce(baseUrl, empid, iso, note));
      } catch (e: any) {
        results.push({ isoDate: iso, ok: false, raw: String(e?.message ?? e) });
      }
    }
  };
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, run);
  await Promise.all(workers);

  const ok = results.filter(r => r.ok).length;
  const fail = results.length - ok;
  return { results, ok, fail, total: results.length };
}
