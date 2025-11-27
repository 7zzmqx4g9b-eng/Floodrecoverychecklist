**Add your own guidelines here**

<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->

Some of the base components you are using may have styling(eg. gap/typography) baked in as defaults.
So make sure you explicitly set any styling information from the guidelines in the generated react to override the defaults.

## Background
ผมกำลังพัฒนาเว็บแอป "Flood Recovery Playbook" สำหรับผู้ประสบภัยน้ำท่วม โดยเน้นการใช้งานบนมือถือและบันทึกข้อมูลลง Local Storage ล่าสุดได้ยกระดับฟีเจอร์ "ระบบบัญชีทรัพย์สินเสียหาย" (Damage Inventory) ให้มีความละเอียดครบถ้วน ทั้งการบันทึกข้อมูลทรัพย์สิน (ยี่ห้อ, อายุ), การประเมินความเสียหาย (ระดับความรุนแรง, สถานะการซ่อม), และสูตรคำนวณมูลค่าสินไหม (มูลค่าปัจจุบัน x % เสียหาย) เพื่อใช้ทำรายงานยื่นเคลมประกันหรือขอความช่วยเหลือ

## Current state
ตอนนี้โค้ดใน `/components/inventory/InventoryManager.tsx` ใช้งานได้สมบูรณ์ตาม Requirement ใหม่แล้ว โดยมีการแก้ไขบั๊ก Uncontrolled Input และปรับสี UI เรียบร้อย ล่าสุดผมได้เข้าไปแก้ไขไฟล์ InventoryManager, Guidelines และ CSS เองเพิ่มเติมเพื่อปรับจูนรายละเอียดสุดท้ายครับ

**Features & Functionality: ระบบ “บัญชีทรัพย์สินเสียหาย” (Damage Asset Inventory System)**  

โครงนี้ออกแบบให้ใช้ได้ทั้งในรูปแบบ  
- ไฟล์ Excel/Google Sheets  
- โปรแกรมเล็ก ๆ / Web App / ระบบภายในองค์กร  

---

## 1. Asset Damage Recording (บันทึกทรัพย์สินเสียหาย)

**1.1 Damage Item Entry Form (ฟอร์มบันทึกรายการเสียหาย)**  
ระบบต้องสามารถบันทึกข้อมูลของแต่ละทรัพย์สินที่เสียหายได้อย่างน้อยดังนี้:

- `รหัสรายการ (Item ID)`  
  - เลขที่/โค้ดสำหรับอ้างอิงรายการแต่ละชิ้น/ชุด  
- `หมวดหมู่ (Category)`  
  - เช่น เครื่องใช้ไฟฟ้า, เฟอร์นิเจอร์, เครื่องมือทำมาหากิน, ยานพาหนะ ฯลฯ  
- `ชื่อทรัพย์สิน (Asset Name)`  
  - เช่น ตู้เย็น 2 ประตู, เตียงไม้ 5 ฟุต, เครื่องตัดหญ้า  
- `รายละเอียดเพิ่มเติม (Description)`  
  - ยี่ห้อ/รุ่น/สี/ขนาด/สเปก เพื่อให้จำแนกชิ้นได้ชัดเจน  
- `จำนวน (Quantity)`  
  - จำนวนชิ้น/ตัว/เครื่องในรายการนั้น  
- `หน่วยนับ (Unit)`  
  - เช่น เครื่อง, ตัว, ชิ้น, ชุด ฯลฯ  

**1.2 Damage Details (รายละเอียดความเสียหาย)**  

- `ประเภทความเสียหาย (Damage Type)`  
  - เช่น น้ำท่วม, ไฟไหม้, ชำรุดจากแรงกระแทก, เสียหายจากโคลน ฯลฯ  
- `ระดับความเสียหาย (Damage Level)`  
  - เล็กน้อย / ปานกลาง / รุนแรง / ใช้งานไม่ได้  
- `คำอธิบายความเสียหาย (Damage Description)`  
  - บรรยายสภาพจริง เช่น แช่น้ำ 3 วัน มอเตอร์ไหม้ สนิมขึ้น ฯลฯ  
- `วันที่เกิดเหตุ (Incident Date)`  
  - วัน/เวลาที่เกิดเหตุหรือวันที่ตรวจพบความเสียหาย  

**1.3 Repair & Usability Status (สถานะการใช้งาน/ซ่อมแซม)**  

- `สถานะการใช้งาน (Usability Status)`  
  - ใช้งานได้ตามปกติ / ใช้งานได้บางส่วน / ใช้งานไม่ได้  
- `สถานะการซ่อมแซม (Repair Status)`  
  - ซ่อมได้ / ซ่อมไม่ได้ / รอประเมิน / ซ่อมแล้ว  
- `ค่าใช้จ่ายประมาณการซ่อม (Estimated Repair Cost)` (ถ้ามี)  
  - ระบุค่าซ่อมต่อหน่วย และค่าซ่อมรวม  

---

## 2. Financial Estimation (การประเมินมูลค่าความเสียหาย)

**2.1 Asset Value Information (ข้อมูลมูลค่าทรัพย์สิน)**  

