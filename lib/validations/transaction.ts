import { z } from "zod";

export const returnConditionEnum = z.enum(["good", "damaged_minor", "damaged_repair", "lost"], {
  message: "กรุณาระบุสภาพครุภัณฑ์เมื่อรับคืน",
});

export const borrowAssetSchema = z.object({
  asset_id: z.string().uuid("กรุณาเลือกครุภัณฑ์ที่ถูกต้อง"),
  borrower_name: z.string().min(1, "กรุณาระบุชื่อผู้ยืม").trim(),
  borrower_department: z.string().min(1, "กรุณาระบุหน่วยงานผู้ยืม").trim(),
  due_date: z.string().min(1, "กรุณาระบุกำหนดส่งคืน"),
  notes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export const returnAssetSchema = z.object({
  transaction_id: z.string().uuid("กรุณาระบุรหัสรายการยืม"),
  condition: returnConditionEnum.default("good"),
  notes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type BorrowAssetFormValues = z.infer<typeof borrowAssetSchema>;
export type ReturnAssetFormValues = z.infer<typeof returnAssetSchema>;
