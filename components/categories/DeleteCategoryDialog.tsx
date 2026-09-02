"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCategory, CategoryWithStats } from "@/actions/categories";

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithStats | null;
  onSuccess?: () => void;
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  category,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !category) return null;

  const hasAssets = category.asset_count > 0;

  const handleDelete = () => {
    setErrorMessage(null);

    startTransition(async () => {
      const res = await deleteCategory(category.id);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#211f1c]">ยืนยันการลบหมวดหมู่</h3>
            <p className="text-xs text-[#71695e] mt-0.5">
              คุณต้องการลบหมวดหมู่ &ldquo;<strong className="text-[#211f1c]">{category.name}</strong>&rdquo; หรือไม่?
            </p>
          </div>
        </div>

        {/* Has Linked Assets Warning */}
        {hasAssets ? (
          <div className="bg-[#fef9eb] border border-[#edd7a6] rounded-xl p-3.5 space-y-1.5 text-xs text-[#8c6d23]">
            <div className="flex items-center gap-1.5 font-bold">
              <Package className="w-4 h-4 text-[#c49830]" />
              <span>ไม่สามารถลบหมวดหมู่นี้ได้</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#785b1a]">
              ปัจจุบันมีครุภัณฑ์จำนวน <strong>{category.asset_count.toLocaleString()} รายการ</strong> ถูกจัดอยู่ในหมวดหมู่นี้
              เพื่อป้องกันข้อมูลสูญหาย กรุณาย้ายหรือลบครุภัณฑ์ออกให้หมดก่อนลบหมวดหมู่
            </p>
          </div>
        ) : (
          <p className="text-xs text-[#71695e] bg-[#f5f2ea] p-3 rounded-xl border border-[#e3ddcd]">
            หมวดหมู่นี้ไม่มีครุภัณฑ์ผูกอยู่ การลบจะไม่มีผลกระทบต่อรายการครุภัณฑ์อื่นในระบบ
          </p>
        )}

        {/* Global Error Message */}
        {errorMessage && (
          <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e3ddcd]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="border-[#d8d2c2] bg-white text-[#4a453d] text-xs h-9 px-4 rounded-lg cursor-pointer"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isPending || hasAssets}
            className={`text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer ${
              hasAssets
                ? "bg-[#cfc7b4] text-[#8b8271] cursor-not-allowed opacity-60"
                : "bg-[#b3401f] hover:bg-[#8f3318]"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังลบ...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันการลบ</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
