import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryStat } from "@/actions/dashboard";
import { ChevronRight } from "lucide-react";

interface CategoryBreakdownProps {
  categories: CategoryStat[];
  totalAssets: number;
}

export function CategoryBreakdown({
  categories,
  totalAssets,
}: CategoryBreakdownProps) {
  return (
    <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-xs flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-[#211f1c]">
            ครุภัณฑ์ตามหมวด
          </CardTitle>
          <Link
            href="/categories"
            className="text-[11px] font-medium text-[#8b8271] hover:text-[#c2593c] transition-colors flex items-center gap-0.5"
          >
            ดูหมวดหมู่ <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>

        <CardContent className="space-y-3.5 pt-2">
          {categories.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b8271]">
              ยังไม่มีข้อมูลหมวดหมู่ครุภัณฑ์
            </div>
          ) : (
            categories.slice(0, 6).map((cat) => (
              <div key={cat.id || cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-[#211f1c]">
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="text-[#8b8271] shrink-0 font-mono text-[11px]">
                    {cat.count.toLocaleString()} ({cat.pct})
                  </span>
                </div>
                <div className="h-1.5 bg-[#e7e2d4] rounded-full overflow-hidden">
                  <div
                    style={{
                      width: cat.count > 0 ? `${Math.max(4, cat.percentage)}%` : "0%",
                      backgroundColor: cat.color,
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </div>

      {totalAssets > 0 && categories.length > 0 && (
        <div className="px-6 pb-4 pt-2 text-[11px] text-[#8b8271] border-t border-[#f0ece1] flex justify-between">
          <span>รวม {categories.length} หมวดหมู่</span>
          <span>{totalAssets.toLocaleString()} รายการ</span>
        </div>
      )}
    </Card>
  );
}
