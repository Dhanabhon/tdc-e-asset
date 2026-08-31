"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Key, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] p-4">
      <Card className="w-full max-w-md bg-[#faf9f5] border-[#e3ddcd] shadow-lg">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#c2593c] text-white flex items-center justify-center shadow-md overflow-hidden">
            <Image 
              src="/images/logo.png" 
              alt="TDC e-Asset Logo" 
              width={52} 
              height={52}
              className="object-contain p-1"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-serif italic text-2xl font-bold">e</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#211f1c]">TDC E-Asset</CardTitle>
            <CardDescription className="text-xs text-[#8b8271] mt-1">
              เข้าสู่ระบบสำหรับผู้ดูแลระบบพัสดุ (Passwordless Login)
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                อีเมลผู้ดูแลระบบ (@tdc.go.th)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
                <Input
                  type="email"
                  placeholder="somchai.j@tdc.go.th"
                  className="pl-9 bg-white border-[#d8d2c2] text-xs h-10"
                  required
                />
              </div>
            </div>

            <Link href="/" className="block">
              <Button className="w-full h-10 bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold">
                ส่งลิงก์เข้าสู่ระบบ (Magic Link) <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </form>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#e3ddcd] w-full" />
            <span className="bg-[#faf9f5] px-3 text-[11px] text-[#8b8271] absolute font-medium">
              หรือเข้าใช้งานด้วย
            </span>
          </div>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full h-10 border-[#d8d2c2] bg-white text-xs font-semibold">
              <Key className="w-4 h-4 mr-2 text-[#c2593c]" /> เข้าสู่ระบบด้วย Passkey (Scan Fingerprint/FaceID)
            </Button>
          </Link>

          <div className="pt-2 text-center text-[11px] text-[#8b8271] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5d7d54]" />
            <span>ระบบความปลอดภัยระดับกองเทคโนโลยีสารสนเทศ</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
