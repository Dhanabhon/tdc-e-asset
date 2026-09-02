import { Skeleton } from "@/components/ui/skeleton";

export default function AssetsPageLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#faf9f5] border border-[#e3ddcd] p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-2xs">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-44 rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-36 rounded-lg" />
      </div>

      {/* Assets Table */}
      <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-[#f5f2ea] px-6 py-3.5 border-b border-[#e7e2d4] flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="divide-y divide-[#efeadd]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>

              <Skeleton className="h-4 w-28 hidden md:block" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-[#efeadd] bg-[#faf9f5] flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
