// app/components/TaiwanPeriodModal.tsx
import React from "react";
import { ReturnTaiwanPeriodListResType } from "@/app/schemaValidations/ReturnTaiwanPeriod";

type Props = {
    open: boolean;
    onClose: () => void;
    data: ReturnTaiwanPeriodListResType;
    selectedRow?: any; // Thêm dòng này!
};

const TaiwanPeriodModal: React.FC<Props> = ({ open, onClose, data, selectedRow }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-xl min-w-[400px]">
                <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-lg">近1年返台休假資料</div>
                    {/* <button onClick={onClose} className="text-xl font-bold">&times;</button> */}
                <button
  onClick={onClose}
  className="text-xl font-bold rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition"
>
  &times;
</button>
                </div>
                {/* Đặt phần thông tin cá nhân ngay dưới tiêu đề */}
                {selectedRow && (
                    <div className="mb-2 px-1 text-base text-gray-700">
                        <span className="font-bold ml-8 font-bold">員工編號：</span>{selectedRow.empid}
                        <span className="ml-4 font-bold ml-8 font-bold">姓名：</span>{selectedRow.nm}
                        <span className="ml-4 font-bold ml-8 font-bold" >部門名稱：</span>{selectedRow.dpnm}
                        <span className="ml-4 font-bold ml-8 font-bold">職稱：</span>{selectedRow.newdutnm}
                    </div>
                )}
                <hr className="my-2" />
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2 border px-2 bg-gray-100">項次</th>
                            <th className="border px-2 border px-2 bg-gray-100">起日</th>
                            <th className="border px-2  border px-2 bg-gray-100">迄日</th>
                            <th className="border px-2 border px-2 bg-gray-100">狀態</th>

                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 text-center">{idx + 1}</td>
                                <td className="border px-2 text-center">{item.backfrdat}</td>
                                <td className="border px-2 text-center">{item.backtodat}</td>
                                {/* <td className="border px-2 text-center">{item.sts}</td> */}
                                <td className={`border px-2 text-center 
  ${item.sts === "核准" ? "text-green-600" : item.sts === "撤單" ? "text-red-500" : ""}
`}>
                                    {item.sts}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaiwanPeriodModal;
