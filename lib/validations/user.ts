import { z } from "zod";
import { EMAIL_STRICT_REGEX } from "./auth";

export const userRoleEnum = z.enum(["admin", "staff"], {
  message: "กรุณาเลือกระดับสิทธิ์ที่ถูกต้อง",
});

export const createUserSchema = z.object({
  email: z
    .string({ message: "กรุณาระบุอีเมล" })
    .trim()
    .min(1, "กรุณาระบุอีเมล")
    .refine(
      (val) => !/[^a-zA-Z0-9@._+-]/.test(val),
      "อีเมลต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และสัญลักษณ์ที่ถูกต้องเท่านั้น (ห้ามมีภาษาอื่นหรือช่องว่าง)"
    )
    .refine(
      (val) => EMAIL_STRICT_REGEX.test(val),
      "รูปแบบอีเมลไม่ถูกต้องตามมาตรฐานสากล (ตัวอย่าง: name@domain.com)"
    ),
  full_name: z
    .string({ message: "กรุณาระบุชื่อ-นามสกุล" })
    .trim()
    .min(2, "ชื่อ-นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อ-นามสกุลต้องไม่เกิน 100 ตัวอักษร"),
  department: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  role: userRoleEnum.default("staff"),
});

export const updateUserSchema = z.object({
  full_name: z
    .string({ message: "กรุณาระบุชื่อ-นามสกุล" })
    .trim()
    .min(2, "ชื่อ-นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อ-นามสกุลต้องไม่เกิน 100 ตัวอักษร"),
  department: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  role: userRoleEnum,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
