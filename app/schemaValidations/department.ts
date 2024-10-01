// import { z } from "zod";

// export const DepartmentSchema = z.object({
//     dpnm: z.string(),
// })
// export const DepartmentListRes = z.array(DepartmentSchema);
// export type DepartmentListResType = z.TypeOf<typeof DepartmentListRes>
import { z } from "zod";

export const DepartmentSchema = z.object({
    dp: z.string(), // Thêm trường dp (mã bộ phận)
    dpnm: z.string(), // Trường dpnm (tên bộ phận)
});

export const DepartmentListRes = z.array(DepartmentSchema);
export type DepartmentListResType = z.TypeOf<typeof DepartmentListRes>;
