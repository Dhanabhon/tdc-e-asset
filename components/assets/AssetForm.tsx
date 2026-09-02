"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Check, 
  ArrowLeft, 
  Image as ImageIcon, 
  Info, 
  Loader2, 
  AlertCircle, 
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category, createAsset, updateAsset } from "@/actions/assets";
import { AssetStatus } from "@/lib/types/database.types";
import { AssetImageUpload } from "@/components/assets/AssetImageUpload";

interface AssetFormProps {
  categories: Category[];
  initialData?: {
    id?: string;
    asset_code: string;
    name: string;
    category_id: string | null;
    brand_model: string | null;
    serial_number: string | null;
    quantity: number;
    location: string | null;
    department: string | null;
    image_url: string | null;
    status: AssetStatus;
  };
  mode: "create" | "edit";
}

export function AssetForm({ categories, initialData, mode }: AssetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state for live preview
  const [assetCode, setAssetCode] = useState(initialData?.asset_code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || (categories.length > 0 ? categories[0].id : "")
  );
  const [brandModel, setBrandModel] = useState(initialData?.brand_model || "");
  const [serialNumber, setSerialNumber] = useState(initialData?.serial_number || "");
  const [quantity, setQuantity] = useState<number>(initialData?.quantity ?? 1);
  const [department, setDepartment] = useState(initialData?.department || "กองยุทธศาสตร์และแผนงาน");
  const [location, setLocation] = useState(initialData?.location || "อาคาร 2 ชั้น 4 ห้อง 402");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [status, setStatus] = useState<AssetStatus>(initialData?.status || "available");
  const [imgError, setImgError] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleGenerateCode = () => {
    const prefix = selectedCategory?.prefix_code || "7440";
    const currentBuddhistYear = (new Date().getFullYear() + 543).toString().slice(-2);
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    setAssetCode(`${prefix}-001-${currentBuddhistYear}-${randomSeq}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (mode === "create") {
          const res = await createAsset(formData);
          if (res.error) {
            setErrorMessage(res.error);
            return;
          }
          if (res.success && res.assetId) {
            router.push(`/assets/${res.assetId}`);
          } else {
            router.push("/assets");
          }
        } else {
          if (!initialData?.id) {
            setErrorMessage("ไม่พบรหัสครุภัณฑ์ที่ต้องการแก้ไข");
            return;
          }
          const res = await updateAsset(initialData.id, formData);
          if (res.error) {
            setErrorMessage(res.error);
            return;
          }
          router.push(`/assets/${initialData.id}`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
        setErrorMessage(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#8b8271]">
            <Link href="/assets" className="hover:underline">
              ทะเบียนครุภัณฑ์
            </Link>{" "}
            /{" "}
            <span className="font-semibold text-[#211f1c]">
              {mode === "create" ? "เพิ่มครุภัณฑ์ใหม่" : `แก้ไข ${initialData?.asset_code || "ครุภัณฑ์"}`}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c] mt-1">
            {mode === "create" ? "เพิ่มครุภัณฑ์ใหม่" : "แก้ไขข้อมูลครุภัณฑ์"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href={mode === "edit" && initialData?.id ? `/assets/${initialData.id}` : "/assets"}>
            <Button
              type="button"
              variant="outline"
              className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold text-[#4a453d]"
              disabled={isPending}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> ยกเลิก
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> กำลังบันทึก...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" /> {mode === "create" ? "บันทึกและขึ้นทะเบียน" : "บันทึกการแก้ไข"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-[#f7e5df] border border-[#f0c2b5] text-[#b3401f] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Form Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: 3 Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: ข้อมูลทั่วไป */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#efeadd]">
              <CardTitle className="text-sm font-semibold text-[#211f1c]">1 · ข้อมูลทั่วไป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="asset_code" className="block text-xs font-medium text-[#4a453d]">
                      รหัสครุภัณฑ์ <span className="text-[#b3401f]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#c2593c] hover:text-[#a3462c] hover:underline cursor-pointer"
                      title="สุ่มสร้างรหัสครุภัณฑ์อัตโนมัติตามหมวดหมู่และปี พ.ศ."
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>สุ่มสร้างรหัส</span>
                    </button>
                  </div>
                  <Input
                    id="asset_code"
                    name="asset_code"
                    required
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="เช่น 7440-001-69-1082"
                    className="bg-white border-[#d8d2c2] text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="category_id" className="block text-xs font-medium text-[#4a453d] mb-1">
                    หมวดหมู่ <span className="text-[#b3401f]">*</span>
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c] focus:outline-none focus:border-[#c2593c]"
                  >
                    <option value="" disabled>
                      -- เลือกหมวดหมู่ --
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.prefix_code ? `(${cat.prefix_code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-xs font-medium text-[#4a453d] mb-1">
                  ชื่อรายการ <span className="text-[#b3401f]">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น เครื่องคอมพิวเตอร์โน้ตบุ๊ก สำหรับงานประมวลผล"
                  className="bg-white border-[#d8d2c2] text-xs"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="brand_model" className="block text-xs font-medium text-[#4a453d] mb-1">
                    ยี่ห้อ / รุ่น
                  </label>
                  <Input
                    id="brand_model"
                    name="brand_model"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    placeholder="เช่น Lenovo ThinkPad E16 Gen 2"
                    className="bg-white border-[#d8d2c2] text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="serial_number" className="block text-xs font-medium text-[#4a453d] mb-1">
                    หมายเลขเครื่อง (S/N)
                  </label>
                  <Input
                    id="serial_number"
                    name="serial_number"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="เช่น PF-4XK2R9"
                    className="bg-white border-[#d8d2c2] text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: การจัดหา & สถานที่ */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#efeadd]">
              <CardTitle className="text-sm font-semibold text-[#211f1c]">
                2 · การจัดหา & สถานที่ตั้ง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="department" className="block text-xs font-medium text-[#4a453d] mb-1">
                    หน่วยงาน / กอง
                  </label>
                  <Input
                    id="department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="เช่น กองยุทธศาสตร์และแผนงาน"
                    className="bg-white border-[#d8d2c2] text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-xs font-medium text-[#4a453d] mb-1">
                    สถานที่ตั้ง / ห้อง
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น อาคาร 2 ชั้น 4 ห้อง 402"
                    className="bg-white border-[#d8d2c2] text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-xs font-medium text-[#4a453d] mb-1">
                    จำนวน <span className="text-[#b3401f]">*</span>
                  </label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="bg-white border-[#d8d2c2] text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: รูปภาพ & สถานะเริ่มต้น */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#efeadd]">
              <CardTitle className="text-sm font-semibold text-[#211f1c]">
                3 · รูปภาพและสถานะ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-[#4a453d] mb-1.5">
                  รูปภาพครุภัณฑ์ (อัปโหลดเข้า Supabase Storage)
                </label>
                <AssetImageUpload
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url);
                    setImgError(false);
                  }}
                />
                <input type="hidden" name="image_url" value={imageUrl} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  สถานะครุภัณฑ์
                </label>
                <div className="flex flex-wrap gap-2">
                  <label
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      status === "available"
                        ? "bg-[#211f1c] text-[#f0eee6] border-[#211f1c]"
                        : "bg-white border-[#d8d2c2] text-[#4a453d] hover:bg-[#f5f2ea]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="available"
                      checked={status === "available"}
                      onChange={() => setStatus("available")}
                      className="sr-only"
                    />
                    ✓ พร้อมใช้งาน
                  </label>

                  <label
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      status === "borrowed"
                        ? "bg-[#211f1c] text-[#f0eee6] border-[#211f1c]"
                        : "bg-white border-[#d8d2c2] text-[#4a453d] hover:bg-[#f5f2ea]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="borrowed"
                      checked={status === "borrowed"}
                      onChange={() => setStatus("borrowed")}
                      className="sr-only"
                    />
                    กำลังถูกยืม
                  </label>

                  <label
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      status === "maintenance"
                        ? "bg-[#211f1c] text-[#f0eee6] border-[#211f1c]"
                        : "bg-white border-[#d8d2c2] text-[#4a453d] hover:bg-[#f5f2ea]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="maintenance"
                      checked={status === "maintenance"}
                      onChange={() => setStatus("maintenance")}
                      className="sr-only"
                    />
                    ส่งซ่อม
                  </label>

                  <label
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      status === "lost"
                        ? "bg-[#211f1c] text-[#f0eee6] border-[#211f1c]"
                        : "bg-white border-[#d8d2c2] text-[#4a453d] hover:bg-[#f5f2ea]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="lost"
                      checked={status === "lost"}
                      onChange={() => setStatus("lost")}
                      className="sr-only"
                    />
                    สูญหาย
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Image & Summary Cards */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Image Preview Card */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm">
            <CardHeader className="pb-2 border-b border-[#efeadd]">
              <CardTitle className="text-xs font-semibold text-[#211f1c]">
                ตัวอย่างรูปภาพครุภัณฑ์
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {imageUrl && !imgError ? (
                <div className="relative h-44 w-full rounded-lg overflow-hidden border border-[#d8d2c2] bg-white flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={name || "รูปภาพครุภัณฑ์"}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 border-2 border-dashed border-[#c9c1ad] rounded-xl bg-[#f5f2ea] flex flex-col items-center justify-center gap-1.5 text-center p-4">
                  <ImageIcon className="w-8 h-8 text-[#a49b8b]" />
                  <span className="text-xs font-medium text-[#8b8271]">
                    {imageUrl && imgError ? "โหลดรูปภาพไม่สำเร็จ (URL ไม่ถูกต้อง)" : "ยังไม่ได้ระบุ URL รูปภาพ"}
                  </span>
                  <span className="text-[10px] text-[#a49b8b]">
                    กรอก URL รูปภาพด้านซ้ายเพื่อดูตัวอย่าง
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dark Summary Card */}
          <Card className="bg-[#211f1c] text-[#f0eee6] border-none shadow-md">
            <CardHeader className="pb-2 border-b border-white/10">
              <CardTitle className="text-xs font-semibold text-[#f0eee6]">
                {mode === "create" ? "สรุปก่อนขึ้นทะเบียน" : "สรุปข้อมูลครุภัณฑ์"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs pt-3">
              <div className="flex justify-between">
                <span className="text-white/60">รหัส</span>
                <span className="font-mono text-[11px] text-right font-medium">
                  {assetCode || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">รายการ</span>
                <span className="text-right font-medium truncate max-w-[160px]">
                  {name || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">หมวดหมู่</span>
                <span className="text-right font-medium">
                  {selectedCategory ? selectedCategory.name : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">จำนวน</span>
                <span className="text-right font-mono font-medium">{quantity} หน่วย</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">หน่วยงาน</span>
                <span className="text-right font-medium truncate max-w-[160px]">
                  {department || "-"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/15">
                <span className="text-white/60">สถานะเริ่มต้น</span>
                <span className="font-semibold text-[#a8d5a2]">
                  {status === "available"
                    ? "พร้อมใช้งาน"
                    : status === "borrowed"
                    ? "กำลังถูกยืม"
                    : "ส่งซ่อม"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tip Card */}
          <div className="bg-[#f5f2ea] border border-[#e3ddcd] rounded-xl p-4 text-xs text-[#71695e] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#4a453d]">
              <Info className="w-4 h-4 text-[#c2593c]" />
              <span>เกร็ดแนะนำ:</span>
            </div>
            <p>
              รหัสครุภัณฑ์ใช้รูปแบบ <span className="font-mono text-[11px] text-[#211f1c]">หมวด-ประเภท-ลำดับ/ปีงบ</span> เช่น <span className="font-mono text-[11px] text-[#211f1c]">7440-001-0001/2569</span>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
