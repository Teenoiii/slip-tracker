import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  QrCode,
  CalendarClock,
  CreditCard,
  Cloud,
  Terminal,
  ArrowRight,
  Layers,
  Wallet
} from "lucide-react";

const LOADER_CODE_SNIPPET = `// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: magic;
// SLIPTRACKER — ONE-CLICK AUTO-UPDATE LOADER v1.0.0

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/sliptracker-os/slip-tracker/main/scriptable/SlipCore.js";
const fm = FileManager.iCloud();
const dir = fm.joinPath(fm.documentsDirectory(), "SlipTracker");
if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
const cachePath = fm.joinPath(dir, "SlipCore.cache.js");

let code = null;
try {
  const req = new Request(GITHUB_RAW_URL);
  req.timeoutInterval = 4;
  const remote = await req.loadString();
  if (remote && remote.includes("SLIPTRACKER_CORE_ENGINE")) {
    code = remote;
    fm.writeString(cachePath, code);
  }
} catch (_) {}

if (!code && fm.fileExists(cachePath)) code = fm.readString(cachePath);
const AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
const run = new AsyncFn("CTX", code + "\\n;return await runSlipTracker(CTX);");
await run({ inputPayload: args.shortcutParameter || (args.plainTexts && args.plainTexts[0]) });
Script.complete();`;

const PRESET_SLIPS = [
  {
    id: "kbank",
    label: "กสิกรไทย (K PLUS)",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    ocrText:
      "โอนเงินสำเร็จ\n11 มี.ค. 69 14:25 น.\nจาก นาย ธีรภัทร รักดี\nไปยัง บจก. คาเฟ่ อเมซอน\nจำนวนเงิน: 65.00 บาท\nค่าธรรมเนียม: 0.00 บาท",
    qrPayload: "0046000600000101030040220202603111425009988775102TH9104ABCD"
  },
  {
    id: "scb",
    label: "ไทยพาณิชย์ (SCB EASY)",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ocrText:
      "SCB โอนเงินสำเร็จ\n15 เม.ย. 2569 - 09:12\nจาก นาย กิตติพงศ์\nไปยัง บมจ. ซีพี ออลล์ (7-Eleven)\nจำนวนเงิน 1,245.50 บาท",
    qrPayload: "003900060000010103014021720260415SCB9911225102TH91041234"
  },
  {
    id: "ktb",
    label: "กรุงไทย (Krungthai NEXT)",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    ocrText:
      "Krungthai โอนเงินสำเร็จ\n02 พ.ย. 69 18:05 น.\nผู้โอน นาย วรพล\nผู้รับโอน\nนางสาว พิมพ์ชนก สุขใจ\nจำนวนเงิน 3,500.00 บาท",
    qrPayload: "0043000600000101030060217KTB202611021805995102TH"
  },
  {
    id: "sms_ktc",
    label: "SMS บัตรเครดิต KTC",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    ocrText:
      "บัตร KTC x1234 ใช้จ่าย 165.00 บาท ที่ STARBUCKS COFFEE เมื่อ 11/03/69 08:30 น. วงเงินคงเหลือ 45,000.00 บ.",
    qrPayload: ""
  }
];

const BANK_MAP = {
  "002": "กรุงเทพ (BBL)",
  "004": "กสิกรไทย (KBANK)",
  "006": "กรุงไทย (KTB)",
  "011": "ทหารไทยธนชาต (TTB)",
  "014": "ไทยพาณิชย์ (SCB)",
  "025": "กรุงศรีอยุธยา (BAY)"
};

const THAI_MONTHS = {
  "ม.ค.": 0,
  "ก.พ.": 1,
  "มี.ค.": 2,
  "เม.ย.": 3,
  "พ.ค.": 4,
  "มิ.ย.": 5,
  "ก.ค.": 6,
  "ส.ค.": 7,
  "ก.ย.": 8,
  "ต.ค.": 9,
  "พ.ย.": 10,
  "ธ.ค.": 11
};

