import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyActivityData } from "@/actions/dashboard";

interface MonthlyActivityProps {
  activity: MonthlyActivityData[];
}

export function MonthlyActivity({ activity }: MonthlyActivityProps) {
  const totalBorrows = activity.reduce((acc, curr) => acc + curr.borrowCount, 0);
  const totalReturns = activity.reduce((acc, curr) => acc + curr.returnCount, 0);

  return (
    <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-xs md:col-span-2 flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-semibold text-[#211f1c]">
              การยืม–คืนรายเดือน
            </CardTitle>
            <p className="text-[11px] text-[#8b8271] mt-0.5">
              สรุปความเคลื่อนไหวการทำรายการ 6 เดือนล่าสุด
            </p>
          </div>
          <div className="text-xs text-[#8b8271] flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-xs bg-[#c2593c]" />
              <span>ยืม ({totalBorrows})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-xs bg-[#211f1c]" />
              <span>คืน ({totalReturns})</span>
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 pt-4 px-2 border-b border-[#e7e2d4]">
            {activity.map((m) => (
              <div
                key={m.monthYear}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-default"
                title={`${m.monthYear}: ยืม ${m.borrowCount} รายการ, คืน ${m.returnCount} รายการ`}
              >
                {/* Bar heights */}
                <div className="flex items-end gap-1.5 w-full justify-center h-full">
                  {/* Borrow Bar */}
                  <div className="flex flex-col items-center h-full justify-end w-4 sm:w-5">
                    <span className="text-[10px] text-[#c2593c] font-medium opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {m.borrowCount}
                    </span>
                    <div
                      style={{ height: m.borrowPct }}
                      className="w-full bg-[#c2593c] rounded-t-sm transition-all duration-500 hover:brightness-110"
                    />
                  </div>

                  {/* Return Bar */}
                  <div className="flex flex-col items-center h-full justify-end w-4 sm:w-5">
                    <span className="text-[10px] text-[#211f1c] font-medium opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {m.returnCount}
                    </span>
                    <div
                      style={{ height: m.returnPct }}
                      className="w-full bg-[#211f1c] rounded-t-sm transition-all duration-500 hover:brightness-110"
                    />
                  </div>
                </div>

                {/* Month label */}
                <span className="text-[11px] font-medium text-[#8b8271] group-hover:text-[#211f1c] transition-colors whitespace-nowrap">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <div className="px-6 pb-4 pt-2 text-[11px] text-[#8b8271] flex justify-between">
        <span>อัตราการคืนตามกำหนดเฉลี่ยสูง</span>
        <span className="text-[#5d7d54] font-medium">ระบบทำงานปกติ</span>
      </div>
    </Card>
  );
}
