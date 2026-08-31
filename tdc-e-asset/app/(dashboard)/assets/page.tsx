import Link from "next/link";
import { Plus, Download, Search, Filter, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const assetsList = [
  {
    code: "7440-001-0001/2569",
    name: "เครื่องคอมพิวเตอร์โน้ตบุ๊ก Lenovo ThinkPad E16 Gen 2",
    dept: "กองยุทธศาสตร์ฯ",
    owner: "นางสาววรรณา ศรีสุข",
    price: "32,900.00 ฿",
    status: "พร้อมใช้งาน",
    bg: "#e2ebd8",
    fg: "#43633a",
  },
  {
    code: "7440-001-0231/2567",
    name: "โน้ตบุ๊ก Dell Latitude 5440",
    dept: "กองยุทธศาสตร์ฯ",
    owner: "นายวิชัย พงษ์ไทย",
    price: "28,500.00 ฿",
    status: "เกินกำหนดคืน",
    bg: "#f7e5df",
    fg: "#b3401f",
  },
  {
    code: "6720-004-0087/2566",
    name: "กล้องดิจิทัล DSLR Canon EOS R6",
    dept: "กองประชาสัมพันธ์",
    owner: "นางสาวสมหญิง สุขใจ",
    price: "74,900.00 ฿",
    status: "กำลังถูกยืม",
    bg: "#eae7dc",
    fg: "#211f1c",
  },
  {
    code: "7440-010-0054/2568",
    name: "โปรเจกเตอร์ Epson EB-2247U",
    dept: "กองยุทธศาสตร์ฯ",
    owner: "นายอนุชา แก้วมณี",
    price: "39,000.00 ฿",
    status: "กำลังถูกยืม",
    bg: "#eae7dc",
    fg: "#211f1c",
  },
  {
    code: "7730-001-0029/2567",
    name: "เครื่องสำรองไฟ UPS APC Smart-UPS 1500VA",
    dept: "กองเทคโนโลยีสารสนเทศ",
    owner: "นายสมชาย ใจดี",
    price: "18,200.00 ฿",
    status: "พร้อมใช้งาน",
    bg: "#e2ebd8",
    fg: "#43633a",
  },
  {
    code: "7110-007-0342/2565",
    name: "เก้าอี้ทำงานพนักพิงสูง Ergotrend",
    dept: "กองบริหารพัสดุ",
    owner: "นายกิตติศักดิ์ มีสุข",
    price: "8,500.00 ฿",
    status: "ส่งซ่อม",
    bg: "#f7f0d8",
    fg: "#8c6d23",
  },
  {
    code: "7440-002-0114/2566",
    name: "จอมอนิเตอร์ Dell UltraSharp 27 นิ้ว 4K",
    dept: "กองยุทธศาสตร์ฯ",
    owner: "นายประสิทธิ์ วงศ์ดี",
    price: "19,500.00 ฿",
    status: "พร้อมใช้งาน",
    bg: "#e2ebd8",
    fg: "#43633a",
  },
  {
    code: "5820-002-0012/2568",
    name: "ชุดเครื่องเสียงเคลื่อนที่พร้อมไมค์ไร้สาย",
    dept: "กองประชาสัมพันธ์",
    owner: "นางสาวสมหญิง สุขใจ",
    price: "24,000.00 ฿",
    status: "พร้อมใช้งาน",
    bg: "#e2ebd8",
    fg: "#43633a",
  },
];

export default function AssetListPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">ทะเบียนครุภัณฑ์</h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            ทั้งหมด 1,248 รายการ · มูลค่ารวม 42.6 ล้านบาท
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold">
            <Download className="w-4 h-4 mr-1.5" /> นำออก Excel
          </Button>
          <Link href="/assets/new">
            <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold">
              <Plus className="w-4 h-4 mr-1.5" /> เพิ่มครุภัณฑ์
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
            <Input
              placeholder="ค้นหาด้วยรหัส ชื่อรายการ S/N หรือผู้รับผิดชอบ…"
              className="pl-9 bg-white border-[#d8d2c2] text-xs h-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="h-10 px-3 py-1 bg-[#faf9f5] border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c]">
              <option>หมวดหมู่: ทั้งหมด</option>
              <option>ครุภัณฑ์คอมพิวเตอร์</option>
              <option>ครุภัณฑ์สำนักงาน</option>
              <option>ครุภัณฑ์ไฟฟ้าและวิทยุ</option>
            </select>
            <select className="h-10 px-3 py-1 bg-[#faf9f5] border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c]">
              <option>สถานะ: ทั้งหมด</option>
              <option>พร้อมใช้งาน</option>
              <option>กำลังถูกยืม</option>
              <option>เกินกำหนดคืน</option>
              <option>ส่งซ่อม</option>
            </select>
            <select className="h-10 px-3 py-1 bg-[#faf9f5] border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c]">
              <option>ปีงบ: 2569</option>
              <option>2568</option>
              <option>2567</option>
            </select>
          </div>
        </div>

        {/* Active Filters Tag */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#211f1c] text-[#f0eee6] font-medium">
            หมวด: คอมพิวเตอร์ <X className="w-3 h-3 cursor-pointer" />
          </span>
          <span className="text-[#8b8271]">
            พบ 412 รายการ · <button className="text-[#c2593c] hover:underline font-medium">ล้างตัวกรอง</button>
          </span>
        </div>
      </div>

      {/* Main Asset Table Card */}
      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                <tr>
                  <th className="w-10 px-4 py-3 text-center">
                    <input type="checkbox" className="rounded border-[#c9c1ad]" />
                  </th>
                  <th className="px-4 py-3">รหัสครุภัณฑ์ ↕</th>
                  <th className="px-4 py-3">รายการ</th>
                  <th className="px-4 py-3">หน่วยงาน</th>
                  <th className="px-4 py-3">ผู้รับผิดชอบ</th>
                  <th className="px-4 py-3 text-right">มูลค่า (บาท)</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="w-10 px-4 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeadd]">
                {assetsList.map((asset) => (
                  <tr key={asset.code} className="hover:bg-[#f5f2ea] transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <input type="checkbox" className="rounded border-[#c9c1ad]" />
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-[#4a453d] whitespace-nowrap">
                      <Link href={`/assets/${asset.code}`} className="hover:text-[#c2593c] hover:underline">
                        {asset.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#211f1c]">
                      <Link href={`/assets/${asset.code}`} className="hover:text-[#c2593c]">
                        {asset.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[#71695e]">
                      {asset.dept}
                    </td>
                    <td className="px-4 py-3.5 text-[#71695e]">
                      {asset.owner}
                    </td>
                    <td className="px-4 py-3.5 text-right font-serif text-[13px] font-medium">
                      {asset.price}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        style={{ backgroundColor: asset.bg, color: asset.fg }}
                        className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button className="text-[#a49b8b] hover:text-[#211f1c]">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e7e2d4] text-xs">
            <span className="text-[#8b8271]">แสดง 1–8 จาก 412 รายการ</span>
            <div className="flex items-center gap-1.5 font-medium">
              <Button size="xs" variant="outline" className="h-7 w-7 border-[#d8d2c2]">←</Button>
              <Button size="xs" className="h-7 w-7 bg-[#211f1c] text-[#f0eee6]">1</Button>
              <Button size="xs" variant="outline" className="h-7 w-7 border-[#d8d2c2]">2</Button>
              <Button size="xs" variant="outline" className="h-7 w-7 border-[#d8d2c2]">3</Button>
              <span className="px-2 text-[#8b8271]">… 52</span>
              <Button size="xs" variant="outline" className="h-7 w-7 border-[#d8d2c2]">→</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
