# SlipTracker — iOS Serverless Expense OS

ระบบบันทึกรายจ่ายอัตโนมัติจาก **ภาพสลิปโอนเงินธนาคารไทย (Multi-Bank OCR + EMVCo QR)** และ **ข้อความ SMS บัตรเครดิต** สำหรับผู้ใช้ iOS ที่ทำงานผ่าน **Apple Shortcuts + Scriptable** แบบไร้เซิร์ฟเวอร์ (100% Serverless & Zero Infrastructure Cost) พร้อมดีไซน์ **Apple Liquid Glass Widget**

---

## ปรัชญาการออกแบบ (Core Philosophy)

1. **Zero Infrastructure Cost (ฟรี 100% ถาวร):** ไม่มีค่าเช่า Database หรือ Cloud Server ทุกอย่างจัดเก็บเป็นไฟล์ JSON บน `FileManager.iCloud()` ในบัญชี iCloud ส่วนตัวของผู้ใช้แต่ละคน (ข้อมูล 10,000 รายการ ใช้พื้นที่ไม่ถึง 2MB)
2. **100% Privacy & Zero Liability (ปลอดภัยตามมาตรฐาน PDPA):** ข้อมูลสลิปและยอดเงินไม่เคยถูกส่งออกไปยังเซิร์ฟเวอร์ภายนอก การแกะข้อความ (OCR) และการถอดรหัส QR Code ทำงานแบบ On-Device บน iPhone ทั้งหมด
3. **One-Click Distribution & Auto-Update:** ติดตั้งง่ายเพียงคัดลอกโค้ด `SlipLoader.js` ไปวางในแอป Scriptable และตั้งชื่อสคริปต์ว่า **`SlipDashboard`** ครั้งเดียว ระบบจะดึงสมองกลหลัก (`SlipCore.js`) เวอร์ชันล่าสุดจาก GitHub (`Teenoiii/slip-tracker`) มาอัปเดตและทำ Offline Cache ให้อัตโนมัติ

---

## ลิงก์ติดตั้งสำหรับ iPhone (iCloud Shortcuts & Scriptable)

- **แอป Scriptable (App Store):** https://apps.apple.com/app/scriptable/id1405459188
- **1. `ScanSlipToApp` (สแกนสลิปล่าสุดในอัลบั้ม):** https://www.icloud.com/shortcuts/ce111366e93a4cd48e1de3256ba3a02f
- **2. `PickSlipToApp` (เลือกรูปสลิปเองจากอัลบั้ม):** https://www.icloud.com/shortcuts/809d3f56b36148dcba8fcaa39267b5f5
- **3. `SlipRecord` (Automation เมื่อปิดแอปธนาคาร):** https://www.icloud.com/shortcuts/c29d2ed91fba4946b565a73e82690b50
- **4. `SlipSMS` (Automation เมื่อได้รับ SMS บัตรเครดิต):** https://www.icloud.com/shortcuts/a93eac4838d94f3d82c6b44d2a3387cd

---

## ความสามารถเฉพาะทาง (Domain Specifications)

### 1. EMVCo QR Code Payload Parser (มาตรฐานสลิปธนาคารไทย)
- สกัดรหัสธนาคารต้นทางจากซับแท็ก `0103` ตามด้วยรหัสธนาคาร 3 หลัก:
  - `004` = กสิกรไทย (KBANK)
  - `014` = ไทยพาณิชย์ (SCB)
  - `002` = กรุงเทพ (BBL)
  - `006` = กรุงไทย (KTB)
  - `011` = ทหารไทยธนชาต (TTB)
  - `025` = กรุงศรีอยุธยา (BAY)
- สกัดรหัสอ้างอิงธุรกรรม (`Ref ID`) จากแท็ก `02` (Length-prefixed TLV) เพื่อใช้ทำ **Duplicate Slip Prevention** ป้องกันการสแกนสลิปใบเดิมซ้ำ

