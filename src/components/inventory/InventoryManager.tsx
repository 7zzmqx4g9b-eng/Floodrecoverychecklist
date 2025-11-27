import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  FileSpreadsheet,
  PieChart,
  Settings,
  Plus,
  Printer,
  Calculator,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";
import * as XLSX from "xlsx";

// --- Types ---

export type DamageLevel =
  | "minor"
  | "moderate"
  | "severe"
  | "total";
export type UsabilityStatus = "normal" | "partial" | "unusable";
export type RepairStatus =
  | "pending"
  | "repairable"
  | "irreparable"
  | "repaired";

export type InventoryItem = {
  id: string;
  // 1. Asset Info
  categoryId: string;
  subCategory?: string;
  name: string;
  description?: string; // Brand/Model/Spec
  quantity: number;
  unit: string; // pcs, set, etc.

  // 2. Damage Info
  damageType: string; // Flood, Impact, etc.
  damageLevel: DamageLevel;
  damageDetail: string;
  incidentDate?: string;
  photoRef?: string; // Link or File ID

  // 3. Status
  usability: UsabilityStatus;
  repairStatus: RepairStatus;
  repairCostEstimate?: number;

  // 4. Financial & Valuation
  originalPrice?: number;
  purchaseDate?: string;
  ageYears?: number; // Calculated or manual
  expectedLifespan?: number;

  currentValuePerUnit: number; // Replacement cost / Market value
  damagePercent: number; // 0-100
  totalDamageValue: number; // Calculated: (CurrentVal * Damage% * Qty)

  note?: string;
};

export type InventoryCategory = {
  id: string;
  name: string;
  subCategories: string[];
};

// --- Constants & Defaults ---

const DEFAULT_CATEGORIES: InventoryCategory[] = [
  {
    id: "electrical",
    name: "เครื่องใช้ไฟฟ้า",
    subCategories: [
      "ทีวี",
      "ตู้เย็น",
      "เครื่องซักผ้า",
      "พัดลม",
      "แอร์",
      "คอมพิวเตอร์",
      "หม้อหุงข้าว",
    ],
  },
  {
    id: "furniture",
    name: "เฟอร์นิเจอร์",
    subCategories: [
      "เตียง",
      "ตู้เสื้อผ้า",
      "โต๊ะ",
      "เก้าอี้",
      "โซฟา",
      "ชั้นวางของ",
      "ที่นอน",
    ],
  },
  {
    id: "livelihood",
    name: "เครื่องมือทำมาหากิน",
    subCategories: [
      "เครื่องตัดหญ้า",
      "สว่าน",
      "อุปกรณ์ขายของ",
      "รถเข็น",
      "เครื่องมือช่าง",
      "ยานพาหนะ",
    ],
  },
  {
    id: "structure",
    name: "วัสดุก่อสร้าง/บ้าน",
    subCategories: [
      "ประตู",
      "หน้าต่าง",
      "พื้น",
      "ผนัง",
      "รั้ว",
      "ระบบไฟฟ้า",
      "สุขภัณฑ์",
    ],
  },
];

const DAMAGE_LEVELS: Record<
  DamageLevel,
  { label: string; color: string; defaultPercent: number }
> = {
  minor: {
    label: "เล็กน้อย",
    color: "bg-green-100 text-green-800",
    defaultPercent: 20,
  },
  moderate: {
    label: "ปานกลาง",
    color: "bg-yellow-100 text-yellow-800",
    defaultPercent: 50,
  },
  severe: {
    label: "รุนแรง",
    color: "bg-orange-100 text-orange-800",
    defaultPercent: 80,
  },
  total: {
    label: "ใช้งานไม่ได้/สูญหาย",
    color: "bg-red-100 text-red-800",
    defaultPercent: 100,
  },
};

// --- Helper Functions ---

const formatCurrency = (val?: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(val || 0);
};

// --- Components ---

