import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-[#f5f2ea] px-4 py-3 border-b border-[#e7e2d4]">
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="divide-y divide-[#efeadd]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-16 rounded-md" />
              <div className="space-y-1.5 flex-1 max-w-sm">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-4 w-20 ml-auto hidden sm:block" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-14 rounded-lg" />
                <Skeleton className="h-8 w-14 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
