import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อหมวดหมู่").max(100, "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร").trim(),
  prefix_code: z
    .string()
    .trim()
    .max(20, "รหัสหมวดหมู่ต้องไม่เกิน 20 ตัวอักษร")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  description: z
    .string()
    .trim()
    .max(255, "คำอธิบายต้องไม่เกิน 255 ตัวอักษร")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
