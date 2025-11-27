import React, { useState, useEffect } from 'react';
import { 
  TriangleAlert,
  Camera, 
  Trash2, 
  Car, 
  FileText, 
  Heart, 
  Calendar, 
  ChevronRight, 
  CircleCheck,
  Phone,
  RotateCcw,
  Printer,
  Share2,
  Mail,
  Home,
  Calculator,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card, CardContent } from "./components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./components/ui/utils";

import { InventoryGuide } from "./components/InventoryGuide";

// --- Data Structure ---

type ChecklistItem = {
  id: string;
  text: string;
  isWarning?: boolean;
};

type SubSection = {
  title: string;
  description?: string;
  items: ChecklistItem[];
};

type Section = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  subSections: SubSection[];
};

const PLAYBOOK_DATA: Section[] = [
  {
    id: 'safety',
    title: '1. ความปลอดภัยก่อน (Safety First)',
    icon: TriangleAlert,
    color: 'text-red-500',
    subSections: [
      {
        title: '1.1 ตรวจสอบโครงสร้างบ้าน (Check Structural Integrity)',
        items: [
          { id: 's1-1', text: 'ห้ามเข้าบ้านทันทีหากเห็นเสา/กำแพงเอียง หรือแตกร้าว (Do not enter if you see tilted pillars/walls or cracks)', isWarning: true },
          { id: 's1-2', text: 'ตรวจสอบหลังคาทรุด หรือพื้นยุบ (Check for sagging roofs or collapsed floors)', isWarning: true },
          { id: 's1-3', text: 'หากสงสัยโครงสร้างเสียหาย ให้ปรึกษา อบต./เทศบาล/วิศวกร ก่อนเข้าพื้นที่ (If uncertain, consult local authorities/engineers before entering)' },
        ]
      },
      {
        title: '1.2 ไฟฟ้า - แก๊ส - สารเคมี (Electricity - Gas - Chemicals)',
        items: [
          { id: 's1-4', text: 'ปิดเมนไฟฟ้าทันที (หากปลอดภัยและเข้าถึงได้) [Turn off main power immediately (if safe)]', isWarning: true },
          { id: 's1-5', text: 'ห้ามเปิดเครื่องใช้ไฟฟ้าที่เคยจมน้ำทันที (Do not turn on submerged appliances)' },
          { id: 's1-6', text: 'ให้ช่างไฟตรวจสอบระบบสายไฟและปลั๊กก่อนใช้งาน (Have an electrician check wiring and outlets)' },
          { id: 's1-7', text: 'ตรวจสอบสายแก๊สว่าชำรุดหรือไม่ หากได้กลิ่นให้เปิดระบายอากาศทันที (Check gas lines; ventilate immediately if you smell gas)', isWarning: true },
          { id: 's1-8', text: 'หลีกเลี่ยงการสัมผัสถังสารเคมี/ยาฆ่าแมลงที่ล้มหรือรั่วด้วยมือเปล่า (Avoid touching leaking chemical/pesticide containers)', },
        ]
      }
    ]
  },
  {
    id: 'evidence',
    title: '2. เก็บหลักฐาน (Evidence Collection)',
    icon: Camera,
    color: 'text-blue-500',
    subSections: [
      {
        title: '2.1 ถ่ายรูป/วิดีโอ "ก่อนเก็บกวาด" (Photo/Video Before Cleanup)',
        items: [
          { id: 'e2-1', text: 'ถ่ายภาพหน้าบ้าน ในบ้าน และรอบบริเวณบ้าน (Take photos of exterior, interior, and surroundings)' },
          { id: 'e2-2', text: 'ถ่ายให้เห็นระดับคราบน้ำบนผนัง ประตู และเฟอร์นิเจอร์ (Capture water line marks on walls/doors/furniture)' },
          { id: 'e2-3', text: 'ถ่ายภาพกว้าง (เห็นทั้งห้อง) และภาพใกล้ (เห็นความเสียหายเจาะจง) [Take wide shots (room overview) and close-ups (specific damage)]' },
          { id: 'e2-4', text: 'ถ่าย Serial Number / ยี่ห้อ / รุ่น ของเครื่องใช้ไฟฟ้าที่เสียหาย (Photo of Serial No./Brand/Model of damaged appliances)' },
        ]
      },
      {
        title: '2.2 จดบันทึกเหตุการณ์ (Log Events)',
        items: [
          { id: 'e2-5', text: 'บันทึกวัน-เวลาที่น้ำเข้า, น้ำสูงสุด และน้ำเริ่มลด (Log date/time of water entry, peak, and receding)' },
          { id: 'e2-6', text: 'ระบุระดับน้ำสูงสุด (เช่น ถึงเข่า, ถึงลูกบิดประตู) [Record peak water level (e.g., knee-high, door knob level)]' },
          { id: 'e2-7', text: 'จดรายการจุดที่เสียหายหนักเป็นพิเศษ (เช่น ห้องครัว, โกดัง) [Note heavily damaged areas (e.g., kitchen, warehouse)]' },
        ]
      }
    ]
  },
  {
    id: 'cleanup',
    title: '3. จัดการบ้านและทรัพย์สิน (Cleanup & Inventory)',
    icon: Home,
    color: 'text-emerald-500',
    subSections: [
      {
        title: '3.1 การทำความสะอาดเบื้องต้น (Initial Cleanup)',
        items: [
          { id: 'c3-1', text: 'ถ่ายรูปของที่จะทิ้งก่อนนำไปทิ้งเสมอ (Always photograph items before disposal)' },
          { id: 'c3-2', text: 'สวมอุปกรณ์ป้องกัน: ถุงมือ, หน้ากาก, รองเท้าบูท (Wear PPE: gloves, masks, boots)' },
          { id: 'c3-3', text: 'เคลียร์เศษแก้ว ของมีคม และเปิดทางระบายน้ำขัง (Clear broken glass/sharps and unblock drains)' },
        ]
      },
      {
        title: '3.2 จัดหมวดหมู่ของเสียหาย (Categorize Damaged Items)',
        items: [
          { id: 'c3-4', text: 'แยกหมวด: เครื่องใช้ไฟฟ้า, เฟอร์นิเจอร์, เครื่องมือทำกิน (Separate: Appliances, Furniture, Livelihood tools)' },
          { id: 'c3-5', text: 'ทำบัญชีรายการของเสียหาย: ชื่อ, จำนวน, ราคาโดยประมาณ, อายุการใช้งาน (Inventory: Name, Qty, Approx Price, Age)' },
        ]
      }
    ]
  },
  {
    id: 'vehicle',
    title: '4. จัดการรถยนต์ (Vehicles)',
    icon: Car,
    color: 'text-slate-500',
    subSections: [
      {
        title: '4.1 กรณีรถจมน้ำ (Submerged Vehicles)',
        items: [
          { id: 'v4-1', text: 'ห้ามสตาร์ทรถเด็ดขาด ถ้าน้ำท่วมถึงเครื่องยนต์ (Do NOT start engine if flooded)', isWarning: true },
          { id: 'v4-2', text: 'ถ่ายรูประดับน้ำเทียบกับตัวรถ และป้ายทะเบียน (Photo of water level vs car body and license plate)' },
        ]
      },
      {
        title: '4.2 หลังน้ำลด (After Water Recedes)',
        items: [
          { id: 'v4-3', text: 'ถ่ายรูปรอบคัน ภายใน และห้องเครื่อง (Photo exterior, interior, and engine bay)' },
          { id: 'v4-4', text: 'ติดต่อประกันภัยเพื่อลากรถ (ถ้ามีประกัน) [Contact insurance for towing (if covered)]' },
          { id: 'v4-5', text: 'ติดต่ออู่ที่เชี่ยวชาญเรื่องน้ำท่วม (Contact flood-specialist mechanics)' },
          { id: 'v4-6', text: 'เก็บใบเสร็จค่ารถยกและค่าซ่อมทุกใบ (Keep all towing and repair receipts)' },
        ]
      }
    ]
  },
  {
    id: 'documents',
    title: '5. ประกันและเยียวยา (Claims & Aid)',
    icon: FileText,
    color: 'text-purple-500',
    subSections: [
      {
        title: '5.1 เช็กสิทธิ์ (Check Rights/Eligibility)',
        items: [
          { id: 'd5-1', text: 'ตรวจสอบกรมธรรม์ประกันบ้าน/รถ/อัคคีภัย (คุ้มครองภัยธรรมชาติไหม) [Check home/car/fire policies (natural disaster coverage?)]' },
          { id: 'd5-2', text: 'ติดตามข่าวสารเงินเยียวยาจากภาครัฐ/ท้องถิ่น (Follow govt/local aid announcements)' },
        ]
      },
      {
        title: '5.2 เตรียมเอกสาร (Prepare Documents)',
        items: [
          { id: 'd5-3', text: 'เตรียมบัตรประชาชน (ตัวจริง + สำเนา/รูปถ่าย) [ID Card (Original + Copy/Photo)]' },
          { id: 'd5-4', text: 'ทะเบียนบ้าน (ถ้ามี) [House Registration (if available)]' },
          { id: 'd5-5', text: 'รวบรวมรูปถ่ายความเสียหายทั้งหมด (Compile all damage photos)' },
          { id: 'd5-6', text: 'กรอกแบบฟอร์มบันทึกเหตุการณ์และรายการทรัพย์สิน (Fill event log & asset inventory forms)' },
        ]
      }
    ]
  },
  {
    id: 'health',
    title: '6. สุขภาพกายและใจ (Health & Wellbeing)',
    icon: Heart,
    color: 'text-pink-500',
    subSections: [
      {
        title: '6.1 สุขภาพกาย (Physical Health)',
        items: [
          { id: 'h6-1', text: 'สวมรองเท้าบูท/ถุงมือทุกครั้งที่ลุยโคลน (Wear boots/gloves in mud)' },
          { id: 'h6-2', text: 'ล้างมือ-เท้าด้วยสบู่หลังสัมผัสน้ำสกปรก (Wash hands/feet with soap after contact with dirty water)' },
          { id: 'h6-3', text: 'สังเกตอาการ: ไข้, แผลอักเสบ, ตาแดง - ให้รีบพบแพทย์ (Watch for: Fever, infection, pink eye - see doctor immediately)' },
        ]
      },
      {
        title: '6.2 สุขภาพจิต (Mental Health)',
        items: [
          { id: 'h6-4', text: 'ยอมรับความรู้สึกเครียด/ท้อว่าเป็นเรื่องปกติ (Accept that stress/discouragement is normal)' },
          { id: 'h6-5', text: 'พูดคุยระบายกับคนในครอบครัวหรือเพื่อน (Talk to family/friends)' },
          { id: 'h6-6', text: 'หากเครียดมาก นอนไม่หลับ โทรสายด่วนสุขภาพจิต 1323 (If stressed/insomniac, call Mental Health Hotline 1323)' },
        ]
      }
    ]
  },
  {
    id: 'planning',
    title: '7. วางแผนฟื้นฟู (Recovery Plan)',
    icon: Calendar,
    color: 'text-indigo-500',
    subSections: [
      {
        title: '7.1 ระยะสั้น 1-7 วัน (Short Term)',
        items: [
          { id: 'p7-1', text: 'ตรวจความปลอดภัยและเก็บหลักฐานให้ครบ (Check safety & complete evidence collection)' },
          { id: 'p7-2', text: 'ติดต่อขอรับความช่วยเหลือเบื้องต้น (Request initial aid)' },
        ]
      },
      {
        title: '7.2 ระยะกลาง 1-4 สัปดาห์ (Medium Term)',
        items: [
          { id: 'p7-3', text: 'ทำความสะอาดใหญ่ ฆ่าเชื้อ ตากบ้านให้แห้ง (Big clean, disinfect, dry out house)' },
          { id: 'p7-4', text: 'ติดตามผลการเคลมประกันและเงินเยียวยา (Follow up on claims/aid)' },
        ]
      },
      {
        title: '7.3 ระยะยาว 1-12 เดือน (Long Term)',
        items: [
          { id: 'p7-5', text: 'ซ่อมแซมโครงสร้างถาวร (Permanent structural repairs)' },
          { id: 'p7-6', text: 'วางแผนป้องกันใหม่: ยกของสูง, ปรับทางน้ำ (Prevention plan: Raise assets, adjust drainage)' },
        ]
      }
    ]
  },
  {
    id: 'financial',
    title: '8. ความมั่นคงทางการเงิน (Financial Security)',
    icon: ShieldCheck,
    color: 'text-orange-500',
    subSections: [
      {
        title: '8.1 สำรวจสถานะการเงิน (Financial Status Check)',
        items: [
          { id: 'f8-1', text: 'รู้ยอดหนี้รวม และค่างวดต่อเดือน (Know total debt & monthly installments)' },
          { id: 'f8-2', text: 'ระบุรายชื่อผู้ที่พึ่งพารายได้เรา (Identify dependents)' },
          { id: 'f8-3', text: 'รวบรวมข้อมูลประกันและสวัสดิการเดิมที่มีทั้งหมด (Gather all existing insurance/welfare info)' },
        ]
      },
      {
        title: '8.2 วางแผนความคุ้มครอง (Coverage Planning)',
        items: [
          { id: 'f8-4', text: 'ตั้งเป้าวงเงินคุ้มครองชีวิตขั้นต่ำ (หนี้สิน + ค่าใช้จ่ายครอบครัว) [Set minimum life coverage goal (Debt + Family expenses)]' },
          { id: 'f8-5', text: 'เลือกแบบประกันหลักที่เหมาะสม (เน้นความคุ้มครองสูงหากงบจำกัด) [Choose suitable main insurance (High coverage if budget limited)]' },
          { id: 'f8-6', text: 'ระบุชื่อผู้รับผลประโยชน์ให้ชัดเจนและเป็นปัจจุบัน (Specify clear/current beneficiaries)' },
        ]
      },
      {
        title: '8.3 สื่อสารและต่อยอด (Communicate & Build)',
        items: [
          { id: 'f8-7', text: 'ทำ “แผนที่ประกันชีวิต” สรุปข้อมูลสำคัญไว้ในแผ่นเดียวให้คนในบ้านรู้ (Create "Insurance Map" summary for family)' },
          { id: 'f8-8', text: 'วางแผนทยอยเพิ่มเงินออมหรือประกันเมื่อการเงินเริ่มฟื้นตัว (Plan to increase savings/insurance as finances recover)' },
        ]
      }
    ]
  }
];