function parseLivePreview(ocrText, qrPayload) {
  // 1. EMVCo QR Extraction
  let bankName = "ตรวจจับจากข้อความ OCR";
  let refId = "TX-AUTO-HASH";
  const bankMatch = (qrPayload || "").match(/0103(\d{3})/);
  if (bankMatch && BANK_MAP[bankMatch[1]]) {
    bankName = BANK_MAP[bankMatch[1]];
  } else if (/KTC/i.test(ocrText)) {
    bankName = "บัตรเครดิต KTC (SMS)";
  } else if (/CardX/i.test(ocrText)) {
    bankName = "บัตรเครดิต CardX (SMS)";
  }

  const afterBank = (qrPayload || "").indexOf("0103");
  const region = afterBank !== -1 ? qrPayload.substring(afterBank + 7) : qrPayload || "";
  const refMatch = region.match(/02(\d{2})([A-Za-z0-9\-_]{6,40})/);
  if (refMatch) {
    const len = parseInt(refMatch[1], 10);
    refId = refMatch[2].substring(0, len);
  }

  // 2. Auto-Heal Date
  let resolvedDate = "2026-03-11";
  const thDateMatch = (ocrText || "").match(
    /(\d{1,2})\s*(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*(\d{2,4})/
  );
  const slashMatch = (ocrText || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);

  if (thDateMatch) {
    const d = String(thDateMatch[1]).padStart(2, "0");
    const m = String((THAI_MONTHS[thDateMatch[2]] ?? 0) + 1).padStart(2, "0");
    let y = parseInt(thDateMatch[3], 10);
    if (y >= 2400) y -= 543;
    else if (y >= 55 && y <= 99) y = 2500 + y - 543;
    resolvedDate = `${y}-${m}-${d}`;
  } else if (slashMatch) {
    const d = String(slashMatch[1]).padStart(2, "0");
    const m = String(slashMatch[2]).padStart(2, "0");
    let y = parseInt(slashMatch[3], 10);
    if (y >= 2400) y -= 543;
    else if (y >= 55 && y <= 99) y = 2500 + y - 543;
    resolvedDate = `${y}-${m}-${d}`;
  }

  // 3. Amount Extraction
  let amount = 0;
  const amtMatch = (ocrText || "").match(
    /(?:จำนวนเงิน|ยอดโอน|ยอดเงิน|ใช้จ่าย|รูดซื้อ|ชำระ)[:\s]*([0-9,]+(?:\.[0-9]{2})?)/i
  );
  if (amtMatch) {
    amount = parseFloat(amtMatch[1].replace(/,/g, ""));
  }

  // 4. Merchant Cleaning
  let merchant = "ไม่ระบุร้านค้า";
  const smsMerch = (ocrText || "").match(/ที่\s+([A-Za-z0-9ก-๙\s\.\-\(\)]+?)(?:\s+เมื่อ|\s+วันที่|$)/);
  const slipMerch = (ocrText || "").match(/(?:ไปยัง|ผู้รับโอน)\s*\n?\s*([^\n\r]+)/);
  const rawMerchant = (smsMerch && smsMerch[1]) || (slipMerch && slipMerch[1]) || "";
  if (rawMerchant) {
    merchant = rawMerchant
      .replace(/^(?:นาย|นางสาว|นาง|บจก\.|บมจ\.|บริษัท|ร้าน)\s*/i, "")
      .trim();
  }

  return { bankName, refId, resolvedDate, amount, merchant };
}

export default function App() {
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState(PRESET_SLIPS[0].id);
  const [ocrText, setOcrText] = useState(PRESET_SLIPS[0].ocrText);
  const [qrPayload, setQrPayload] = useState(PRESET_SLIPS[0].qrPayload);

  const parsedResult = useMemo(
    () => parseLivePreview(ocrText, qrPayload),
    [ocrText, qrPayload]
  );

  const handleCopyLoader = async () => {
    try {
      await navigator.clipboard.writeText(LOADER_CODE_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      setCopied(true);
    }
  };

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setOcrText(preset.ocrText);
    setQrPayload(preset.qrPayload);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">SlipTracker</span>
              <span className="ml-2 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                iOS Serverless OS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#simulator"
              className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white sm:inline-block"
            >
              ทดลองแกะสลิป
            </a>
            <a
              href="#install"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              <span>ติดตั้งใน 1 คลิก</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Zero Infrastructure Cost • 100% On-Device Privacy • Auto-Update Engine</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              บันทึกรายจ่ายจากสลิปธนาคาร{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                อัตโนมัติบน iPhone
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              เปลี่ยนการสแกนจ่ายและรูดบัตรเครดิตให้กลายเป็นแดชบอร์ดการเงินส่วนตัวแบบเรียลไทม์
              ทำงานผ่าน Apple Shortcuts + Scriptable เก็บข้อมูลลง{" "}
              <span className="text-slate-200 font-medium">iCloud Drive</span> ของคุณเอง 100%
              ไม่ต้องสมัครสมาชิก ไม่เสียค่ารายเดือนถาวร
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Cloud className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. ฟรี 100% ถาวร (Zero Cost)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                ไม่มีเซิร์ฟเวอร์กลางและไม่มีค่าเช่า Database ข้อมูลถูกจัดเก็บใน{" "}
                <code className="text-emerald-300">FileManager.iCloud()</code> ของแต่ละคน
                บันทึก 10,000 สลิปใช้พื้นที่ไม่ถึง 2MB
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. ความเป็นส่วนตัวสูงสุด (PDPA Safe)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                ภาพสลิปและ SMS บัตรเครดิตถูกประมวลผลด้วย On-Device OCR บนเครื่อง iPhone
                ของคุณเอง ไม่มีการส่งข้อมูลการเงินออกไปหาบุคคลที่สาม
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. อัปเดตสมองกลอัตโนมัติ</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                ก๊อปปี้โค้ด <code className="text-purple-300">SlipLoader.js</code> เพียงครั้งเดียว
                เมื่อธนาคารเปลี่ยนหน้าตาสลิปใหม่ ระบบจะดึง <code className="text-purple-300">SlipCore.js</code>{" "}
                เวอร์ชันล่าสุดจาก GitHub ให้ทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Slip Parser Simulator */}
      <section id="simulator" className="border-t border-slate-800/80 bg-slate-900/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Interactive Core Engine Sandbox
              </span>
              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                ทดสอบระบบแกะสลิป & แก้บั๊กปี พ.ศ. แบบเรียลไทม์
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_SLIPS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                    activePreset === preset.id
                      ? preset.badgeColor
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Input Column */}
            <div className="space-y-5 lg:col-span-7">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span>ข้อความจาก Apple Shortcuts OCR / SMS</span>
                  <span className="text-indigo-400">แก้ไขข้อความเพื่อทดสอบได้ทันที</span>
                </label>
                <textarea
                  rows={6}
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 font-mono text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                />

                <label className="mt-4 mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <QrCode className="h-4 w-4 text-emerald-400" />
                  <span>EMVCo QR Code String (Tag 0103XXX + Tag 02 Ref ID)</span>
                </label>
                <input
                  type="text"
                  value={qrPayload}
                  onChange={(e) => setQrPayload(e.target.value)}
                  placeholder="เว้นว่างไว้หากเป็น SMS บัตรเครดิต..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 font-mono text-xs text-emerald-300 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Right Output Column (Simulated iOS Widget & JSON Output) */}
            <div className="space-y-5 lg:col-span-5">
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-indigo-400">
                    SLIPTRACKER EXTRACTED PAYLOAD
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    พร้อมบันทึกเข้า iCloud
                  </span>
                </div>

                <div className="mt-5 flex items-baseline justify-between border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-xs text-slate-400">ร้านค้า / ผู้รับโอน (ตัดคำนำหน้าอัตโนมัติ)</p>
                    <p className="mt-1 text-xl font-bold text-white">{parsedResult.merchant}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">ยอดใช้จ่าย</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                      ฿{parsedResult.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
                    <dt className="flex items-center gap-1.5 text-slate-400">
                      <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                      <span>ธนาคาร / ช่องทาง</span>
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-200">{parsedResult.bankName}</dd>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
                    <dt className="flex items-center gap-1.5 text-slate-400">
                      <CalendarClock className="h-3.5 w-3.5 text-emerald-400" />
                      <span>วันที่ ค.ศ. (Auto-Heal)</span>
                    </dt>
                    <dd className="mt-1 font-mono font-semibold text-emerald-300">
                      {parsedResult.resolvedDate}
                    </dd>
                  </div>

                  <div className="col-span-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
                    <dt className="text-slate-400">รหัสอ้างอิงป้องกันสลิปซ้ำ (Unique Ref ID)</dt>
                    <dd className="mt-1 truncate font-mono text-indigo-300">{parsedResult.refId}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One-Click Installation Section */}
      <section id="install" className="border-t border-slate-800/80 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white">
              วิธีติดตั้งสำหรับเพื่อน (One-Click Setup)
            </h2>
            <p className="mt-3 text-slate-400">
              ทำตาม 3 ขั้นตอนสั้นๆ ครั้งเดียวจบ ระบบจะดูแลและอัปเดตตัวเองอัตโนมัติตลอดไป
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    1
                  </span>
                  <h3 className="font-bold text-white">โหลดแอป Scriptable จาก App Store</h3>
                </div>
                <p className="mt-2 pl-10 text-sm text-slate-400">
                  เปิดแอป Scriptable กดปุ่ม <strong>+</strong> มุมขวาบน แล้วตั้งชื่อสคริปต์ว่า{" "}
                  <code className="text-indigo-300">SlipTracker</code>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    2
                  </span>
                  <h3 className="font-bold text-white">ก๊อปปี้โค้ด SlipLoader ด้านขวามือไปวาง</h3>
                </div>
                <p className="mt-2 pl-10 text-sm text-slate-400">
                  กดปุ่มคัดลอกโค้ด แล้ววางลงในแอป Scriptable กดรัน 1 ครั้งเพื่อให้ระบบสร้างฐานข้อมูลบน iCloud Drive
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    3
                  </span>
                  <h3 className="font-bold text-white">เชื่อมต่อ Apple Shortcuts & วาง Widget</h3>
                </div>
                <p className="mt-2 pl-10 text-sm text-slate-400">
                  สร้าง Shortcut ที่ใช้คำสั่ง <em>Extract Text from Image</em> +{" "}
                  <em>Scan QR/Barcodes</em> แล้วส่งค่าเข้า Scriptable พร้อมเพิ่ม Widget บนหน้าจอโฮม
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span>scriptable/SlipLoader.js</span>
                  </div>
                  <button
                    onClick={handleCopyLoader}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>คัดลอกโค้ดแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>คัดลอกโค้ด Loader</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-slate-300">
                  <code>{LOADER_CODE_SNIPPET}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-medium text-slate-400">
            SlipTracker — iOS Serverless Expense OS (Open-Source MIT License)
          </p>
          <p className="mt-1">
            ออกแบบและพัฒนาเพื่อความอิสระทางการเงิน ความเป็นส่วนตัว 100% และไร้ค่าใช้จ่ายรายเดือนตลอดชีพ
          </p>
        </div>
      </footer>
    </div>
  );
}
