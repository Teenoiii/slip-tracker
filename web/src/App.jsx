import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Download,
  ExternalLink,
  QrCode,
  CalendarClock,
  Landmark,
  Hash,
  Terminal,
  ScanLine,
  Images,
  AppWindow,
  MessageSquare,
  ChevronDown,
  Wallet,
  LayoutGrid
} from "lucide-react";
import loaderSource from "../../scriptable/SlipLoader.js?raw";
import coreSource from "../../scriptable/SlipCore.js?raw";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const LOADER_CODE_SNIPPET = loaderSource;
const SCRIPT_NAME = "SlipDashboard";

const SHORTCUT_LINKS = {
  scanSlip: "https://www.icloud.com/shortcuts/ce111366e93a4cd48e1de3256ba3a02f",
  pickSlip: "https://www.icloud.com/shortcuts/809d3f56b36148dcba8fcaa39267b5f5",
  slipRecord: "https://www.icloud.com/shortcuts/c29d2ed91fba4946b565a73e82690b50",
  slipSMS: "https://www.icloud.com/shortcuts/a93eac4838d94f3d82c6b44d2a3387cd",
  scriptableApp: "https://apps.apple.com/app/scriptable/id1405459188"
};

const LINKS = {
  ...SHORTCUT_LINKS,
  scriptable: SHORTCUT_LINKS.scriptableApp,
  github: "https://github.com/Teenoiii/slip-tracker",
  coreRaw: "https://raw.githubusercontent.com/Teenoiii/slip-tracker/main/scriptable/SlipCore.js"
};

/* The simulator runs the real SlipCore.js engine, so the preview always matches the app. */
const engine = (() => {
  const mod = { exports: {} };
  new Function("module", "exports", coreSource)(mod, mod.exports);
  return mod.exports;
})();

const PRESETS = [
  {
    id: "kbank",
    label: "กสิกรไทย",
    ocrText:
      "โอนเงินสำเร็จ\n11 มี.ค. 69 14:25 น.\nจาก\nนาย ธีรภัทร รักดี\nไปยัง\nบจก. คาเฟ่ อเมซอน\nเลขที่รายการ: 010311142500998877\nจำนวนเงิน: 65.00 บาท",
    qrPayload: "0046000600000101030040220202603111425009988775102TH9104ABCD"
  },
  {
    id: "scb",
    label: "ไทยพาณิชย์",
    ocrText:
      "SCB โอนเงินสำเร็จ\n15 เม.ย. 2569 - 09:12\nจาก นาย กิตติพงศ์\nไปยัง บมจ. ซีพี ออลล์ (7-Eleven)\nจำนวนเงิน 1,245.50 บาท",
    qrPayload: "003900060000010103014021720260415SCB9911225102TH91041234"
  },
  {
    id: "ktb",
    label: "กรุงไทย",
    ocrText:
      "Krungthai โอนเงินสำเร็จ\n02 พ.ย. 69 18:05 น.\nผู้โอน นาย วรพล\nผู้รับโอน\nนางสาว พิมพ์ชนก สุขใจ\nจำนวนเงิน 3,500.00 บาท",
    qrPayload: "0043000600000101030060217KTB202611021805995102TH"
  },
  {
    id: "ktc",
    label: "SMS KTC",
    ocrText:
      "บัตร KTC x1234 ใช้จ่าย 165.00 บาท ที่ STARBUCKS COFFEE เมื่อ 11/03/69 08:30 น. วงเงินคงเหลือ 45,000.00 บ.",
    qrPayload: ""
  }
];

const WIDGET_DEMO = {
  today: 285,
  month: 8420,
  remaining: 6580,
  bars: [420, 0, 960, 310, 1250, 640, 285],
  labels: ["WE", "TH", "FR", "SA", "SU", "MO", "TD"]
};

const AUTOMATION_APPS = ["K PLUS", "SCB EASY", "Krungthai NEXT", "BBL", "ttb touch", "MAKE by KBank"];

const SHORTCUT_TABS = [
  {
    id: "scan",
    title: "ScanSlipToApp",
    caption: "สแกนสลิปล่าสุด",
    icon: ScanLine
  },
  {
    id: "pick",
    title: "PickSlipToApp",
    caption: "เลือกรูปจากอัลบั้ม",
    icon: Images
  },
  {
    id: "auto",
    title: "SlipRecord Automation",
    caption: "ออโต้เมื่อปิดแอปธนาคาร",
    icon: AppWindow
  },
  {
    id: "sms",
    title: "Auto-SMS บัตรเครดิต",
    caption: "บันทึกจาก SMS",
    icon: MessageSquare
  }
];

