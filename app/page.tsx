"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  MailCheck,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithMagicLink } from "@/actions/auth";
import packageInfo from "@/package.json";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const authErrorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authErrorParam === "auth-failed"
      ? "การยืนยันตัวตนไม่สำเร็จหรือลิงก์หมดอายุแล้ว กรุณาส่งลิงก์ใหม่อีกครั้ง"
      : null
  );

  const currentThaiYear = new Date().getFullYear() + 543;
  const appVersion = packageInfo.version;

  // Handle Magic Link Submission
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSentSuccess(false);

    if (!email || !email.includes("@")) {
      setErrorMessage("กรุณาระบุอีเมลที่ถูกต้อง");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", email);
        const res = await signInWithMagicLink(formData);

        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          setSentSuccess(true);
        }
      } catch (err: unknown) {
        console.error("Client login submission error:", err);
        let msg = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาตรวจสอบ Environment Variables บน Vercel หรือลองใหม่อีกครั้ง";
        if (
          err instanceof Error &&
          err.message &&
          !err.message.includes("Minified React error") &&
          !err.message.includes("react.dev/errors")
        ) {
          msg = err.message;
        }
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9e6db] p-4 sm:p-6 md:p-10 font-sans">
      {/* 1d Split Card Container */}
      <div className="w-full max-w-5xl bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[560px] md:min-h-[600px]">
        {/* Left Dark Ink Panel */}
        <div className="flex-1 bg-[#211f1c] text-[#f0eee6] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Brand Header Logo */}
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[9px] bg-[#c2593c] text-white flex items-center justify-center font-semibold text-[17px] font-serif-lora shrink-0 shadow-md">
              e
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[18px] tracking-tight text-[#f0eee6] leading-none">
                TDC E-Asset
              </span>
              <span className="text-[11px] text-[#f0eee6]/60 font-normal mt-0.5">
                กองเทคโนโลยีสารสนเทศ
              </span>
            </div>
          </div>

          {/* Main Tagline */}
          <div className="my-8 md:my-0 space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold leading-[1.3] tracking-tight text-[#f0eee6]">
              ทุกครุภัณฑ์<br />
              ตรวจสอบได้ ติดตามถึง
            </h1>
            <p className="text-sm md:text-[15px] text-[#f0eee6]/75 max-w-md leading-[1.7]">
              ระบบบริหารจัดการครุภัณฑ์ ทะเบียนทรัพย์สิน การยืม–คืน และรายงาน ครบในที่เดียว
            </p>
          </div>

          {/* Left Footer */}
          <div className="text-[12px] text-[#f0eee6]/50 flex items-center justify-between">
            <span>© {currentThaiYear} กองเทคโนโลยีสารสนเทศ · เวอร์ชัน {appVersion}</span>
          </div>
        </div>

        {/* Right Warm Ivory Form Panel */}
        <div className="w-full md:w-[460px] bg-[#faf9f5] p-8 md:p-12 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Header & Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eae7dc] border border-[#ddd6c6] text-[11px] font-medium text-[#71695e] mb-3">
                <Sparkles className="w-3 h-3 text-[#c2593c]" />
                <span>ระบบบริหารจัดการครุภัณฑ์ดิจิทัล</span>
              </div>
              <h2 className="text-[24px] font-bold text-[#211f1c] tracking-tight">เข้าสู่ระบบ</h2>
              <p className="text-[13px] text-[#71695e] mt-1 leading-[1.6]">
                ไม่ต้องใช้รหัสผ่าน — เข้าสู่ระบบผ่านลิงก์อีเมล (Magic Link)
              </p>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Magic Link Form & Success Feedback */}
            {sentSuccess ? (
              <div className="bg-[#e4ead9] border border-[#a3c293] text-[#2c4c23] p-5 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#5d7d54] text-white flex items-center justify-center shrink-0">
                    <MailCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[14px]">ลิงก์เข้าสู่ระบบถูกส่งไปยังอีเมลของคุณแล้ว</span>
                </div>
                <p className="text-xs text-[#2c4c23]/90 leading-relaxed pl-10">
                  ระบบได้ส่งลิงก์ยืนยันตัวตนไปยัง <strong>{email}</strong> เรียบร้อยแล้ว กรุณาเปิดอีเมลและคลิกลิงก์เพื่อเข้าใช้งานระบบ
                </p>
                <div className="pt-2 pl-10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSentSuccess(false)}
                    className="text-xs h-8 text-[#2c4c23] hover:bg-[#d8e2cb] cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> ส่งใหม่อีกครั้ง
                  </Button>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                    อีเมลผู้ดูแลระบบ / เจ้าหน้าที่
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@your-company.com"
                      className="pl-9 bg-white border-[#d8d2c2] text-xs h-11 rounded-lg focus-visible:ring-[#c2593c]"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งลิงก์เข้าสู่ระบบ...</span>
                    </>
                  ) : (
                    <>
                      <span>ส่งลิงก์เข้าสู่ระบบ (Magic Link)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="pt-4 mt-6 border-t border-[#e3ddcd] text-center text-[11px] text-[#8b8271] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5d7d54]" />
            <span>ระบบความปลอดภัยตามมาตรฐานสากล</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IndexPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#e9e6db]">
          <div className="flex items-center gap-2 text-sm text-[#71695e]">
            <Loader2 className="w-5 h-5 animate-spin text-[#c2593c]" />
            <span>กำลังโหลด...</span>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
