import React, { useState, useEffect, useMemo } from 'react';
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
  Printer
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";
import * as XLSX from 'xlsx';

// --- Types ---

export type InventoryStatus = 'repairable' | 'irreparable' | 'pending';

export type InventoryItem = {
  id: string;
  categoryId: string;
  subCategory?: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  lifespanYears: number;
  purchaseDate?: string;
  damageDetail: string;
  status: InventoryStatus;
  note?: string;
};

export type InventoryCategory = {
  id: string;
  name: string;
  subCategories: string[];
};

// --- Default Data ---

const DEFAULT_CATEGORIES: InventoryCategory[] = [
  {
    id: 'electrical',
    name: 'เครื่องใช้ไฟฟ้า',
    subCategories: ['ทีวี', 'ตู้เย็น', 'เครื่องซักผ้า', 'พัดลม', 'แอร์', 'ไมโครเวฟ', 'คอมพิวเตอร์']
  },
  {
    id: 'furniture',
    name: 'เฟอร์นิเจอร์',
    subCategories: ['เตียง', 'ตู้เสื้อผ้า', 'โต๊ะ', 'เก้าอี้', 'โซฟา', 'ชั้นวางของ']
  },
  {
    id: 'livelihood',
    name: 'เครื่องมือทำมาหากิน',
    subCategories: ['เครื่องตัดหญ้า', 'สว่าน', 'อุปกรณ์ขายของ', 'รถเข็น', 'เครื่องมือช่าง']
  }
];

// --- Components ---

