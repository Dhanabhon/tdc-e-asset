"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Search,
  AlertCircle,
  QrCode,
  Loader2,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  borrowAssetAction,
  AvailableAsset,
  LoanWithAsset,
} from "@/actions/transactions";
import { ReturnDialog } from "./ReturnDialog";
import { formatThaiDate } from "@/lib/utils";

interface BorrowReturnClientProps {
  availableAssets: AvailableAsset[];
  initialLoans: LoanWithAsset[];
  defaultAssetId?: string;
  defaultFilter?: "active" | "overdue" | "returned";
}

export function BorrowReturnClient({
  availableAssets,
  initialLoans,
  defaultAssetId,
  defaultFilter = "active",
}: BorrowReturnClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected Asset ID
  const [selectedAssetId, setSelectedAssetId] = useState<string>(() => {
    if (defaultAssetId) return defaultAssetId;
    const fromParam = searchParams.get("asset_id");
    if (fromParam) return fromParam;
    return availableAssets.length > 0 ? availableAssets[0].id : "";
  });

  // Borrower details state
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerDepartment, setBorrowerDepartment] = useState("กองยุทธศาสตร์และแผนงาน");
  
  // Date helper functions
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  const defaultDueStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  }, []);

  const [borrowDate, setBorrowDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDueStr);
  const [remindDays, setRemindDays] = useState<number>(1);
  const [notes, setNotes] = useState("");

  // Form submission state
  const [isBorrowPending, startBorrowTransition] = useTransition();
  const [borrowError, setBorrowError] = useState<string | null>(null);
  const [borrowSuccess, setBorrowSuccess] = useState<string | null>(null);

  // Loans table tabs and search
  const [activeTab, setActiveTab] = useState<"active" | "overdue" | "returned">(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam === "overdue" || filterParam === "returned" || filterParam === "active") {
      return filterParam;
    }
    return defaultFilter;
  });
  const [loansSearchTerm, setLoansSearchTerm] = useState("");

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<LoanWithAsset | null>(null);

  // Selected Asset details
  const selectedAsset = useMemo(() => {
    return availableAssets.find((a) => a.id === selectedAssetId) || null;
  }, [availableAssets, selectedAssetId]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const active = initialLoans.filter((l) => !l.returned_at).length;
    const overdue = initialLoans.filter((l) => !l.returned_at && l.is_overdue).length;
    const returned = initialLoans.filter((l) => !!l.returned_at).length;
    return { active, overdue, returned };
  }, [initialLoans]);

  // Filtered loans list based on active tab and search term
  const displayedLoans = useMemo(() => {
    let list = initialLoans;

    // Filter by tab
    if (activeTab === "active") {
      list = list.filter((l) => !l.returned_at);
    } else if (activeTab === "overdue") {
      list = list.filter((l) => !l.returned_at && l.is_overdue);
    } else if (activeTab === "returned") {
      list = list.filter((l) => !!l.returned_at);
    }

    // Filter by search query
    if (loansSearchTerm.trim()) {
      const q = loansSearchTerm.trim().toLowerCase();
      list = list.filter((l) => {
        const name = l.assets?.name?.toLowerCase() || "";
        const code = l.assets?.asset_code?.toLowerCase() || "";
        const borrower = l.borrower_name?.toLowerCase() || "";
        const dept = l.borrower_department?.toLowerCase() || "";
        const notes = l.notes?.toLowerCase() || "";
        return (
          name.includes(q) ||
          code.includes(q) ||
          borrower.includes(q) ||
          dept.includes(q) ||
          notes.includes(q)
        );
      });
    }

    return list;
  }, [initialLoans, activeTab, loansSearchTerm]);

  // Quick button handler to add days to due date
  const handleAddDays = (days: number) => {
    try {
      const base = borrowDate ? new Date(borrowDate) : new Date();
      if (!isNaN(base.getTime())) {
        base.setDate(base.getDate() + days);
        setDueDate(base.toISOString().split("T")[0]);
      }
    } catch {
      // Fallback
    }
  };

  // Handle Borrow Submission
  const handleBorrowSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBorrowError(null);
    setBorrowSuccess(null);

    if (!selectedAssetId) {
      setBorrowError("กรุณาเลือกครุภัณฑ์ที่ต้องการยืม");
      return;
    }

    if (!borrowerName.trim()) {
      setBorrowError("กรุณาระบุชื่อผู้ยืม");
      return;
    }

    if (!borrowerDepartment.trim()) {
      setBorrowError("กรุณาระบุหน่วยงานผู้ยืม");
      return;
    }

    if (!dueDate) {
      setBorrowError("กรุณาระบุกำหนดวันส่งคืน");
      return;
    }

    const formData = new FormData();
    formData.append("asset_id", selectedAssetId);
    formData.append("borrower_name", borrowerName.trim());
    formData.append("borrower_department", borrowerDepartment.trim());
    formData.append("due_date", dueDate);
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }

    startBorrowTransition(async () => {
      try {
        const res = await borrowAssetAction(formData);
        if (res.error) {
          setBorrowError(res.error);
          return;
        }

        setBorrowSuccess("บันทึกการยืมครุภัณฑ์สำเร็จ!");
        setNotes("");
        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกการยืม";
        setBorrowError(msg);
      }
    });
  };

  // Open Return Modal
  const handleOpenReturnModal = (loan: LoanWithAsset) => {
    setSelectedLoanForReturn(loan);
    setReturnDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#211f1c]">ยืม–คืนครุภัณฑ์</h1>
        <p className="text-xs text-[#8b8271] mt-0.5">
          บันทึกการยืม walk-in และติดตามสถานะรายการที่กำลังถูกยืม
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Walk-in Borrow Form (Mockup 2c) */}
        <Card className="bg-[#faf9f5] border-[#e3ddcd] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#efeadd]">
            <CardTitle className="text-sm font-semibold text-[#211f1c] flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#c2593c]" /> บันทึกการยืม (walk-in)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              {/* Alert Feedback Messages */}
              {borrowError && (
                <div className="p-3 bg-[#f7e5df] border border-[#e5b8a8] text-[#b3401f] rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{borrowError}</span>
                </div>
              )}

              {borrowSuccess && (
                <div className="p-3 bg-[#e2ebd8] border border-[#b8d6a8] text-[#43633a] rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{borrowSuccess}</span>
                </div>
              )}

              {/* Asset Selector */}
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  ครุภัณฑ์ <span className="text-[#b3401f]">*</span>
                </label>

                {availableAssets.length === 0 ? (
                  <div className="p-3 bg-[#f5f2ea] border border-[#e3ddcd] rounded-lg text-xs text-[#8b8271] text-center">
                    ไม่มีครุภัณฑ์ที่พร้อมให้ยืมในขณะนี้
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => {
                        setSelectedAssetId(e.target.value);
                        setBorrowError(null);
                      }}
                      className="w-full h-10 px-3 bg-white border border-[#d8d2c2] rounded-lg text-xs font-medium text-[#211f1c] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c2593c] focus-visible:border-[#c2593c] transition-colors cursor-pointer"
                    >
                      {availableAssets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.asset_code} — {asset.name} (คงเหลือ {asset.available_quantity} หน่วย)
                        </option>
                      ))}
                    </select>

                    {/* Selected Asset Quick Info Card */}
                    {selectedAsset && (
                      <div className="mt-2.5 flex items-center gap-3 p-2.5 border border-[#e3ddcd] rounded-lg bg-[#f5f2ea]">
                        <div className="w-9 h-9 rounded-md bg-[#e3ddcd] flex items-center justify-center shrink-0">
                          {selectedAsset.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={selectedAsset.image_url}
                              alt={selectedAsset.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <QrCode className="w-5 h-5 text-[#71695e]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#211f1c] truncate">
                            {selectedAsset.name}
                          </p>
                          <p className="text-[11px] font-mono text-[#8b8271]">
                            {selectedAsset.asset_code} · พร้อมใช้งาน ({selectedAsset.available_quantity}/{selectedAsset.quantity})
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Borrower Name */}
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  ผู้ยืม <span className="text-[#b3401f]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="เช่น นายอนุชา แก้วมณี"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  required
                  className="bg-white border-[#d8d2c2] text-xs h-9"
                />
              </div>

              {/* Borrower Department */}
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  หน่วยงาน / สังกัด <span className="text-[#b3401f]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="เช่น กองยุทธศาสตร์และแผนงาน"
                  value={borrowerDepartment}
                  onChange={(e) => setBorrowerDepartment(e.target.value)}
                  required
                  className="bg-white border-[#d8d2c2] text-xs h-9"
                />
              </div>

              {/* Dates */}
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">วันที่ยืม</label>
                  <Input
                    type="date"
                    value={borrowDate}
                    onChange={(e) => setBorrowDate(e.target.value)}
                    className="bg-white border-[#d8d2c2] text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4a453d] mb-1">
                    กำหนดคืน <span className="text-[#b3401f]">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="bg-white border-[#d8d2c2] text-xs h-9"
                  />
                </div>
              </div>

              {/* Quick Add Days */}
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                  เพิ่มระยะเวลายืมด่วน
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddDays(1)}
                    className="flex-1 py-1.5 rounded-lg bg-white border border-[#d8d2c2] hover:bg-[#eae7dc] text-[#4a453d] text-xs font-medium transition-colors"
                  >
                    +1 วัน
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDays(3)}
                    className="flex-1 py-1.5 rounded-lg bg-white border border-[#d8d2c2] hover:bg-[#eae7dc] text-[#4a453d] text-xs font-medium transition-colors"
                  >
                    +3 วัน
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDays(7)}
                    className="flex-1 py-1.5 rounded-lg bg-white border border-[#d8d2c2] hover:bg-[#eae7dc] text-[#4a453d] text-xs font-medium transition-colors"
                  >
                    +7 วัน
                  </button>
                </div>
              </div>

              {/* Reminder Chips */}
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1.5">
                  แจ้งเตือนก่อนครบกำหนด
                </label>
                <div className="flex gap-2">
                  {[1, 3, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRemindDays(days)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        remindDays === days
                          ? "bg-[#211f1c] text-[#f0eee6]"
                          : "bg-white border border-[#d8d2c2] text-[#8b8271] hover:bg-[#f5f2ea]"
                      }`}
                    >
                      {days} วัน
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes / Purpose */}
              <div>
                <label className="block text-xs font-medium text-[#4a453d] mb-1">
                  วัตถุประสงค์ / หมายเหตุ
                </label>
                <Input
                  placeholder="เช่น ใช้จัดงานสัมมนายุทธศาสตร์..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white border-[#d8d2c2] text-xs"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isBorrowPending || availableAssets.length === 0}
                className="w-full bg-[#c2593c] hover:bg-[#a3462c] text-white text-xs font-semibold h-10 mt-2 shadow-sm"
              >
                {isBorrowPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" /> บันทึกการยืม
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Active Loans Table (Mockup 2c) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Bar: Tabs & Search Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex gap-1.5 p-1 bg-[#eae7dc] border border-[#ddd6c6] rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "active"
                    ? "bg-[#faf9f5] text-[#211f1c] shadow-xs"
                    : "text-[#71695e] hover:bg-white/50"
                }`}
              >
                กำลังยืม ({tabCounts.active})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("overdue")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "overdue"
                    ? "bg-[#f7e5df] text-[#b3401f] shadow-xs"
                    : "text-[#b3401f] hover:bg-white/50"
                }`}
              >
                เกินกำหนด ({tabCounts.overdue})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("returned")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "returned"
                    ? "bg-[#e2ebd8] text-[#43633a] shadow-xs"
                    : "text-[#71695e] hover:bg-white/50"
                }`}
              >
                คืนแล้ว ({tabCounts.returned})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8271]" />
              <Input
                type="text"
                placeholder="ค้นหาชื่อผู้ยืม, รหัส หรือชื่อ..."
                value={loansSearchTerm}
                onChange={(e) => setLoansSearchTerm(e.target.value)}
                className="pl-8 pr-8 bg-white border-[#d8d2c2] text-xs h-9 rounded-lg focus-visible:ring-1 focus-visible:ring-[#c2593c]"
              />
              {loansSearchTerm && (
                <button
                  type="button"
                  onClick={() => setLoansSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8271] hover:text-[#211f1c] cursor-pointer"
                  title="ล้างข้อความค้นหา"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Loans Table Card */}
          <Card className="bg-[#faf9f5] border-[#e3ddcd] overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f5f2ea] text-[#8b8271] font-semibold border-b border-[#e7e2d4]">
                    <tr>
                      <th className="px-4 py-3">รายการ</th>
                      <th className="px-4 py-3">ผู้ยืม</th>
                      <th className="px-4 py-3">วันที่ยืม</th>
                      <th className="px-4 py-3">กำหนดคืน</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 text-right">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efeadd]">
                    {displayedLoans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-[#8b8271]">
                          <Clock className="w-7 h-7 mx-auto text-[#a49b8b] mb-2" />
                          <p className="font-semibold text-xs text-[#211f1c]">
                            ไม่พบรายการยืมในหมวดนี้
                          </p>
                          <p className="text-[11px] text-[#8b8271] mt-0.5">
                            {loansSearchTerm
                              ? "ลองค้นหาด้วยคำค้นอื่น"
                              : "ไม่มีข้อมูลรายการยืมที่ตรงกับเงื่อนไขในปัจจุบัน"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      displayedLoans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-[#f5f2ea] transition-colors">
                          {/* รายการ */}
                          <td className="px-4 py-3.5">
                            <Link
                              href={`/assets/${loan.asset_id}`}
                              className="font-semibold text-[#211f1c] hover:underline hover:text-[#c2593c] flex items-center gap-1 group"
                            >
                              <span className="truncate max-w-[180px] sm:max-w-[240px]">
                                {loan.assets?.name || "ไม่ระบุชื่อครุภัณฑ์"}
                              </span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <p className="font-mono text-[11px] text-[#8b8271]">
                              {loan.assets?.asset_code}
                              {loan.assets?.brand_model ? ` · ${loan.assets.brand_model}` : ""}
                            </p>
                          </td>

                          {/* ผู้ยืม */}
                          <td className="px-4 py-3.5 text-[#4a453d]">
                            <p className="font-medium text-[#211f1c]">{loan.borrower_name}</p>
                            {loan.borrower_department && (
                              <p className="text-[11px] text-[#8b8271]">
                                ({loan.borrower_department})
                              </p>
                            )}
                          </td>

                          {/* วันที่ยืม */}
                          <td className="px-4 py-3.5 text-[#71695e] whitespace-nowrap">
                            {formatThaiDate(loan.borrowed_at)}
                          </td>

                          {/* กำหนดคืน */}
                          <td className="px-4 py-3.5 text-[#71695e] whitespace-nowrap">
                            {formatThaiDate(loan.due_date)}
                          </td>

                          {/* สถานะ */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            {loan.returned_at ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e2ebd8] text-[#43633a]">
                                คืนแล้ว
                                {loan.condition_on_return === "damaged_minor" && " (ชำรุดเล็กน้อย)"}
                                {loan.condition_on_return === "damaged_repair" && " (ส่งซ่อม)"}
                              </span>
                            ) : loan.is_overdue ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f7e5df] text-[#b3401f]">
                                เกินกำหนด {loan.overdue_days} วัน
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#eae7dc] text-[#211f1c]">
                                กำลังยืม
                              </span>
                            )}
                          </td>

                          {/* การกระทำ */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            {!loan.returned_at ? (
                              <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                onClick={() => handleOpenReturnModal(loan)}
                                className="border-[#d8d2c2] hover:border-[#5d7d54] hover:text-[#5d7d54] text-xs font-semibold cursor-pointer"
                              >
                                รับคืน
                              </Button>
                            ) : (
                              <span className="text-[11px] text-[#8b8271] inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-[#5d7d54]" /> คืนเรียบร้อย
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Return Modal Dialog */}
      <ReturnDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        loan={selectedLoanForReturn}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