// --- Components ---

const SectionCard = ({ section, onClick, progress }: { section: Section, onClick: () => void, progress: number }) => {
  const Icon = section.icon;
  
  if (!Icon) {
    return null;
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] border-l-4 overflow-hidden h-full"
      style={{ borderLeftColor: 'currentColor' }} 
      onClick={onClick}
    >
      <div className={cn("h-full w-1.5 absolute left-0 top-0", section.color.replace('text-', 'bg-'))} />
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full bg-opacity-10", section.color.replace('text-', 'bg-'))}>
            <Icon className={cn("w-6 h-6", section.color)} />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight text-slate-900">{section.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {progress === 100 ? 'เรียบร้อยแล้ว (Completed)' : `${progress}% เสร็จสิ้น (Done)`}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </CardContent>
      {progress > 0 && (
        <div className="h-1 bg-slate-100 w-full">
          <div 
            className={cn("h-full transition-all duration-500", section.color.replace('text-', 'bg-'))} 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Card>
  );
};

const ChecklistDetail = ({ section, checkedItems: initialCheckedItems, onSave, onCancel }: { 
  section: Section, 
  checkedItems: Record<string, boolean>, 
  onSave: (items: Record<string, boolean>) => void,
  onCancel: () => void
}) => {
  const Icon = section.icon;
  const [localCheckedItems, setLocalCheckedItems] = useState(initialCheckedItems);

  const handleLocalToggle = (id: string) => {
    setLocalCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-white z-50 flex flex-col"
    >
      {/* Header */}
      <div className="border-b bg-white shadow-sm sticky top-0 z-10 safe-area-top">
        <div className="p-4 flex items-center gap-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Button>
          <div className="flex-1">
            <h2 className="font-bold text-lg truncate pr-2 text-slate-900">{section.title}</h2>
          </div>
          {Icon && <Icon className={cn("w-6 h-6", section.color)} />}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4 pb-24 bg-slate-50">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {section.subSections.map((sub, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <span className={cn("w-1.5 h-6 rounded-full", section.color.replace('text-', 'bg-'))}/>
                {sub.title}
              </h3>
              {sub.description && <p className="text-slate-600 text-sm pl-4">{sub.description}</p>}
              
              <div className="grid gap-3">
                {sub.items.map((item) => {
                  const isChecked = !!localCheckedItems[item.id];
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleLocalToggle(item.id)}
                      className={cn(
                        "p-4 rounded-xl border bg-white shadow-sm transition-all cursor-pointer flex gap-3 items-start group relative overflow-hidden",
                        isChecked ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200",
                        item.isWarning && !isChecked ? "border-red-200 bg-red-50" : ""
                      )}
                    >
                      {item.isWarning && !isChecked && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                      )}
                      
                      <div className={cn(
                        "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                        isChecked 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      )}>
                        {isChecked && <CircleCheck className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1 relative z-10">
                        <p className={cn(
                          "text-sm leading-relaxed select-none font-medium",
                          isChecked ? "text-slate-500 line-through" : "text-slate-700",
                          item.isWarning && !isChecked ? "text-red-800" : ""
                        )}>
                          {item.text}
                        </p>
                        {item.isWarning && !isChecked && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mt-1 bg-red-100/50 px-2 py-0.5 rounded-full w-fit">
                            <TriangleAlert className="w-3 h-3" />
                            ระวังอันตราย! (Danger!)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Action */}
      <div className="p-4 border-t bg-white pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button className="flex-1 text-base font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" size="lg" onClick={onCancel}>
            ยกเลิก (Cancel)
          </Button>
          <Button className="flex-[2] text-base font-semibold" size="lg" onClick={() => onSave(localCheckedItems)}>
            บันทึก (Save)
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('flood-playbook-progress');
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress");
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('flood-playbook-progress', JSON.stringify(checkedItems));
    }
  }, [checkedItems, mounted]);

  const handleSave = (newCheckedItems: Record<string, boolean>) => {
    setCheckedItems(newCheckedItems);
    setActiveSectionId(null);
  };

  const handleReset = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะล้างรายการที่ทำไปทั้งหมด? (Are you sure you want to clear all progress?)')) {
      setCheckedItems({});
    }
  };

  const calculateSectionProgress = (section: Section) => {
    const totalItems = section.subSections.reduce((acc, sub) => acc + sub.items.length, 0);
    const checkedCount = section.subSections.reduce((acc, sub) => {
      return acc + sub.items.filter(item => checkedItems[item.id]).length;
    }, 0);
    return totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);
  };

  const totalProgress = () => {
    const totalAll = PLAYBOOK_DATA.reduce((acc, sec) => 
      acc + sec.subSections.reduce((sAcc, sub) => sAcc + sub.items.length, 0), 0
    );
    const checkedAll = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedAll / totalAll) * 100);
  };

  const activeSection = PLAYBOOK_DATA.find(s => s.id === activeSectionId);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const progress = totalProgress();
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const totalCount = PLAYBOOK_DATA.reduce((acc, sec) => 
      acc + sec.subSections.reduce((sAcc, sub) => sAcc + sub.items.length, 0), 0
    );
    
    const subject = encodeURIComponent(`รายงานความคืบหน้าการฟื้นฟูหลังน้ำลด (Flood Recovery Progress: ${progress}%)`);
    const body = encodeURIComponent(
      `รายงานความคืบหน้าการฟื้นฟูหลังน้ำลด\n` +
      `Flood Recovery Progress Report\n\n` +
      `ความคืบหน้าโดยรวม: ${progress}%\n` +
      `รายการที่ทำเสร็จแล้ว: ${checkedCount} จาก ${totalCount} รายการ\n\n` +
      `คุณสามารถดูรายละเอียดฉบับเต็มได้จากไฟล์ PDF ที่แนบมา (กรุณาบันทึก PDF จากแอปพลิเคชันก่อนส่งอีเมลนี้)\n\n` +
      `สร้างโดย: คู่มือฟื้นฟูหลังน้ำลด (Flood Recovery Playbook)`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10 print:p-0 print:bg-white">
      {/* Print Only Report */}
      <div className="hidden print:block p-8 max-w-3xl mx-auto bg-white">
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-900">รายงานความคืบหน้าการฟื้นฟูหลังน้ำลด</h1>
          <p className="text-slate-500">Flood Recovery Playbook Report</p>
          <p className="text-slate-400 text-sm mt-1">By Kobie Arayatakul</p>
          <div className="mt-4 text-sm text-slate-600">
            วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="mt-2 font-bold text-emerald-600">
            ความคืบหน้า: {totalProgress()}%
          </div>
        </div>

        <div className="space-y-8">
          {PLAYBOOK_DATA.map((section) => (
            <div key={section.id} className="break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className={cn("w-2 h-6 rounded-full", section.color.replace('text-', 'bg-'))}/>
                {section.title}
              </h2>
              <div className="space-y-4 pl-4">
                {section.subSections.map((sub, subIdx) => (
                  <div key={subIdx}>
                    <h3 className="font-semibold text-slate-700 mb-2 text-sm">{sub.title}</h3>
                    <ul className="space-y-2">
                      {sub.items.map((item) => {
                        const isChecked = !!checkedItems[item.id];
                        return (
                          <li key={item.id} className="flex items-start gap-3 text-sm">
                            <div className={cn(
                              "w-5 h-5 border rounded flex items-center justify-center shrink-0 mt-0.5",
                              isChecked ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300"
                            )}>
                              {isChecked && <span className="text-xs">✓</span>}
                            </div>
                            <span className={cn(
                              isChecked ? "text-slate-600" : "text-slate-900",
                              item.isWarning && !isChecked ? "text-red-600 font-bold" : ""
                            )}>
                              {item.text} {item.isWarning && !isChecked && "(ระวังอันตราย!)"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t text-center text-xs text-slate-400">
          เอกสารนี้สร้างจากแอปพลิเคชันคู่มือฟื้นฟูหลังน้ำลด
        </div>
      </div>

      {/* Screen View */}
      <div className="print:hidden">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-xl text-slate-900 leading-none">คู่มือฟื้นฟู</h1>
              <p className="text-xs text-slate-500 mt-1">Flood Recovery Playbook</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{totalProgress()}% เสร็จสิ้น (Done)</span>
              <Progress value={totalProgress()} className="w-24 h-2 mt-1" />
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-4 space-y-6">
          
          {/* Intro Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50" />
            <CardContent className="p-5 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="max-w-2xl">
                  <h2 className="font-bold text-blue-900 text-lg mb-2">เริ่มจากตรงไหนดี? (Where to start?)</h2>
                  <p className="text-sm text-blue-800 leading-relaxed mb-4 md:mb-0">
                    ทำตามเช็กลิสต์ด้านล่างทีละขั้นตอน เพื่อความปลอดภัยและรักษาสิทธิ์การเยียวยาของคุณ
                    <br/><span className="opacity-75">(Follow the checklist below step-by-step for safety and to secure your rights to aid.)</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                   <a href="tel:1323" className="flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-2 rounded-lg text-slate-700 border shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
                     <Phone className="w-3.5 h-3.5 text-pink-500" /> สายด่วนสุขภาพจิต (Mental Health) 1323
                   </a>
                     <Button 
                      variant="outline" 
                      size="sm"
                      className="h-auto py-2 px-3 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 border-slate-200 shadow-sm"
                      onClick={() => setShowGuide(true)}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      คู่มือทำบัญชีของเสียหาย
                   </Button>
                   <Button 
                      variant="outline" 
                      size="sm"
                      className="h-auto py-2 px-3 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 border-slate-200 shadow-sm"
                      onClick={handlePrint}
                    >
                      <Printer className="w-3.5 h-3.5 mr-1.5" />
                      พิมพ์ / บันทึก PDF (Print/Save)
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Section List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายการสิ่งที่ต้องทำ (Checklist)</h2>
            <span className="text-xs text-slate-400">{Object.values(checkedItems).filter(Boolean).length} รายการที่ทำแล้ว (Items done)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLAYBOOK_DATA.map(section => (
              <SectionCard 
                key={section.id} 
                section={section} 
                onClick={() => setActiveSectionId(section.id)}
                progress={calculateSectionProgress(section)}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8 pb-8">
            <Button 
              variant="ghost" 
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              ล้างข้อมูลทั้งหมด (Reset All Progress)
            </Button>
          </div>
        </div>
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeSection && (
          <ChecklistDetail 
            section={activeSection} 
            checkedItems={checkedItems}
            onSave={handleSave}
            onCancel={() => setActiveSectionId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
               <h2 className="font-bold text-lg">คู่มือทำบัญชีทรัพย์สินเสียหาย</h2>
               <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)}>
                 ปิด (Close)
               </Button>
            </div>
            <InventoryGuide />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}