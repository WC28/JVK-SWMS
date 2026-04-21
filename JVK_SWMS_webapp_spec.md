# JVK Social Work Management System (SWMS) Web App Spec

## 1. เป้าหมายระบบ

พัฒนา `web app` สำหรับทีมสังคมสงเคราะห์ JVK โดยใช้หัวข้อข้อมูลหลักเดียวคือ `Information Case` เพื่อให้สามารถ:

- บันทึกและติดตามข้อมูลเคสในระบบเดียว
- ดูภาพรวมงานผ่าน `dashboard`
- ดูสถิติรายเดือน
- แยกดูสถิติระดับ `กลุ่มงาน` และ `รายนักสังคมสงเคราะห์`
- บันทึกหรือส่งออก dashboard/report เป็นไฟล์ `PNG`

## 2. โครงสร้างหน้าหลักของระบบ

ระบบแบ่งเป็น 4 หน้าใช้งานหลัก

### 2.1 หน้า `Case Entry`

ใช้สำหรับบันทึกและแก้ไขข้อมูลเคสทั้งหมดจากหัวข้อ `Information Case`

ฟังก์ชันหลัก:

- เพิ่มเคสใหม่
- แก้ไขข้อมูลเคส
- ค้นหาเคส
- filter ตามเดือน, ปี, SW, สถานะ, intake, priority, พื้นที่, MD
- เรียงลำดับตาม consult date / deadline / status
- แสดงสถานะ `Late` อัตโนมัติ
- แสดงเตือน `เข้าตึกครบ 5 วันทำการ` หรือ `ยังไม่ครบ`
- รองรับ checkbox, dropdown, date picker, text area

### 2.2 หน้า `Dashboard ภาพรวมกลุ่มงาน`

ใช้สรุปสถิติรวมแบบเดียวกับภาพตัวอย่าง KPI Dashboard

บล็อกข้อมูลหลัก:

- Total cases
- Total Male
- Total Female
- In Progress
- D/C
- LATE
- WAIT D/C
- Total OPD
- Total IPD
- Total ER
- Total OPD เด็ก
- นิติจิตเวช OPD
- นิติจิตเวช IPD

ตาราง/กราฟที่ควรมี:

- Total Intake Cases แยก Male / Female / Total
- สถิติรายเดือนแบ่งตามกลุ่มวัย + เพศ + intake
- สรุป success rate รายเดือน
- Top ปัญหา/เรื่องที่ส่งปรึกษา
- สถิติพื้นที่/จังหวัด

### 2.3 หน้า `Dashboard รายนักสังคมสงเคราะห์`

เลือกดูทีละคนหรือดูรวมหลายคน

ตัวกรอง:

- เดือน
- ปี
- SW Name

บล็อกข้อมูลหลักต่อคน:

- Total cases
- In Progress
- LATE
- WAIT D/C
- D/C
- Homeward
- OPD
- IPD
- ER
- OPD เด็ก

ตาราง/รายงานต่อคน:

- Top 5 ผู้ป่วยค้างวอร์ด/นอนเรือนาน
- Top 5 ปัญหา/พื้นที่/Re-consult/ค้างวอร์ด
- สถิติแยกตึก
- สถิติแยกพื้นที่
- สถิติแยกปัญหา

### 2.4 หน้า `Monthly Reports / Export`

ใช้เก็บ snapshot รายเดือน และ export ออกเป็นภาพ

ความสามารถ:

- เลือกเดือน/ปี
- กด `Generate Monthly Snapshot`
- บันทึกค่ารายงานของเดือนนั้นไว้เป็นประวัติ
- export dashboard เป็น `PNG`
- export dashboard รายกลุ่มงาน
- export dashboard ราย SW
- ตั้งชื่อไฟล์อัตโนมัติ เช่น:
  - `JVK-SWMS-dashboard-team-2026-02.png`
  - `JVK-SWMS-dashboard-khun-siriporn-2026-02.png`

## 3. โครงสร้างข้อมูลหลัก: Information Case

ตารางหลักชื่อ `information_cases`

### 3.1 คอลัมน์ข้อมูล

