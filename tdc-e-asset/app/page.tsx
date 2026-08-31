import Link from "next/link";
import { 
  Package, 
  ArrowLeftRight, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  Lock, 
  UserCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // If supabase credentials are not set or during static prerender
    user = null;
  }

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#211f1c] flex flex-col font-sans selection:bg-[#c2593c]/20 selection:text-[#c2593c]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e3ddcd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#c2593c] text-white flex items-center justify-center font-semibold text-lg font-serif-lora shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              e
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-[#211f1c] leading-none">
                TDC E-Asset
              </span>
              <span className="text-[11px] text-[#8b8271] font-medium mt-0.5">
                กองบริหารพัสดุและครุภัณฑ์
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#71695e]">
            <a href="#features" className="hover:text-[#211f1c] transition-colors">
              คุณสมบัติระบบ
            </a>
            <a href="#assets" className="hover:text-[#211f1c] transition-colors">
              ทะเบียนครุภัณฑ์
            </a>
            <a href="#borrow-return" className="hover:text-[#211f1c] transition-colors">
              ระบบยืม–คืน
            </a>
            <a href="#reports" className="hover:text-[#211f1c] transition-colors">
              รายงานสรุป
            </a>
            <a href="#security" className="hover:text-[#211f1c] transition-colors">
              ความปลอดภัย
            </a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="h-9 px-4 bg-[#211f1c] hover:bg-[#3a362f] text-white text-xs font-medium rounded-lg shadow-sm gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-[#5d7d54]" />
                  <span>ไปยังแดชบอร์ด</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="h-9 px-4 bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold rounded-lg shadow-sm gap-2">
                  <span>เข้าสู่ระบบ (สำหรับเจ้าหน้าที่)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-radial from-[#e8decb]/50 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eae7dc] border border-[#ddd6c6] text-xs text-[#52493d] font-medium shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-[#c2593c]" />
            <span>ระบบบริหารจัดการครุภัณฑ์ดิจิทัล · เวอร์ชัน 2.4 (ปีงบประมาณ 2569)</span>
          </div>

          {/* Headline & Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#211f1c] leading-[1.2]">
              ทุกครุภัณฑ์ <span className="text-[#c2593c] underline decoration-[#c2593c]/30 underline-offset-8">ตรวจสอบได้</span><br className="hidden sm:inline" />
              ติดตามถึง แม่นยำทุกขั้นตอน
            </h1>
            <p className="text-base sm:text-lg text-[#71695e] max-w-2xl mx-auto leading-relaxed pt-2">
              TDC E-Asset แพลตฟอร์มบริหารจัดการสินทรัพย์ไอทีและครุภัณฑ์ภายในหน่วยงาน 
              บันทึกทะเบียนพัสดุ ติดตามการยืม–คืนออนไลน์ และรายงานสรุปข้อมูลแบบเรียลไทม์
            </p>
          </div>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {isLoggedIn ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-8 bg-[#c2593c] hover:bg-[#a3462c] text-white text-sm font-semibold rounded-xl shadow-md gap-2.5">
                  <span>เข้าสู่หน้าแดชบอร์ดบริหาร</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-8 bg-[#c2593c] hover:bg-[#a3462c] text-white text-sm font-semibold rounded-xl shadow-md gap-2.5">
                  <span>เข้าสู่ระบบ (สำหรับเจ้าหน้าที่)</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <a href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-6 border-[#d8d2c2] bg-white hover:bg-[#f5f2ea] text-xs font-semibold text-[#4a453d] rounded-xl">
                <span>ดูรายละเอียดและฟังก์ชัน</span>
              </Button>
            </a>
          </div>

          {/* Highlight Metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-[#f5f2ea] border border-[#e3ddcd] p-4 rounded-xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#211f1c] font-mono">100%</p>
              <p className="text-xs text-[#8b8271] mt-1 font-medium">ระบบยืม-คืน ไร้กระดาษ</p>
            </div>
            <div className="bg-[#f5f2ea] border border-[#e3ddcd] p-4 rounded-xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#c2593c] font-mono">Race-Safe</p>
              <p className="text-xs text-[#8b8271] mt-1 font-medium">ล็อกสต็อกป้องกันติดลบ</p>
            </div>
            <div className="bg-[#f5f2ea] border border-[#e3ddcd] p-4 rounded-xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#5d7d54] font-mono">Passwordless</p>
              <p className="text-xs text-[#8b8271] mt-1 font-medium">เข้าใช้งานด้วย Magic Link</p>
            </div>
            <div className="bg-[#f5f2ea] border border-[#e3ddcd] p-4 rounded-xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#211f1c] font-mono">RLS Guard</p>
              <p className="text-xs text-[#8b8271] mt-1 font-medium">ความปลอดภัยระดับตาราง</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section (6a/6c Mockup Alignment) */}
      <section id="features" className="py-16 bg-[#eae7dc]/60 border-y border-[#e3ddcd]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c2593c]">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#211f1c] tracking-tight">
              3 ระบบหลักเพื่อการบริหารจัดการครุภัณฑ์ครบวงจร
            </h2>
            <p className="text-xs sm:text-sm text-[#71695e]">
              ออกแบบมาเพื่อตอบสนองการปฏิบัติงานของเจ้าหน้าที่พัสดุและผู้บริหารหน่วยงานโดยเฉพาะ
            </p>
          </div>

          {/* 3 Main Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: ทะเบียนครุภัณฑ์ */}
            <div id="assets" className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#c2593c]/10 text-[#c2593c] flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#211f1c]">ทะเบียนครุภัณฑ์</h3>
                  <p className="text-xs text-[#8b8271] font-medium mt-0.5">Asset Registry & Inventory</p>
                </div>
                <p className="text-xs text-[#71695e] leading-relaxed">
                  บันทึกข้อมูลครุภัณฑ์อย่างละเอียด ทั้งรหัสสินทรัพย์ หมายเลขเครื่อง (S/N) 
                  หมวดหมู่ ยี่ห้อ/รุ่น สถานที่จัดเก็บ และภาพถ่ายอุปกรณ์ พร้อมระบบค้นหาอัจฉริยะ
                </p>
                <ul className="space-y-2 pt-2 border-t border-[#e3ddcd] text-xs text-[#4a453d]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>แยกหมวดหมู่และรหัสครุภัณฑ์เป็นสัดส่วน</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>ติดตามสถานะ: พร้อมใช้งาน, ถูกยืม, ซ่อมบำรุง</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>ค้นหาและกรองรายการสะดวกรวดเร็ว</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: ยืม–คืนออนไลน์ */}
            <div id="borrow-return" className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ring-2 ring-[#c2593c]/30">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#5d7d54]/10 text-[#5d7d54] flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 mb-1 text-[10px] font-bold bg-[#c2593c] text-white rounded">
                    ไฮไลท์สำคัญ
                  </div>
                  <h3 className="text-lg font-bold text-[#211f1c]">ยืม–คืนออนไลน์</h3>
                  <p className="text-xs text-[#8b8271] font-medium mt-0.5">Online Borrow & Return Management</p>
                </div>
                <p className="text-xs text-[#71695e] leading-relaxed">
                  ทำรายการยืมและคืนครุภัณฑ์ผ่านระบบออนไลน์ ป้องกันความขัดแย้งของข้อมูลด้วยระบบ 
                  Row-Level Locking ในฐานข้อมูล ป้องกันสต็อกติดลบอย่างสมบูรณ์แบบ
                </p>
                <ul className="space-y-2 pt-2 border-t border-[#e3ddcd] text-xs text-[#4a453d]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>Race-safe atomic transactions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>บันทึกชื่อผู้ยืม สังกัดหน่วยงาน และวันกำหนดคืน</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>บันทึกสภาพอุปกรณ์เมื่อรับคืน (สมบูรณ์, ชำรุด)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: รายงานครบถ้วน */}
            <div id="reports" className="bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#211f1c]/10 text-[#211f1c] flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#211f1c]">รายงานครบถ้วน</h3>
                  <p className="text-xs text-[#8b8271] font-medium mt-0.5">Comprehensive Reports & Analytics</p>
                </div>
                <p className="text-xs text-[#71695e] leading-relaxed">
                  สรุปผลการดำเนินงานผ่าน KPI Dashboards แสดงจำนวนสินทรัพย์ทั้งหมด อัตราการยืมคืน 
                  และรายการค้างคืน เพื่อความโปร่งใสและพร้อมรับการตรวจสอบประจำปี
                </p>
                <ul className="space-y-2 pt-2 border-t border-[#e3ddcd] text-xs text-[#4a453d]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>สรุปสถานะพัสดุ 4 มิติแบบเรียลไทม์</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>ประวัติบันทึกธุรกรรมย้อนหลัง 10 รายการล่าสุด</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5d7d54] shrink-0" />
                    <span>รองรับการตรวจนับครุภัณฑ์ประจำปีงบประมาณ</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Reliability Section */}
      <section id="security" className="py-16 bg-[#faf9f5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#211f1c] text-[#f0eee6] rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-[#f0eee6] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#5d7d54]" />
                <span>Enterprise Security Standard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0eee6]">
                ความปลอดภัยและความน่าเชื่อถือระดับกองเทคโนโลยีสารสนเทศ
              </h2>
              <p className="text-xs sm:text-sm text-[#f0eee6]/75 leading-relaxed">
                ระบบถูกออกแบบด้วยสถาปัตยกรรมไร้รหัสผ่าน (Passwordless Authentication) 
                ทำงานร่วมกับนโยบาย Row Level Security (RLS) บนฐานข้อมูล PostgreSQL เพื่อปกป้องข้อมูลพัสดุของหน่วยงานอย่างปลอดภัยสูงสุด
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-[#f0eee6]/90">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#c2593c]" />
                  <span>Magic Link & OTP Login</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#c2593c]" />
                  <span>Row Level Security (RLS)</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto text-center">
              <Link href="/login" className="block w-full md:w-auto">
                <Button className="w-full md:w-auto h-12 px-8 bg-[#c2593c] hover:bg-[#a3462c] text-white text-sm font-semibold rounded-xl shadow-lg gap-2">
                  <span>เข้าสู่ระบบทันที</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#eae7dc] border-t border-[#ddd6c6] py-10 text-xs text-[#71695e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#c2593c] text-white flex items-center justify-center font-semibold text-sm font-serif-lora shrink-0">
              e
            </div>
            <div>
              <p className="font-semibold text-[#211f1c]">TDC E-Asset · ระบบบริหารจัดการครุภัณฑ์</p>
              <p className="text-[11px] text-[#8b8271]">กองบริหารพัสดุและสินทรัพย์ กรมส่งเสริมและพัฒนา</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#71695e]">
            <a href="#features" className="hover:text-[#211f1c] transition-colors">
              คุณสมบัติ
            </a>
            <a href="#assets" className="hover:text-[#211f1c] transition-colors">
              ทะเบียนครุภัณฑ์
            </a>
            <a href="#borrow-return" className="hover:text-[#211f1c] transition-colors">
              ยืม–คืน
            </a>
            <Link href="/login" className="hover:text-[#c2593c] font-medium transition-colors">
              เข้าสู่ระบบ (เจ้าหน้าที่)
            </Link>
          </div>

          <p className="text-[11px] text-[#8b8271]">
            © 2569 TDC E-Asset. สงวนลิขสิทธิ์ตามกฎหมาย
          </p>
        </div>
      </footer>
    </div>
  );
}