- `ราคาซื้อเดิมต่อหน่วย (Original Purchase Price)`  
- `ปีที่ซื้อ / วันที่ซื้อ (Purchase Year/Date)`  
- `อายุการใช้งานที่ผ่านไป (Used Lifespan)`  
  - คำนวณอัตโนมัติจากวันที่ซื้อถึงวันที่เกิดเหตุ  
- `อายุการใช้งานที่คาดหวัง (Expected Lifespan)`  
  - เช่น 5 ปี, 10 ปี, 15 ปี ตามประเภททรัพย์สิน  

**2.2 Current Value & Loss Estimation (มูลค่าปัจจุบันและมูลค่าความเสียหาย)**  

- `มูลค่าปัจจุบันโดยประมาณต่อหน่วย (Estimated Current Value/Unit)`  
  - ราคาที่ต้องใช้ซื้อใหม่ในสภาพเทียบเท่าปัจจุบัน หรือราคาตลาดปัจจุบัน  
- `มูลค่าปัจจุบันรวม (Total Estimated Current Value)`  
  - คำนวณอัตโนมัติ = จำนวน × มูลค่าปัจจุบันต่อหน่วย  
- `สัดส่วนการเสียหาย (Damage Percentage)`  
  - เช่น เสียหาย 100% / 80% / 50% ตามระดับความเสียหาย  
- `มูลค่าความเสียหายต่อหน่วย (Damage Value/Unit)`  
  - = มูลค่าปัจจุบันต่อหน่วย × สัดส่วนการเสียหาย  
- `มูลค่าความเสียหายรวม (Total Damage Value)`  
  - = มูลค่าความเสียหายต่อหน่วย × จำนวน  

*(ใน Excel/ระบบ สามารถตั้งสูตรคำนวณอัตโนมัติได้)*  

**2.3 Depreciation (ค่าเสื่อมราคา – ถ้าต้องการแบบละเอียด)**  

- รองรับการคำนวณค่าเสื่อมจาก:  
  - ราคาซื้อเดิม  
  - อายุการใช้งานคาดหวัง  
  - อายุการใช้งานที่ผ่านไป  
- แสดง `มูลค่าคงเหลือหลังหักค่าเสื่อม (Net Book Value)`  
- ใช้สำหรับทำรายงานประกอบการเคลมประกัน/ยื่นเอกสารราชการ/หน่วยงานช่วยเหลือ  

---

## 3. Categorization & Filtering (การจัดหมวดหมู่และการกรองข้อมูล)

**3.1 Category Management (จัดการหมวดหมู่ทรัพย์สิน)**  

- กำหนดหมวดหมู่หลัก เช่น  
  - เครื่องใช้ไฟฟ้า  
  - เฟอร์นิเจอร์  
  - เครื่องมือทำมาหากิน  
  - ยานพาหนะ  
  - วัสดุก่อสร้าง/โครงสร้างบ้าน ฯลฯ  
- เพิ่ม/แก้ไข/ลบหมวดหมู่ได้ เพื่อให้ยืดหยุ่นกับประเภททรัพย์สินแต่ละบ้าน/องค์กร  

**3.2 Filtering & Search (การค้นหา/กรอง)**  

- ค้นหาตาม:  
  - ชื่อทรัพย์สิน  
  - หมวดหมู่  
  - ช่วงมูลค่าความเสียหาย  
  - ระดับความเสียหาย  
  - สถานะซ่อม (ซ่อมได้/ซ่อมไม่ได้/รอประเมิน)  
- กรองรายการเพื่อใช้ในรายงานเฉพาะส่วน เช่น  
  - แสดงเฉพาะ “เครื่องใช้ไฟฟ้าที่เสียหาย 100%”  
  - แสดงเฉพาะ “เครื่องมือทำมาหากินที่ซ่อมไม่ได้”  

---

## 4. Reporting & Summary (รายงานและสรุปผล)

**4.1 Summary by Category (สรุปตามหมวดหมู่)**  

- รายงานสรุปมูลค่าความเสียหายแยกตามหมวด เช่น:  

  | หมวดหมู่            | จำนวนรายการ | จำนวนรวม (หน่วย) | มูลค่าความเสียหายรวม (บาท) |
  |----------------------|-------------|-------------------|-------------------------------|
  | เครื่องใช้ไฟฟ้า      | 10          | 12                | 85,000                        |
  | เฟอร์นิเจอร์        | 7           | 9                 | 40,000                        |
  | เครื่องมือทำมาหากิน | 5           | 5                 | 120,000                       |

- แสดง **ยอดรวมทั้งหมด** ของทรัพย์สินที่เสียหาย  

**4.2 Detailed Item Report (รายงานรายการละเอียด)**  

- รายการแบบเต็มสำหรับใช้แนบยื่นหน่วยงาน/บริษัทประกัน:  
  - หมวดหมู่  
  - ชื่อทรัพย์สิน  
  - จำนวน  
  - ราคาซื้อเดิม / มูลค่าปัจจุบัน  
  - มูลค่าความเสียหายต่อหน่วย  
  - มูลค่าความเสียหายรวม  
  - รายละเอียดสภาพความเสียหาย  
  - รูปถ่าย (ถ้ามี – อ้างอิงเป็นไฟล์แนบ/ลิงก์)  

