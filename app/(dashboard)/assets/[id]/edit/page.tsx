import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssetById, getCategories } from "@/actions/assets";
import { AssetForm } from "@/components/assets/AssetForm";

export const dynamic = "force-dynamic";

interface AssetEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssetEditPage({ params }: AssetEditPageProps) {
  const { id } = await params;

  const [asset, categories] = await Promise.all([
    getAssetById(id),
    getCategories(),
  ]);

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

  return (
    <AssetForm
      categories={categories}
      initialData={{
        id: asset.id,
        asset_code: asset.asset_code,
        name: asset.name,
        category_id: asset.category_id,
        brand_model: asset.brand_model,
        serial_number: asset.serial_number,
        quantity: asset.quantity,
        location: asset.location,
        department: asset.department,
        image_url: asset.image_url,
        status: asset.status,
      }}
      mode="edit"
    />
  );
}
