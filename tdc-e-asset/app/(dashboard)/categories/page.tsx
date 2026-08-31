import { Plus, FolderTree, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  { id: "1", name: "ครุภัณฑ์คอมพิวเตอร์", code: "7440", count: 542, description: "เครื่องคอมพิวเตอร์, โน้ตบุ๊ก, จอมอนิเตอร์, เซิร์ฟเวอร์, อุปกรณ์ต่อพ่วง" },
  { id: "2", name: "ครุภัณฑ์สำนักงาน", code: "7110", count: 310, description: "โต๊ะทำงาน, เก้าอี้ทำงาน, ตู้เก็บเอกสาร, เครื่องทำทำลายเอกสาร" },
  { id: "3", name: "ครุภัณฑ์ไฟฟ้าและวิทยุ", code: "7730", count: 215, description: "เครื่องปรับอากาศ, เครื่องสำรองไฟ UPS, วิทยุสื่อสาร" },
  { id: "4", name: "ครุภัณฑ์โฆษณาและเผยแพร่", code: "6720", count: 120, description: "กล้องถ่ายภาพดิจิทัล, กล้องวิดีโอ, โปรเจกเตอร์, ชุดเครื่องเสียง" },
  { id: "5", name: "ครุภัณฑ์งานบ้านงานครัว", count: 61, code: "5820", description: "ตู้เย็น, ตู้กดน้ำดื่ม, ไมโครเวฟ" },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">หมวดหมู่ครุภัณฑ์</h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            จัดกลุ่มและกำหนดประเภทครุภัณฑ์ทั้งหมด 5 หมวดหลัก
          </p>
        </div>
        <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> เพิ่มหมวดหมู่ใหม่
        </Button>
      </div>

      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
              <tr>
                <th className="px-4 py-3">รหัสหมวด</th>
                <th className="px-4 py-3">ชื่อหมวดหมู่</th>
                <th className="px-4 py-3">คำอธิบาย</th>
                <th className="px-4 py-3 text-right">จำนวนรายการ</th>
                <th className="px-4 py-3 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeadd]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#f5f2ea] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-[#4a453d]">
                    {cat.code}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-[#211f1c]">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3.5 text-[#71695e]">
                    {cat.description}
                  </td>
                  <td className="px-4 py-3.5 text-right font-serif font-semibold text-[#211f1c]">
                    {cat.count} รายการ
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <Button size="xs" variant="outline" className="border-[#d8d2c2]">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="xs" variant="outline" className="border-[#d8d2c2] text-[#b3401f] hover:bg-[#f7e5df]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
