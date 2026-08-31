"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { returnAssetAction, LoanWithAsset } from "@/actions/transactions";
import { ReturnCondition } from "@/lib/types/database.types";
import { formatThaiDate } from "@/lib/utils";
import {
  Check,
  AlertCircle,
  Loader2,
  Package,
  Calendar,
  User,
  AlertTriangle,
  Wrench,
  CheckCircle2,
} from "lucide-react";

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: LoanWithAsset | null;
  onSuccess?: () => void;
}

export function ReturnDialog({
  open,
  onOpenChange,
  loan,
  onSuccess,
}: ReturnDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [condition, setCondition] = useState<ReturnCondition>("good");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!loan) return null;

  const handleReturnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("transaction_id", loan.id);
    formData.append("condition", condition);
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }

    startTransition(async () => {
      try {
        const res = await returnAssetAction(formData);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        // Successfully returned
        setNotes("");
        setCondition("good");
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการบันทึกการส่งคืน";
        setErrorMessage(message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#faf9f5] border-[#e3ddcd] p-6">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-bold text-[#211f1c] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5d7d54]" /> รับคืนครุภัณฑ์
          </DialogTitle>
          <DialogDescription className="text-xs text-[#8b8271]">
            ตรวจสอบสภาพและยืนยันการรับคืนครุภัณฑ์เข้าสู่คลัง
          </DialogDescription>
        </DialogHeader>

        {/* Loan & Asset Overview Card */}
        <div className="p-3.5 rounded-xl bg-[#f5f2ea] border border-[#e3ddcd] space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8e2d4] flex items-center justify-center shrink-0 mt-0.5">
              <Package className="w-4 h-4 text-[#71695e]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#211f1c] truncate">
                {loan.assets?.name || "ไม่ระบุชื่อครุภัณฑ์"}
              </p>
              <p className="font-mono text-[11px] text-[#8b8271]">
                {loan.assets?.asset_code}
                {loan.assets?.brand_model ? ` · ${loan.assets.brand_model}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e8e2d4] text-[11px]">
            <div className="space-y-0.5">
              <span className="text-[#8b8271] flex items-center gap-1">
                <User className="w-3 h-3" /> ผู้ยืม
              </span>
              <p className="font-medium text-[#211f1c] truncate">
                {loan.borrower_name}
                {loan.borrower_department ? ` (${loan.borrower_department})` : ""}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[#8b8271] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> กำหนดคืน
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[#211f1c]">
                  {formatThaiDate(loan.due_date)}
                </span>
                {loan.is_overdue && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#f7e5df] text-[#b3401f]">
                    เกิน {loan.overdue_days} วัน
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleReturnSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Condition Radio Options */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#4a453d]">
              สภาพของครุภัณฑ์เมื่อส่งคืน <span className="text-[#b3401f]">*</span>
            </label>

            <div className="grid gap-2">
              {/* Option 1: Good */}
              <label
                onClick={() => setCondition("good")}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  condition === "good"
                    ? "bg-[#f2f7ed] border-[#5d7d54] shadow-xs"
                    : "bg-white border-[#d8d2c2] hover:bg-[#fbfaf7]"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="good"
                  checked={condition === "good"}
                  onChange={() => setCondition("good")}
                  className="mt-0.5 text-[#5d7d54] focus:ring-[#5d7d54]"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#211f1c] flex items-center gap-1.5">
                    <span className="text-[#5d7d54]">✓ ปกติ</span>
                  </div>
                  <p className="text-[11px] text-[#71695e] mt-0.5">
                    สภาพสมบูรณ์ พร้อมใช้งานต่อ (สต็อกพร้อมใช้ +1)
                  </p>
                </div>
              </label>

              {/* Option 2: Damaged Minor */}
              <label
                onClick={() => setCondition("damaged_minor")}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  condition === "damaged_minor"
                    ? "bg-[#fef9eb] border-[#c49830] shadow-xs"
                    : "bg-white border-[#d8d2c2] hover:bg-[#fbfaf7]"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="damaged_minor"
                  checked={condition === "damaged_minor"}
                  onChange={() => setCondition("damaged_minor")}
                  className="mt-0.5 text-[#c49830] focus:ring-[#c49830]"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#211f1c] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#c49830]" />
                    <span>ชำรุดเล็กน้อย</span>
                  </div>
                  <p className="text-[11px] text-[#71695e] mt-0.5">
                    มีตำหนิหรือรอยขีดข่วน แต่ยังใช้งานได้ (สต็อกพร้อมใช้ +1)
                  </p>
                </div>
              </label>

              {/* Option 3: Damaged Repair */}
              <label
                onClick={() => setCondition("damaged_repair")}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  condition === "damaged_repair"
                    ? "bg-[#fdf2ef] border-[#c2593c] shadow-xs"
                    : "bg-white border-[#d8d2c2] hover:bg-[#fbfaf7]"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="damaged_repair"
                  checked={condition === "damaged_repair"}
                  onChange={() => setCondition("damaged_repair")}
                  className="mt-0.5 text-[#c2593c] focus:ring-[#c2593c]"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#211f1c] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#c2593c]" />
                    <span className="text-[#b3401f]">ชำรุด ส่งซ่อม</span>
                  </div>
                  <p className="text-[11px] text-[#71695e] mt-0.5">
                    ชำรุด ใช้งานไม่ได้ ต้องส่งซ่อม (เปลี่ยนสถานะเป็น &apos;ส่งซ่อม&apos;)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Remarks Textarea */}
          <div>
            <label className="block text-xs font-semibold text-[#4a453d] mb-1">
              หมายเหตุ / รายละเอียดสภาพ
            </label>
            <textarea
              name="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น อุปกรณ์ครบชุด สภาพปกติ, มีรอยขีดข่วนที่ฝาครอบ..."
              className="w-full px-3 py-2 bg-white border border-[#d8d2c2] rounded-lg text-xs text-[#211f1c] focus:outline-none focus:ring-1 focus:ring-[#5d7d54] placeholder:text-[#a49b8b]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#e8e2d4]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="border-[#d8d2c2] text-xs font-medium text-[#71695e] hover:bg-[#f5f2ea]"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#5d7d54] hover:bg-[#4a6842] text-white text-xs font-semibold shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> ยืนยันรับคืน ✓
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
