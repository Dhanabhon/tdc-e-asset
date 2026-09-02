import { Skeleton } from "@/components/ui/skeleton";

export default function BorrowReturnLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Borrow Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#faf9f5] border border-[#e3ddcd] rounded-2xl p-6 space-y-5 shadow-2xs">
          <div className="border-b border-[#efeadd] pb-3 space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>

            <Skeleton className="h-11 w-full rounded-lg pt-2" />
          </div>
        </div>

        {/* Right Column: Active Loans Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#faf9f5] border border-[#e3ddcd] rounded-2xl p-6 space-y-4 shadow-2xs">
          {/* Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#efeadd] pb-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-44 rounded-lg" />
          </div>

          {/* Loan Rows */}
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-[#efeadd] bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-3.5 w-20 ml-auto" />
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                </div>
                <Skeleton className="h-8 w-18 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