| Column | Field | Type | หมายเหตุ |
| --- | --- | --- | --- |
| A | case_no | number/text | เลขลำดับ |
| B | is_done | boolean | checkbox |
| C | problem_social_list | enum | dropdown |
| D | priority | enum | Low, Medium, High |
| E | status | enum | In progress, D/C, LATE, WAIT D/C |
| F | consult_date | date | วันที่รับปรึกษา |
| G | deadline | date | คำนวณอัตโนมัติจาก consult date |
| H | ward_due_date | date | วันที่ควรเข้าตึกให้ครบภายใน 5 วันทำการ |
| I | sw_name | enum | รายชื่อนักสังคม 8 ท่าน |
| J | patient_name | text | ชื่อผู้ป่วย |
| K | intake | enum | OPD, IPD, OPD เด็ก, ER, นิติจิตเวช OPD, นิติจิตเวช IPD |
| L | intake_no | text | เลขที่/ลำดับ |
| M | sex | enum | Male, Female |
| N | admit_date | date | วันที่ admit |
| O | age | number | อายุ |
| P | hn | text | HN |
| Q | dx | text | Diagnosis |
| R | ward | enum | รายการตึก |
| S | patient_name_copy | text | ดึงจาก J |
| T | sw_name_copy | text | ดึงจาก I |
| U | area | enum | อำเภอ/จังหวัดตามรายการ |
| V | md_name | enum | รายชื่อแพทย์ |
| W | intervention_plan | multi-enum | เลือกได้หลายค่า |
| X | dc_date | date | D/C Date |
| Y | is_dc_done | boolean | checkbox |
| Z | followup_date | date | F/U Date |
| AA | is_fu_done | boolean | checkbox |
| AB | note | text | บันทึกเพิ่มเติม |

## 4. Logic สำคัญของระบบ

### 4.1 Deadline

`deadline = consult_date + 5 วันทำการ`

เงื่อนไข:

- นับเฉพาะวันจันทร์-ศุกร์
- ไม่นับเสาร์-อาทิตย์
- ไม่นับวันหยุดราชการไทย

ตัวอย่าง:

- Consult Date = `2026-02-21`
- Deadline ต้องคำนวณตามปฏิทินวันทำการไทย

หมายเหตุ:

- ใน web app ควรมีตาราง `thai_holidays` แยกไว้เพื่อใช้คำนวณอย่างถูกต้อง

### 4.2 Late Status

ระบบควรตั้งสถานะ `LATE` อัตโนมัติเมื่อ:

- วันนี้เกิน `deadline`
- และสถานะยังไม่เป็น `D/C`
- และงานยังไม่ complete

### 4.3 คัดแยกช่วงอายุ

ใช้กับรายงาน Monthly Breakdown:

- 0-5 ปี = กลุ่มเด็กปฐมวัย
- 6-14 ปี = กลุ่มเด็กวัยเรียน
- 15-21 ปี = กลุ่มวัยรุ่น
- 22-59 ปี = กลุ่มวัยทำงาน
- 60+ ปี = กลุ่มผู้สูงอายุ

### 4.4 Success Rate รายเดือน

สูตรแนะนำ:

`success rate = (จำนวนเคส D/C ภายในเดือน / จำนวนเคสทั้งหมดของ SW ในเดือน) x 100`

หรือถ้าทีมต้องการนับจากเคสปิดจริงเท่านั้น:

`success rate = (จำนวน D/C / (D/C + ค้างวอร์ด)) x 100`

ควรตั้งค่าในระบบได้ว่าองค์กรจะใช้สูตรใด

### 4.5 Top 5 ค้างวอร์ด

คำนวณจาก:

- วันที่ consult ถึงวันที่ปัจจุบัน หรือถึงวันที่ D/C
- เรียงจากจำนวนวันมากไปน้อย
- แสดงเฉพาะเคสที่ยัง active หรือมีเงื่อนไขตามที่ทีมกำหนด

## 5. ตัวกรองกลางของ Dashboard

ทุก dashboard ควรมี filter กลาง:

- เดือน
- ปี
- ช่วงวันที่
- SW
- Intake
- Status
- Priority
- Ward
- MD
- Area

## 6. รายงานที่ระบบควรรองรับ

### 6.1 รายงานภาพรวมกลุ่มงาน

- KPI Summary
- Total Intake Cases
- Monthly Breakdown by Age / Sex / Intake
- Success Rate รายเดือน
- Top 10 Re-consult
- Top ปัญหา/เรื่อง
- สถิติพื้นที่ในเขต/นอกเขต
- สถิติแยกตึก
- KPI ตามแพทย์ผู้ส่งปรึกษา

### 6.2 รายงานรายนักสังคมสงเคราะห์

- KPI Dashboard ต่อคน
- Top 5 ค้างวอร์ด
- Top 5 ปัญหา
- Top 5 พื้นที่
- Re-consult ต่อคน
- สถิติตึกที่รับผิดชอบ
- สถิติ intake ต่อคน
- success rate ต่อคน

## 7. การบันทึกข้อมูลรายเดือน

มี 2 แนวทาง

### แนวทาง A: ใช้ข้อมูลสดแล้ว filter รายเดือน

ข้อดี:

- ข้อมูลไม่ซ้ำ
- ดูย้อนหลังได้ทันที
- แก้ไขข้อมูลแล้วทุก report อัปเดตตาม

เหมาะกับ:

- งาน operational รายวัน

### แนวทาง B: เก็บ Monthly Snapshot แยก