### 2. Auto-Heal Date Engine (แก้บั๊กปี พ.ศ. บน iOS)
- แก้ปัญหา `new Date()` บน iOS แปลงปี พ.ศ. เพี้ยนข้ามศตวรรษ:
  - ปี พ.ศ. เต็ม 4 หลัก (`2400 <= y <= 2700`) ลบด้วย `543` เป็น ค.ศ. อัตโนมัติ (เช่น `2569 -> 2026`)
  - ปี พ.ศ. ย่อ 2 หลัก (เช่น `69`) แปลงเป็น `2026` อัตโนมัติ
  - รองรับเดือนภาษาไทยทั้งแบบย่อ (`ม.ค.` - `ธ.ค.`) และแบบเต็ม (`มกราคม` - `ธันวาคม`) แปลงเป็น Month Index (`0 - 11`)

### 3. Multi-Bank OCR & Credit Card SMS Extraction
- สกัดยอดเงินจากคีย์เวิร์ด (`จำนวนเงิน`, `ยอดโอน`, `ยอดเงิน`, `ใช้จ่าย`, `รูดซื้อ`, `ชำระ`, `Amount`, `THB`, `฿`, `บาท`) รองรับทั้งหลักพันที่มีจุลภาค (`,`) และทศนิยม 2 ตำแหน่ง
- สกัดชื่อร้านค้าและผู้รับโอน พร้อมตัดคำนำหน้าขยะ (`ไปยัง`, `ผู้รับโอน`, `นาย`, `นางสาว`, `บจก.`, `บมจ.`, `บริษัท`, `ร้าน`) ออกโดยอัตโนมัติ
- รองรับข้อความแจ้งเตือน SMS บัตรเครดิตชั้นนำ (`KTC`, `CardX`, `KBANK-CC`, `TTB`, `BAY`)
- จัดหมวดหมู่รายจ่ายอัตโนมัติ (อาหารและเครื่องดื่ม, ช้อปปิ้ง, เดินทาง, บิลสาธารณูปโภค, บันเทิง)

### 4. Apple Liquid Glass Home Screen Widget
- ออกแบบสำหรับ iOS Medium Widget โทน Frosted Dark Obsidian (`#1E2330` → `#141720` → `#0D0F14`)
- แบ่ง 2 คอลัมน์: ยอดใช้จ่ายวันนี้ (`TODAY'S SPENT`), ยอดสะสมรายเดือน, Capsule แสดงงบคงเหลือ (`REMAINING`), และกราฟแท่งเปรียบเทียบรายจ่าย 7 วันย้อนหลัง (`7-DAY VELOCITY`)

---

## โครงสร้างโปรเจกต์ (Directory Structure)

```text
slip-tracker/
├── package.json
├── .gitignore
├── README.md
├── scriptable/
│   ├── SlipLoader.js      # ตัวดึงโค้ดอัตโนมัติสำหรับสคริปต์ "SlipDashboard" (Auto-Update + iCloud Cache)
│   └── SlipCore.js        # เอนจินหลัก (EMVCo Parser + Date Healer + iCloud DB + Liquid Glass Widget)
├── test/
│   ├── sample_slips.json  # Mock Data สลิปธนาคารไทย 6 แห่ง และ SMS บัตรเครดิต
│   └── test-parser.js     # Automated Unit Test รันผ่าน Node.js (17 Assertions)
└── web/                   # Web Portal, Setup Guide 4 ขั้นตอน & Live Sandbox (Vite + React + Tailwind CSS)
```

---

## วิธีรันและทดสอบระบบ (Quick Start)

### 1. รันชุดทดสอบ Unit Test (Node.js)
```bash
npm test
```

### 2. รันหน้าเว็บ Portal & Interactive Simulator (Local Dev)
```bash
npm run web:install
npm run web:dev
```

### 3. ตั้งค่า Deploy บน Cloudflare Pages
เมื่อเชื่อมต่อ GitHub Repository (`Teenoiii/slip-tracker`) เข้ากับ Cloudflare Pages ให้ตั้งค่าดังนี้:
- **Framework preset:** `Vite`
- **Build command:** `npm run web:install && npm run web:build`
- **Build output directory:** `web/dist`
- **Environment variables:** `NODE_VERSION = 20`
