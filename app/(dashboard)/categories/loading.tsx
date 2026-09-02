import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#faf9f5] border border-[#e3ddcd] flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-3 rounded-xl bg-[#faf9f5] border border-[#e3ddcd] flex items-center justify-between">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-4 w-28 hidden sm:block" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-[#f5f2ea] px-5 py-3 border-b border-[#e7e2d4]">
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="divide-y divide-[#efeadd]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-4 w-48 flex-1 max-w-sm" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 hidden md:block" />
              <Skeleton className="h-4 w-24 hidden sm:block" />
              <div className="flex items-center gap-1.5 ml-auto">
                <Skeleton className="h-7 w-14 rounded-md" />
                <Skeleton className="h-7 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
