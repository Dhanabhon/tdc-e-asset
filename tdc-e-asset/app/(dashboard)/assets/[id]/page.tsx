import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  ArrowLeftRight,
  Package,
  Calendar,
  Building,
  MapPin,
  Barcode,
  Layers,
  User,
  Clock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetById } from "@/actions/assets";
import { AssetStatusBadge } from "@/components/assets/AssetStatusBadge";
import { DeleteAssetButton } from "@/components/assets/DeleteAssetButton";

export const dynamic = "force-dynamic";

interface AssetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="p-4 bg-[#efeadd] rounded-full inline-block text-[#71695e]">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#211f1c]">ไม่พบข้อมูลครุภัณฑ์</h2>
        <p className="text-xs text-[#8b8271]">
          รหัสหรือ ID ที่ระบุไม่มีอยู่ในระบบ หรืออาจถูกลบไปแล้ว
        </p>
        <Link href="/assets">
          <Button variant="outline" className="border-[#d8d2c2] text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> กลับหน้ารายการครุภัณฑ์
          </Button>
        </Link>
      </div>
    );
  }

  const transactions = asset.transactions || [];

  const getConditionBadge = (condition: string | null) => {
    if (!condition) return <span className="text-[#8b8271]">-</span>;
    switch (condition) {
      case "good":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#e2ebd8] text-[#43633a]">
            สมบูรณ์ปกติ
          </span>
        );
      case "damaged_minor":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#f7f0d8] text-[#8c6d23]">
            ชำรุดเล็กน้อย
          </span>
        );
      case "damaged_repair":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#f7e5df] text-[#b3401f]">
            ส่งซ่อม
          </span>
        );
      default:
        return <span className="text-[#71695e]">{condition}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#8b8271]">
            <Link href="/assets" className="hover:underline">
              ทะเบียนครุภัณฑ์
            </Link>{" "}
            / <span className="font-mono text-[#211f1c]">{asset.asset_code}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">
              {asset.name}
            </h1>
            <AssetStatusBadge status={asset.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/assets">
            <Button
              variant="outline"
              className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold text-[#4a453d]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> ย้อนกลับ
            </Button>
          </Link>

          <Link href={`/borrow-return?asset_id=${asset.id}&asset_code=${asset.asset_code}`}>
            <Button
              variant="outline"
              className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold text-[#211f1c]"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-1 text-[#c2593c]" /> บันทึกการยืม
            </Button>
          </Link>

          <Link href={`/assets/${asset.id}/edit`}>
            <Button className="bg-[#211f1c] hover:bg-[#3a362f] text-white text-xs font-semibold">
              <Edit3 className="w-3.5 h-3.5 mr-1" /> แก้ไข
            </Button>
          </Link>

          <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Image Card */}
        <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="pb-2 border-b border-[#efeadd]">
            <CardTitle className="text-xs font-semibold text-[#211f1c] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#8b8271]" /> รูปภาพครุภัณฑ์
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex items-center justify-center">
            {asset.image_url ? (
              <div className="w-full h-56 rounded-lg overflow-hidden border border-[#d8d2c2] bg-white flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.image_url}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-56 border-2 border-dashed border-[#c9c1ad] rounded-xl bg-[#f5f2ea] flex flex-col items-center justify-center gap-2 text-center p-6">
                <Package className="w-10 h-10 text-[#a49b8b]" />
                <span className="text-xs font-medium text-[#8b8271]">ไม่มีรูปภาพครุภัณฑ์</span>
                <span className="text-[10px] text-[#a49b8b]">
                  สามารถแก้ไขข้อมูลเพื่อเพิ่ม URL รูปภาพได้
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Columns: Specs & Location */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Specifications */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#efeadd]">
              <CardTitle className="text-sm font-semibold text-[#211f1c] flex items-center gap-2">
                <Barcode className="w-4 h-4 text-[#c2593c]" /> ข้อมูลจำเพาะและรายละเอียด
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[#8b8271] block">รหัสครุภัณฑ์</span>
                  <span className="font-mono font-bold text-sm text-[#211f1c]">
                    {asset.asset_code}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8b8271] block">หมวดหมู่</span>
                  <span className="font-medium text-[#211f1c] inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#8b8271]" />
                    {asset.category?.name || "-"}
                    {asset.category?.prefix_code && (
                      <span className="font-mono text-[11px] text-[#8b8271]">
                        ({asset.category.prefix_code})
                      </span>
                    )}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8b8271] block">ยี่ห้อ / รุ่น</span>
                  <span className="font-medium text-[#211f1c]">
                    {asset.brand_model || "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8b8271] block">หมายเลขเครื่อง (S/N)</span>
                  <span className="font-mono font-medium text-[#211f1c]">
                    {asset.serial_number || "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8b8271] block">ผู้ลงทะเบียน</span>
                  <span className="font-medium text-[#211f1c] inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#8b8271]" />
                    {asset.creator?.full_name || asset.creator?.email || "ผู้ดูแลระบบ"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8b8271] block">วันที่ลงทะเบียนในระบบ</span>
                  <span className="font-medium text-[#211f1c] inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8b8271]" />
                    {new Date(asset.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Stock & Location */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#efeadd]">
              <CardTitle className="text-sm font-semibold text-[#211f1c] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#c2593c]" /> สถานะและการจัดสรร
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[#8b8271] block">จำนวนพร้อมใช้งาน / ทั้งหมด</span>
                  <span className="font-mono font-semibold text-sm text-[#211f1c]">
                    {asset.available_quantity} / {asset.quantity} หน่วย
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8b8271] block">หน่วยงานที่ครอบครอง</span>
                  <span className="font-medium text-[#211f1c] inline-flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#8b8271]" />
                    {asset.department || "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8b8271] block">สถานที่ตั้ง / ห้อง</span>
                  <span className="font-medium text-[#211f1c] inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8b8271]" />
                    {asset.location || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Borrow-Return Transaction History */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#efeadd]">
          <CardTitle className="text-sm font-semibold text-[#211f1c] flex items-center gap-2">
            <History className="w-4 h-4 text-[#c2593c]" /> ประวัติการยืม-คืน ({transactions.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="py-10 text-center text-[#8b8271] space-y-1">
              <Clock className="w-6 h-6 mx-auto text-[#a49b8b]" />
              <p className="text-xs font-semibold text-[#211f1c]">ยังไม่มีประวัติการยืม-คืน</p>
              <p className="text-[11px] text-[#8b8271]">
                เมื่อมีการบันทึกการยืมหรือส่งคืนครุภัณฑ์นี้ รายการจะปรากฏที่นี่โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                  <tr>
                    <th className="px-4 py-3">ผู้ยืม / หน่วยงาน</th>
                    <th className="px-4 py-3 text-center">ประเภท</th>
                    <th className="px-4 py-3">วันที่ยืม</th>
                    <th className="px-4 py-3">กำหนดส่งคืน</th>
                    <th className="px-4 py-3">วันที่ส่งคืนจริง</th>
                    <th className="px-4 py-3">สภาพเมื่อคืน</th>
                    <th className="px-4 py-3">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efeadd]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#f5f2ea] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#211f1c]">
                          {tx.borrower_name}
                        </div>
                        {tx.borrower_department && (
                          <div className="text-[11px] text-[#8b8271]">
                            {tx.borrower_department}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.type === "borrow" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#eae7dc] text-[#211f1c]">
                            ยืม
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#e2ebd8] text-[#43633a]">
                            คืน
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#4a453d]">
                        {tx.borrowed_at
                          ? new Date(tx.borrowed_at).toLocaleDateString("th-TH")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-[#4a453d]">
                        {tx.due_date
                          ? new Date(tx.due_date).toLocaleDateString("th-TH")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-[#4a453d]">
                        {tx.returned_at
                          ? new Date(tx.returned_at).toLocaleDateString("th-TH")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {getConditionBadge(tx.condition_on_return)}
                      </td>
                      <td className="px-4 py-3 text-[#71695e] max-w-xs truncate">
                        {tx.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
