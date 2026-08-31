import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const admins = [
  {
    name: "สมชาย ใจดี",
    init: "สจ",
    email: "somchai.j@tdc.go.th",
    method: "Magic Link / Passkey",
    last: "เมื่อสักครู่",
    st: "ใช้งานอยู่",
    color: "#5d7d54",
    bg: "#e2ebd8",
    fg: "#43633a",
  },
  {
    name: "วรรณา ศรีสุข",
    init: "วศ",
    email: "wanna.s@tdc.go.th",
    method: "Magic Link",
    last: "2 ชั่วโมงที่แล้ว",
    st: "ใช้งานอยู่",
    color: "#c2593c",
    bg: "#e2ebd8",
    fg: "#43633a",
  },
  {
    name: "วิชัย พงษ์ไทย",
    init: "วพ",
    email: "wichai.p@tdc.go.th",
    method: "Email OTP",
    last: "เมื่อวานนี้ 16:20 น.",
    st: "ใช้งานอยู่",
    color: "#211f1c",
    bg: "#e2ebd8",
    fg: "#43633a",
  },
  {
    name: "สมหญิง สุขใจ",
    init: "สส",
    email: "somying.s@tdc.go.th",
    method: "Magic Link",
    last: "รอตอบรับคำเชิญ",
    st: "รออนุมัติ",
    color: "#8b8271",
    bg: "#f7f0d8",
    fg: "#8c6d23",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">ผู้ดูแลระบบ</h1>
          <p className="text-xs text-[#8b8271] mt-0.5">
            ระบบมีบทบาทเดียว (Admin) — ทุกคนเข้าถึงได้เท่ากัน · 4 บัญชี
          </p>
        </div>
        <Button className="bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> เชิญผู้ดูแลทางอีเมล
        </Button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 bg-[#f5f2ea] border border-[#e3ddcd] rounded-xl px-4 py-3 text-xs text-[#71695e]">
        <Info className="w-4 h-4 text-[#c2593c] shrink-0" />
        <span>
          ผู้ถูกเชิญจะได้รับลิงก์ทางอีเมล (Passwordless Auth) และตั้งค่า Passkey ในการเข้าครั้งแรก — ไม่มีการใช้รหัสผ่านในระบบ
        </span>
      </div>

      <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
              <tr>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3">วิธีเข้าสู่ระบบ</th>
                <th className="px-4 py-3">เข้าใช้ล่าสุด</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeadd]">
              {admins.map((u) => (
                <tr key={u.email} className="hover:bg-[#f5f2ea] transition-colors">
                  <td className="px-4 py-3.5 flex items-center gap-3 font-semibold text-[#211f1c]">
                    <div 
                      style={{ backgroundColor: u.color }}
                      className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold shrink-0"
                    >
                      {u.init}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#71695e]">
                    {u.email}
                  </td>
                  <td className="px-4 py-3.5 text-[#71695e]">
                    {u.method}
                  </td>
                  <td className="px-4 py-3.5 text-[#71695e]">
                    {u.last}
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span
                      style={{ backgroundColor: u.bg, color: u.fg }}
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold"
                    >
                      {u.st}
                    </span>
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
