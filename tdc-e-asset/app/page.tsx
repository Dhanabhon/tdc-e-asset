"use client";

import { useState } from "react";
import Link from "next/link";
import { Fingerprint, MailCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithMagicLink } from "@/actions/auth";

export default function IndexLoginPage() {
  const [email, setEmail] = useState("somchai.j@agency.go.th");
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSentSuccess(false);

    try {
      const formData = new FormData();
      formData.append("email", email);
      const res = await signInWithMagicLink(formData);

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSentSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการส่งลิงก์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9e6db] p-4 sm:p-6 md:p-10 font-sans">
      {/* 1d Split Card Container */}
      <div className="w-full max-w-5xl bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] md:min-h-[640px]">
        {/* Left Dark Panel */}
        <div className="flex-1 bg-[#211f1c] text-[#f0eee6] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Brand Header Logo matching design 1d */}
          <div className="flex items-center gap-[10px]">
            <div className="w-[34px] h-[34px] rounded-[8px] bg-[#c2593c] text-white flex items-center justify-center font-semibold text-[16px] font-serif-lora shrink-0">
              e
            </div>
            <span className="font-semibold text-[17px] tracking-tight text-[#f0eee6]">TDC E-Asset</span>
          </div>

          {/* Main Tagline */}
          <div className="my-10 md:my-0 space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold leading-[1.35] tracking-tight text-[#f0eee6]">
              ทุกครุภัณฑ์<br />
              ตรวจสอบได้ ติดตามถึง
            </h1>
            <p className="text-sm md:text-[15.5px] text-[#f0eee6]/72 max-w-md leading-[1.7]">
              ระบบบริหารจัดการครุภัณฑ์ ทะเบียนทรัพย์สิน การยืม–คืน และรายงาน ครบในที่เดียว
            </p>
          </div>

          {/* Left Footer */}
          <div className="text-[12.5px] text-[#f0eee6]/50">
            © 2569 กองบริหารพัสดุ · เวอร์ชัน 2.4
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-[440px] bg-[#faf9f5] p-8 md:p-12 flex flex-col justify-center shrink-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-[23px] font-semibold text-[#211f1c]">เข้าสู่ระบบ</h2>
              <p className="text-[13.5px] text-[#71695e] mt-1.5 leading-[1.6]">
                ไม่ต้องใช้รหัสผ่าน — เข้าผ่านลิงก์อีเมล บัญชีองค์กร หรือ Passkey
              </p>
            </div>

            {sentSuccess ? (
              <div className="bg-[#e4ead9] border border-[#a3c293] text-[#2c4c23] p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <MailCheck className="w-5 h-5 text-[#42603b]" />
                  <span>ส่ง Magic Link เรียบร้อยแล้ว!</span>
                </div>
                <p className="text-xs leading-relaxed">
                  ระบบได้ส่งลิงก์เข้าสู่ระบบไปยัง <strong>{email}</strong> เรียบร้อยแล้ว กรุณาเปิดอีเมลและคลิกลิงก์เพื่อยืนยันเข้าสู่ระบบ
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSentSuccess(false)} 
                  className="mt-2 text-xs h-8 border-[#a3c293] bg-white text-[#2c4c23]"
                >
                  ลองส่งอีกครั้ง
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3 rounded-lg flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-[#4a453d] mb-1.5">
                    อีเมลหน่วยงาน
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="somchai.j@agency.go.th"
                    className="bg-white border-[#d8d2c2] text-sm h-11 rounded-lg focus-visible:ring-[#c2593c]"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 bg-[#c2593c] hover:bg-[#a3462c] text-white text-[14.5px] font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังส่งลิงก์...
                    </>
                  ) : (
                    "ส่งลิงก์เข้าสู่ระบบ →"
                  )}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#e0dacb]" />
              <span className="text-xs text-[#a49b8b]">หรือ</span>
              <div className="flex-1 h-px bg-[#e0dacb]" />
            </div>

            {/* Social & Passkey Buttons */}
            <div className="space-y-2.5">
              <Link href="/dashboard" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-[#d8d2c2] bg-white hover:bg-[#f5f2ea] text-[13.5px] font-medium text-[#211f1c] rounded-lg gap-2.5"
                >
                  <span className="w-[17px] h-[17px] rounded-full bg-conic-[from_0deg,#4285F4_0_25%,#34A853_0_50%,#FBBC05_0_75%,#EA4335_0] inline-block shrink-0" />
                  ดำเนินการต่อด้วย Google (Demo)
                </Button>
              </Link>

              <Link href="/dashboard" className="block">
                <Button className="w-full h-11 bg-[#211f1c] hover:bg-[#3a362f] text-[#f0eee6] text-[13.5px] font-medium rounded-lg gap-2">
                  <Fingerprint className="w-4 h-4 text-[#c2593c]" />
                  เข้าด้วย Passkey (Demo)
                </Button>
              </Link>
            </div>

            <p className="text-[11.5px] text-center text-[#a49b8b] pt-2 leading-[1.6]">
              การเข้าใช้งานถือว่ายอมรับ{" "}
              <a href="#" className="underline hover:text-[#c2593c]">
                นโยบายการใช้ระบบ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
