"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderTree,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Package,
  Layers,
  Sparkles,
  ArrowUpRight,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryWithStats, CategoriesResult } from "@/actions/categories";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { formatThaiDate } from "@/lib/utils";

interface CategoryManagementClientProps {
  initialData: CategoriesResult;
}

export function CategoryManagementClient({ initialData }: CategoryManagementClientProps) {
  const router = useRouter();
  const categories = initialData.categories;
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithStats | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithStats | null>(null);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.prefix_code && c.prefix_code.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  const totalAssignedAssets = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.asset_count, 0);
  }, [categories]);

  const totalQuantitySum = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.total_quantity, 0);
  }, [categories]);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eae7dc] border border-[#ddd6c6] text-[11px] font-medium text-[#71695e] mb-2">
            <FolderTree className="w-3 h-3 text-[#c2593c]" />
            <span>การจัดหมวดหมู่พัสดุ</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">
            หมวดหมู่ครุภัณฑ์ (Category Management)
          </h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            จัดกลุ่มและกำหนดประเภทครุภัณฑ์ พร้อมรหัสคำนำหน้าตามมาตรฐานภาครัฐ
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs h-9 px-4 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </Button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#faf9f5] border-[#e3ddcd] p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f5f0e6] text-[#c2593c] border border-[#e8dfcf]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#71695e] font-medium">หมวดหมู่ทั้งหมด</div>
              <div className="text-xl font-bold font-serif text-[#211f1c]">
                {categories.length.toLocaleString()}{" "}
                <span className="text-xs font-sans font-normal text-[#8b8271]">หมวด</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e3ddcd] p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#eef2e6] text-[#5d7d54] border border-[#dce6d2]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#71695e] font-medium">รายการครุภัณฑ์ที่จัดหมวดแล้ว</div>
              <div className="text-xl font-bold font-serif text-[#43633a]">
                {totalAssignedAssets.toLocaleString()}{" "}
                <span className="text-xs font-sans font-normal text-[#8b8271]">รายการ</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e3ddcd] p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#fdf8eb] text-[#c49830] border border-[#edd7a6]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#71695e] font-medium">จำนวนชิ้นรวมในระบบ</div>
              <div className="text-xl font-bold font-serif text-[#8c6d23]">
                {totalQuantitySum.toLocaleString()}{" "}
                <span className="text-xs font-sans font-normal text-[#8b8271]">ชิ้น</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="bg-[#faf9f5] border border-[#e3ddcd] p-3 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อหมวดหมู่ หรือรหัสคำนำหน้า (Prefix)..."
            className="pl-9 pr-9 bg-white border-[#d8d2c2] text-xs h-9 rounded-lg"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8271] hover:text-[#211f1c] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-[#8b8271] hidden sm:block">
          แสดง {filteredCategories.length} จาก {categories.length} หมวดหมู่
        </div>
      </div>

      {/* Categories Table */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f5f2ea] text-[#71695e] font-semibold border-b border-[#e7e2d4]">
                <tr>
                  <th className="px-5 py-3 font-medium">รหัสหมวด (Prefix)</th>
                  <th className="px-5 py-3 font-medium">ชื่อหมวดหมู่</th>
                  <th className="px-5 py-3 text-center font-medium">จำนวนรายการครุภัณฑ์</th>
                  <th className="px-5 py-3 text-center font-medium hidden md:table-cell">จำนวนชิ้นรวม</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">วันที่สร้าง</th>
                  <th className="px-5 py-3 text-right font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeadd]">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#8b8271]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FolderTree className="w-8 h-8 text-[#8b8271]/50" />
                        <p className="font-semibold text-sm text-[#211f1c]">ไม่พบข้อมูลหมวดหมู่</p>
                        <p className="text-xs text-[#8b8271]">
                          ไม่มีหมวดหมู่ที่ตรงกับคำค้นหา หรือยังไม่มีการเพิ่มหมวดหมู่ในระบบ
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#f5f2ea] transition-colors">
                      {/* Prefix Code */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {cat.prefix_code ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-[#efe8db] text-[#4a453d] px-2.5 py-0.5 rounded-md border border-[#ddd6c6]">
                            <Tag className="w-3 h-3 text-[#c2593c]" />
                            {cat.prefix_code}
                          </span>
                        ) : (
                          <span className="text-[#a49b8b] font-mono">-</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-5 py-3.5 font-semibold text-[#211f1c]">
                        <Link
                          href={`/assets?category=${cat.id}`}
                          className="hover:text-[#c2593c] hover:underline flex items-center gap-1.5"
                          title="ดูครุภัณฑ์ในหมวดนี้"
                        >
                          <span>{cat.name}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </Link>
                      </td>

                      {/* Asset Count */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <Link
                          href={`/assets?category=${cat.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef2e6] text-[#43633a] border border-[#d6e2cc] hover:bg-[#e2ebd8] transition-colors cursor-pointer"
                          title="คลิกเพื่อดูครุภัณฑ์ในหมวดนี้"
                        >
                          <Package className="w-3 h-3" />
                          <span>{cat.asset_count.toLocaleString()} รายการ</span>
                        </Link>
                      </td>

                      {/* Quantity Sum */}
                      <td className="px-5 py-3.5 text-center font-mono font-medium text-[#4a453d] hidden md:table-cell whitespace-nowrap">
                        {cat.total_quantity.toLocaleString()} ชิ้น
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-3.5 text-[#71695e] hidden sm:table-cell whitespace-nowrap">
                        {formatThaiDate(cat.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setEditingCategory(cat)}
                            className="border-[#d8d2c2] text-[#4a453d] hover:text-[#c2593c] hover:bg-white cursor-pointer"
                            title="แก้ไขหมวดหมู่"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" /> แก้ไข
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setDeletingCategory(cat)}
                            className="border-[#d8d2c2] text-[#8b8271] hover:text-[#b3401f] hover:bg-[#f7e5df] hover:border-[#e5b8a8] cursor-pointer"
                            title="ลบหมวดหมู่"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <CreateCategoryDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Edit Category Modal */}
      <EditCategoryDialog
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSuccess={handleRefresh}
      />

      {/* Delete Category Modal */}
      <DeleteCategoryDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
