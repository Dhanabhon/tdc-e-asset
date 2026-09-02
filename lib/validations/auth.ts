import { z } from "zod";

/**
 * Strict RFC 5322 compatible email regex
 * Disallows any non-ASCII characters, spaces, and ensures proper domain and TLD structure.
 */
export const EMAIL_STRICT_REGEX =
  /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

export const emailSchema = z
  .string({ message: "กรุณาระบุอีเมล" })
  .trim()
  .min(1, "กรุณาระบุอีเมล")
  .refine(
    (val) => !/[^a-zA-Z0-9@._+-]/.test(val),
    "อีเมลต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข และสัญลักษณ์ที่ถูกต้องเท่านั้น (ห้ามมีภาษาอื่นหรือช่องว่าง)"
  )
  .refine((val) => val.includes("@"), "อีเมลต้องมีเครื่องหมาย @")
  .refine(
    (val) => val.split("@").length === 2,
    "อีเมลต้องมีเครื่องหมาย @ เพียง 1 ตัวเท่านั้น"
  )
  .refine((val) => {
    const [local] = val.split("@");
    return local && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..");
  }, "ชื่อผู้ใช้หน้า @ ต้องไม่ขึ้นต้น ลงท้าย หรือมีจุดติดกัน (..)")
  .refine((val) => {
    const parts = val.split("@");
    const domain = parts[1];
    return domain && domain.includes(".") && domain.split(".").pop()!.length >= 2;
  }, "โดเมนต้องมีนามสกุลที่ถูกต้อง เช่น .com, .go.th, .ac.th")
  .refine(
    (val) => EMAIL_STRICT_REGEX.test(val),
    "รูปแบบอีเมลไม่ถูกต้องตามมาตรฐาน (ตัวอย่าง: name@domain.com)"
  );

/**
 * Validates email format according to international RFC 5322 standards
 * and strictly prevents non-English (e.g. Thai) characters and spaces.
 */
export function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "กรุณาระบุอีเมล" };
  }

  const trimmed = email.trim();

  // Check for non-ASCII or disallowed characters (e.g. Thai characters, accents, emoji, spaces)
  if (/[^a-zA-Z0-9@._+-]/.test(trimmed)) {
    return {
      isValid: false,
      error: "พิมพ์ได้เฉพาะตัวอักษรภาษาอังกฤษ (A-Z, a-z), ตัวเลข (0-9) และสัญลักษณ์อีเมล (@ . _ - +) เท่านั้น ห้ามพิมพ์ภาษาอื่น",
    };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: "อีเมลต้องมีเครื่องหมาย @ เพียง 1 ตัวเท่านั้น",
    };
  }

  const [localPart, domainPart] = parts;
  if (!localPart || localPart.length === 0) {
    return {
      isValid: false,
      error: "กรุณาระบุชื่อผู้ใช้ด้านหน้าเครื่องหมาย @",
    };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return {
      isValid: false,
      error: "ชื่อผู้ใช้หน้า @ ต้องไม่ขึ้นต้น ลงท้าย หรือมีจุดติดกัน (..)",
    };
  }

  if (!domainPart || domainPart.length === 0) {
    return {
      isValid: false,
      error: "กรุณาระบุโดเมนด้านหลังเครื่องหมาย @ (เช่น your-company.com)",
    };
  }

  if (!domainPart.includes(".")) {
    return {
      isValid: false,
      error: "โดเมนต้องมีจุดคั่นและนามสกุล เช่น @agency.go.th หรือ @company.com",
    };
  }

  const domainParts = domainPart.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return {
      isValid: false,
      error: "นามสกุลโดเมนต้องเป็นตัวอักษรภาษาอังกฤษอย่างน้อย 2 ตัว เช่น .com, .th",
    };
  }

  if (!EMAIL_STRICT_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "รูปแบบอีเมลไม่ถูกต้องตามมาตรฐานสากล (ตัวอย่าง: john.doe@your-company.com)",
    };
  }

  return { isValid: true };
}
