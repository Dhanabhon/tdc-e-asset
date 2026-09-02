"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Laptop,
  Monitor,
  Printer as PrinterIcon,
  Server,
  Network,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadAssetImageAction } from "@/actions/assets";

interface AssetImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const PRESET_IMAGES = [
  {
    name: "โน้ตบุ๊ก",
    icon: Laptop,
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "คอมพิวเตอร์ PC",
    icon: Monitor,
    url: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "จอมอนิเตอร์",
    icon: Monitor,
    url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "เครื่องพิมพ์",
    icon: PrinterIcon,
    url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "เซิร์ฟเวอร์",
    icon: Server,
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "สวิตช์ / เครือข่าย",
    icon: Network,
    url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
  },
];

export function AssetImageUpload({ value, onChange }: AssetImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFile = (file: File) => {
    setErrorMessage(null);

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("ขนาดไฟล์รูปภาพต้องไม่เกิน 5 MB");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("รองรับเฉพาะไฟล์รูปภาพ JPG, PNG, WebP หรือ GIF เท่านั้น");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadAssetImageAction(formData);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.url) {
        onChange(res.url);
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Case 1: Has Image Value -> Show Preview Card */}
      {value ? (
        <div className="p-3.5 rounded-xl bg-white border border-[#e3ddcd] flex flex-col sm:flex-row items-center gap-4 shadow-2xs">
          <div className="relative w-32 h-24 rounded-lg bg-[#f5f2ea] overflow-hidden shrink-0 border border-[#e3ddcd]">
            <Image
              src={value}
              alt="ภาพครุภัณฑ์"
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
            {isPending && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-[#211f1c]">
              <Check className="w-4 h-4 text-[#5d7d54]" />
              <span>อัปโหลดรูปภาพเรียบร้อยแล้ว</span>
            </div>
            <p className="text-[11px] text-[#8b8271] truncate font-mono max-w-sm">
              {value}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="border-[#d8d2c2] text-xs h-8 px-3 rounded-lg text-[#4a453d] hover:bg-[#f5f2ea] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>เปลี่ยนรูป</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onChange("")}
                disabled={isPending}
                className="border-[#d8d2c2] text-xs h-8 px-3 rounded-lg text-[#b3401f] hover:bg-[#f7e5df] hover:border-[#e5b8a8] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>ลบรูป</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Case 2: No Image -> Modern Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isPending && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? "border-[#c2593c] bg-[#fdf2ee] scale-[0.99]"
              : "border-[#d8d2c2] bg-white hover:bg-[#faf9f5] hover:border-[#b5ac99]"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#f5f2ea] border border-[#e3ddcd] flex items-center justify-center text-[#71695e]">
            {isPending ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#c2593c]" />
            ) : (
              <UploadCloud className="w-6 h-6 text-[#c2593c]" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#211f1c]">
              {isPending
                ? "กำลังอัปโหลดรูปภาพไปยัง Supabase Storage..."
                : "คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่"}
            </p>
            <p className="text-[11px] text-[#8b8271]">
              รองรับไฟล์ JPG, PNG, WebP หรือ GIF (ขนาดสูงสุดไม่เกิน 5 MB)
            </p>
          </div>
        </div>
      )}

      {/* Preset Buttons for Quick Choice */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-[#71695e]">
          <span className="font-medium">หรือเลือกรูปภาพตัวอย่างอุปกรณ์ไอทียอดนิยม:</span>
          <button
            type="button"
            onClick={() => setShowManualUrl(!showManualUrl)}
            className="text-[#c2593c] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showManualUrl ? "ซ่อนช่อง URL" : "ระบุเป็น URL"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_IMAGES.map((preset) => {
            const Icon = preset.icon;
            const isSelected = value === preset.url;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange(preset.url)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#211f1c] text-[#faf9f5] border-[#211f1c] shadow-2xs"
                    : "bg-white border-[#d8d2c2] text-[#4a453d] hover:bg-[#f5f2ea]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#c2593c]" : "text-[#71695e]"}`} />
                <span className="truncate">{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Manual URL Input fallback */}
        {showManualUrl && (
          <div className="pt-2 animate-in fade-in duration-150">
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
              <Input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://example.com/asset-photo.jpg"
                className="pl-9 bg-white border-[#d8d2c2] text-xs h-9 font-mono"
              />
            </div>
            <p className="text-[10px] text-[#8b8271] mt-1 pl-1">
              ระบุ URL ของรูปภาพภายนอกโดยตรง (หากไม่ต้องการอัปโหลดไฟล์)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
