import Link from "next/link";
import { Upload, Check, ChevronDown, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewAssetPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#8b8271]">
            <Link href="/assets" className="hover:underline">ทะเบียนครุภัณฑ์</Link> / <span className="font-semibold text-[#211f1c]">เพิ่มครุภัณฑ์ใหม่</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c] mt-1">เพิ่มครุภัณฑ์ใหม่</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/assets">
            <Button variant="outline" className="border-[#d8d2c2] bg-[#faf9f5] hover:bg-white text-xs font-semibold">
              ยกเลิก
            </Button>
          </Link>
          <Button variant="secondary" className="bg-[#211f1c] text-[#f0eee6] hover:bg-[#3a362f] text-xs font-semibold">
            บันทึกร่าง
          </Button>
          <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold">
            <Check className="w-4 h-4 mr-1.5" /> บันทึกและขึ้นทะเบียน
          </Button>
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: 3 Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: ข้อมูลทั่วไป */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#211f1c]">1 · ข้อมูลทั่วไป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">
                    รหัสครุภัณฑ์ <span className="text-[#b3401f]">*</span>
                  </label>
                  <Input defaultValue="7440-001-0001/2569" className="bg-white border-[#d8d2c2] text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">
                    หมวดหมู่ <span className="text-[#b3401f]">*</span>
                  </label>
                  <select className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
                    <option>ครุภัณฑ์คอมพิวเตอร์</option>
                    <option>ครุภัณฑ์สำนักงาน</option>
                    <option>ครุภัณฑ์ไฟฟ้าและวิทยุ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  ชื่อรายการ <span className="text-[#b3401f]">*</span>
                </label>
                <Input defaultValue="เครื่องคอมพิวเตอร์โน้ตบุ๊ก สำหรับงานประมวลผล" className="bg-white border-[#d8d2c2] text-xs" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">ยี่ห้อ / รุ่น</label>
                  <Input defaultValue="Lenovo ThinkPad E16 Gen 2" className="bg-white border-[#d8d2c2] text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">หมายเลขเครื่อง (S/N)</label>
                  <Input defaultValue="PF-4XK2R9" className="bg-white border-[#d8d2c2] text-xs font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: การจัดหา */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#211f1c]">2 · การจัดหา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">
                    วันที่ได้มา <span className="text-[#b3401f]">*</span>
                  </label>
                  <Input type="date" defaultValue="2026-07-14" className="bg-white border-[#d8d2c2] text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">วิธีการได้มา</label>
                  <select className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
                    <option>ซื้อ (e-bidding)</option>
                    <option>ตกลงราคา</option>
                    <option>บริจาค/รับโอน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">
                    ราคาต่อหน่วย (บาท) <span className="text-[#b3401f]">*</span>
                  </label>
                  <Input defaultValue="32,900.00" className="bg-white border-[#d8d2c2] text-xs text-right font-serif" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">ปีงบประมาณ</label>
                  <select className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
                    <option>2569</option>
                    <option>2568</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">แหล่งงบประมาณ</label>
                  <select className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
                    <option>งบลงทุน</option>
                    <option>งบดำเนินงาน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">อายุการใช้งาน (ปี)</label>
                  <Input defaultValue="5" className="bg-white border-[#d8d2c2] text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: สถานที่และผู้รับผิดชอบ */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#211f1c]">3 · สถานที่และผู้รับผิดชอบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">หน่วยงาน / กอง</label>
                  <select className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
                    <option>กองยุทธศาสตร์และแผนงาน</option>
                    <option>กองเทคโนโลยีสารสนเทศ</option>
                    <option>กองประชาสัมพันธ์</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">สถานที่ตั้ง / ห้อง</label>
                  <Input defaultValue="อาคาร 2 ชั้น 4 ห้อง 402" className="bg-white border-[#d8d2c2] text-xs" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">ผู้รับผิดชอบ</label>
                  <select className="w-full h-9 px-3 py-1 bg-white border border-[#d8d2c2] rounded-md text-xs font-medium text-[#211f1c]">
                    <option>นางสาววรรณา ศรีสุข</option>
                    <option>นายสมชาย ใจดี</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">สถานะเริ่มต้น</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#211f1c] text-[#f0eee6] text-xs font-semibold">
                      ✓ พร้อมใช้งาน
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white border border-[#d8d2c2] text-[#8b8271] text-xs font-medium cursor-pointer">
                      สำรอง
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white border border-[#d8d2c2] text-[#8b8271] text-xs font-medium cursor-pointer">
                      ส่งซ่อม
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">URL รูปภาพ / หมายเหตุ</label>
                <Input placeholder="https://example.com/image.jpg หรือ รายละเอียดอุปกรณ์เพิ่มเติม..." className="bg-white border-[#d8d2c2] text-xs" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Image & Summary Cards */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Upload Card */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#211f1c]">รูปภาพครุภัณฑ์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 border-2 border-dashed border-[#c9c1ad] rounded-xl bg-repeat bg-[#f5f2ea] flex flex-col items-center justify-center gap-1.5 text-center p-4">
                <Upload className="w-6 h-6 text-[#a49b8b]" />
                <span className="text-xs font-medium text-[#8b8271]">ลากรูปมาวาง หรือระบุ URL รูปภาพ</span>
                <span className="text-[10px] text-[#a49b8b]">JPG/PNG สูงสุด 5 MB</span>
              </div>
            </CardContent>
          </Card>

          {/* Dark Summary Card */}
          <Card className="bg-[#211f1c] text-[#f0eee6] border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#f0eee6]">สรุปก่อนขึ้นทะเบียน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">รหัส</span>
                <span className="font-mono text-[11px]">7440-001-0001/2569</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">หมวด</span>
                <span>คอมพิวเตอร์</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">ราคา</span>
                <span className="font-serif">32,900.00 ฿</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">ค่าเสื่อม/ปี (20%)</span>
                <span className="font-serif">6,580.00 ฿</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/15">
                <span className="text-white/60">หมดอายุการใช้งาน</span>
                <span>ปีงบ 2574</span>
              </div>
            </CardContent>
          </Card>

          {/* Tip Card */}
          <div className="bg-[#f5f2ea] border border-[#e3ddcd] rounded-xl p-4 text-xs text-[#71695e] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#4a453d]">
              <Info className="w-4 h-4 text-[#c2593c]" />
              <span>เกร็ดแนะนำ:</span>
            </div>
            <p>
              รหัสครุภัณฑ์ใช้รูปแบบ <span className="font-mono text-[11px] text-[#211f1c]">หมวด-ประเภท-ลำดับ/ปีงบ</span> ระบบจะออกลำดับรหัสให้อัตโนมัติเมื่อเลือกหมวดหมู่
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