สร้างตาราง `monthly_snapshots`

ฟิลด์หลัก:

- snapshot_month
- snapshot_year
- snapshot_type
- owner_type
- owner_name
- payload_json
- image_path หรือ image_url
- created_at

ข้อดี:

- เก็บหลักฐานรายงานของแต่ละเดือน
- ใช้ส่งผู้บริหารได้
- export PNG แล้วเก็บประวัติได้

ข้อแนะนำ:

- ระบบจริงควรมีทั้ง 2 แบบ
- ใช้ข้อมูลสดสำหรับ dashboard
- ใช้ snapshot สำหรับเอกสารรายเดือนที่ต้องการเก็บเป็นหลักฐาน

## 8. การ Export PNG

รองรับ export 3 ระดับ

- Export ภาพรวมกลุ่มงาน
- Export รายงานราย SW
- Export ตารางเฉพาะส่วน เช่น Top 5, Summary, Monthly Breakdown

ข้อเสนอทางเทคนิค:

- render dashboard เป็น component
- ใช้ HTML-to-image หรือ screenshot service
- ตั้งขนาดภาพมาตรฐาน เช่น 1600x900 หรือ A4 landscape

รูปแบบไฟล์:

- PNG พื้นหลังขาว
- ฟอนต์อ่านง่าย
- มีหัวข้อรายงาน + เดือน/ปี + วันเวลาที่ export

## 9. สิทธิ์ผู้ใช้งาน

อย่างน้อยควรมี 3 ระดับ

### Admin

- จัดการ master data
- จัดการผู้ใช้
- ดูทุก dashboard
- export ได้ทุกแบบ

### SW Staff

- เพิ่ม/แก้ไขเคสของตนเอง
- ดู dashboard ของตนเอง
- ดู dashboard กลุ่มงานตามสิทธิ์

### Viewer / Supervisor

- ดูรายงาน
- filter ข้อมูล
- export PNG

## 10. Master Data ที่ต้องมี

- รายชื่อ SW
- รายชื่อแพทย์
- รายชื่อตึก
- รายการ intake
- รายการปัญหา/เรื่อง
- รายการ intervention plan
- รายการพื้นที่/จังหวัด/อำเภอ
- วันหยุดราชการไทย

## 11. โครงสร้างเมนูแนะนำ

- `Case Entry`
- `Case List`
- `Team Dashboard`
- `SW Dashboard`
- `Monthly Reports`
- `Master Data`
- `Settings`

## 12. ข้อเสนอ UX/UI ตามภาพตัวอย่าง

- หน้า dashboard ใช้การ์ด KPI สีชัดเจนแบบเดียวกับตัวอย่าง
- เลือกธีมสีประจำแต่ละ SW ได้
- รองรับภาษาไทยเต็มรูปแบบ
- ใช้ตัวเลขขนาดใหญ่สำหรับ KPI สำคัญ
- ตารางรายงานควรพิมพ์ออกได้ง่าย
- มีปุ่ม `Export PNG` ทุก section สำคัญ

## 13. MVP ที่แนะนำให้ทำก่อน

เฟสแรกควรมี:

1. ระบบบันทึก `Information Case`
2. dashboard ภาพรวมกลุ่มงาน
3. dashboard ราย SW
4. filter รายเดือน
5. export PNG
6. master data พื้นฐาน

## 14. เฟสถัดไป

- monthly snapshot
- login / role permission
- audit log
- แจ้งเตือนเคสใกล้ deadline
- แจ้งเตือนเคส late
- export PDF
- mobile responsive

## 15. ข้อเสนอเทคนิคสำหรับพัฒนาจริง

ถ้าจะทำเป็น web app จริง แนะนำโครงสร้างนี้:

- Frontend: `Next.js`
- UI: `Tailwind CSS`
- Database: `PostgreSQL`
- ORM: `Prisma`
- Chart/Export: `html-to-image` หรือ `dom-to-image`
- Auth: `NextAuth` หรือระบบ login ภายใน

ถ้าต้องการเชื่อมกับ Google Sheet ในช่วงเริ่มต้น:

- ใช้ Google Sheet เป็น data source ชั่วคราว
- แล้ว sync เข้า database ภายหลัง

## 16. สรุปภาพรวม

ระบบ web app นี้ควรมีแกนหลักเป็น `Information Case` เพียงชุดเดียว แล้วใช้ข้อมูลชุดนี้ไปสร้าง:

- หน้าบันทึกข้อมูลเคส
- dashboard ภาพรวมกลุ่มงาน
- dashboard รายนักสังคมสงเคราะห์
- รายงานรายเดือน
- export PNG

แนวทางนี้จะทำให้ระบบใช้งานง่าย, ดูข้อมูลย้อนหลังได้, และสามารถทำรายงานผู้บริหารจากหน้าจอเดียวกันได้
