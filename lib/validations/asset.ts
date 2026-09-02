import { z } from "zod";

export const assetStatusEnum = z.enum(["available", "borrowed", "maintenance", "lost"]);

export const assetSchema = z.object({
  asset_code: z.string().min(1, "กรุณาระบุรหัสครุภัณฑ์").trim(),
  name: z.string().min(1, "กรุณาระบุชื่อรายการ").trim(),
  category_id: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  brand_model: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  serial_number: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  quantity: z.coerce
    .number({ message: "กรุณาระบุจำนวนที่ถูกต้อง" })
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .min(1, "จำนวนต้องอย่างน้อย 1 รายการ")
    .default(1),
  location: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  department: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  image_url: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  status: assetStatusEnum.default("available"),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
