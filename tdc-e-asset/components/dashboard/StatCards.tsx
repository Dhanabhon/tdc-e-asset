import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/actions/dashboard";

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. ครุภัณฑ์ทั้งหมด */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-xs">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-[#8b8271]">
            ครุภัณฑ์ทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif-lora text-[#211f1c] tracking-tight">
            {stats.totalAssets.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#8b8271] mt-1">
            ทั้งหมด {stats.totalQuantity.toLocaleString()} ชิ้น (พร้อมใช้ {stats.availableQuantity.toLocaleString()})
          </p>
        </CardContent>
      </Card>

      {/* 2. กำลังถูกยืม */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-xs">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-[#8b8271]">
            กำลังถูกยืม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif-lora text-[#211f1c] tracking-tight">
            {stats.borrowedCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#5d7d54] font-medium mt-1">
            {stats.borrowedCount > 0
              ? `อยู่ระหว่างการใช้งาน ${stats.borrowedCount.toLocaleString()} รายการ`
              : "ไม่มีรายการค้างคืน"}
          </p>
        </CardContent>
      </Card>

      {/* 3. เกินกำหนดคืน */}
      <Card className={`bg-[#faf9f5] shadow-xs transition-colors ${stats.overdueCount > 0 ? "border-[#e5b8a8]" : "border-[#e3ddcd]"}`}>
        <CardHeader className="pb-1">
          <CardTitle className={`text-xs font-medium ${stats.overdueCount > 0 ? "text-[#b3401f]" : "text-[#8b8271]"}`}>
            เกินกำหนดคืน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold font-serif-lora tracking-tight ${stats.overdueCount > 0 ? "text-[#b3401f]" : "text-[#211f1c]"}`}>
            {stats.overdueCount.toLocaleString()}
          </div>
          <p className={`text-[11px] font-medium mt-1 ${stats.overdueCount > 0 ? "text-[#b3401f]" : "text-[#8b8271]"}`}>
            {stats.overdueCount > 0
              ? `ต้องติดตามด่วน ${stats.overdueCount.toLocaleString()} รายการ`
              : "ไม่มีรายการเกินกำหนด"}
          </p>
        </CardContent>
      </Card>

      {/* 4. ส่งซ่อม / ชำรุด */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-xs">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-[#8b8271]">
            ส่งซ่อม / ชำรุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif-lora text-[#211f1c] tracking-tight">
            {stats.maintenanceCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#8b8271] mt-1">
            {stats.maintenanceCount > 0
              ? `รอซ่อมบำรุง ${stats.maintenanceCount.toLocaleString()} รายการ`
              : "ครุภัณฑ์สภาพปกติ"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
