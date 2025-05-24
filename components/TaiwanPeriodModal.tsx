// app/components/TaiwanPeriodModal.tsx
import React from "react";
import { ReturnTaiwanPeriodListResType } from "@/app/schemaValidations/ReturnTaiwanPeriod";

type Props = {
    open: boolean;
    onClose: () => void;
    data: ReturnTaiwanPeriodListResType;
};

const TaiwanPeriodModal: React.FC<Props> = ({ open, onClose, data }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl min-w-[400px]">
                <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-lg">近1年返台休假資料</div>
                    <button onClick={onClose} className="text-xl font-bold">&times;</button>
                </div>
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2">項次</th>
                            <th className="border px-2">起日</th>
                            <th className="border px-2">迄日</th>
                            <th className="border px-2">狀態</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 text-center">{idx + 1}</td>
                                <td className="border px-2 text-center">{item.backfrdat}</td>
                                <td className="border px-2 text-center">{item.backtodat}</td>
                                <td className="border px-2 text-center">{item.sts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaiwanPeriodModal;