const FAQS = [
  {
    q: 'สแกนแล้วขึ้นว่า "ไม่พบยอดเงินที่ถูกต้อง"',
    a: "ScanSlipToApp อ่านรูปล่าสุดในอัลบั้ม หากมีภาพถ่ายหน้าจอ (Screenshot) อื่นคั่นเป็นรูปล่าสุดแทนรูปสลิป ระบบจะอ่านภาพนั้นและหายอดเงินไม่เจอ วิธีแก้คือใช้ PickSlipToApp เลือกรูปสลิปโดยตรง หรือบันทึกรูปสลิปใหม่แล้วรันอีกครั้ง"
  },
  {
    q: 'คำสั่งลัดแจ้งว่า "ไม่พบอัลบั้ม Recents" บนเครื่องที่ตั้งเมนูภาษาไทย',
    a: 'อัลบั้มนี้ชื่อ "ล่าสุด" บนเครื่องภาษาไทย ทำให้คำสั่งลัดเวอร์ชันที่กรองด้วยชื่ออัลบั้มหาไม่เจอ ลิงก์ Shortcut ในหน้านี้ถอดตัวกรองชื่ออัลบั้มออกแล้ว จึงใช้ได้ทั้งเครื่องเมนูภาษาไทยและอังกฤษ หากเคยติดตั้งเวอร์ชันเก่า ให้ลบแล้วกดรับลิงก์ใหม่จากหน้านี้'
  },
  {
    q: "เปิดแอปธนาคารดูเฉยๆ แล้วปิด จะบันทึกซ้ำไหม",
    a: "ไม่บันทึกซ้ำ ระบบใช้รหัสอ้างอิงจาก QR (Ref ID) ของแต่ละสลิปเป็นตัวตรวจสอบ หากสลิปใบเดิมเคยถูกบันทึกแล้ว จะแจ้งว่าซ้ำและข้ามไปโดยไม่เพิ่มรายการ หากไม่มี QR ระบบจะสร้างรหัสจากยอด ร้านค้า และเวลาแทน"
  },
  {
    q: "ข้อมูลของฉันถูกส่งไปที่ไหนบ้าง",
    a: "ไม่ถูกส่งไปที่ใดเลย การอ่านข้อความและ QR ทำบนเครื่อง ข้อมูลรายการเก็บเป็นไฟล์ JSON ใน iCloud Drive ของคุณเอง ส่วนที่ดึงจาก GitHub คือโค้ดโปรแกรมเท่านั้น ไม่มีข้อมูลการเงินวิ่งออกไป"
  },
  {
    q: "ถ้าไม่มีอินเทอร์เน็ตจะใช้ได้ไหม",
    a: "ใช้ได้ Loader เก็บโค้ดเวอร์ชันล่าสุดไว้ในเครื่อง ต้องต่อเน็ตแค่ครั้งแรกที่รันเพื่อดาวน์โหลด หลังจากนั้นจะตรวจหาอัปเดตเป็นระยะเมื่อมีสัญญาณ"
  }
];

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

const glass = "border border-white/10 bg-white/[0.04] backdrop-blur-xl";

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {children && <p className="mt-3 text-sm leading-relaxed text-slate-400">{children}</p>}
    </div>
  );
}

function StepHeader({ n, title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-slate-950">
        {n}
      </span>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
  );
}

function LinkButton({ href, children, icon: Icon = ExternalLink }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </a>
  );
}

function OrderedList({ items }) {
  return (
    <ol className="space-y-2.5 text-sm leading-relaxed text-slate-300">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-slate-300">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function formatMoney(n, whole = false) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2
  });
}

