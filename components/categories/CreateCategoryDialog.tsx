"use client";

import { useState, useTransition } from "react";
import { FolderPlus, Loader2, AlertCircle, Sparkles, Tag, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory } from "@/actions/categories";

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GOVERNMENT_PRESETS = [
  { name: "คอมพิวเตอร์ตั้งโต๊ะ", code: "7440" },
  { name: "เครื่องคอมพิวเตอร์โน้ตบุ๊ก", code: "7440" },
  { name: "ครุภัณฑ์สำนักงาน", code: "7110" },
  { name: "ครุภัณฑ์ไฟฟ้าและวิทยุ", code: "7730" },
  { name: "ครุภัณฑ์โฆษณาและเผยแพร่", code: "6720" },
  { name: "ครุภัณฑ์งานบ้านงานครัว", code: "5820" },
];

export function CreateCategoryDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [prefixCode, setPrefixCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

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

      const res = await createCategory(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setName("");
        setPrefixCode("");
        onSuccess?.();
        onClose();
      }
    });
  };

  const handleSelectPreset = (preset: { name: string; code: string }) => {
    setName(preset.name);
    setPrefixCode(preset.code);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f5f0e6] border border-[#ddd6c6] text-[#c2593c] flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#211f1c]">เพิ่มหมวดหมู่ครุภัณฑ์ใหม่</h3>
            <p className="text-xs text-[#71695e] mt-0.5">
              กำหนดหมวดหมู่และรหัสคำนำหน้าตามมาตรฐานระบบพัสดุภาครัฐ
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

        {/* Preset Suggestions */}
        <div className="space-y-1.5 bg-[#f5f2ea] border border-[#e3ddcd] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#71695e]">
            <Sparkles className="w-3.5 h-3.5 text-[#c2593c]" />
            <span>หมวดหมู่มาตรฐานภาครัฐยอดนิยม (คลิกเพื่อเลือก):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {GOVERNMENT_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 rounded-lg text-xs bg-white border border-[#d8d2c2] hover:border-[#c2593c] hover:text-[#c2593c] text-[#4a453d] transition-colors cursor-pointer"
              >
                {p.name} ({p.code})
              </button>
            ))}
          </div>
        </div>

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
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>บันทึกหมวดหมู่</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
