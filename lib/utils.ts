import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string or Date object into Thai Buddhist Era date format (DD/MM/YYYY).
 */
export function formatThaiDate(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

/**
 * Formats an ISO date string or Date object into a readable Thai string (e.g. 15 ก.ค. 2569).
 */
export function formatThaiDateLong(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

const THAI_DAY_NAMES = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

const THAI_MONTH_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const THAI_SHORT_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/**
 * Returns full Thai date string with Buddhist year and Thai fiscal year (1 Oct - 30 Sep).
 * E.g. "วันจันทร์ที่ 31 สิงหาคม 2569 · ปีงบประมาณ 2569"
 */
export function getThaiBuddhistDateHeader(date: Date = new Date()): string {
  const dayName = THAI_DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const monthName = THAI_MONTH_NAMES[date.getMonth()];
  const buddhistYear = date.getFullYear() + 543;
  
  // Thai fiscal year starts in October
  const monthNum = date.getMonth() + 1; // 1-12
  const fiscalYear = monthNum >= 10 ? buddhistYear + 1 : buddhistYear;

  return `ข้อมูล ณ ${dayName}ที่ ${day} ${monthName} ${buddhistYear} · ปีงบประมาณ ${fiscalYear}`;
}

/**
 * Returns formatted short header date string for Topbar Header.
 * E.g. "จันทร์ที่ 31 สิงหาคม 2569 (ปีงบ 2569)"
 */
export function getThaiHeaderDate(date: Date = new Date()): string {
  const dayName = THAI_DAY_NAMES[date.getDay()].replace("วัน", "");
  const day = date.getDate();
  const monthName = THAI_MONTH_NAMES[date.getMonth()];
  const buddhistYear = date.getFullYear() + 543;
  const monthNum = date.getMonth() + 1;
  const fiscalYear = monthNum >= 10 ? buddhistYear + 1 : buddhistYear;

  return `${dayName}ที่ ${day} ${monthName} ${buddhistYear} (ปีงบ ${fiscalYear})`;
}

