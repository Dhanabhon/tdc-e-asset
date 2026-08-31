import Link from "next/link";
import { Plus, ArrowLeftRight, AlertCircle, ArrowUpRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const overdueItems = [
  {
    code: "7440-001-0231/2567",
    name: "โน้ตบุ๊ก Dell Latitude 5440",
    who: "นายวิชัย พงษ์ไทย (กองยุทธศาสตร์ฯ)",
    due: "15 ก.ค. 2569",
    late: "เกิน 45 วัน",
  },
  {
    code: "6720-004-0087/2566",
    name: "กล้องดิจิทัล DSLR Canon EOS R6",
    who: "นางสาวสมหญิง สุขใจ (กองประชาสัมพันธ์)",
    due: "02 ส.ค. 2569",
    late: "เกิน 27 วัน",
  },
  {
    code: "7440-010-0054/2568",
    name: "โปรเจกเตอร์ Epson EB-2247U",
    who: "นายอนุชา แก้วมณี (กองยุทธศาสตร์ฯ)",
    due: "10 ส.ค. 2569",
    late: "เกิน 19 วัน",
  },
];

const categoryBreakdown = [
  { name: "ครุภัณฑ์คอมพิวเตอร์", count: 542, pct: "43%", color: "#c2593c" },
  { name: "ครุภัณฑ์สำนักงาน", count: 310, pct: "25%", color: "#211f1c" },
  { name: "ครุภัณฑ์ไฟฟ้าและวิทยุ", count: 215, pct: "17%", color: "#5d7d54" },
  { name: "ครุภัณฑ์โฆษณาและเผยแพร่", count: 120, pct: "10%", color: "#b08d3e" },
  { name: "ครุภัณฑ์งานบ้านงานครัว", count: 61, pct: "5%", color: "#8b8271" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">แดชบอร์ด</h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            ข้อมูล ณ วันศุกร์ที่ 29 สิงหาคม 2569 · ปีงบประมาณ 2569
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/assets/new">
            <Button variant="outline" className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold">
              <Plus className="w-4 h-4 mr-1.5" /> เพิ่มครุภัณฑ์
            </Button>
          </Link>
          <Link href="/borrow-return">
            <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold">
              <ArrowLeftRight className="w-4 h-4 mr-1.5" /> บันทึกการยืม
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      <div className="flex items-center justify-between bg-[#f7e5df] border border-[#e5b8a8] rounded-xl px-4 py-3 text-xs text-[#7a2c14]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#b3401f] animate-pulse" />
          <span className="font-medium">
            มีครุภัณฑ์เกินกำหนดคืน 7 รายการ — รายการที่เกิน 30 วันขึ้นไปควรติดตามด่วน
          </span>
        </div>
        <Link href="/borrow-return?filter=overdue" className="font-semibold hover:underline flex items-center gap-1">
          ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#faf9f5] border-[#e3ddcd]">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-[#8b8271]">ครุภัณฑ์ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#211f1c]">1,248</div>
            <p className="text-[11px] text-[#8b8271] mt-1">มูลค่ารวม 42.6 ล้านบาท</p>
          </CardContent>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e3ddcd]">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-[#8b8271]">กำลังถูกยืม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#211f1c]">86</div>
            <p className="text-[11px] text-[#5d7d54] mt-1">คืนสัปดาห์นี้ 14 รายการ</p>
          </CardContent>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e5b8a8]">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-[#b3401f]">เกินกำหนดคืน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#b3401f]">7</div>
            <p className="text-[11px] text-[#b3401f] mt-1">เกิน 30 วัน 2 รายการ</p>
          </CardContent>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e3ddcd]">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-[#8b8271]">ส่งซ่อม / ชำรุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#211f1c]">12</div>
            <p className="text-[11px] text-[#8b8271] mt-1">รอจำหน่าย 5 รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Chart & Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Borrow-Return Visual Mockup */}
        <Card className="bg-[#faf9f5] border-[#e3ddcd] md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-[#211f1c]">การยืม–คืนรายเดือน</CardTitle>
            <div className="text-xs text-[#8b8271] flex items-center gap-3">
              <span>6 เดือนล่าสุด</span>
              <span><span className="text-[#c2593c]">■</span> ยืม</span>
              <span><span className="text-[#211f1c]">■</span> คืน</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-44 flex items-end justify-between gap-4 pt-6 px-2">
              {[
                { month: "มี.ค.", borrow: "60%", return: "50%" },
                { month: "เม.ย.", borrow: "40%", return: "35%" },
                { month: "พ.ค.", borrow: "75%", return: "70%" },
                { month: "มิ.ย.", borrow: "85%", return: "80%" },
                { month: "ก.ค.", borrow: "90%", return: "85%" },
                { month: "ส.ค.", borrow: "65%", return: "55%" },
              ].map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="flex items-end gap-1.5 w-full justify-center h-full">
                    <div style={{ height: m.borrow }} className="w-4 bg-[#c2593c] rounded-t-sm" />
                    <div style={{ height: m.return }} className="w-4 bg-[#211f1c] rounded-t-sm" />
                  </div>
                  <span className="text-[11px] font-medium text-[#8b8271]">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-[#faf9f5] border-[#e3ddcd]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#211f1c]">ครุภัณฑ์ตามหมวด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{cat.name}</span>
                  <span className="text-[#8b8271]">{cat.count}</span>
                </div>
                <div className="h-1.5 bg-[#e7e2d4] rounded-full overflow-hidden">
                  <div 
                    style={{ width: cat.pct, backgroundColor: cat.color }} 
                    className="h-full rounded-full" 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Items Table Section */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold text-[#211f1c]">
            เกินกำหนดคืน — ต้องติดตาม
          </CardTitle>
          <Link href="/borrow-return" className="text-xs font-semibold text-[#c2593c] hover:underline flex items-center gap-1">
            ดูทั้งหมด (7) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-t border-[#e7e2d4]">
              <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                <tr>
                  <th className="px-4 py-2.5">รหัสครุภัณฑ์</th>
                  <th className="px-4 py-2.5">รายการ</th>
                  <th className="px-4 py-2.5">ผู้ยืม</th>
                  <th className="px-4 py-2.5">กำหนดคืน</th>
                  <th className="px-4 py-2.5">ระยะเวลาเกิน</th>
                  <th className="px-4 py-2.5 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeadd]">
                {overdueItems.map((item) => (
                  <tr key={item.code} className="hover:bg-[#f5f2ea] transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-[#4a453d] whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#211f1c]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-[#71695e]">
                      {item.who}
                    </td>
                    <td className="px-4 py-3 text-[#8b8271]">
                      {item.due}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#b3401f]">
                      {item.late}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button size="xs" variant="outline" className="border-[#d8d2c2] text-xs hover:border-[#c2593c] hover:text-[#c2593c]">
                        ติดตาม
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
