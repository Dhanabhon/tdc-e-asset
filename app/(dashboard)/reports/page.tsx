import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reportData = [
  { cat: "ครุภัณฑ์คอมพิวเตอร์", ok: 480, out: 48, fix: 14, total: 542, value: "24,390,000.00" },
  { cat: "ครุภัณฑ์สำนักงาน", ok: 288, out: 18, fix: 4, total: 310, value: "6,820,000.00" },
  { cat: "ครุภัณฑ์ไฟฟ้าและวิทยุ", ok: 198, out: 12, fix: 5, total: 215, value: "5,375,000.00" },
  { cat: "ครุภัณฑ์โฆษณาและเผยแพร่", ok: 110, out: 8, fix: 2, total: 120, value: "4,680,000.00" },
  { cat: "ครุภัณฑ์งานบ้านงานครัว", ok: 58, out: 2, fix: 1, total: 61, value: "1,353,450.00" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">รายงาน</h1>
        <p className="text-xs text-[#8b8271] mt-0.5">
          รายงานสรุปครุภัณฑ์ การยืม–คืน และมูลค่าทางบัญชี
        </p>
      </div>

      {/* 4 Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#211f1c] text-[#f0eee6] border-none shadow-sm cursor-pointer">
          <CardHeader className="pb-2">
            <div className="font-serif text-xl font-bold">▦</div>
            <CardTitle className="text-xs font-semibold text-[#f0eee6] mt-2">
              สรุปครุภัณฑ์ตามหมวด/สถานะ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-[#f0eee6]/60">กำลังดูอยู่ · ปีงบ 2569</p>
          </CardContent>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e3ddcd] hover:border-[#c2593c] cursor-pointer transition-colors">
          <CardHeader className="pb-2">
            <div className="font-serif text-xl font-bold text-[#c2593c]">⇄</div>
            <CardTitle className="text-xs font-semibold text-[#211f1c] mt-2">
              การยืม–คืนรายเดือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-[#8b8271]">แยกตามหน่วยงาน</p>
          </CardContent>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e3ddcd] hover:border-[#c2593c] cursor-pointer transition-colors">
          <CardHeader className="pb-2">
            <div className="font-serif text-xl font-bold text-[#b3401f]">⚠</div>
            <CardTitle className="text-xs font-semibold text-[#211f1c] mt-2">
              ครุภัณฑ์เกินกำหนดคืน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-[#8b8271]">7 รายการ ณ วันนี้</p>
          </CardContent>
        </Card>

        <Card className="bg-[#faf9f5] border-[#e3ddcd] hover:border-[#c2593c] cursor-pointer transition-colors">
          <CardHeader className="pb-2">
            <div className="font-serif text-xl font-bold text-[#5d7d54]">฿</div>
            <CardTitle className="text-xs font-semibold text-[#211f1c] mt-2">
              ค่าเสื่อม / มูลค่ารวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-[#8b8271]">สำหรับงานบัญชี</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Output View */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e7e2d4] gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-[#211f1c]">
              สรุปครุภัณฑ์ตามหมวด/สถานะ · ปีงบประมาณ 2569
            </CardTitle>
            <p className="text-[11px] text-[#8b8271] mt-0.5">
              สร้างเมื่อ 29 ส.ค. 2569 09:40 น. · โดย สมชาย ใจดี
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-9 px-3 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
              <option>ปีงบ: 2569</option>
              <option>ปีงบ: 2568</option>
            </select>
            <Button variant="outline" size="xs" className="h-9 border-[#d8d2c2] bg-white text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
            </Button>
            <Button size="xs" className="h-9 bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs">
              <FileText className="w-3.5 h-3.5 mr-1" /> PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
              <tr>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3 text-right">พร้อมใช้</th>
                <th className="px-4 py-3 text-right">ถูกยืม</th>
                <th className="px-4 py-3 text-right">ส่งซ่อม</th>
                <th className="px-4 py-3 text-right">รวม</th>
                <th className="px-4 py-3 text-right">มูลค่ารวม (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeadd]">
              {reportData.map((row) => (
                <tr key={row.cat} className="hover:bg-[#f5f2ea] transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-[#211f1c]">
                    {row.cat}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[#71695e]">
                    {row.ok}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[#71695e]">
                    {row.out}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[#71695e]">
                    {row.fix}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-[#211f1c]">
                    {row.total}
                  </td>
                  <td className="px-4 py-3.5 text-right font-serif">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#f0ece0] font-semibold text-[#211f1c] border-t border-[#ddd6c6]">
              <tr>
                <td className="px-4 py-3.5">รวมทั้งหมด</td>
                <td className="px-4 py-3.5 text-right">1,134</td>
                <td className="px-4 py-3.5 text-right">88</td>
                <td className="px-4 py-3.5 text-right">26</td>
                <td className="px-4 py-3.5 text-right">1,248</td>
                <td className="px-4 py-3.5 text-right font-serif">42,618,450.00</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
