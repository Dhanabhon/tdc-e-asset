import { Check, QrCode, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const loansList = [
  {
    code: "7440-001-0231/2567",
    name: "โน้ตบุ๊ก Dell Latitude 5440",
    who: "นายวิชัย พงษ์ไทย (กองยุทธศาสตร์ฯ)",
    from: "01/07/2569",
    due: "15/07/2569",
    st: "เกินกำหนด 45 วัน",
    bg: "#f7e5df",
    fg: "#b3401f",
  },
  {
    code: "6720-004-0087/2566",
    name: "กล้องดิจิทัล DSLR Canon EOS R6",
    who: "นางสาวสมหญิง สุขใจ (กองประชาสัมพันธ์)",
    from: "15/07/2569",
    due: "02/08/2569",
    st: "เกินกำหนด 27 วัน",
    bg: "#f7e5df",
    fg: "#b3401f",
  },
  {
    code: "7440-010-0054/2568",
    name: "โปรเจกเตอร์ Epson EB-2247U",
    who: "นายอนุชา แก้วมณี (กองยุทธศาสตร์ฯ)",
    from: "20/07/2569",
    due: "10/08/2569",
    st: "เกินกำหนด 19 วัน",
    bg: "#f7e5df",
    fg: "#b3401f",
  },
  {
    code: "7440-001-0298/2568",
    name: "โน้ตบุ๊ก Lenovo ThinkPad L14",
    who: "นายกิตติศักดิ์ มีสุข (กองบริหารพัสดุ)",
    from: "20/08/2569",
    due: "03/09/2569",
    st: "กำลังยืม",
    bg: "#eae7dc",
    fg: "#211f1c",
  },
  {
    code: "6730-002-0016/2565",
    name: "เครื่องฉายภาพโปรเจกเตอร์ HD",
    who: "นางสาวพิมลวรรณ แสงทอง (กองแผนงาน)",
    from: "22/08/2569",
    due: "05/09/2569",
    st: "กำลังยืม",
    bg: "#eae7dc",
    fg: "#211f1c",
  },
];

export default function BorrowReturnPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">ยืม–คืนครุภัณฑ์</h1>
        <p className="text-xs text-[#8b8271] mt-0.5">
          บันทึกการยืม walk-in และติดตามสถานะรายการที่กำลังถูกยืม
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Borrow Form */}
        <Card className="bg-[#faf9f5] border-[#e3ddcd]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#211f1c]">
              บันทึกการยืม (walk-in)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#4a453d] mb-1">
                ครุภัณฑ์ <span className="text-[#b3401f]">*</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border-1.5 border-[#c2593c] rounded-lg bg-white text-xs">
                <Search className="w-4 h-4 text-[#c2593c]" />
                <span className="text-[#211f1c] font-medium">สแกน QR หรือพิมพ์รหัส/ชื่อ…</span>
              </div>
              
              {/* Selected Asset Quick Info */}
              <div className="mt-2.5 flex items-center gap-3 p-2.5 border border-[#e3ddcd] rounded-lg bg-[#f5f2ea]">
                <div className="w-9 h-9 rounded-md bg-[#e3ddcd] flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5 text-[#71695e]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#211f1c] truncate">โปรเจกเตอร์ Epson EB-2247U</p>
                  <p className="text-[11px] font-mono text-[#8b8271]">7440-010-0054/2568 · พร้อมใช้งาน</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4a453d] mb-1">
                ผู้ยืม <span className="text-[#b3401f]">*</span>
              </label>
              <select className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
                <option>นายอนุชา แก้วมณี — กองยุทธศาสตร์ฯ</option>
                <option>นายวิชัย พงษ์ไทย — กองยุทธศาสตร์ฯ</option>
                <option>นางสาวสมหญิง สุขใจ — กองประชาสัมพันธ์</option>
              </select>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">วันที่ยืม</label>
                <Input type="date" defaultValue="2026-08-29" className="bg-white border-[#d8d2c2] text-xs h-9" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  กำหนดคืน <span className="text-[#b3401f]">*</span>
                </label>
                <Input type="date" defaultValue="2026-09-05" className="bg-white border-[#d8d2c2] text-xs h-9" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                แจ้งเตือนก่อนครบกำหนด
              </label>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-[#211f1c] text-[#f0eee6] text-xs font-semibold cursor-pointer">
                  1 วัน
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white border border-[#d8d2c2] text-[#8b8271] text-xs font-medium cursor-pointer">
                  3 วัน
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white border border-[#d8d2c2] text-[#8b8271] text-xs font-medium cursor-pointer">
                  7 วัน
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4a453d] mb-1">วัตถุประสงค์</label>
              <Input placeholder="เช่น ใช้จัดงานสัมมนายุทธศาสตร์..." className="bg-white border-[#d8d2c2] text-xs" />
            </div>

            <Button className="w-full bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold h-10 mt-2">
              <Check className="w-4 h-4 mr-1.5" /> บันทึกการยืม
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Loans List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 p-1 bg-[#eae7dc] border border-[#ddd6c6] rounded-xl w-fit">
            <button className="px-4 py-1.5 rounded-lg bg-[#faf9f5] text-xs font-semibold text-[#211f1c] shadow-sm">
              กำลังยืม (86)
            </button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-medium text-[#b3401f] hover:bg-white/50">
              เกินกำหนด (7)
            </button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-medium text-[#71695e] hover:bg-white/50">
              คืนแล้ว
            </button>
          </div>

          <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                    <tr>
                      <th className="px-4 py-3">รายการ</th>
                      <th className="px-4 py-3">ผู้ยืม</th>
                      <th className="px-4 py-3">วันที่ยืม</th>
                      <th className="px-4 py-3">กำหนดคืน</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 text-right">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efeadd]">
                    {loansList.map((loan) => (
                      <tr key={loan.code} className="hover:bg-[#f5f2ea] transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-[#211f1c]">{loan.name}</p>
                          <p className="font-mono text-[11px] text-[#a49b8b]">{loan.code}</p>
                        </td>
                        <td className="px-4 py-3.5 text-[#71695e]">
                          {loan.who}
                        </td>
                        <td className="px-4 py-3.5 text-[#71695e]">
                          {loan.from}
                        </td>
                        <td className="px-4 py-3.5 text-[#71695e]">
                          {loan.due}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            style={{ backgroundColor: loan.bg, color: loan.fg }}
                            className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold"
                          >
                            {loan.st}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Button size="xs" variant="outline" className="border-[#d8d2c2] hover:border-[#5d7d54] hover:text-[#5d7d54] text-xs">
                            รับคืน
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
      </div>
    </div>
  );
}
