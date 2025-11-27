import React, { useState } from 'react';
import { 
  ClipboardList, 
  Camera, 
  AlertTriangle, 
  Home, 
  Calculator, 
  Clock, 
  FileText, 
  CheckCircle2,
  Info,
  FileSpreadsheet,
  Printer,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

export const InventoryGuide = () => {
  const [overviewChecked, setOverviewChecked] = useState<Record<string, boolean>>({});
  const [stepChecked, setStepChecked] = useState<Record<string, boolean>>({});

  const toggleOverview = (id: string) => {
    setOverviewChecked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleStep = (id: string) => {
    setStepChecked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const downloadExcel = () => {
    const headers = ["เลขลำดับ", "ประเภททรัพย์สิน", "รายละเอียด (ยี่ห้อ/รุ่น)", "จำนวน", "สถานที่ (ห้อง/ชั้น)", "ระดับความเสียหาย", "ค่าเสียหายโดยประมาณ", "หมายเหตุ"];
    const csvContent = "\uFEFF" + headers.join(",") + "\n"; // Add BOM for Excel Thai support
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "แบบฟอร์มรายการทรัพย์สินเสียหาย.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printForm = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>แบบฟอร์มรายการทรัพย์สินเสียหาย</title>
            <style>
              body { font-family: 'Sarabun', sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 12px 8px; text-align: left; font-size: 14px; }
              th { background-color: #f3f4f6; font-weight: bold; text-align: center; }
              .header { margin-bottom: 30px; text-align: center; }
              .header h2 { margin: 0 0 10px 0; }
              .info-section { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 20px; }
              .info-item { flex: 1; min-width: 200px; border-bottom: 1px dotted #ccc; padding-bottom: 5px; margin-bottom: 15px; }
              .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&display=swap" rel="stylesheet">
          </head>
          <body>
            <div class="header">
              <h2>แบบฟอร์มรายการทรัพย์สินเสียหาย (Damage Inventory Form)</h2>
              <p>สำหรับผู้ประสบภัยน้ำท่วมเพื่อยื่นเยียวยา/เคลมประกัน</p>
            </div>
            
            <div class="info-section">
               <div class="info-item">ชื่อ-นามสกุล: </div>
               <div class="info-item">เบอร์ติดต่อ: </div>
               <div class="info-item">ที่อยู่: </div>
               <div class="info-item">วันที่สำรวจ: </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">ลำดับ</th>
                  <th style="width: 120px;">ประเภททรัพย์สิน</th>
                  <th>รายละเอียด (ยี่ห้อ/รุ่น/อายุ)</th>
                  <th style="width: 60px;">จำนวน</th>
                  <th style="width: 100px;">สถานที่</th>
                  <th style="width: 120px;">ระดับความเสียหาย</th>
                  <th style="width: 100px;">ค่าเสียหาย (บาท)</th>
                  <th style="width: 150px;">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                ${Array(15).fill(0).map((_, i) => `
                  <tr style="height: 45px;">
                    <td style="text-align: center;">${i+1}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>สร้างจาก: Flood Recovery Playbook</p>
            </div>
            <script>
              setTimeout(() => { window.print(); }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const overviewList = [
    { icon: ClipboardList, title: "1. จดรายการ", desc: "อะไรเสียหายบ้าง? ในบ้าน / นอกบ้าน / เครื่องมือทำกิน" },
    { icon: Camera, title: "2. ถ่ายรูป/เก็บหลักฐาน", desc: "ถ่ายก่อนซ่อม / ก่อนทิ้ง / ก่อนทำความสะอาด" },
    { icon: Calculator, title: "3. ประเมินมูลค่า", desc: "ประมาณค่าใช้จ่ายที่ต้องซ่อมหรือซื้อใหม่" },
    { icon: Clock, title: "4. จดบันทึกเหตุการณ์", desc: "วันที่ เวลา ระดับน้ำ เพื่อยืนยันเหตุการณ์" },
    { icon: FileText, title: "5. เก็บเข้าแฟ้ม", desc: "รวมเอกสารไว้ที่เดียวเพื่อง่ายต่อการติดต่อหน่วยงาน" },
  ];

  const formHeaders = [
    "เลขลำดับ",
    "ประเภททรัพย์สิน (เช่น เครื่องใช้ไฟฟ้า, เฟอร์นิเจอร์)",
    "รายละเอียด (ยี่ห้อ, รุ่น, อายุการใช้งาน)",
    "จำนวน",
    "สถานที่ (ห้อง, ชั้น)",
    "ระดับความเสียหาย",
    "ค่าเสียหายโดยประมาณ",
    "หมายเหตุ"
  ];


  const printGuide = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>คู่มือทำบัญชีทรัพย์สินเสียหาย</title>
            <style>
              body { font-family: 'Sarabun', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6; }
              h1 { font-size: 24px; text-align: center; margin-bottom: 10px; color: #1e40af; }
              h2 { font-size: 18px; color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; }
              h3 { font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
              p, li { font-size: 14px; }
              ul.checklist, ol.checklist { list-style: none; padding-left: 0; }
              ul.checklist li, ol.checklist li { padding-left: 25px; position: relative; margin-bottom: 8px; }
              ul.checklist li::before { content: '☐'; position: absolute; left: 0; font-size: 16px; font-weight: bold; }
              ul { margin-top: 5px; padding-left: 20px; }
              .section { margin-bottom: 20px; }
              .step { margin-bottom: 15px; border-left: 3px solid #cbd5e1; padding-left: 15px; }
              .warning { color: #b91c1c; font-weight: bold; background: #fef2f2; padding: 10px; border-radius: 5px; }
              .example-box { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 5px; margin-top: 10px; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
              .header-desc { text-align: center; color: #64748b; margin-bottom: 40px; }
              .credit { font-weight: bold; color: #1e40af; margin-top: 5px; }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&display=swap" rel="stylesheet">
          </head>
          <body>
            <h1>คู่มือทำ “บัญชีทรัพย์สินเสียหาย” สำหรับผู้ประสบภัย</h1>
            <p class="header-desc">Playbook สำหรับประชาชนเพื่อเก็บข้อมูลความเสียหายอย่างเป็นระบบ ใช้เป็นหลักฐานยื่นเยียวยาและเคลมประกัน</p>
            
            <h2>1. เป้าหมาย</h2>
            <ul class="checklist">
              <li>ช่วยให้เก็บข้อมูลความเสียหายอย่างเป็นระบบตั้งแต่วันแรก</li>
              <li>ใช้เป็นหลักฐานขอรับเงินเยียวยาจากรัฐ / องค์กรท้องถิ่น / ประกันภัย</li>
              <li>ลดปัญหา "จำไม่ได้ / ไม่มีหลักฐาน" เมื่อต้องกรอกเอกสารจริง</li>
            </ul>

            <h2>2. ภาพรวมการทำบัญชี</h2>
            <ol class="checklist">
              <li><strong>จดรายการ:</strong> อะไรเสียหายบ้าง? ในบ้าน / นอกบ้าน</li>
              <li><strong>ถ่ายรูป/เก็บหลักฐาน:</strong> ถ่ายก่อนซ่อม / ก่อนทิ้ง / ก่อนทำความสะอาด</li>
              <li><strong>ประเมินมูลค่า:</strong> ประมาณค่าใช้จ่ายที่ต้องซ่อมหรือซื้อใหม่</li>
              <li><strong>จดบันทึกเหตุการณ์:</strong> วันที่ เวลา ระดับน้ำ เพื่อยืนยันเหตุการณ์</li>
              <li><strong>เก็บเข้าแฟ้ม:</strong> รวมเอกสารไว้ที่เดียวเพื่อง่ายต่อการติดต่อหน่วยงาน</li>
            </ol>

            <h2>3. สิ่งที่ควรเตรียม</h2>
            <ul class="checklist">
              <li>สมุด + ปากกา (จดทันทีหน้างาน)</li>
              <li>โทรศัพท์มือถือ (ถ่ายรูป/วิดีโอ)</li>
              <li>เครื่องคิดเลข</li>
            </ul>

            <h2>4. ขั้นตอนการปฏิบัติ</h2>
            
            <div class="step">
              <h3>ขั้นตอนที่ 1: ความปลอดภัยมาก่อน</h3>
              <p class="warning">⚠️ ระวังอันตราย! ตัดไฟก่อนเข้าพื้นที่ ตรวจสอบรอยร้าวโครงสร้าง หากไม่แน่ใจห้ามเข้าเด็ดขาด</p>
            </div>

            <div class="step">
              <h3>ขั้นตอนที่ 2: ถ่ายรูปสภาพรวม</h3>
              <ul class="checklist">
                <li>ถ่ายด้านนอกให้เห็นระดับคราบน้ำ</li>
                <li>ถ่ายภายในห้องให้เห็นสภาพรวม ความเสียหาย และโคลน</li>
                <li>ตรวจสอบให้รูปมีวันที่ระบุ (Timestamp)</li>
              </ul>
            </div>

            <div class="step">
              <h3>ขั้นตอนที่ 3: จดรายการของเสียหาย</h3>
              <div class="example-box">
                <strong>ตัวอย่างการจด:</strong><br>
                • ทรัพย์สิน: ตู้เย็น 2 ประตู ยี่ห้อ A รุ่น B (อายุ 4 ปี)<br>
                • ความเสียหาย: ใช้งานไม่ได้ (แช่น้ำครึ่งเครื่อง 3 วัน)<br>
                • ค่าเสียหาย: ~9,000 - 12,000 บาท<br>
                • หมายเหตุ: ช่างแจ้งว่าซ่อมไม่คุ้ม
              </div>
            </div>

            <div class="step">
              <h3>ขั้นตอนที่ 4: สำรวจตัวบ้าน</h3>
              <ul class="checklist">
                <li>วัดระดับน้ำสูงสุดและระยะเวลาท่วมขัง</li>
                <li>สำรวจพื้นบวม สีลอก ประตูบวม</li>
                <li>ถ่ายรูปคราบน้ำและรอยร้าวเก็บไว้</li>
              </ul>
            </div>

            <h2>5. ข้อแนะนำสำคัญ</h2>
            <ul class="checklist">
              <li><strong>อย่าทิ้งของทันที:</strong> ถ่ายรูปเก็บหลักฐานก่อนทิ้งเสมอ</li>
              <li><strong>เก็บใบเสร็จ:</strong> ค่าซ่อม ค่าวัสดุ ค่าจ้างแรงงาน เก็บไว้เบิก/ยืนยัน</li>
              <li><strong>เตรียมเอกสาร:</strong> ถ่ายสำเนาบัตรประชาชน ทะเบียนบ้าน หน้าสมุดบัญชี เตรียมไว้หลายๆ ชุด</li>
            </ul>

            <div class="footer">
              <p>สร้างโดย: Flood Recovery Playbook</p>
              <p class="credit">Said by 'Kobie Arayatakul'</p>
            </div>
            <script>
              setTimeout(() => { window.print(); }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 bg-slate-50 min-h-screen pb-20">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-2">
          <ClipboardList className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          คู่มือทำ “บัญชีทรัพย์สินเสียหาย” สำหรับผู้ประสบภัย
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-4">
          Playbook สำหรับประชาชนเพื่อเก็บข้อมูลความเสียหายอย่างเป็นระบบ ใช้เป็นหลักฐานยื่นเยียวยาและเคลมประกัน
        </p>
        <Button 
          variant="outline" 
          className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={printGuide}
        >
          <Printer className="w-4 h-4" />
          พิมพ์คู่มือฉบับเต็ม (PDF)
        </Button>
      </div>

      {/* 1. เป้าหมาย */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
            <CheckCircle2 className="w-6 h-6" />
            1. เป้าหมายของคู่มือนี้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-2">
            <li>ช่วยให้เก็บข้อมูลความเสียหายอย่างเป็นระบบตั้งแต่วันแรก</li>
            <li>ใช้เป็นหลักฐานขอรับเงินเยียวยาจากรัฐ / องค์กรท้องถิ่น</li>
            <li>ใช้ยื่นเคลมประกันบ้าน / ประกันภัยน้ำท่วม</li>
            <li>ใช้เจรจากับหน่วยงานอื่น (เช่น การไฟฟ้าฯ หากเกี่ยวข้อง)</li>
            <li>ลดปัญหา "จำไม่ได้ / ไม่มีหลักฐาน" เมื่อต้องกรอกเอกสารจริง</li>
          </ul>
        </CardContent>
      </Card>

      {/* 2. ภาพรวม - Infographic Style */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 pl-2 border-l-4 border-blue-500">
          2. ภาพรวมการทำบัญชี (Infographic)
        </h2>
        
        <div className="relative py-4">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-blue-100 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {overviewList.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-50 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300 relative">
                   <item.icon className="w-8 h-8 text-blue-500" />
                   <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold border-2 border-white">
                     {idx + 1}
                   </div>
                </div>
                
                {/* Content Card */}
                <div className="bg-white p-3 rounded-xl border shadow-sm w-full h-full min-h-[120px] hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-slate-900 mb-1">{item.title.split('. ')[1]}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Connecting Arrow (Mobile) */}
                {idx < overviewList.length - 1 && (
                  <div className="md:hidden text-slate-300 my-2">
                    ▼
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. สิ่งที่ต้องเตรียม */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 pl-2 border-l-4 border-emerald-500">
          3. สิ่งที่ควรเตรียมไว้ตั้งแต่ต้น
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* 3.1 Form Headers & Export */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-lg">3.1 แบบฟอร์มและหัวข้อสำคัญ</CardTitle>
              <CardDescription>หัวข้อที่ควรมีในตารางบัญชีทรัพย์สิน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border flex-1">
                {formHeaders.map((header, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-emerald-500 bg-emerald-500 text-white">
                       <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-slate-700">{header}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 space-y-2">
                <p className="text-xs text-slate-500 text-center mb-2">
                  ดาวน์โหลดแบบฟอร์มเปล่าเพื่อนำไปปริ้นท์หรือกรอกในคอมพิวเตอร์
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 text-green-700"
                    onClick={downloadExcel}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel (.csv)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-700"
                    onClick={printForm}
                  >
                    <Printer className="w-4 h-4" />
                    พิมพ์ PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3.2 Tools */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-lg">3.2 อุปกรณ์ช่วยเก็บข้อมูล</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3 p-2 rounded hover:bg-slate-50">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block">สมุด + ปากกา</span>
                    <span className="text-sm text-slate-500">สำคัญมาก! จดทันทีหน้างาน กันลืม</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-2 rounded hover:bg-slate-50">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block">โทรศัพท์มือถือ</span>
                    <span className="text-sm text-slate-500">ถ่ายรูป/วิดีโอ และใช้แอป Note หรือ Google Sheets</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-2 rounded hover:bg-slate-50">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block">เครื่องคิดเลข</span>
                    <span className="text-sm text-slate-500">ช่วยรวมยอดความเสียหายเบื้องต้น</span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. ขั้นตอนทีละข้อ */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 pl-2 border-l-4 border-orange-500">
          4. ขั้นตอนการปฏิบัติ (Step-by-Step)
        </h2>
        
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">1</div>
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-lg text-slate-900">ความปลอดภัยมาก่อน</h3>
              <Alert variant="destructive" className="mb-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>ระวังอันตราย!</AlertTitle>
                <AlertDescription>
                  ตัดไฟก่อนเข้าพื้นที่ ตรวจสอบรอยร้าวโครงสร้าง หากไม่แน่ใจห้ามเข้าเด็ดขาด
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                {[
                   { id: "st1_1", text: "ตัดไฟที่เมนสวิตช์ก่อนเข้าพื้นที่ (ถ้าทำได้ปลอดภัย)" },
                   { id: "st1_2", text: "สวมรองเท้าบูทและถุงมือยางป้องกันไฟรั่ว/ของมีคม" },
                   { id: "st1_3", text: "สังเกตรอยร้าวที่เสาหรือคาน ก่อนเดินเข้าตัวบ้าน" }
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => toggleStep(item.id)}>
                    <Checkbox id={item.id} checked={!!stepChecked[item.id]} onCheckedChange={() => toggleStep(item.id)} className="mt-1" />
                    <label className={`text-sm cursor-pointer ${stepChecked[item.id] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">2</div>
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-lg text-slate-900">ถ่ายรูปสภาพรวมก่อนเก็บกวาด</h3>
              <div className="space-y-2">
                 {[
                   { id: "st2_1", text: "ถ่ายด้านนอกตัวบ้าน ให้เห็นระดับคราบน้ำบนผนัง/รั้ว" },
                   { id: "st2_2", text: "ถ่ายสภาพภายในห้องทุกห้อง ให้เห็นโคลนและความเสียหายรวม" },
                   { id: "st2_3", text: "ตรวจสอบการตั้งค่ากล้อง ให้มีวันที่/เวลา (Timestamp) บนรูป" }
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => toggleStep(item.id)}>
                    <Checkbox id={item.id} checked={!!stepChecked[item.id]} onCheckedChange={() => toggleStep(item.id)} className="mt-1" />
                    <label className={`text-sm cursor-pointer ${stepChecked[item.id] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">3</div>
            <div className="space-y-2 w-full">
              <h3 className="font-bold text-lg text-slate-900">เดินทีละห้อง จด "รายการของเสียหาย"</h3>
              
              <div className="space-y-2 mb-4">
                 {[
                   { id: "st3_1", text: "เริ่มเดินสำรวจทีละห้อง (เช่น ห้องรับแขก -> ห้องครัว)" },
                   { id: "st3_2", text: "จดชื่อทรัพย์สิน ยี่ห้อ รุ่น และถ่ายรูปของชิ้นนั้นระยะใกล้" },
                   { id: "st3_3", text: "ของชิ้นเล็กจำนวนมาก (เช่น เสื้อผ้า, หนังสือ) ให้กองรวมกันแล้วถ่ายรูปทีเดียว" }
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => toggleStep(item.id)}>
                    <Checkbox id={item.id} checked={!!stepChecked[item.id]} onCheckedChange={() => toggleStep(item.id)} className="mt-1" />
                    <label className={`text-sm cursor-pointer ${stepChecked[item.id] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>

              <Card className="bg-slate-50 border-dashed">
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-slate-700">ตัวอย่างการจด:</p>
                  <div className="text-sm text-slate-600 grid gap-1">
                    <p>• <span className="font-medium">ทรัพย์สิน:</span> ตู้เย็น 2 ประตู ยี่ห้อ A รุ่น B (อายุ 4 ปี)</p>
                    <p>• <span className="font-medium">ความเสียหาย:</span> ใช้งานไม่ได้ (แช่น้ำครึ่งเครื่อง 3 วัน)</p>
                    <p>• <span className="font-medium">ค่าเสียหาย:</span> ~9,000 - 12,000 บาท</p>
                    <p>• <span className="font-medium">หมายเหตุ:</span> ช่างแจ้งว่าซ่อมไม่คุ้ม</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-none w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">4</div>
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-lg text-slate-900">ระบุความเสียหายของ "ตัวบ้าน"</h3>
              <div className="space-y-2">
                 {[
                   { id: "st4_1", text: "วัดระดับน้ำสูงสุดที่ท่วมในตัวบ้าน (เช่น 1.5 เมตร)" },
                   { id: "st4_2", text: "ระบุระยะเวลาที่ท่วมขัง (เช่น 5 วัน)" },
                   { id: "st4_3", text: "สำรวจความเสียหาย: พื้นบวม, สีลอก, ประตูบวมปิดไม่ได้" },
                   { id: "st4_4", text: "ถ่ายรูปคราบน้ำและรอยร้าวตามมุมเสา/ผนังเก็บไว้" }
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => toggleStep(item.id)}>
                    <Checkbox id={item.id} checked={!!stepChecked[item.id]} onCheckedChange={() => toggleStep(item.id)} className="mt-1" />
                    <label className={`text-sm cursor-pointer ${stepChecked[item.id] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ตัวอย่างแบบฟอร์ม */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 pl-2 border-l-4 border-purple-500">
          5. ตัวอย่างโครงแบบฟอร์ม
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 border-collapse min-w-[600px]">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 border">ลำดับ</th>
                <th className="px-4 py-3 border">ทรัพย์สิน</th>
                <th className="px-4 py-3 border">รายละเอียด</th>
                <th className="px-4 py-3 border">จำนวน</th>
                <th className="px-4 py-3 border">ความเสียหาย</th>
                <th className="px-4 py-3 border">ค่าเสียหาย (ประมาณ)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border">1</td>
                <td className="px-4 py-3 border">ตู้เย็น</td>
                <td className="px-4 py-3 border">ยี่ห้อ X รุ่น Y</td>
                <td className="px-4 py-3 border">1</td>
                <td className="px-4 py-3 border">จมน้ำทั้งเครื่อง</td>
                <td className="px-4 py-3 border">8,000</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border">2</td>
                <td className="px-4 py-3 border">เสื้อผ้า</td>
                <td className="px-4 py-3 border">เสื้อยืด/กางเกง</td>
                <td className="px-4 py-3 border">~20 ตัว</td>
                <td className="px-4 py-3 border">เปื้อนโคลนซักไม่ออก</td>
                <td className="px-4 py-3 border">2,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <Button 
            variant="outline" 
            className="justify-center gap-2 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 text-green-700"
            onClick={downloadExcel}
          >
            <FileSpreadsheet className="w-4 h-4" />
            ดาวน์โหลด Excel Template (.csv)
          </Button>
          <Button 
            variant="outline" 
            className="justify-center gap-2 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-700"
            onClick={printForm}
          >
            <Printer className="w-4 h-4" />
            พิมพ์แบบฟอร์มเปล่า (PDF)
          </Button>
        </div>
      </section>

      {/* 6. ข้อแนะนำสำคัญ */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <Info className="w-5 h-5" /> ข้อแนะนำสำคัญ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-yellow-900">
          <p><strong>1. อย่าทิ้งของทันที:</strong> ถ่ายรูปเก็บหลักฐานก่อนทิ้งเสมอ</p>
          <p><strong>2. เก็บใบเสร็จ:</strong> ค่าซ่อม ค่าวัสดุ ค่าจ้างแรงงาน เก็บไว้เบิก/ยืนยัน</p>
          <p><strong>3. เตรียมเอกสาร:</strong> ถ่ายสำเนาบัตรประชาชน ทะเบียนบ้าน หน้าสมุดบัญชี เตรียมไว้หลายๆ ชุด</p>
        </CardContent>
      </Card>

    </div>
  );
};