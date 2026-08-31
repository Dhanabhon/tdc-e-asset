"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  MailCheck,
  AlertCircle,
  Loader2,
  KeyRound,
  Fingerprint,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithMagicLink, verifyEmailOtp } from "@/actions/auth";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authErrorParam = searchParams.get("error");

  const [authMode, setAuthMode] = useState<"magic-link" | "otp">("magic-link");
  const [email, setEmail] = useState("somchai.j@agency.go.th");
  const [otpToken, setOtpToken] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authErrorParam === "auth-failed"
      ? "การยืนยันตัวตนไม่สำเร็จหรือลิงก์หมดอายุแล้ว กรุณาส่งลิงก์ใหม่อีกครั้ง"
      : null
  );
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);

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
        const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งลิงก์เข้าสู่ระบบ";
        setErrorMessage(msg);
      }
    });
  };

  // Handle OTP Token Submission
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("กรุณาระบุอีเมลที่ถูกต้อง");
      return;
    }

    if (!otpToken || otpToken.trim().length === 0) {
      setErrorMessage("กรุณาระบุรหัส OTP 6 หลัก");
      return;
    }

    startTransition(async () => {
      try {
        const res = await verifyEmailOtp(email, otpToken);

        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          setOtpSuccessMessage("ยืนยันตัวตนสำเร็จ กำลังเข้าสู่ระบบ...");
          router.push("/dashboard");
          router.refresh();
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตรวจสอบรหัส OTP";
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9e6db] p-4 sm:p-6 md:p-10 font-sans">
      {/* 1d Split Card Container */}
      <div className="w-full max-w-5xl bg-[#faf9f5] border border-[#ddd6c6] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[620px] md:min-h-[660px]">
        {/* Left Dark Ink Panel */}
        <div className="flex-1 bg-[#211f1c] text-[#f0eee6] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Brand Header Logo matching design 1d */}
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[9px] bg-[#c2593c] text-white flex items-center justify-center font-semibold text-[17px] font-serif-lora shrink-0 shadow-md">
              e
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[18px] tracking-tight text-[#f0eee6] leading-none">
                TDC E-Asset
              </span>
              <span className="text-[11px] text-[#f0eee6]/60 font-normal mt-0.5">
                กองบริหารพัสดุ
              </span>
            </div>
          </div>

          {/* Main Tagline & Bullet Points */}
          <div className="my-8 md:my-0 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold leading-[1.3] tracking-tight text-[#f0eee6]">
                ทุกครุภัณฑ์<br />
                ตรวจสอบได้ ติดตามถึง
              </h1>
              <p className="text-sm md:text-[15px] text-[#f0eee6]/75 max-w-md leading-[1.7]">
                ระบบบริหารจัดการครุภัณฑ์ ทะเบียนทรัพย์สิน การยืม–คืน และรายงาน ครบในที่เดียว
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs md:text-[13px] text-[#f0eee6]/80 bg-white/5 px-3.5 py-2.5 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#5d7d54] shrink-0" />
                <span>ไม่ต้องจำรหัสผ่าน — เข้าสู่ระบบผ่าน Magic Link หรือ OTP</span>
              </div>
              <div className="flex items-center gap-3 text-xs md:text-[13px] text-[#f0eee6]/80 bg-white/5 px-3.5 py-2.5 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#c2593c] shrink-0" />
                <span>สิทธิ์การเข้าถึงข้อมูลตามบทบาท (RLS Database Security)</span>
              </div>
            </div>
          </div>

          {/* Left Footer */}
          <div className="text-[12px] text-[#f0eee6]/50 flex items-center justify-between">
            <span>© 2569 กองบริหารพัสดุ · เวอร์ชัน 2.4</span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-[#f0eee6]/70">
              Free Tier Ready
            </span>
          </div>
        </div>

        {/* Right Warm Ivory Form Panel */}
        <div className="w-full md:w-[460px] bg-[#faf9f5] p-8 md:p-12 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Back link & Title */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#8b8271] hover:text-[#211f1c] transition-colors mb-3 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>กลับหน้าหลัก</span>
              </Link>
              <h2 className="text-[24px] font-bold text-[#211f1c] tracking-tight">เข้าสู่ระบบ</h2>
              <p className="text-[13px] text-[#71695e] mt-1 leading-[1.6]">
                ไม่ต้องใช้รหัสผ่าน — เข้าผ่านลิงก์อีเมล (Magic Link) หรือรหัส OTP
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#eae7dc] rounded-lg text-xs font-medium border border-[#ddd6c6]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("magic-link");
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "magic-link"
                    ? "bg-white text-[#211f1c] shadow-xs font-semibold"
                    : "text-[#71695e] hover:text-[#211f1c]"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Magic Link</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "otp"
                    ? "bg-white text-[#211f1c] shadow-xs font-semibold"
                    : "text-[#71695e] hover:text-[#211f1c]"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>รหัส OTP 6 หลัก</span>
              </button>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* OTP Verification Success Notification */}
            {otpSuccessMessage && (
              <div className="bg-[#e4ead9] border border-[#a3c293] text-[#2c4c23] p-3.5 rounded-xl flex items-center gap-2 text-xs">
                <MailCheck className="w-4 h-4 text-[#42603b]" />
                <span>{otpSuccessMessage}</span>
              </div>
            )}

            {/* Flow 1: Magic Link Mode */}
            {authMode === "magic-link" && (
              <>
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
                    <div className="pt-2 pl-10 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAuthMode("otp");
                        }}
                        className="text-xs h-8 bg-white border-[#a3c293] text-[#2c4c23] hover:bg-[#f0f4eb]"
                      >
                        <KeyRound className="w-3.5 h-3.5 mr-1" /> กรอกรหัส OTP แทน
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSentSuccess(false)}
                        className="text-xs h-8 text-[#2c4c23] hover:bg-[#d8e2cb]"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> ส่งใหม่อีกครั้ง
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
                    <div>
                      <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                        อีเมลผู้ดูแลระบบ / เจ้าหน้าที่ (@agency.go.th หรือ @tdc.go.th)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="somchai.j@agency.go.th"
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
              </>
            )}

            {/* Flow 2: OTP 6-Digit Mode */}
            {authMode === "otp" && (
              <form className="space-y-4" onSubmit={handleOtpSubmit}>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                    อีเมลผู้ดูแลระบบ
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="somchai.j@agency.go.th"
                      className="pl-9 bg-white border-[#d8d2c2] text-xs h-10 rounded-lg focus-visible:ring-[#c2593c]"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                    รหัส OTP 6 หลัก
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
                    <Input
                      type="text"
                      maxLength={6}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="123456"
                      className="pl-9 bg-white border-[#d8d2c2] text-sm tracking-widest font-mono h-11 rounded-lg focus-visible:ring-[#c2593c]"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <p className="text-[11px] text-[#8b8271] mt-1">
                    รหัส 6 หลักที่ระบบส่งให้ทางอีเมลเมื่อร้องขอ
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังตรวจสอบรหัส...</span>
                    </>
                  ) : (
                    <>
                      <span>ยืนยันรหัส OTP และเข้าสู่ระบบ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#e3ddcd] w-full" />
              <span className="bg-[#faf9f5] px-3 text-[11px] text-[#8b8271] absolute font-medium">
                หรือเข้าใช้งานด่วน (Demo Mode)
              </span>
            </div>

            {/* Demo & Quick Bypass for Testing */}
            <div className="space-y-2">
              <Link href="/dashboard" className="block">
                <Button
                  variant="outline"
                  className="w-full h-10 border-[#d8d2c2] bg-white hover:bg-[#f5f2ea] text-xs font-semibold text-[#211f1c] rounded-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c2593c]" />
                  <span>เข้าชมระบบสาธิต (Demo Dashboard)</span>
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button className="w-full h-10 bg-[#211f1c] hover:bg-[#3a362f] text-[#f0eee6] text-xs font-semibold rounded-lg flex items-center justify-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 text-[#c2593c]" />
                  <span>เข้าสู่ระบบด้วย Passkey (Scan Fingerprint/FaceID)</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="pt-4 mt-4 border-t border-[#e3ddcd] text-center text-[11px] text-[#8b8271] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5d7d54]" />
            <span>ระบบความปลอดภัยตามมาตรฐานกองเทคโนโลยีสารสนเทศ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
