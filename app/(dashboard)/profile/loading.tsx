import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg self-start sm:self-auto" />
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl overflow-hidden shadow-2xs">
            <Skeleton className="h-24 w-full rounded-none" />
            <div className="px-6 pb-6 pt-0 space-y-4">
              <div className="-mt-12 mb-4">
                <Skeleton className="w-20 h-20 rounded-2xl border-4 border-[#faf9f5]" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
              <div className="space-y-3 pt-4 border-t border-[#efeadd]">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>

          <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl p-4 space-y-3 shadow-2xs">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column: Edit Form & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl p-6 space-y-5 shadow-2xs">
            <div className="border-b border-[#efeadd] pb-3 space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-64" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#efeadd]">
                <Skeleton className="h-9 w-36 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-[#faf9f5] border border-[#e3ddcd] rounded-xl p-6 space-y-4 shadow-2xs">
            <div className="border-b border-[#efeadd] pb-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-72 mt-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
