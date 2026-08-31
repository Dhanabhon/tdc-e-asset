"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AssetPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export function AssetPagination({
  page,
  totalPages,
  totalCount,
  limit,
}: AssetPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalCount === 0) {
    return null;
  }

  const fromItem = Math.min((page - 1) * limit + 1, totalCount);
  const toItem = Math.min(page * limit, totalCount);

  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageClick = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      const url = createPageUrl(newPage);
      router.push(url);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#e7e2d4] text-xs">
      <span className="text-[#8b8271]">
        แสดง {fromItem}–{toItem} จาก {totalCount} รายการ
      </span>
      <div className="flex items-center gap-1.5 font-medium">
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={page <= 1}
          onClick={() => handlePageClick(page - 1)}
          className="h-7 w-7 border-[#d8d2c2] disabled:opacity-40 cursor-pointer"
        >
          ←
        </Button>

        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-[#8b8271]">
                …
              </span>
            );
          }

          const isCurrent = p === page;

          return (
            <Button
              key={`page-${p}`}
              type="button"
              size="xs"
              variant={isCurrent ? "default" : "outline"}
              onClick={() => handlePageClick(p as number)}
              className={
                isCurrent
                  ? "h-7 w-7 bg-[#211f1c] text-[#f0eee6] hover:bg-[#3a362f] cursor-default"
                  : "h-7 w-7 border-[#d8d2c2] hover:bg-white text-[#4a453d] cursor-pointer"
              }
            >
              {p}
            </Button>
          );
        })}

        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => handlePageClick(page + 1)}
          className="h-7 w-7 border-[#d8d2c2] disabled:opacity-40 cursor-pointer"
        >
          →
        </Button>
      </div>
    </div>
  );
}