**4.3 Export & Print (การส่งออกข้อมูล)**  

- รองรับการส่งออกเป็น:  
  - ไฟล์ Excel (`.xlsx`)  
  - ไฟล์ PDF (สำหรับพิมพ์หรือแนบเอกสารอย่างเป็นทางการ)  
- รูปแบบตารางจัดให้เหมาะกับการยื่นต่อ:  
  - หน่วยงานรัฐ/ท้องถิ่น  
  - บริษัทประกันภัย  
  - องค์กรช่วยเหลือ/บริจาค  

---

## 5. User & Workflow Support (รองรับการทำงานของผู้ใช้งาน)

**5.1 User-Friendly Input (ป้อนข้อมูลง่าย ไม่ซับซ้อน)**  

- แบบฟอร์มกรอกข้อมูลชัดเจน แบ่งส่วน:  
  - ข้อมูลพื้นฐานทรัพย์สิน  
  - ข้อมูลความเสียหาย  
  - ข้อมูลมูลค่าและการประเมิน  
- ใช้ Drop-down / ตัวเลือก เพื่อช่วยให้กรอกได้เร็ว และลดการสะกดผิด  
- ตั้งค่าฟิลด์บังคับกรอก (เช่น ชื่อทรัพย์สิน, จำนวน, มูลค่าประมาณการ)  

**5.2 Validation & Error Checking (ตรวจสอบความถูกต้อง)**  

- เตือนถ้า:  
  - กรอกจำนวนเป็น 0 หรือค่าติดลบ  
  - มูลค่าความเสียหายสูงกว่ามูลค่าปัจจุบันมากผิดปกติ  
- ตรวจสอบข้อมูลซ้ำซ้อน เช่น รายการเดียวกันถูกลงหลายครั้ง  

**5.3 Audit & Versioning (ติดตามการแก้ไข – ถ้าต้องการระดับองค์กร)**  

- บันทึกว่าใครเป็นคนเพิ่ม/แก้ไขรายการพร้อมวันเวลา  
- เก็บประวัติการแก้ไขมูลค่า/จำนวน เพื่อความโปร่งใสกรณีตรวจสอบภายหลัง  

---

## 6. Optional: Photo & Document Attachment (แนบรูปและเอกสาร)

**6.1 Photo Evidence (หลักฐานภาพถ่าย)**  

- ช่องสำหรับกรอก “ลิงก์รูปภาพ” หรือ “รหัสไฟล์รูป” ที่จัดเก็บในระบบอื่น/โฟลเดอร์กลาง  
- ใช้เพื่อยืนยันสภาพก่อน–หลังเกิดเหตุ, เปรียบเทียบความเสียหาย  

**6.2 Supporting Documents (เอกสารประกอบ)**  

- อ้างอิงเอกสาร เช่น ใบเสร็จ, ใบเสนอราคาซ่อม, ใบประเมินราคา  
- เก็บเลขที่เอกสาร/วันที่/ผู้ประเมิน เพื่อใช้ประกอบการเคลมประกันหรือยื่นขอความช่วยเหลือ  

---

## 7. ตัวอย่างโครงสร้างตาราง “บัญชีทรัพย์สินเสียหาย”

คุณสามารถใช้เป็นหัวคอลัมน์ใน Excel/Google Sheets ได้ทันที:

| Item ID | หมวดหมู่ | ชื่อทรัพย์สิน | รายละเอียด | จำนวน | หน่วย | ราคาซื้อเดิม/หน่วย | ปีที่ซื้อ | อายุใช้งานแล้ว (ปี) | มูลค่าปัจจุบัน/หน่วย | % ความเสียหาย | มูลค่าความเสียหายรวม | ประเภทความเสียหาย | รายละเอียดความเสียหาย | สถานะซ่อม | หมายเหตุ |
|--------|-----------|----------------|------------|--------|-------|-----------------------|-----------|------------------------|------------------------|-----------------|-------------------------|----------------------|---------------------------|-----------|----------|

---

### สรุป

- ระบบ/ไฟล์ “บัญชีทรัพย์สินเสียหาย” ควรช่วยให้คุณ *บันทึก–ประเมิน–สรุป* ความเสียหายของทรัพย์สินอย่างเป็นระบบ  
- แกนหลักคือ: ข้อมูลทรัพย์สิน, รายละเอียดความเสียหาย, มูลค่าปัจจุบัน และมูลค่าความเสียหายรวม  
- จากนั้นต่อยอดด้วยฟังก์ชันค้นหา, กรอง, รายงาน และส่งออก เพื่อนำไปใช้กับหน่วยงาน/บริษัทประกันได้จริง  

ถ้าคุณต้องการให้ช่วย **ออกแบบหัวตาราง Excel เป็นภาษาอังกฤษ** หรือ **เขียนเป็น Requirement Document ภาษาอังกฤษแบบใช้ส่งให้ทีม IT/นักพัฒนา** บอกได้เลย ผมจะจัดรูปเป็นข้อ ๆ ให้พร้อมใช้งานทันทีครับ
