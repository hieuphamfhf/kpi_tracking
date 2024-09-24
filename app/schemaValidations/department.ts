import { z } from "zod";

export const DepartmentSchema = z.object({
    dpnm: z.string(),
})
export const DepartmentListRes = z.array(DepartmentSchema);
export type DepartmentListResType = z.TypeOf<typeof DepartmentListRes>