export const InventoryManager = ({ onClose }: { onClose?: () => void }) => {
  // State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>(DEFAULT_CATEGORIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Load Data
  useEffect(() => {
    const savedItems = localStorage.getItem('flood-inventory-items');
    const savedCategories = localStorage.getItem('flood-inventory-categories');
    
    if (savedItems) {
      try { setItems(JSON.parse(savedItems)); } catch (e) { console.error(e); }
    }
    
    if (savedCategories) {
      try { setCategories(JSON.parse(savedCategories)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('flood-inventory-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('flood-inventory-categories', JSON.stringify(categories));
  }, [categories]);

  // Handlers
  const handleSaveItem = (item: InventoryItem) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? item : i));
    } else {
      setItems([...items, item]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleExportExcel = () => {
    // Detailed Sheet
    const dataToExport = items.map(item => ({
      'หมวดหมู่': categories.find(c => c.id === item.categoryId)?.name || item.categoryId,
      'หมวดย่อย': item.subCategory || '-',
      'ชื่อรายการ': item.name,
      'จำนวน': item.quantity,
      'ราคาต่อหน่วย': item.pricePerUnit,
      'มูลค่ารวม': item.totalValue,
      'อายุการใช้งาน (ปี)': item.lifespanYears,
      'รายละเอียดความเสียหาย': item.damageDetail,
      'สถานะ': item.status === 'repairable' ? 'ซ่อมได้' : item.status === 'irreparable' ? 'ซ่อมไม่ได้' : 'รอประเมิน',
      'หมายเหตุ': item.note || '-'
    }));

    // Summary Sheet
    const summaryData = categories.map(cat => {
      const catItems = items.filter(i => i.categoryId === cat.id);
      return {
        'หมวดหมู่': cat.name,
        'จำนวนรายการ': catItems.length,
        'จำนวนชิ้นรวม': catItems.reduce((sum, i) => sum + i.quantity, 0),
        'มูลค่าความเสียหายรวม': catItems.reduce((sum, i) => sum + i.totalValue, 0)
      };
    });
    // Add Grand Total
    summaryData.push({
      'หมวดหมู่': 'รวมทั้งหมด',
      'จำนวนรายการ': items.length,
      'จำนวนชิ้นรวม': items.reduce((sum, i) => sum + i.quantity, 0),
      'มูลค่าความเสียหายรวม': items.reduce((sum, i) => sum + i.totalValue, 0)
    });

    const wb = XLSX.utils.book_new();
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "สรุปความเสียหาย");
    
    const wsDetail = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, wsDetail, "รายการละเอียด");

    XLSX.writeFile(wb, `บัญชีทรัพย์สินเสียหาย_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const totalValue = items.reduce((acc, item) => acc + item.totalValue, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Filtering
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.damageDetail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categorySummary = useMemo(() => {
    return categories.map(cat => {
      const catItems = items.filter(i => i.categoryId === cat.id);
      return {
        ...cat,
        itemCount: catItems.length,
        totalQty: catItems.reduce((sum, i) => sum + i.quantity, 0),
        totalVal: catItems.reduce((sum, i) => sum + i.totalValue, 0)
      };
    }).filter(c => c.itemCount > 0);
  }, [categories, items]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col pb-20 print:bg-white print:pb-0">
      {/* Print Layout (Hidden on Screen) */}
      <div className="hidden print:block p-8 bg-white">
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-900">บัญชีรายการทรัพย์สินเสียหาย</h1>
          <p className="text-slate-500">Damage Inventory Report</p>
          <div className="mt-2 text-sm text-slate-600">
            วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 bg-slate-100 p-2">1. สรุปตามหมวดหมู่</h2>
          <table className="w-full text-sm text-left">
            <thead className="border-b-2 border-slate-200">
              <tr>
                <th className="py-2">หมวดหมู่</th>
                <th className="py-2 text-right">จำนวนรายการ</th>
                <th className="py-2 text-right">จำนวนชิ้น</th>
                <th className="py-2 text-right">มูลค่ารวม</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map(cat => (
                <tr key={cat.id} className="border-b border-slate-100">
                  <td className="py-2">{cat.name}</td>
                  <td className="py-2 text-right">{cat.itemCount}</td>
                  <td className="py-2 text-right">{cat.totalQty}</td>
                  <td className="py-2 text-right">฿{cat.totalVal.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-50">
                <td className="py-2 pl-2">รวมทั้งหมด</td>
                <td className="py-2 text-right">{items.length}</td>
                <td className="py-2 text-right">{totalItems}</td>
                <td className="py-2 text-right pr-2">฿{totalValue.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 bg-slate-100 p-2">2. รายการละเอียด</h2>
          <table className="w-full text-xs text-left">
            <thead className="border-b-2 border-slate-200">
              <tr>
                <th className="py-2 w-[20%]">ชื่อรายการ</th>
                <th className="py-2 w-[15%]">หมวดหมู่</th>
                <th className="py-2 w-[10%]">จำนวน</th>
                <th className="py-2 w-[10%]">ราคา/หน่วย</th>
                <th className="py-2 w-[10%]">รวม</th>
                <th className="py-2 w-[20%]">ความเสียหาย</th>
                <th className="py-2 w-[15%]">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-2">
                    <div className="font-bold">{item.name}</div>
                    {item.purchaseDate && <div className="text-slate-500">ซื้อ: {item.purchaseDate} ({item.lifespanYears} ปี)</div>}
                  </td>
                  <td className="py-2 pr-2">
                    {categories.find(c => c.id === item.categoryId)?.name}
                    {item.subCategory && <div className="text-slate-500">{item.subCategory}</div>}
                  </td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">฿{item.pricePerUnit.toLocaleString()}</td>
                  <td className="py-2 font-semibold">฿{item.totalValue.toLocaleString()}</td>
                  <td className="py-2 pr-2 text-slate-600">{item.damageDetail}</td>
                  <td className="py-2">
                    {item.status === 'repairable' ? 'ซ่อมได้' : item.status === 'irreparable' ? 'ซ่อมไม่ได้' : 'รอประเมิน'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen Header */}
      <div className="bg-white border-b sticky top-0 z-20 print:hidden">
        <div className="p-4 flex items-center gap-3 max-w-3xl mx-auto">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="-ml-2">
              <X className="w-6 h-6" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="font-bold text-lg text-slate-900">บัญชีทรัพย์สินเสียหาย</h1>
            <p className="text-xs text-slate-500">บันทึกรายการเพื่อขอเยียวยา/เคลมประกัน</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="icon" onClick={handlePrint} title="Print / Save PDF">
                <Printer className="w-5 h-5 text-slate-600" />
             </Button>
             <Button variant="outline" size="icon" onClick={handleExportExcel} title="Export Excel">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
             </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-4 max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="list">รายการ ({items.length})</TabsTrigger>
              <TabsTrigger value="summary">สรุปยอดรวม</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-6 print:hidden">
        
        {activeTab === 'summary' ? (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-md">
               <CardContent className="p-6 text-center">
                 <div className="text-slate-300 text-sm mb-2">มูลค่าความเสียหายรวมทั้งหมด</div>
                 <div className="text-4xl font-bold text-white mb-1">฿{totalValue.toLocaleString()}</div>
                 <div className="text-slate-400 text-xs">{totalItems} รายการทรัพย์สิน</div>
               </CardContent>
            </Card>

            <div className="grid gap-4">
              <h3 className="font-bold text-slate-900">สรุปแยกตามหมวดหมู่</h3>
              {categorySummary.map(cat => (
                <Card key={cat.id} className="overflow-hidden">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">{cat.name}</div>
                      <div className="text-xs text-slate-500">{cat.itemCount} รายการ ({cat.totalQty} ชิ้น)</div>
                    </div>
                    <div className="text-right font-bold text-red-600">
                      ฿{cat.totalVal.toLocaleString()}
                    </div>
                  </CardContent>
                  <div className="bg-slate-50 px-4 py-2 border-t text-xs text-slate-500 flex justify-between">
                     <span>เฉลี่ยต่อชิ้น: ฿{Math.round(cat.totalVal / cat.totalQty).toLocaleString()}</span>
                  </div>
                </Card>
              ))}
              
              {categorySummary.length === 0 && (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
                   ยังไม่มีข้อมูลรายการ
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">มูลค่ารวม</div>
                  <div className="text-lg font-bold text-red-600 mt-0.5">฿{totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">รายการ</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{totalItems} <span className="text-xs font-normal text-slate-500">ชิ้น</span></div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="space-y-3 bg-white p-3 rounded-lg border shadow-sm">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="ค้นหาชื่อ, อาการเสีย..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-50"
                  />
               </div>
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Button variant="outline" size="icon" onClick={() => setIsCategoryManagerOpen(true)} className="shrink-0">
                    <Settings className="w-4 h-4 text-slate-600" />
                  </Button>
                  
                  <select 
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">ทุกหมวดหมู่</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>

                  <select 
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">ทุกสถานะ</option>
                    <option value="pending">รอประเมิน</option>
                    <option value="repairable">ซ่อมได้</option>
                    <option value="irreparable">ซ่อมไม่ได้</option>
                  </select>
               </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed">
                  <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">ไม่พบรายการที่ค้นหา</p>
                  <Button variant="link" onClick={() => setIsFormOpen(true)} className="text-emerald-600">
                    + เพิ่มรายการใหม่
                  </Button>
                </div>
              ) : (
                filteredItems.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 group">
                    <div className={cn(
                      "h-1.5 w-full", 
                      item.status === 'repairable' ? 'bg-yellow-500' : 
                      item.status === 'irreparable' ? 'bg-red-500' : 'bg-slate-300'
                    )} />
                    <CardContent className="p-4 cursor-pointer" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium mb-0.5 flex items-center gap-1">
                            {categories.find(c => c.id === item.categoryId)?.name}
                            {item.subCategory && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{item.subCategory}</span>}
                          </div>
                          <h3 className="font-bold text-base text-slate-900 leading-tight">{item.name}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-red-600">฿{item.totalValue.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">{item.quantity} x ฿{item.pricePerUnit.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-2 rounded text-xs text-slate-700 mb-3 flex gap-2">
                        <span className="font-semibold text-slate-500 shrink-0">อาการ:</span>
                        <span className="truncate">{item.damageDetail}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className={cn(
                          "border-0 text-[10px] h-5 px-2",
                          item.status === 'repairable' ? 'bg-yellow-50 text-yellow-700' : 
                          item.status === 'irreparable' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                        )}>
                          {item.status === 'repairable' ? 'ซ่อมได้' : item.status === 'irreparable' ? 'ซ่อมไม่ได้' : 'รอประเมิน'}
                        </Badge>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsFormOpen(true); }}>
                              <Edit2 className="w-3.5 h-3.5" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                           </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <Button 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-emerald-600 hover:bg-emerald-700 transition-transform hover:scale-105 print:hidden z-30"
        onClick={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
      >
        <Plus className="w-7 h-7 text-white" />
      </Button>

      {/* Forms & Modals */}
      <ItemForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        initialData={editingItem}
        categories={categories}
        onSave={handleSaveItem}
      />

      <CategoryManager 
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        categories={categories}
        onUpdate={setCategories}
      />
    </div>
  );
};

// --- Sub-Components ---

const ItemForm = ({ open, onOpenChange, initialData, categories, onSave }: any) => {
  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    categoryId: categories[0]?.id,
    quantity: 1,
    status: 'pending'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        categoryId: categories[0]?.id,
        quantity: 1,
        status: 'pending',
        name: '',
        pricePerUnit: 0,
        lifespanYears: 0,
        damageDetail: '',
        note: ''
      });
    }
  }, [initialData, open, categories]);

  const calculateTotal = () => {
    return (formData.quantity || 0) * (formData.pricePerUnit || 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      totalValue: calculateTotal()
    } as InventoryItem);
  };

  const activeCategory = categories.find((c: any) => c.id === formData.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-lg w-[95vw]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'แก้ไขรายการ' : 'เพิ่มรายการทรัพย์สิน'}</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลทรัพย์สินที่เสียหายเพื่อประเมินมูลค่าและจัดทำบัญชี
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          {/* Category Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>หมวดหมู่</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(v) => setFormData({...formData, categoryId: v, subCategory: ''})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
                <Label>ประเภท (ย่อย)</Label>
                {activeCategory?.subCategories?.length > 0 ? (
                  <Select 
                    value={formData.subCategory} 
                    onValueChange={(v) => setFormData({...formData, subCategory: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ระบุประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCategory.subCategories.map((sub: string) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                   <Input 
                      placeholder="ระบุเอง (ไม่มีตัวเลือก)" 
                      value={formData.subCategory || ''} 
                      onChange={e => setFormData({...formData, subCategory: e.target.value})} 
                   />
                )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>ชื่อรายการทรัพย์สิน <span className="text-red-500">*</span></Label>
            <Input 
              required 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="เช่น ตู้เย็น 2 ประตู, เตียงนอน 6 ฟุต"
            />
          </div>

          {/* Qty & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>จำนวน</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  min="1" 
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ราคา/หน่วย (บาท)</Label>
              <Input 
                type="number" 
                min="0"
                required
                value={formData.pricePerUnit || ''}
                onChange={e => setFormData({...formData, pricePerUnit: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          {/* Total Value Preview */}
          <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border">
            <span className="text-sm text-slate-500">มูลค่ารวมโดยประมาณ</span>
            <span className="font-bold text-lg text-emerald-600">฿{calculateTotal().toLocaleString()}</span>
          </div>

          {/* Lifespan & Date */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>อายุการใช้งาน (ปี)</Label>
              <Input 
                type="number" 
                min="0"
                value={formData.lifespanYears || ''}
                onChange={e => setFormData({...formData, lifespanYears: parseFloat(e.target.value) || 0})}
                placeholder="เช่น 3"
              />
             </div>
             <div className="space-y-2">
              <Label>วันที่ซื้อ (ถ้าจำได้)</Label>
              <Input 
                type="date"
                value={formData.purchaseDate || ''}
                onChange={e => {
                  const date = e.target.value;
                  // Auto calc years
                  const years = date ? ((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1) : 0;
                  setFormData({
                    ...formData, 
                    purchaseDate: date,
                    lifespanYears: parseFloat(years.toString())
                  });
                }}
              />
             </div>
          </div>

          {/* Damage Details */}
          <div className="space-y-2">
            <Label>รายละเอียดความเสียหาย</Label>
            <Input 
              value={formData.damageDetail || ''} 
              onChange={e => setFormData({...formData, damageDetail: e.target.value})}
              placeholder="เช่น จมน้ำมิดตู้, สนิมขึ้น, แตกหัก"
            />
          </div>

           {/* Status */}
          <div className="space-y-2">
            <Label>สถานะ</Label>
            <Select 
              value={formData.status} 
              onValueChange={(v: any) => setFormData({...formData, status: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">รอประเมิน</SelectItem>
                <SelectItem value="repairable">ซ่อมได้</SelectItem>
                <SelectItem value="irreparable">ซ่อมไม่ได้ (เสียหายถาวร)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Note */}
          <div className="space-y-2">
            <Label>หมายเหตุ</Label>
            <Input 
              value={formData.note || ''} 
              onChange={e => setFormData({...formData, note: e.target.value})}
              placeholder="เช่น มีใบรับประกัน, ถ่ายรูปแล้ว"
            />
          </div>

          <DialogFooter className="mt-6 flex-row gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">บันทึกรายการ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CategoryManager = ({ open, onOpenChange, categories, onUpdate }: any) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<InventoryCategory | null>(null);
  const [newSubCatName, setNewSubCatName] = useState('');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    onUpdate([...categories, {
      id: `cat-${Date.now()}`,
      name: newCatName,
      subCategories: []
    }]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('ลบหมวดหมู่นี้? (รายการในหมวดนี้อาจได้รับผลกระทบ)')) {
      onUpdate(categories.filter((c: any) => c.id !== id));
    }
  };

  const handleAddSubCat = () => {
    if (!editingCat || !newSubCatName.trim()) return;
    const updatedCat = {
      ...editingCat,
      subCategories: [...(editingCat.subCategories || []), newSubCatName.trim()]
    };
    onUpdate(categories.map((c: any) => c.id === editingCat.id ? updatedCat : c));
    setEditingCat(updatedCat);
    setNewSubCatName('');
  };

  const handleDeleteSubCat = (sub: string) => {
    if (!editingCat) return;
    const updatedCat = {
      ...editingCat,
      subCategories: editingCat.subCategories.filter(s => s !== sub)
    };
    onUpdate(categories.map((c: any) => c.id === editingCat.id ? updatedCat : c));
    setEditingCat(updatedCat);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>จัดการหมวดหมู่</DialogTitle>
          <DialogDescription>
            เพิ่มหรือลบหมวดหมู่และประเภทย่อยสำหรับจัดกลุ่มทรัพย์สิน
          </DialogDescription>
        </DialogHeader>
        
        {editingCat ? (
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
               <Button variant="ghost" size="sm" onClick={() => setEditingCat(null)}><ChevronDown className="rotate-90 w-4 h-4" /> กลับ</Button>
               <div className="flex-1 flex gap-2">
                 <Input 
                   value={editingCat.name} 
                   onChange={(e) => {
                     const newName = e.target.value;
                     const updated = { ...editingCat, name: newName };
                     setEditingCat(updated);
                     onUpdate(categories.map((c: any) => c.id === editingCat.id ? updated : c));
                   }}
                   className="font-bold text-lg h-10"
                 />
               </div>
             </div>
             
             <div className="space-y-2">
               <Label>เพิ่มประเภทย่อย</Label>
               <div className="flex gap-2">
                 <Input 
                   placeholder="ชื่อประเภทย่อย..." 
                   value={newSubCatName}
                   onChange={e => setNewSubCatName(e.target.value)}
                 />
                 <Button onClick={handleAddSubCat}>เพิ่ม</Button>
               </div>
             </div>

             <Label>รายการประเภทย่อย</Label>
             <div className="space-y-2 border rounded p-2 max-h-[300px] overflow-y-auto">
                {editingCat.subCategories?.map(sub => (
                   <div key={sub} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                     <span>{sub}</span>
                     <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteSubCat(sub)}>
                       <Trash2 className="w-3 h-3" />
                     </Button>
                   </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="ชื่อหมวดหมู่ใหม่..." 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
              <Button onClick={handleAddCategory}><Plus className="w-4 h-4" /></Button>
            </div>
            <ScrollArea className="h-[300px] border rounded-md p-2">
              <div className="space-y-2">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex gap-1">
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCat(cat)}>
                         <Settings className="w-4 h-4 text-slate-500" />
                       </Button>
                       {!['electrical', 'furniture', 'livelihood'].includes(cat.id) && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
