import { Skeleton } from "@/components/ui/skeleton";

export default function AssetDetailLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image & Specs */}
        <div className="space-y-6">
          <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-2xl overflow-hidden p-6 space-y-4 shadow-2xs">
            <Skeleton className="h-56 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-2xl p-6 space-y-3 shadow-2xs">
            <Skeleton className="h-5 w-32 border-b border-[#efeadd] pb-2" />
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Loan History & Activity */}
        <div className="lg:col-span-2 bg-[#faf9f5] border border-[#e3ddcd] rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#efeadd] pb-3">
            <div className="space-y-1">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>

          <div className="space-y-4 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-[#efeadd] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