export const InventoryManager = ({
  onClose,
}: {
  onClose?: () => void;
}) => {
  // State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<
    InventoryCategory[]
  >(DEFAULT_CATEGORIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] =
    useState<string>("all");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  const [activeTab, setActiveTab] = useState("list");

  // Load Data
  useEffect(() => {
    const savedItems = localStorage.getItem(
      "flood-inventory-items-v2",
    );
    const savedCategories = localStorage.getItem(
      "flood-inventory-categories-v2",
    );

    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Try migrating v1 data if exists
      const v1Items = localStorage.getItem(
        "flood-inventory-items",
      );
      if (v1Items) {
        try {
          const oldItems = JSON.parse(v1Items);
          const migrated = oldItems.map((i: any) => ({
            ...i,
            unit: "เครื่อง",
            damageType: "น้ำท่วม",
            damageLevel:
              i.status === "irreparable" ? "total" : "moderate",
            usability:
              i.status === "irreparable"
                ? "unusable"
                : "partial",
            repairStatus: i.status || "pending",
            currentValuePerUnit: i.pricePerUnit || 0,
            damagePercent:
              i.status === "irreparable" ? 100 : 50,
            totalDamageValue: i.totalValue || 0,
          }));
          setItems(migrated);
        } catch (e) {}
      }
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem(
      "flood-inventory-items-v2",
      JSON.stringify(items),
    );
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      "flood-inventory-categories-v2",
      JSON.stringify(categories),
    );
  }, [categories]);

  // Handlers
  const handleSaveItem = (item: InventoryItem) => {
    if (editingItem) {
      setItems(items.map((i) => (i.id === item.id ? item : i)));
    } else {
      setItems([...items, item]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const handleExportExcel = () => {
    const dataToExport = items.map((item) => ({
      ID: item.id,
      หมวดหมู่:
        categories.find((c) => c.id === item.categoryId)
          ?.name || item.categoryId,
      หมวดย่อย: item.subCategory || "-",
      ชื่อทรัพย์สิน: item.name,
      "รายละเอียด/รุ่น": item.description || "-",
      จำนวน: item.quantity,
      หน่วย: item.unit,
      "ราคาซื้อเดิม/หน่วย": item.originalPrice || 0,
      ปีที่ซื้อ: item.purchaseDate
        ? new Date(item.purchaseDate).getFullYear()
        : "-",
      "อายุการใช้งาน (ปี)": item.ageYears || "-",
      "มูลค่าปัจจุบัน/หน่วย": item.currentValuePerUnit,
      ระดับความเสียหาย:
        DAMAGE_LEVELS[item.damageLevel]?.label ||
        item.damageLevel,
      "% ความเสียหาย": item.damagePercent + "%",
      มูลค่าความเสียหายรวม: item.totalDamageValue,
      ลักษณะความเสียหาย: item.damageDetail,
      ประเภทความเสียหาย: item.damageType,
      สถานะซ่อม:
        item.repairStatus === "repairable"
          ? "ซ่อมได้"
          : item.repairStatus === "irreparable"
            ? "ซ่อมไม่ได้"
            : item.repairStatus === "repaired"
              ? "ซ่อมแล้ว"
              : "รอประเมิน",
      ค่าซ่อมประเมิน: item.repairCostEstimate || 0,
      หมายเหตุ: item.note || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "บัญชีทรัพย์สินเสียหาย",
    );
    XLSX.writeFile(
      wb,
      `Damage_Inventory_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Calculations
  const totalDamageValue = items.reduce(
    (acc, item) => acc + item.totalDamageValue,
    0,
  );
  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  // Filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      item.categoryId === filterCategory;
    const matchesStatus =
      filterStatus === "all" ||
      item.repairStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categorySummary = useMemo(() => {
    return categories
      .map((cat) => {
        const catItems = items.filter(
          (i) => i.categoryId === cat.id,
        );
        return {
          ...cat,
          itemCount: catItems.length,
          totalQty: catItems.reduce(
            (sum, i) => sum + i.quantity,
            0,
          ),
          totalDamage: catItems.reduce(
            (sum, i) => sum + i.totalDamageValue,
            0,
          ),
        };
      })
      .filter((c) => c.itemCount > 0);
  }, [categories, items]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col pb-20 print:bg-white print:pb-0">
      {/* Print Report (Hidden on Screen) */}
      <div className="hidden print:block p-8 bg-white text-black">
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">
            แบบฟอร์มบัญชีรายการทรัพย์สินเสียหาย
          </h1>
          <p className="text-slate-600">
            Damage Assessment & Inventory Report
          </p>
          <div className="mt-4 flex justify-between text-sm">
            <span>
              วันที่พิมพ์:{" "}
              {new Date().toLocaleDateString("th-TH")}
            </span>
            <span>ผู้รายงาน: __________________________</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg mb-2 border-l-4 border-slate-800 pl-2">
            สรุปมูลค่าความเสียหาย
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2 text-left">
                  หมวดหมู่
                </th>
                <th className="border border-slate-300 p-2 text-right">
                  รายการ
                </th>
                <th className="border border-slate-300 p-2 text-right">
                  มูลค่าความเสียหาย (บาท)
                </th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map((cat) => (
                <tr key={cat.id}>
                  <td className="border border-slate-300 p-2">
                    {cat.name}
                  </td>
                  <td className="border border-slate-300 p-2 text-right">
                    {cat.itemCount}
                  </td>
                  <td className="border border-slate-300 p-2 text-right">
                    {formatCurrency(cat.totalDamage)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-50">
                <td className="border border-slate-300 p-2">
                  รวมทั้งสิ้น
                </td>
                <td className="border border-slate-300 p-2 text-right">
                  {items.length}
                </td>
                <td className="border border-slate-300 p-2 text-right">
                  {formatCurrency(totalDamageValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2 border-l-4 border-slate-800 pl-2">
            รายการละเอียด
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-1 w-[20%]">
                  ทรัพย์สิน/รายละเอียด
                </th>
                <th className="border border-slate-300 p-1 w-[5%]">
                  จน.
                </th>
                <th className="border border-slate-300 p-1 w-[10%]">
                  ราคาเดิม
                </th>
                <th className="border border-slate-300 p-1 w-[10%]">
                  มูลค่าปัจจุบัน
                </th>
                <th className="border border-slate-300 p-1 w-[15%]">
                  ความเสียหาย
                </th>
                <th className="border border-slate-300 p-1 w-[10%]">
                  มูลค่าเสียหาย
                </th>
                <th className="border border-slate-300 p-1 w-[10%]">
                  สถานะซ่อม
                </th>
                <th className="border border-slate-300 p-1 w-[20%]">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="border border-slate-300 p-1">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-slate-500">
                      {item.description}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      ({item.categoryId})
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="border border-slate-300 p-1 text-right">
                    {formatCurrency(item.originalPrice)}
                  </td>
                  <td className="border border-slate-300 p-1 text-right">
                    {formatCurrency(item.currentValuePerUnit)}
                  </td>
                  <td className="border border-slate-300 p-1">
                    <div>
                      {DAMAGE_LEVELS[item.damageLevel]?.label} (
                      {item.damagePercent}%)
                    </div>
                    <div className="text-slate-500">
                      {item.damageDetail}
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-bold">
                    {formatCurrency(item.totalDamageValue)}
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    {item.repairStatus === "repairable"
                      ? "ซ่อมได้"
                      : item.repairStatus === "irreparable"
                        ? "ซ่อมไม่ได้"
                        : item.repairStatus === "repaired"
                          ? "ซ่อมแล้ว"
                          : "รอประเมิน"}
                    {item.repairCostEstimate ? (
                      <div className="text-[9px]">
                        ค่าซ่อม{" "}
                        {formatCurrency(
                          item.repairCostEstimate,
                        )}
                      </div>
                    ) : null}
                  </td>
                  <td className="border border-slate-300 p-1">
                    {item.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border-t pt-4 flex justify-between text-xs text-slate-500">
          <div>
            ลงชื่อเจ้าของทรัพย์สิน
            .......................................................
          </div>
          <div>
            ลงชื่อพยาน/ผู้ตรวจสอบ
            .......................................................
          </div>
        </div>
      </div>

      {/* Screen View */}
      <div className="bg-white border-b sticky top-0 z-20 print:hidden">
        <div className="p-4 flex items-center gap-3 max-w-5xl mx-auto">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="-ml-2"
            >
              <X className="w-6 h-6" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="font-bold text-lg text-slate-900">
              ระบบบัญชีทรัพย์สินเสียหาย
            </h1>
            <p className="text-xs text-slate-500">
              Damage Asset Inventory System
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.print()}
              title="Print / Save PDF"
            >
              <Printer className="w-5 h-5 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportExcel}
              title="Export Excel"
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </Button>
          </div>
        </div>

        <div className="px-4 max-w-5xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="list">
                รายการ ({items.length})
              </TabsTrigger>
              <TabsTrigger value="summary">
                สรุปและรายงาน
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-6 print:hidden">
        {activeTab === "summary" ? (
          <div className="space-y-6 animate-in fade-in">
            <Card className="bg-slate-800 text-white border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-slate-300 text-sm">
                      มูลค่าความเสียหายสุทธิ
                    </div>
                    <div className="text-4xl font-bold text-white mt-1">
                      {formatCurrency(totalDamageValue)}
                    </div>
                  </div>
                  <div className="bg-red-500/20 p-3 rounded-full">
                    <AlertTriangle className="text-red-500 w-6 h-6" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <div className="text-xs text-slate-400">
                      จำนวนรายการ
                    </div>
                    <div className="font-semibold">
                      {items.length} รายการ
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">
                      จำนวนชิ้น
                    </div>
                    <div className="font-semibold">
                      {totalItems} ชิ้น
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {categorySummary.map((cat) => (
                <Card
                  key={cat.id}
                  className="overflow-hidden border-l-4 border-l-emerald-500"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 text-lg">
                          {cat.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {cat.itemCount} รายการ
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {formatCurrency(cat.totalDamage)}
                        </div>
                        <div className="text-xs text-slate-400">
                          เสียหาย
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            {/* Filters */}
            <div className="bg-white p-3 rounded-xl border shadow-sm space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="ค้นหาชื่อ, รุ่น, หรืออาการเสีย..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-9 bg-slate-50 border-slate-200"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm"
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(e.target.value)
                  }
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm"
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value)
                  }
                >
                  <option value="all">ทุกสถานะซ่อม</option>
                  <option value="pending">รอประเมิน</option>
                  <option value="repairable">ซ่อมได้</option>
                  <option value="irreparable">
                    ซ่อมไม่ได้
                  </option>
                </select>
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed">
                  <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Plus className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-slate-900 font-semibold">
                    ยังไม่มีรายการ
                  </p>
                  <p className="text-slate-500 text-sm mb-4">
                    เริ่มบันทึกความเสียหายชิ้นแรก
                  </p>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    + เพิ่มรายการใหม่
                  </Button>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-md transition-all cursor-pointer group border-slate-200"
                    onClick={() => {
                      setEditingItem(item);
                      setIsFormOpen(true);
                    }}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-slate-600 border-slate-200 font-normal"
                            >
                              {
                                categories.find(
                                  (c) =>
                                    c.id === item.categoryId,
                                )?.name
                              }
                            </Badge>
                            {item.subCategory && (
                              <span className="text-xs text-slate-400">
                                {item.subCategory}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-slate-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600 text-lg">
                            {formatCurrency(
                              item.totalDamageValue,
                            )}
                          </div>
                          <Badge
                            className={cn(
                              "font-normal",
                              DAMAGE_LEVELS[item.damageLevel]
                                ?.color,
                            )}
                          >
                            เสียหาย {item.damagePercent}%
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                          <span className="truncate max-w-[150px]">
                            {item.damageDetail}
                          </span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {item.repairStatus ===
                            "repairable" && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200 bg-green-50"
                            >
                              ซ่อมได้
                            </Badge>
                          )}
                          {item.repairStatus ===
                            "irreparable" && (
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-200 bg-red-50"
                            >
                              ซ่อมไม่ได้
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-emerald-600 hover:bg-emerald-700 transition-transform hover:scale-105 print:hidden z-30"
        onClick={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
      >
        <Plus className="w-7 h-7 text-white" />
      </Button>

      <ItemFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingItem}
        categories={categories}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

// --- Sub-Components ---

const ItemFormDialog = ({
  open,
  onOpenChange,
  initialData,
  categories,
  onSave,
  onDelete,
}: any) => {
  const [formData, setFormData] = useState<
    Partial<InventoryItem>
  >({});
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        // Default Values
        setFormData({
          id: "",
          categoryId: categories[0]?.id,
          quantity: 1,
          unit: "ชิ้น",
          damageType: "���้ำท่วม",
          damageLevel: "moderate",
          usability: "partial",
          repairStatus: "pending",
          damagePercent: 50,
          currentValuePerUnit: 0,
          originalPrice: 0,
          incidentDate: new Date().toISOString().split("T")[0],
        });
      }
      setActiveTab("info");
    }
  }, [open, initialData, categories]);

  const calculateTotal = () => {
    const qty = formData.quantity || 0;
    const val = formData.currentValuePerUnit || 0;
    const pct = formData.damagePercent || 0;
    return val * (pct / 100) * qty;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "info") {
      setActiveTab("damage");
      return;
    }
    if (activeTab === "damage") {
      setActiveTab("value");
      return;
    }

    onSave({
      ...formData,
      id:
        formData.id || Math.random().toString(36).substr(2, 9),
      totalDamageValue: calculateTotal(),
    } as InventoryItem);
  };

  const activeCategory = categories.find(
    (c: any) => c.id === formData.categoryId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] flex flex-col p-0 sm:max-w-2xl w-[95vw] gap-0">
        <DialogHeader className="p-4 border-b bg-slate-50">
          <DialogTitle>
            {initialData ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          </DialogTitle>
          <DialogDescription>
            บันทึกรายละเอียดทรัพย์สินและความเสียหาย
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-white">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="sticky top-0 bg-white z-10 px-4 pt-2 border-b">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="info">
                  1. ข้อมูลทรัพย์สิน
                </TabsTrigger>
                <TabsTrigger value="damage">
                  2. ความเสียหาย
                </TabsTrigger>
                <TabsTrigger value="value">
                  3. ประเมินมูลค่า
                </TabsTrigger>
              </TabsList>
            </div>

            <form
              id="item-form"
              onSubmit={handleSubmit}
              className="p-4 space-y-6"
            >
              <TabsContent
                value="info"
                className="space-y-4 mt-0"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>หมวดหมู่</Label>
                    <Select
                      value={
                        formData.categoryId || categories[0]?.id
                      }
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          categoryId: v,
                          subCategory: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ประเภท (ย่อย)</Label>
                    <div className="relative">
                      <Input
                        list="subcategories"
                        placeholder="เลือกหรือพิมพ์เอง"
                        value={formData.subCategory || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subCategory: e.target.value,
                          })
                        }
                      />
                      <datalist id="subcategories">
                        {activeCategory?.subCategories.map(
                          (s: string) => (
                            <option key={s} value={s} />
                          ),
                        )}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    ชื่อทรัพย์สิน{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="เช่น ตู้เย็น 2 ประตู"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    ยี่ห้อ / รุ่น / รายละเอียดเพิ่มเติม
                  </Label>
                  <Input
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="เช่น Samsung Inverter สีเงิน 12 คิว"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>จำนวน</Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={formData.quantity ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity:
                            parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>หน่วยนับ</Label>
                    <Input
                      value={formData.unit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit: e.target.value,
                        })
                      }
                      placeholder="ชิ้น, ชุด"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-2 w-full">
                    <Label className="text-blue-900">
                      ประวัติการซื้อ (ถ้าจำได้)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="date"
                        className="bg-white"
                        value={formData.purchaseDate || ""}
                        onChange={(e) => {
                          const d = e.target.value;
                          const years = d
                            ? new Date().getFullYear() -
                              new Date(d).getFullYear()
                            : 0;
                          setFormData({
                            ...formData,
                            purchaseDate: d,
                            ageYears: years > 0 ? years : 0,
                          });
                        }}
                      />
                      <div className="relative">
                        <Input
                          type="number"
                          className="bg-white pr-8"
                          placeholder="อายุการใช้งาน"
                          value={formData.ageYears ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ageYears: parseFloat(
                                e.target.value,
                              ),
                            })
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          ปี
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="damage"
                className="space-y-4 mt-0"
              >
                <div className="space-y-2">
                  <Label>ระดับความเสียหาย</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      Object.keys(
                        DAMAGE_LEVELS,
                      ) as DamageLevel[]
                    ).map((level) => (
                      <div
                        key={level}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            damageLevel: level,
                            damagePercent:
                              DAMAGE_LEVELS[level]
                                .defaultPercent,
                          })
                        }
                        className={cn(
                          "cursor-pointer p-3 rounded-lg border text-sm text-center transition-all",
                          formData.damageLevel === level
                            ? "border-slate-900 ring-1 ring-slate-900 font-bold " +
                                DAMAGE_LEVELS[level].color
                            : "border-slate-200 hover:bg-slate-50",
                        )}
                      >
                        {DAMAGE_LEVELS[level].label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ลักษณะความเสียหาย (ละเอียด)</Label>
                  <Textarea
                    className="min-h-[80px]"
                    placeholder="เช่น จมน้ำมิดเครื่อง 3 วัน, สนิมเกาะมอเตอร์, บอร์ดวงจรช็อต"
                    value={formData.damageDetail || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        damageDetail: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ประเภทภัย</Label>
                    <Select
                      value={formData.damageType || "น้ำท่วม"}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          damageType: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="น้ำท่วม">
                          น้ำท่วม
                        </SelectItem>
                        <SelectItem value="ไฟไหม้">
                          ไฟไหม้
                        </SelectItem>
                        <SelectItem value="ดินโคลน">
                          ดินโคลนถล่ม
                        </SelectItem>
                        <SelectItem value="กระแสไฟฟ้า">
                          ไฟฟ้าลัดวงจร
                        </SelectItem>
                        <SelectItem value="อื่นๆ">
                          อื่นๆ
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>วันที่เกิดเหตุ</Label>
                    <Input
                      type="date"
                      value={formData.incidentDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          incidentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>สถานะการใช้งาน & การซ่อม</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={formData.repairStatus || "pending"}
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          repairStatus: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="การซ่อมแซม" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          รอประเมิน
                        </SelectItem>
                        <SelectItem value="repairable">
                          ซ่อมได้
                        </SelectItem>
                        <SelectItem value="irreparable">
                          ซ่อมไม่ได้
                        </SelectItem>
                        <SelectItem value="repaired">
                          ซ่อมแล้ว
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.usability || "partial"}
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          usability: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="การใช้งาน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">
                          ใช้งานได้ปกติ
                        </SelectItem>
                        <SelectItem value="partial">
                          ใช้ได้บางส่วน
                        </SelectItem>
                        <SelectItem value="unusable">
                          ใช้งานไม่ได้
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="value"
                className="space-y-6 mt-0"
              >
                <Card className="border-emerald-100 bg-emerald-50/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-emerald-200 pb-2 mb-2">
                      <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        คำนวณมูลค่าความเสียหาย
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label>
                          มูลค่าปัจจุบัน/หน่วย (Replacement
                          Cost)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="number"
                            className="pl-9 bg-white font-semibold"
                            placeholder="ราคาตลาดของใหม่"
                            value={
                              formData.currentValuePerUnit ?? ""
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                currentValuePerUnit: parseFloat(
                                  e.target.value,
                                ),
                              })
                            }
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">
                          ราคาที่ต้องจ่ายเพื่อซื้อของใหม่ทดแทนในปัจจุบัน
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <Label>สัดส่วนความเสียหาย</Label>
                          <span className="font-bold text-red-600">
                            {formData.damagePercent || 0}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                          value={formData.damagePercent || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              damagePercent: parseInt(
                                e.target.value,
                              ),
                            })
                          }
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>0% (ไม่เสีย)</span>
                          <span>50% (ครึ่งหนึ่ง)</span>
                          <span>100% (ทั้งหมด)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-emerald-100 mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600">
                          มูลค่าความเสียหายต่อหน่วย
                        </span>
                        <span className="font-medium">
                          ฿
                          {(
                            (formData.currentValuePerUnit ||
                              0) *
                            ((formData.damagePercent || 0) /
                              100)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold text-emerald-700 border-t border-dashed pt-2 mt-2">
                        <span>
                          รวมสุทธิ ({formData.quantity ?? 0}{" "}
                          {formData.unit})
                        </span>
                        <span>
                          ฿{calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ราคาซื้อเดิม (Reference)</Label>
                      <Input
                        type="number"
                        placeholder="ราคาในอดีต"
                        value={formData.originalPrice ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originalPrice: parseFloat(
                              e.target.value,
                            ),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ค่าซ่อมประเมิน (ถ้ามี)</Label>
                      <Input
                        type="number"
                        placeholder="ค่าช่าง+อะไหล่"
                        value={
                          formData.repairCostEstimate ?? ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            repairCostEstimate: parseFloat(
                              e.target.value,
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50 flex-row justify-between sm:justify-between gap-3">
          {initialData && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(initialData.id);
                onOpenChange(false);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> ลบ
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="item-form"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {activeTab === "value" ? "บันทึกรายการ" : "ถัดไป"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};