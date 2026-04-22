## Vercel + Supabase Deploy

โปรเจกต์นี้ถูกปรับให้พร้อม deploy โดยใช้ `Next.js on Vercel` และ `Supabase Postgres + REST`

### 1. สร้างตารางใน Supabase

1. เปิด Supabase project
2. ไปที่ `SQL Editor`
3. รันไฟล์ [schema.sql](/Users/witthirasag./Documents/Codex/2026-04-21-jvk-sw-case-management-5-google/supabase/schema.sql)

หลังรันเสร็จ ระบบจะมีบัญชีเริ่มต้นให้:

- `username`: `admin`
- `password`: `ChangeMe123!`

แนะนำให้ล็อกอินครั้งแรกแล้วเปลี่ยนรหัสผ่านทันทีในหน้า `User Access`

### 2. เตรียม Environment Variables

ใส่ค่าต่อไปนี้ทั้งใน local `.env.local` และใน Vercel Project Settings

```env
APP_URL=https://your-vercel-domain.vercel.app
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SHEETS_SHEET_NAME=Information Case
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
```

### 3. Authentication ของระบบ

ระบบล็อกอินหลักของเว็บใช้ `username/password` จากตาราง `app_users` แล้ว  
ดังนั้นไม่จำเป็นต้องใช้ Google OAuth สำหรับการเข้าสู่ระบบอีก

Google OAuth ด้านล่างนี้ใช้เฉพาะกรณีที่ต้องการ `เชื่อม Google Sheets` จากหน้า `Case Entry`

### 4. ตั้งค่า Google OAuth สำหรับ Google Sheets (ถ้าจะใช้)

เพิ่ม redirect URI สำหรับ production:

```text
https://your-vercel-domain.vercel.app/api/google-oauth/callback
```

และสำหรับ local:

```text
http://localhost:3000/api/google-oauth/callback
```

### 5. Deploy ไปที่ Vercel

1. push โค้ดขึ้น GitHub
2. import repo นี้ใน Vercel
3. ใส่ env ทั้งหมดใน Vercel
4. deploy

### 6. หมายเหตุสำคัญ

- ระบบนี้ใช้ `SUPABASE_SERVICE_ROLE_KEY` ฝั่ง server เท่านั้น ห้ามใส่ใน client component
- ถ้าต้องการ import/export Google Sheet ใน production ต้องตั้ง OAuth ให้ตรงโดเมน production
- หน้า `Monthly Reports` ยังควรทยอย render เป็น section/tab เพื่อให้ลื่นขึ้นเมื่อข้อมูลเยอะมาก
