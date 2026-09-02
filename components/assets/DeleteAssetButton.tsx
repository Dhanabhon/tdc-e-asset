"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAsset } from "@/actions/assets";

interface DeleteAssetButtonProps {
  assetId: string;
  assetName: string;
  variant?: "default" | "compact";
}

export function DeleteAssetButton({
  assetId,
  assetName,
  variant = "default",
}: DeleteAssetButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteAsset(assetId);
        if (res.error) {
          setError(res.error);
          return;
        }
        setIsOpen(false);
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบครุภัณฑ์";
        setError(message);
      }
    });
  };

  return (
    <>
      {variant === "compact" ? (
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="border-[#d8d2c2] text-[#8b8271] hover:text-[#b3401f] hover:bg-[#f7e5df] hover:border-[#e5b8a8] cursor-pointer"
          title="ลบครุภัณฑ์"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="border-[#e3ddcd] text-[#b3401f] hover:bg-[#f7e5df] hover:text-[#a32e10] text-xs font-semibold cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" /> ลบครุภัณฑ์
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#f7e5df] text-[#b3401f] rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#211f1c]">ยืนยันการลบครุภัณฑ์</h3>
                <p className="text-xs text-[#71695e]">
                  คุณแน่ใจหรือไม่ว่าต้องการลบรายการ &ldquo;
                  <span className="font-semibold text-[#211f1c]">{assetName}</span>
                  &rdquo;? การดำเนินการนี้ไม่สามารถยกเลิกได้
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-[#f7e5df] border border-[#f0c2b5] text-[#b3401f] text-xs rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e7e2d4]">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                className="border-[#d8d2c2] text-xs font-medium"
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="bg-[#b3401f] hover:bg-[#8c2d13] text-white text-xs font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> กำลังลบ...
                  </>
                ) : (
                  "ยืนยันการลบ"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