/* iOS widget mock matching renderHomeWidget in SlipCore.js */
function WidgetPreview() {
  const max = Math.max(...WIDGET_DEMO.bars);
  const low = WIDGET_DEMO.remaining / 15000 <= 0.15;
  const accent = low ? "#F87171" : "#38BDF8";
  return (
    <div
      className="flex w-full max-w-[360px] gap-3 rounded-[28px] p-4 shadow-2xl shadow-black/60 ring-1 ring-white/10"
      style={{
        background: "linear-gradient(145deg, rgba(30,35,48,0.95), rgba(20,23,32,0.97) 55%, rgba(13,15,20,0.98))"
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[9px] font-semibold tracking-wider text-[#64748B]">EXPENSE TRACKER</span>
        <div className="mt-1.5 flex items-end gap-0.5">
          <span className="pb-0.5 text-sm font-medium text-[#94A3B8]">฿</span>
          <span className="text-[22px] font-bold leading-none text-[#F8FAFC]">{formatMoney(WIDGET_DEMO.today)}</span>
        </div>
        <span className="mt-0.5 text-[8px] font-semibold tracking-wider text-[#475569]">TODAY'S SPENT</span>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[8px] font-semibold tracking-wider text-[#475569]">MONTH</span>
          <span className="text-xs font-semibold text-[#CBD5E1]">฿{formatMoney(WIDGET_DEMO.month)}</span>
        </div>
        <div
          className="mt-auto flex items-center gap-1.5 self-start rounded-full px-2.5 py-1.5"
          style={{ background: "rgba(30,41,59,0.5)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          <span className="text-[8px] font-semibold tracking-wider text-[#64748B]">REMAINING</span>
          <span className="text-[11px] font-bold" style={{ color: accent }}>
            ฿{formatMoney(WIDGET_DEMO.remaining, true)}
          </span>
        </div>
      </div>
      <div className="rounded-[10px] px-3 pt-2.5 pb-2" style={{ background: "rgba(16,19,27,0.6)" }}>
        <span className="text-[8px] font-semibold tracking-wider text-[#64748B]">7-DAY VELOCITY</span>
        <div className="mt-2 flex items-end gap-1">
          {WIDGET_DEMO.bars.map((v, i) => {
            const isToday = i === WIDGET_DEMO.bars.length - 1;
            const h = v > 0 ? Math.max(4, Math.round((v / max) * 56)) : 4;
            const color = isToday ? "#38BDF8" : v > 0 ? "#334155" : "#1E2430";
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="flex h-14 w-3.5 items-end justify-center">
                  <div className="w-2.5 rounded-[3px]" style={{ height: h, background: color }} />
                </div>
                <span
                  className="text-[7px] font-semibold"
                  style={{ color: isToday ? "#38BDF8" : "#64748B" }}
                >
                  {WIDGET_DEMO.labels[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Simulator() {
  const [preset, setPreset] = useState(PRESETS[0].id);
  const [ocrText, setOcrText] = useState(PRESETS[0].ocrText);
  const [qrPayload, setQrPayload] = useState(PRESETS[0].qrPayload);

  const result = useMemo(() => {
    try {
      const tx = engine.parseSlipTransaction({ ocrText, qrPayload });
      return { ok: true, tx };
    } catch (err) {
      return { ok: false, message: String(err && err.message ? err.message : err) };
    }
  }, [ocrText, qrPayload]);

  const choose = (p) => {
    setPreset(p.id);
    setOcrText(p.ocrText);
    setQrPayload(p.qrPayload);
  };

  const tx = result.ok ? result.tx : null;
  const rawYearMatch = ocrText.match(/(?:\d{1,2}\s*(?:[ก-ฮ]\.[ก-ฮ]\.)|\d{1,2}\/\d{1,2}\/)\s*(\d{2,4})/);
  const rawYear = rawYearMatch ? rawYearMatch[1] : null;

  return (
    <section id="simulator" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionTitle eyebrow="Live Sandbox" title="ทดลองแกะสลิปแบบเรียลไทม์">
        กล่องนี้รันเอนจินตัวจริง (SlipCore.js) ในเบราว์เซอร์ของคุณ ข้อความที่พิมพ์ไม่ถูกส่งไปที่ไหน
      </SectionTitle>

      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => choose(p)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              preset === p.id
                ? "border-sky-400 bg-sky-400/15 text-sky-300"
                : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${glass} rounded-2xl p-5`}>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            ข้อความจาก OCR / SMS
          </label>
          <textarea
            rows={7}
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-sm text-slate-200 focus:border-sky-400 focus:outline-none"
          />
          <label className="mt-4 mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <QrCode className="h-4 w-4 text-sky-400" />
            EMVCo QR payload
          </label>
          <input
            value={qrPayload}
            onChange={(e) => setQrPayload(e.target.value)}
            placeholder="เว้นว่างไว้สำหรับ SMS บัตรเครดิต"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-xs text-sky-300 focus:border-sky-400 focus:outline-none"
          />
        </div>

        <div className={`${glass} rounded-2xl p-5`}>
          {!tx ? (
            <p className="text-sm text-red-300">{result.message}</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">ร้านค้า / ผู้รับ (ตัดคำนำหน้าแล้ว)</p>
                  <p className="mt-1 truncate text-lg font-bold text-white">{tx.merchant}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{tx.categoryName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">ยอด</p>
                  <p className="mt-1 text-2xl font-extrabold text-sky-300">
                    ฿{formatMoney(tx.amount)}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <dt className="flex items-center gap-1.5 text-slate-400">
                    <Landmark className="h-3.5 w-3.5" /> ธนาคาร / ช่องทาง
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-200">{tx.bankName}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <dt className="flex items-center gap-1.5 text-slate-400">
                    <CalendarClock className="h-3.5 w-3.5" /> วันที่ (พ.ศ. เป็น ค.ศ.)
                  </dt>
                  <dd className="mt-1 font-mono font-semibold text-slate-200">
                    {rawYear ? `${rawYear} → ` : ""}
                    {tx.dateOnly}
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-3">
                  <dt className="flex items-center gap-1.5 text-slate-400">
                    <Hash className="h-3.5 w-3.5" />
                    Ref ID {tx.hasVerifiedQR ? "(จาก QR)" : "(สร้างจากรายการ ไม่มี QR)"}
                  </dt>
                  <dd className="mt-1 truncate font-mono text-sky-300">{tx.refId}</dd>
                </div>
              </dl>
              {tx.amount <= 0 && (
                <p className="mt-3 text-xs text-amber-300">ไม่พบยอดเงินในข้อความนี้ รายการนี้จะไม่ถูกบันทึก</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Install() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("scan");

  const copyLoader = async () => {
    try {
      await navigator.clipboard.writeText(LOADER_CODE_SNIPPET);
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = LOADER_CODE_SNIPPET;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeTab = SHORTCUT_TABS.find((t) => t.id === tab);

  return (
    <section id="install" className="border-t border-white/5 bg-black/20 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionTitle eyebrow="Setup Guide" title="ติดตั้งใน 4 ขั้นตอน">
          ทำครั้งเดียวจบ ใช้เวลาประมาณ 5 นาที ต้องใช้ iPhone ที่มี iCloud Drive เปิดอยู่
        </SectionTitle>

        {/* Step 1 */}
        <div className={`${glass} mb-6 rounded-2xl p-6`}>
          <StepHeader n={1} title="ติดตั้งแอป Scriptable" />
          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            Scriptable เป็นแอปฟรีที่ใช้รันสคริปต์ JavaScript บน iPhone และเป็นตัวที่เก็บข้อมูลลง iCloud ของคุณ
          </p>
          <LinkButton href={LINKS.scriptable} icon={Download}>
            เปิดใน App Store
          </LinkButton>
        </div>

        {/* Step 2 */}
        <div className={`${glass} mb-6 rounded-2xl p-6`}>
          <StepHeader n={2} title="คัดลอกโค้ด Loader" />
          <OrderedList
            items={[
              "กดปุ่มคัดลอกด้านล่าง",
              "เปิดแอป Scriptable แล้วกดปุ่ม + มุมขวาบนเพื่อสร้างสคริปต์ใหม่",
              <span key="paste">
                วางโค้ด แล้วแตะชื่อสคริปต์ด้านบนเปลี่ยนเป็น{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">{SCRIPT_NAME}</code>{" "}
                (พิมพ์ให้ตรงตัวพิมพ์ใหญ่เล็ก เพราะ Shortcut เรียกด้วยชื่อนี้)
              </span>,
              "กดปุ่ม Play รันหนึ่งรอบ เพื่อให้ระบบดาวน์โหลดเอนจินและสร้างโฟลเดอร์ใน iCloud Drive"
            ]}
          />
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <span className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Terminal className="h-4 w-4 text-sky-400" /> SlipLoader.js
              </span>
              <button
                onClick={copyLoader}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "คัดลอกแล้ว" : "คัดลอกโค้ด"}
              </button>
            </div>
            <pre className="max-h-72 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-300">
              <code>{LOADER_CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`${glass} mb-6 rounded-2xl p-6`}>
          <StepHeader n={3} title="ติดตั้ง Apple Shortcuts และตั้งค่า Automation" />
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SHORTCUT_TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-sky-400 bg-sky-400/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-sky-300" : "text-slate-400"}`} />
                  <p className={`mt-2 text-xs font-semibold ${active ? "text-white" : "text-slate-300"}`}>
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{t.caption}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h4 className="mb-3 font-semibold text-white">
              {activeTab.title} <span className="font-normal text-slate-400">({activeTab.caption})</span>
            </h4>

            {tab === "scan" && (
              <>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  หยิบรูปล่าสุดในอัลบั้ม อ่านข้อความและ QR บนเครื่อง แล้วส่งเข้า {SCRIPT_NAME} เหมาะกับตอนเพิ่งแคปสลิปเสร็จ
                  กดรันจาก Action Button, Back Tap หรือไอคอนบนหน้าจอโฮม
                </p>
                <LinkButton href={SHORTCUT_LINKS.scanSlip}>รับ Shortcut ScanSlipToApp</LinkButton>
              </>
            )}

            {tab === "pick" && (
              <>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  เปิดหน้าเลือกรูปให้คุณเลือกสลิปเอง เหมาะกับสลิปเก่า หรือกรณีที่มีภาพอื่นคั่นอยู่หลังสลิปล่าสุด
                  เลือกได้ทีละหลายรูป
                </p>
                <LinkButton href={SHORTCUT_LINKS.pickSlip}>รับ Shortcut PickSlipToApp</LinkButton>
              </>
            )}

            {tab === "auto" && (
              <>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  ติดตั้งคำสั่งลัด <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">SlipRecord</code>{" "}
                  แล้วผูกกับ Automation ให้ iPhone สแกนและบันทึกสลิปล่าสุดอัตโนมัติทุกครั้งที่คุณปิดแอปธนาคาร
                </p>
                <div className="mb-5">
                  <LinkButton href={SHORTCUT_LINKS.slipRecord}>รับ Shortcut SlipRecord</LinkButton>
                </div>
                <OrderedList
                  items={[
                    "กดปุ่มด้านบนเพื่อเพิ่มคำสั่งลัด SlipRecord เข้าแอป Shortcuts ก่อน",
                    "เปิดแอป Shortcuts แล้วไปที่แท็บ Automation จากนั้นกด + (New Automation)",
                    <span key="app">
                      เลือก App แล้วติ๊กแอปธนาคารที่ใช้: {AUTOMATION_APPS.join(", ")}
                    </span>,
                    'เลือก "Is Closed" (ถูกปิด) และเลือก "Run Immediately" (ทำงานทันที) จากนั้นกด Next',
                    "เลือกคำสั่งลัด SlipRecord ที่เพิ่งติดตั้ง แล้วกด Done"
                  ]}
                />
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  หากเปิดแอปธนาคารดูเฉยๆ แล้วปิด ระบบจะไม่บันทึกซ้ำ เพราะตรวจรหัสอ้างอิง QR ของสลิปที่เคยบันทึกแล้ว
                </p>
              </>
            )}

            {tab === "sms" && (
              <>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  ติดตั้งคำสั่งลัด <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">SlipSMS</code>{" "}
                  เพื่อบันทึกยอดรูดบัตรเครดิต (KTC, CardX, KBANK, ttb, Krungsri) จากข้อความ SMS ที่ธนาคารส่งมาโดยอัตโนมัติ
                </p>
                <div className="mb-5">
                  <LinkButton href={SHORTCUT_LINKS.slipSMS}>รับ Shortcut SlipSMS</LinkButton>
                </div>
                <OrderedList
                  items={[
                    "กดปุ่มด้านบนเพื่อเพิ่มคำสั่งลัด SlipSMS เข้าแอป Shortcuts ก่อน",
                    "เปิดแอป Shortcuts ไปที่แท็บ Automation แล้วกด + เลือก Message",
                    <span key="kw">
                      ที่ Message Contains ใส่คำค้นเช่น{" "}
                      <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">THB</code> หรือ{" "}
                      <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">ใช้จ่าย</code>
                    </span>,
                    'เลือก "Run Immediately" (ทำงานทันที) แล้วกด Next',
                    "เลือกคำสั่งลัด SlipSMS เพื่อส่งข้อความ SMS เข้าไปประมวลผลในระบบ แล้วกด Done"
                  ]}
                />
              </>
            )}
          </div>
        </div>

        {/* Step 4 */}
        <div className={`${glass} rounded-2xl p-6`}>
          <StepHeader n={4} title="เพิ่ม Liquid Glass Widget บนหน้าจอโฮม" />
          <div className="grid items-center gap-6 md:grid-cols-2">
            <OrderedList
              items={[
                "กดค้างที่พื้นที่ว่างบนหน้าจอโฮมจนไอคอนสั่น แล้วกด + มุมซ้ายบน",
                "ค้นหา Scriptable แล้วเลือกขนาด Medium จากนั้นกด Add Widget",
                "แตะ Widget ที่เพิ่งวาง เพื่อเข้าหน้าตั้งค่า",
                <span key="s">
                  Script เลือก <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">{SCRIPT_NAME}</code>
                </span>,
                "When Interacting เลือก Run Script"
              ]}
            />
            <div className="flex justify-center">
              <WidgetPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SectionTitle eyebrow="Troubleshooting" title="คำถามที่พบบ่อย" />
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <div key={f.q} className={`${glass} overflow-hidden rounded-2xl`}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open === i}
            >
              <span className="text-sm font-semibold text-white">{f.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

const PILLARS = [
  {
    icon: Cloud,
    title: "Zero Infrastructure Cost",
    text: "ไม่มีเซิร์ฟเวอร์กลาง ไม่มีค่ารายเดือน ข้อมูลเป็นไฟล์ JSON ใน iCloud Drive ของคุณ 10,000 รายการใช้พื้นที่ไม่ถึง 2MB"
  },
  {
    icon: ShieldCheck,
    title: "100% On-Device Privacy",
    text: "อ่านสลิปและ SMS บนเครื่อง เก็บใน iCloud ส่วนตัว ไม่มีข้อมูลการเงินผ่านเซิร์ฟเวอร์ของเรา"
  },
  {
    icon: RefreshCw,
    title: "Auto-Update Engine",
    text: "คัดลอก Loader ครั้งเดียว ระบบดึงเอนจินเวอร์ชันล่าสุดจาก GitHub และเก็บแคชไว้ใช้ตอนออฟไลน์"
  }
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0D13] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(60% 40% at 15% 0%, rgba(56,189,248,0.10), transparent), radial-gradient(50% 40% at 90% 10%, rgba(99,102,241,0.10), transparent)"
        }}
      />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0D13]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-slate-950">
              <Wallet className="h-4 w-4" />
            </span>
            <span className="font-bold tracking-tight text-white">SlipTracker</span>
          </a>
          <nav className="flex items-center gap-1 text-sm">
            <a href="#simulator" className="hidden rounded-lg px-3 py-2 text-slate-300 hover:text-white sm:block">
              ทดลอง
            </a>
            <a href="#faq" className="hidden rounded-lg px-3 py-2 text-slate-300 hover:text-white sm:block">
              FAQ
            </a>
            <a
              href="#install"
              className="rounded-xl bg-sky-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              ติดตั้ง
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-10" id="top">
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300">
                <LayoutGrid className="h-3.5 w-3.5 text-sky-400" />
                Apple Shortcuts + Scriptable
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                บันทึกรายจ่ายจากสลิป
                <br />
                <span className="text-sky-400">อัตโนมัติบน iPhone</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
                แคปสลิปหรือรูดบัตรเครดิต แล้วให้ iPhone จดให้เอง รองรับสลิปธนาคารไทยและ SMS บัตรเครดิต
                ป้องกันสลิปซ้ำด้วย QR และแปลงปี พ.ศ. ให้ถูกต้อง
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#install"
                  className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  เริ่มติดตั้ง
                </a>
                <a
                  href={LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  ดูโค้ดบน GitHub
                </a>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <WidgetPreview />
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`${glass} rounded-2xl p-5`}>
                  <Icon className="h-5 w-5 text-sky-400" />
                  <h3 className="mt-3 font-bold text-white">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{p.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <Simulator />
        <Install />
        <Faq />
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        SlipTracker, MIT License. ข้อมูลทั้งหมดอยู่ในอุปกรณ์และ iCloud ของคุณเอง
      </footer>
    </div>
  );
}
