"use client";
import { useEffect, useState } from "react";
import EmpployeeInfoTable from "./EmpployeeInfoTable";
import { EmpployeeInfoApiRequest } from "@/app/apiRequest/EmpployeeInfo";
import { departmentApiRequest } from "@/app/apiRequest/department";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TaiwanPeriodModal from "@/components/TaiwanPeriodModal";
import { ReturnTaiwanPeriodListRes } from "@/app/schemaValidations/ReturnTaiwanPeriod";
import Pagination from "@/components/Pagination";
import { dedupeTaiwanPeriod } from "@/utils/dedupeTaiwanPeriod";

export default function EmpployeeInfoPage() {
  const PAGE_SIZE = 50;

  // phân trang
  const [page, setPage] = useState(1);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // filter nhân sự
  const [empid, setEmpid] = useState<string>('');
  const [nm, setNm] = useState<string>('');
  const [dp, setDp] = useState<string>('');
  const [dpnm, setDpnm] = useState<string>(''); // tên phòng ban
  const [newdutnm, setNewdutnm] = useState<string>('');

  // dữ liệu & trạng thái
  const [EmpployeeInfo, setEmpployeeInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- NEW: state khoảng ngày (yyyy-MM-dd) để hiển thị ma trận
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // helper: "yyyyMMdd" -> "yyyy-MM-dd"
  const ymdToDash = (s: string) => `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;

  // fetch list
  const fetchData = async () => {
    setLoading(true);
    try {
      const { payload } = await EmpployeeInfoApiRequest.getList({
        empid, nm, dp, dpnm, newdutnm,
        // nếu muốn lọc server-side theo ngày, mở 2 dòng dưới:
        // backfrdat: fromDate ? fromDate.replace(/-/g, "") : undefined,
        // backtodat: toDate ? toDate.replace(/-/g, "") : undefined,
      });
      setEmpployeeInfo(payload);
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // xem chi tiết: Taiwan period
  const handleRowClick = async (item: any) => {
    setSelectedRow(item);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const today = new Date();
      const backtodat = today.toISOString().slice(0, 10).replace(/-/g, "");
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const backfrdat = lastYear.toISOString().slice(0, 10).replace(/-/g, "");

      const res = await fetch(
        `http://10.198.170.99:5000/API/ReturnTaiwanPeriod?empid=${item.empid}&backfrdat=${backfrdat}&backtodat=${backtodat}`
      );
      const data = await res.json();
      const parsed = ReturnTaiwanPeriodListRes.safeParse(data);
      if (parsed.success) {
        const deduped = dedupeTaiwanPeriod(parsed.data);
        setModalData(deduped);
      } else {
        setModalData([]);
      }
    } catch {
      setModalData([]);
    }
    setModalLoading(false);
  };

  const totalPage = Math.ceil(EmpployeeInfo.length / PAGE_SIZE);
  const pageData = EmpployeeInfo.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!empid && !nm && !dp && !dpnm && !newdutnm) return;
    fetchData();
  }, [empid, nm, dp, dpnm, newdutnm]);

  return (
    <div>
      <Tabs defaultValue="account" className="bg-gray-50 min-h-screen">
        <TabsContent value="account" className="bg-gray-50 ">
          <Card >
            <CardHeader className="p-4 pb-2">
              <CardTitle>探親單查詢畫面</CardTitle>
              <CardDescription>請使用條件篩選數據，可匯出報告到 Excel。</CardDescription>
            </CardHeader>

            <CardContent className="pt-2 ">
              <EmpployeeInfoTable
                EmpployeeInfo={EmpployeeInfo}
                // hoặc pageData nếu vẫn muốn phân trang server-side
                onEmpidChange={setEmpid}
                onNmChange={setNm}
                onDpChange={setDp}
                onDpnmChange={setDpnm}
                onNewdutnmChange={setNewdutnm}
                empid={empid}
                nm={nm}
                dp={dp}
                dpnm={dpnm}
                newdutnm={newdutnm}
                loading={loading}
                onRowClick={handleRowClick}
                page={page}
                pageSize={PAGE_SIZE}

                // ---- NEW: nhận từ FilterBar (forward trong EmpployeeInfoTable)
                onDateChange={(from, to) => {
                  setFromDate(ymdToDash(from));
                  setToDate(ymdToDash(to));
                }}

                // ---- NEW: truyền xuống ma trận để hiển thị đúng theo filter
                startDate={fromDate || undefined}
                endDate={toDate || undefined}

                // calendarValues: bạn map dữ liệu API -> Record<YYYY-MM-DD, CellData> rồi truyền vào đây
                // calendarValues={mappedValues}
              />

              <TaiwanPeriodModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                data={modalLoading ? [] : modalData}
                selectedRow={selectedRow}
              />
              {modalLoading && modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white px-8 py-4 rounded shadow">Loading...</div>
                </div>
              )}
              <div className="max-w-5xl mx-auto">
                <Pagination
                  page={page}
                  totalPage={totalPage}
                  totalCount={EmpployeeInfo.length}
                  onPageChange={setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
