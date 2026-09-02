"use client";

import { useState, useTransition } from "react";
import { FolderEdit, Loader2, AlertCircle, Tag, Layers, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCategory, CategoryWithStats } from "@/actions/categories";

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithStats | null;
  onSuccess?: () => void;
}

export function EditCategoryDialog({
  isOpen,
  onClose,
  category,
  onSuccess,
}: EditCategoryDialogProps) {
  if (!isOpen || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <EditCategoryForm
        key={category.id}
        category={category}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function EditCategoryForm({
  category,
  onClose,
  onSuccess,
}: {
  category: CategoryWithStats;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(category.name || "");
  const [prefixCode, setPrefixCode] = useState(category.prefix_code || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("กรุณาระบุชื่อหมวดหมู่");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("prefix_code", prefixCode.trim());

      const res = await updateCategory(category.id, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <div className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative">
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#f5f0e6] border border-[#ddd6c6] text-[#c2593c] flex items-center justify-center shrink-0">
          <FolderEdit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#211f1c]">แก้ไขหมวดหมู่ครุภัณฑ์</h3>
          <p className="text-xs text-[#71695e] mt-0.5">
            ปรับเปลี่ยนชื่อและรหัสคำนำหน้าหมวดหมู่
          </p>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Prefix Code */}
          <div>
            <label className="block text-xs font-medium text-[#4a453d] mb-1">
              รหัสหมวดหมู่ (Prefix)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
              <Input
                type="text"
                value={prefixCode}
                onChange={(e) => setPrefixCode(e.target.value)}
                placeholder="เช่น 7440"
                className="pl-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg font-mono"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Category Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#4a453d] mb-1">
              ชื่อหมวดหมู่ <span className="text-[#b3401f]">*</span>
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น คอมพิวเตอร์ตั้งโต๊ะ"
                className="pl-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg"
                required
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e3ddcd]">
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
            type="submit"
            disabled={isPending}
            className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกการแก้ไข</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
