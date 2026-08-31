import Link from "next/link";
import { Plus, Eye, Edit3, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAssets, getCategories } from "@/actions/assets";
import { AssetStatusBadge } from "@/components/assets/AssetStatusBadge";
import { AssetFilters } from "@/components/assets/AssetFilters";
import { AssetExportButton } from "@/components/assets/AssetExportButton";
import { AssetPagination } from "@/components/assets/AssetPagination";

export const dynamic = "force-dynamic";

interface AssetsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const status = resolvedParams.status || "";
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const limit = 10;

  const [categories, { assets, totalCount, totalPages }] = await Promise.all([
    getCategories(),
    getAssets({
      search,
      category_id: category,
      status,
      page,
      limit,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">ทะเบียนครุภัณฑ์</h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            พบทั้งหมด {totalCount.toLocaleString()} รายการ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AssetExportButton assets={assets} />
          <Link href="/assets/new">
            <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold shadow-sm cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" /> เพิ่มครุภัณฑ์
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <AssetFilters categories={categories} totalCount={totalCount} />

      {/* Main Asset Table Card */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัสครุภัณฑ์</th>
                  <th className="px-4 py-3 font-medium">รายการ / ยี่ห้อ-รุ่น</th>
                  <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                  <th className="px-4 py-3 font-medium">หน่วยงาน / สถานที่</th>
                  <th className="px-4 py-3 text-center font-medium">จำนวน (คงเหลือ/ทั้งหมด)</th>
                  <th className="px-4 py-3 text-center font-medium">สถานะ</th>
                  <th className="px-4 py-3 text-right font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeadd]">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#8b8271]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 bg-[#efeadd] rounded-full text-[#71695e]">
                          <Package2 className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-sm text-[#211f1c]">ไม่พบข้อมูลครุภัณฑ์</p>
                        <p className="text-xs max-w-sm text-[#8b8271]">
                          ไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา หรือยังไม่มีการลงทะเบียนครุภัณฑ์ในระบบ
                        </p>
                        <Link href="/assets/new" className="pt-2">
                          <Button size="sm" className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่มครุภัณฑ์ใหม่
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-[#f5f2ea] transition-colors">
                      {/* Asset Code */}
                      <td className="px-4 py-3.5 font-mono font-medium text-[#4a453d] whitespace-nowrap">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="hover:text-[#c2593c] hover:underline flex items-center gap-1"
                        >
                          {asset.asset_code}
                        </Link>
                      </td>

                      {/* Name & Model */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="font-semibold text-[#211f1c] hover:text-[#c2593c] line-clamp-1"
                        >
                          {asset.name}
                        </Link>
                        {asset.brand_model && (
                          <span className="block text-[11px] text-[#8b8271] mt-0.5 font-mono">
                            {asset.brand_model}
                            {asset.serial_number ? ` · S/N: ${asset.serial_number}` : ""}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-[#71695e] whitespace-nowrap">
                        {asset.category?.name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#eee8dc] text-[#554e42] text-[11px] font-medium">
                            {asset.category.name}
                          </span>
                        ) : (
                          <span className="text-[#a49b8b]">-</span>
                        )}
                      </td>

                      {/* Department & Location */}
                      <td className="px-4 py-3.5 text-[#71695e]">
                        <div className="font-medium text-[#4a453d]">{asset.department || "-"}</div>
                        {asset.location && (
                          <div className="text-[11px] text-[#8b8271]">{asset.location}</div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5 text-center font-mono whitespace-nowrap">
                        <span className="font-semibold text-[#211f1c]">
                          {asset.available_quantity}
                        </span>
                        <span className="text-[#8b8271]"> / {asset.quantity}</span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <AssetStatusBadge status={asset.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/assets/${asset.id}`}>
                            <Button
                              size="xs"
                              variant="outline"
                              className="border-[#d8d2c2] text-[#4a453d] hover:text-[#211f1c] hover:bg-white"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> ดู
                            </Button>
                          </Link>
                          <Link href={`/assets/${asset.id}/edit`}>
                            <Button
                              size="xs"
                              variant="outline"
                              className="border-[#d8d2c2] text-[#4a453d] hover:text-[#c2593c] hover:bg-white"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1" /> แก้ไข
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <AssetPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={limit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
