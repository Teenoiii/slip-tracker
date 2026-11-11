# SlipTracker — iOS Serverless Expense OS 💸📱

ระบบบันทึกรายจ่ายอัตโนมัติจาก **ภาพสลิปโอนเงินธนาคารไทย (Multi-Bank OCR + EMVCo QR)** และ **ข้อความ SMS บัตรเครดิต** สำหรับผู้ใช้ iOS ที่ทำงานผ่าน **Apple Shortcuts + Scriptable** แบบไร้เซิร์ฟเวอร์ (100% Serverless & Zero Infrastructure Cost)

---

## 🌟 ปรัชญาการออกแบบ (Core Philosophy)

1. **Zero Infrastructure Cost (ฟรี 100% ถาวร):** ไม่มีค่าเช่า Database หรือ Cloud Server ทุกอย่างจัดเก็บเป็นไฟล์ JSON บน `FileManager.iCloud()` ในบัญชี iCloud ส่วนตัวของผู้ใช้แต่ละคน (ข้อมูล 10,000 รายการ ใช้พื้นที่ไม่ถึง 2MB)
2. **100% Privacy & Zero Liability (ปลอดภัยตามมาตรฐาน PDPA):** ข้อมูลสลิปและยอดเงินไม่เคยถูกส่งออกไปยังเซิร์ฟเวอร์ภายนอก การแกะข้อความ (OCR) และการถอดรหัส QR Code ทำงานแบบ On-Device บน iPhone ทั้งหมด
3. **One-Click Distribution & Auto-Update:** เพื่อนติดตั้งง่ายที่สุดเพียงก๊อปปี้โค้ด `SlipLoader.js` สั้นๆ ไปวางในแอป Scriptable ครั้งเดียว ระบบจะดึงสมองกลหลัก (`SlipCore.js`) เวอร์ชันล่าสุดจาก GitHub มาอัปเดตและทำ Offline Cache ให้อัตโนมัติ

---

## 🧠 ความสามารถเฉพาะทาง (Domain Specifications)

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

---

## 📁 โครงสร้างโปรเจกต์ (Directory Structure)

```text
slip-tracker/
├── package.json
├── .gitignore
├── README.md
├── scriptable/
│   ├── SlipLoader.js      # ตัวดึงโค้ดอัตโนมัติสำหรับเครื่องเพื่อน (Auto-Update + iCloud Cache)
│   └── SlipCore.js        # เอนจินหลัก (EMVCo Parser + Date Healer + iCloud DB + iOS Widget + UI)
├── test/
│   ├── sample_slips.json  # Mock Data สลิปธนาคารไทย 6 แห่ง และ SMS บัตรเครดิต
│   └── test-parser.js     # Automated Unit Test รันผ่าน Node.js
└── web/                   # Landing Page & Interactive Slip Simulator (Vite + React + Tailwind CSS)
```

---

## 🚀 วิธีรันและทดสอบระบบ (Quick Start)

### 1. รันชุดทดสอบ Unit Test (Node.js)
ทดสอบความแม่นยำของ EMVCo QR Parser, Auto-Heal Date Engine, OCR สลิปทุกธนาคาร และระบบป้องกันสลิปซ้ำ:

```bash
npm test
```

### 2. รันหน้าเว็บ Landing Page & Interactive Simulator
หน้าเว็บสำหรับแจกโค้ดให้เพื่อนทาง Instagram Bio พร้อมกล่องจำลองการแกะสลิปแบบเรียลไทม์:

```bash
npm run web:install
npm run web:dev
```

หรือสั่ง Build สำหรับนำไป Deploy บน GitHub Pages / Vercel / Cloudflare Pages (ฟรี 100%):

```bash
npm run web:build
```
