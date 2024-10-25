// import { z } from "zod";

// export const DepartmentSchema = z.object({
//     dpnm: z.string(),
// })
// export const DepartmentListRes = z.array(DepartmentSchema);
// export type DepartmentListResType = z.TypeOf<typeof DepartmentListRes>
import { z } from "zod";

export const DepartmentSchema = z.object({
    co: z.string(), // Thêm trường mã công ty
    dp: z.string(), // Mã bộ phận
    dpnm: z.string(), // Tên bộ phận
});


export const DepartmentListRes = z.array(DepartmentSchema);
export type DepartmentListResType = z.TypeOf<typeof DepartmentListRes>;
