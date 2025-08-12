import LeaveCalendarMatrix, { CellData } from "@/components/LeaveCalendarMatrixProps";

const values: Record<string, CellData> = {
  "2025-08-25": { type: "BUSINESS_TW", note: "返台" },
  "2025-08-30": { type: "PUBLIC_HOL", note: "台、越均放假" },
};

export default function Page() {
  return (
    <LeaveCalendarMatrix
      startDate="2025-08-25"
      endDate="2025-09-15"
      values={values}
      autoSundayWeeklyOff
    />
  );
}
