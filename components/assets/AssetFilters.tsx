"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Category } from "@/actions/assets";

interface AssetFiltersProps {
  categories: Category[];
  totalCount: number;
}

export function AssetFilters({ categories, totalCount }: AssetFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentStatus = searchParams.get("status") || "all";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateFilters = (updates: { search?: string; category?: string; status?: string; page?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        params.set("search", updates.search.trim());
      } else {
        params.delete("search");
      }
    }

    if (updates.category !== undefined) {
      if (updates.category && updates.category !== "all") {
        params.set("category", updates.category);
      } else {
        params.delete("category");
      }
    }

    if (updates.status !== undefined) {
      if (updates.status && updates.status !== "all") {
        params.set("status", updates.status);
      } else {
        params.delete("status");
      }
    }

    if (updates.page !== undefined) {
      params.set("page", updates.page);
    } else {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const selectedCategoryObj = categories.find((c) => c.id === currentCategory);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "พร้อมใช้งาน";
      case "borrowed":
        return "กำลังถูกยืม";
      case "maintenance":
        return "ส่งซ่อม";
      case "lost":
        return "สูญหาย";
      default:
        return status;
    }
  };

  const hasActiveFilters = Boolean(
    currentSearch ||
      (currentCategory && currentCategory !== "all") ||
      (currentStatus && currentStatus !== "all")
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ค้นหาด้วยรหัสครุภัณฑ์, ชื่อรายการ, S/N, สถานที่, หรือหน่วยงาน..."
              className="pl-9 pr-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-[#c2593c]"
            />
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8271] animate-spin" />
            ) : searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: "" });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8271] hover:text-[#211f1c] cursor-pointer"
                title="ล้างข้อความค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
          <button
            type="submit"
            className="h-10 px-3.5 bg-[#211f1c] hover:bg-[#383431] text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-colors"
          >
            ค้นหา
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <select
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="h-10 px-3 py-1 bg-white border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c] hover:border-[#c2593c] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c2593c] transition-colors cursor-pointer"
          >
            <option value="all">หมวดหมู่: ทั้งหมด</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.prefix_code ? `(${cat.prefix_code})` : ""}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="h-10 px-3 py-1 bg-white border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c] hover:border-[#c2593c] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c2593c] transition-colors cursor-pointer"
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="available">พร้อมใช้งาน</option>
            <option value="borrowed">กำลังถูกยืม</option>
            <option value="maintenance">ส่งซ่อม</option>
            <option value="lost">สูญหาย</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#211f1c] text-[#f0eee6] text-[11px] font-medium">
              ค้นหา: &ldquo;{currentSearch}&rdquo;
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: "" });
                }}
              />
            </span>
          )}

          {currentCategory && currentCategory !== "all" && selectedCategoryObj && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#211f1c] text-[#f0eee6] text-[11px] font-medium">
              หมวด: {selectedCategoryObj.name}
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFilters({ category: "all" })}
              />
            </span>
          )}

          {currentStatus && currentStatus !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#211f1c] text-[#f0eee6] text-[11px] font-medium">
              สถานะ: {getStatusLabel(currentStatus)}
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFilters({ status: "all" })}
              />
            </span>
          )}

          <span className="text-[#8b8271] text-xs ml-1">
            พบ {totalCount} รายการ ·{" "}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[#c2593c] hover:underline font-medium cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
