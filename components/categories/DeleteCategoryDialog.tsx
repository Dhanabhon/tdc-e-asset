"use client";

import { useState, useTransition } from "react";
import {
  Trash2,
  Loader2,
  AlertTriangle,
  Package,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteCategory,
  deleteCategoryWithReassign,
  CategoryWithStats,
} from "@/actions/categories";

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithStats | null;
  allCategories?: CategoryWithStats[];
  onSuccess?: () => void;
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  category,
  allCategories = [],
  onSuccess,
}: DeleteCategoryDialogProps) {
  if (!isOpen || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <DeleteCategoryForm
        key={category.id}
        category={category}
        allCategories={allCategories}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function DeleteCategoryForm({
  category,
  allCategories,
  onClose,
  onSuccess,
}: {
  category: CategoryWithStats;
  allCategories: CategoryWithStats[];
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const otherCategories = allCategories.filter((c) => c.id !== category.id);
  const hasAssets = category.asset_count > 0;

  const [strategy, setStrategy] = useState<"reassign" | "uncategorized">(
    otherCategories.length > 0 ? "reassign" : "uncategorized"
  );
  const [targetCategoryId, setTargetCategoryId] = useState<string>(
    otherCategories[0]?.id || ""
  );

  const handleDelete = () => {
    setErrorMessage(null);

    startTransition(async () => {
      let res;
      if (hasAssets) {
        res = await deleteCategoryWithReassign(
          category.id,
          strategy,
          strategy === "reassign" ? targetCategoryId : undefined
        );
      } else {
        res = await deleteCategory(category.id);
      }

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <div className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative">
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

      {/* Has Linked Assets Options */}
      {hasAssets ? (
        <div className="space-y-3">
          <div className="bg-[#fef9eb] border border-[#edd7a6] rounded-xl p-3.5 space-y-1 text-xs text-[#8c6d23]">
            <div className="flex items-center gap-1.5 font-bold">
              <Package className="w-4 h-4 text-[#c49830]" />
              <span>
                พบครุภัณฑ์จำนวน <strong>{category.asset_count.toLocaleString()} รายการ</strong> อยู่ในหมวดนี้
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#785b1a]">
              กรุณาเลือกว่าต้องการจัดการครุภัณฑ์ทั้งหมดในหมวดนี้อย่างไรก่อนดำเนินการลบ เพื่อความปลอดภัยของข้อมูล
            </p>
          </div>

          <div className="space-y-2">
            {/* Strategy Option 1: Reassign to another category */}
            {otherCategories.length > 0 && (
              <div
                onClick={() => setStrategy("reassign")}
                className={`flex flex-col gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  strategy === "reassign"
                    ? "bg-white border-[#c2593c] ring-1 ring-[#c2593c]/20 shadow-2xs"
                    : "bg-white border-[#d8d2c2] hover:bg-[#faf9f5]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="strategy"
                    value="reassign"
                    checked={strategy === "reassign"}
                    onChange={() => setStrategy("reassign")}
                    className="mt-0.5 text-[#c2593c] focus:ring-[#c2593c]"
                  />
                  <div className="text-xs flex-1">
                    <div className="font-semibold text-[#211f1c] flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#c2593c]" />
                      <span>ย้ายครุภัณฑ์ทั้งหมดไปยังหมวดหมู่อื่น (แนะนำ)</span>
                    </div>
                    <p className="text-[11px] text-[#71695e] mt-0.5">
                      โอนย้ายครุภัณฑ์ทั้งหมด {category.asset_count.toLocaleString()} รายการไปยังหมวดหมู่ที่เลือก แล้วลบหมวดนี้
                    </p>
                  </div>
                </div>

                {strategy === "reassign" && (
                  <div className="pt-2 pl-6 border-t border-[#f0eee6]">
                    <label className="block text-[11px] font-medium text-[#4a453d] mb-1">
                      เลือกหมวดหมู่ปลายทางที่จะรับโอนครุภัณฑ์:
                    </label>
                    <select
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full h-9 px-3 bg-[#faf9f5] border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c] focus:outline-none focus:border-[#c2593c]"
                    >
                      {otherCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.prefix_code ? `[${c.prefix_code}] ` : ""}
                          {c.name} ({c.asset_count} รายการเดิม)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Strategy Option 2: Uncategorized */}
            <div
              onClick={() => setStrategy("uncategorized")}
              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                strategy === "uncategorized"
                  ? "bg-white border-[#c2593c] ring-1 ring-[#c2593c]/20 shadow-2xs"
                  : "bg-white border-[#d8d2c2] hover:bg-[#faf9f5]"
              }`}
            >
              <input
                type="radio"
                name="strategy"
                value="uncategorized"
                checked={strategy === "uncategorized"}
                onChange={() => setStrategy("uncategorized")}
                className="mt-0.5 text-[#c2593c] focus:ring-[#c2593c]"
              />
              <div className="text-xs">
                <div className="font-semibold text-[#211f1c]">
                  ปลดเป็น &ldquo;ไม่ระบุหมวดหมู่&rdquo; (Uncategorized)
                </div>
                <p className="text-[11px] text-[#71695e] mt-0.5">
                  ครุภัณฑ์จะยังคงอยู่ในระบบตามปกติ แต่ค่าหมวดหมู่จะถูกปรับเป็นว่างไว้
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#71695e] bg-[#f5f2ea] p-3.5 rounded-xl border border-[#e3ddcd]">
          หมวดหมู่นี้ไม่มีครุภัณฑ์ผูกอยู่ สามารถลบออกจากระบบได้อย่างปลอดภัย
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
          disabled={isPending || (hasAssets && strategy === "reassign" && !targetCategoryId)}
          className="bg-[#b3401f] hover:bg-[#8f3318] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังดำเนินการ...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {hasAssets
                  ? strategy === "reassign"
                    ? "ย้ายครุภัณฑ์และลบหมวดหมู่"
                    : "ปลดหมวดหมู่และลบ"
                  : "ยืนยันการลบ"}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
