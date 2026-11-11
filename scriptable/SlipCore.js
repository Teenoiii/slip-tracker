// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: indigo; icon-glyph: wallet;

/**
 * ============================================================================
 * SLIPTRACKER_CORE_ENGINE v1.0.0
 * iOS Serverless Expense OS — Core Engine (Parser + iCloud DB + Widget + UI)
 * ============================================================================
 * รองรับทั้งการรันบนแอป Scriptable (iOS) และการ Import ไปรัน Unit Test บน Node.js
 * ============================================================================
 */

const SLIPTRACKER_VERSION = "1.0.0";

/**
 * แผนผังรหัสธนาคารตามมาตรฐาน EMVCo / BOT (Tag 00 -> Sub-tag 0103XXX)
 */
const THAI_BANK_CODES = {
  "002": { code: "BBL", name: "กรุงเทพ (BBL)", color: "#1e4598" },
  "004": { code: "KBANK", name: "กสิกรไทย (K PLUS)", color: "#138f2d" },
  "006": { code: "KTB", name: "กรุงไทย (Krungthai NEXT)", color: "#00a9e0" },
  "011": { code: "TTB", name: "ทหารไทยธนชาต (ttb touch)", color: "#0050f0" },
  "014": { code: "SCB", name: "ไทยพาณิชย์ (SCB EASY)", color: "#4e2e7f" },
  "022": { code: "CIMB", name: "ซีไอเอ็มบีไทย (CIMB)", color: "#790009" },
  "024": { code: "UOB", name: "ยูโอบี (UOB TMRW)", color: "#0b3370" },
  "025": { code: "BAY", name: "กรุงศรีอยุธยา (KMA)", color: "#fec43b" },
  "030": { code: "GSB", name: "ออมสิน (MyMo)", color: "#eb198d" },
  "034": { code: "BAAC", name: "ธ.ก.ส. (BAAC)", color: "#1b75bc" },
  "067": { code: "TISCO", name: "ทิสโก้ (TISCO)", color: "#005a9c" },
  "069": { code: "KKP", name: "เกียรตินาคินภัทร (KKP)", color: "#594f74" },
  "073": { code: "LHB", name: "แลนด์ แอนด์ เฮ้าส์ (LHB)", color: "#6d6e71" }
};

/**
 * แผนผังเดือนภาษาไทย (ทั้งแบบย่อและแบบเต็ม) -> Month Index (0 - 11)
 */
const THAI_MONTH_MAP = {
  "ม.ค.": 0,
  "มกราคม": 0,
  "มค": 0,
  "ก.พ.": 1,
  "กุมภาพันธ์": 1,
  "กพ": 1,
  "มี.ค.": 2,
  "มีนาคม": 2,
  "มีค": 2,
  "เม.ย.": 3,
  "เมษายน": 3,
  "เมย": 3,
  "พ.ค.": 4,
  "พฤษภาคม": 4,
  "พค": 4,
  "มิ.ย.": 5,
  "มิถุนายน": 5,
  "มิย": 5,
  "ก.ค.": 6,
  "กรกฎาคม": 6,
  "กค": 6,
  "ส.ค.": 7,
  "สิงหาคม": 7,
  "สค": 7,
  "ก.ย.": 8,
  "กันยายน": 8,
  "กย": 8,
  "ต.ค.": 9,
  "ตุลาคม": 9,
  "ตค": 9,
  "พ.ย.": 10,
  "พฤศจิกายน": 10,
  "พย": 10,
  "ธ.ค.": 11,
  "ธันวาคม": 11,
  "ธค": 11
};

const ENGLISH_MONTH_MAP = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11
};

/**
 * ระบบจัดหมวดหมู่อัตโนมัติ (Smart Category Classifier)
 */
const CATEGORY_RULES = [
  {
    id: "food",
    name: "อาหารและเครื่องดื่ม",
    icon: "",
    keywords: [
      "cafe",
      "coffee",
      "starbucks",
      "amazon",
      "คาเฟ่",
      "กาแฟ",
      "ร้านอาหาร",
      "ข้าวมันไก่",
      "ก๋วยเตี๋ยว",
      "ชาบู",
      "สุกี้",
      "mk",
      "kfc",
      "mcdonald",
      "burger",
      "pizza",
      "grabfood",
      "lineman",
      "foodpanda",
      "robinhood",
      "shinkanzen",
      "after you",
      "เต่าบิน",
      "taobin",
      "ส้มตำ",
      "ตามสั่ง",
      "เบเกอรี่",
      "bakery"
    ]
  },
  {
    id: "shopping",
    name: "ช้อปปิ้งและของใช้",
    icon: "",
    keywords: [
      "7-eleven",
      "7-11",
      "cp all",
      "ซีพี ออลล์",
      "shopee",
      "lazada",
      "tiktok",
      "central",
      "เซ็นทรัล",
      "lotus",
      "โลตัส",
      "big c",
      "บิ๊กซี",
      "makro",
      "แม็คโคร",
      "uniqlo",
      "ikea",
      "watsons",
      "boots",
      "eveandboy",
      "donki",
      "tops",
      "ท็อปส์"
    ]
  },
  {
    id: "transport",
    name: "เดินทางและยานพาหนะ",
    icon: "",
    keywords: [
      "grab",
      "bolt",
      "bts",
      "mrt",
      "ทางด่วน",
      "ปตท",
      "ptt",
      "บางจาก",
      "bangchak",
      "shell",
      "เชลล์",
      "caltex",
      "คาลเท็กซ์",
      "การรถไฟ",
      "แอร์พอร์ต",
      "สายการบิน",
      "airasia",
      "nokair",
      "แท็กซี่",
      "วิน"
    ]
  },
  {
    id: "bills",
    name: "บิลและสาธารณูปโภค",
    icon: "",
    keywords: [
      "การไฟฟ้า",
      "กฟน",
      "กฟภ",
      "การประปา",
      "กปน",
      "กปภ",
      "ais",
      "true",
      "dtac",
      "3bb",
      "nt",
      "ค่าเน็ต",
      "ค่าไฟ",
      "ค่าน้ำ",
      "ค่าเช่า",
      "คอนโด",
      "นิติบุคคล",
      "ประกัน",
      "aia",
      "fwd",
      "เมืองไทย"
    ]
  },
  {
    id: "entertainment",
    name: "บันเทิงและไลฟ์สไตล์",
    icon: "",
    keywords: [
      "netflix",
      "spotify",
      "youtube",
      "apple.com/bill",
      "apple",
      "google",
      "steam",
      "major",
      "sf cinema",
      "โรงหนัง",
      "คอนเสิร์ต",
      "เกม",
      "ฟิตเนส",
      "fitness"
    ]
  }
];

/**
 * ============================================================================
 * 1. EMVCo QR CODE PARSER (Thai Bank Slip Verification Standard)
 * ============================================================================
 * โครงสร้าง EMVCo TLV (Tag-Length-Value):
 * - Tag 2 หลัก + Length 2 หลัก + Value ตามความยาว
 * - Tag 00 ของสลิปไทย (Mini-QR Verification) มักบรรจุ Sub-TLV:
 *   - Sub-tag 00: API ID (000001)
 *   - Sub-tag 01: Sending Bank Code 3 หลัก (เช่น 0103004 -> KBANK)
 *   - Sub-tag 02: Transaction Reference ID (เช่น 022020260311889900112233)
 */
function parseTLV(payload) {
  const result = {};
  if (!payload || typeof payload !== "string") return result;

  let index = 0;
  const clean = payload.trim();

  while (index + 4 <= clean.length) {
    const tag = clean.substring(index, index + 2);
    const lenStr = clean.substring(index + 2, index + 4);
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lenStr)) {
      break;
    }
    const len = parseInt(lenStr, 10);
    if (len <= 0 || index + 4 + len > clean.length) {
      break;
    }
    const value = clean.substring(index + 4, index + 4 + len);
    result[tag] = value;
    index += 4 + len;
  }

  return result;
}

function parseEMVCoQR(qrString) {
  if (!qrString || typeof qrString !== "string" || qrString.trim().length < 10) {
    return {
      isValid: false,
      bankCode: null,
      bankShortName: null,
      bankName: null,
      refId: null,
      raw: qrString || ""
    };
  }

  const raw = qrString.trim();
  let bankId = null;
  let refId = null;

  // Step 1: ลองแกะแบบ TLV มาตรฐานจาก Tag 00 (Thai Slip Mini-QR Payload)
  const rootTLV = parseTLV(raw);
  if (rootTLV["00"] && rootTLV["00"].length >= 10) {
    const subTLV = parseTLV(rootTLV["00"]);
    if (subTLV["01"] && /^\d{3}$/.test(subTLV["01"])) {
      bankId = subTLV["01"];
    }
    if (subTLV["02"] && subTLV["02"].length >= 6) {
      refId = subTLV["02"];
    }
  }

  // Step 2: หาก QR เป็นรูปแบบย่อหรือ Concatenated String ให้ใช้ Pattern Matching ตามสเปก EMVCo
  // ค้นหา Tag 0103 ตามด้วยรหัสธนาคาร 3 หลัก
  if (!bankId) {
    const bankMatch = raw.match(/0103(\d{3})/);
    if (bankMatch) {
      bankId = bankMatch[1];
    }
  }

  // ค้นหา Tag 02 ตามด้วยความยาว 2 หลัก (08 - 35 ตัวอักษร) แล้วดึงค่า Ref ID ตามความยาวจริง
  if (!refId) {
    const afterBankIdx = raw.indexOf("0103");
    const searchRegion = afterBankIdx !== -1 ? raw.substring(afterBankIdx + 7) : raw;

    const refMatch = searchRegion.match(/02(\d{2})([A-Za-z0-9\-_]{6,40})/);
    if (refMatch) {
      const declaredLength = parseInt(refMatch[1], 10);
      const candidate = refMatch[2];
      if (declaredLength >= 6 && candidate.length >= declaredLength) {
        refId = candidate.substring(0, declaredLength);
      } else if (candidate.length >= 8) {
        refId = candidate;
      }
    }
  }

  const bankInfo = bankId && THAI_BANK_CODES[bankId] ? THAI_BANK_CODES[bankId] : null;

  return {
    isValid: Boolean(bankId || refId),
    bankNumericCode: bankId,
    bankCode: bankInfo ? bankInfo.code : bankId ? `BANK_${bankId}` : null,
    bankName: bankInfo ? bankInfo.name : bankId ? `ธนาคารรหัส ${bankId}` : null,
    refId: refId || null,
    raw
  };
}

/**
 * ============================================================================
 * 2. AUTO-HEAL DATE ENGINE (แก้อาการปี พ.ศ. 2569 / 69 เพี้ยนบน iOS)
 * ============================================================================
 */
function normalizeThaiYear(rawYear) {
  const y = typeof rawYear === "number" ? rawYear : parseInt(String(rawYear).trim(), 10);
  if (isNaN(y)) return new Date().getFullYear();

  // พ.ศ. 4 หลัก เช่น 2569 -> 2026
  if (y >= 2400 && y <= 2700) {
    return y - 543;
  }

  // ค.ศ. 4 หลัก เช่น 2026 -> 2026
  if (y >= 1970 && y < 2400) {
    return y;
  }

  // ปี 2 หลัก (เช่น 69 จาก พ.ศ. 2569 หรือ 26 จาก ค.ศ. 2026)
  if (y >= 0 && y <= 99) {
    // ปี พ.ศ. ย่อของยุคปัจจุบันอยู่ในช่วง 60 - 99 (พ.ศ. 2560 - 2599 -> ค.ศ. 2017 - 2056)
    if (y >= 55 && y <= 99) {
      return 2500 + y - 543;
    }
    // ปี ค.ศ. ย่อ เช่น 24, 25, 26 -> 2024, 2025, 2026
    return 2000 + y;
  }

  return new Date().getFullYear();
}

function parseThaiDate(text, fallbackDate = null) {
  const defaultDate = fallbackDate ? new Date(fallbackDate) : new Date();
  if (!text || typeof text !== "string") {
    return formatDateResult(defaultDate, false);
  }

  const normalizedText = text.replace(/\s+/g, " ").trim();

  // ดึงเวลา HH:mm(:ss) หากมีในข้อความ
  let hours = defaultDate.getHours();
  let minutes = defaultDate.getMinutes();
  let seconds = 0;

  const timeRegex = /(?:เวลา|เมื่อ|at|-|\s|^)([01]?\d|2[0-3])[:.]([0-5]\d)(?:[:.]([0-5]\d))?\s*(?:น\.|น|AM|PM)?/i;
  const timeMatch = normalizedText.match(timeRegex);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
  }

  // Pattern 1: วันที่พร้อมชื่อเดือนภาษาไทย เช่น "11 มี.ค. 69", "11 มีนาคม 2569", "5 ม.ค. 2026"
  const thaiMonthsPattern = Object.keys(THAI_MONTH_MAP)
    .sort((a, b) => b.length - a.length)
    .map((m) => m.replace(/\./g, "\\."))
    .join("|");

  const thaiDateRegex = new RegExp(
    `(\\d{1,2})\\s*(${thaiMonthsPattern})\\.?\\s*(\\d{2,4})`,
    "i"
  );
  const thaiMatch = normalizedText.match(thaiDateRegex);

  if (thaiMatch) {
    const day = parseInt(thaiMatch[1], 10);
    const rawMonth = thaiMatch[2];
    const monthKey = THAI_MONTH_MAP[rawMonth] !== undefined
      ? rawMonth
      : `${rawMonth}.`;
    const monthIndex = THAI_MONTH_MAP[monthKey] !== undefined ? THAI_MONTH_MAP[monthKey] : 0;
    const yearAD = normalizeThaiYear(thaiMatch[3]);

    const constructed = new Date(yearAD, monthIndex, day, hours, minutes, seconds);
    if (!isNaN(constructed.getTime())) {
      return formatDateResult(constructed, true);
    }
  }

  // Pattern 2: วันที่พร้อมชื่อเดือนภาษาอังกฤษ เช่น "11 Mar 2026", "11 Mar 69"
  const engDateRegex = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i;
  const engMatch = normalizedText.match(engDateRegex);
  if (engMatch) {
    const day = parseInt(engMatch[1], 10);
    const monthIndex = ENGLISH_MONTH_MAP[engMatch[2].toLowerCase().substring(0, 3)];
    const yearAD = normalizeThaiYear(engMatch[3]);
    const constructed = new Date(yearAD, monthIndex, day, hours, minutes, seconds);
    if (!isNaN(constructed.getTime())) {
      return formatDateResult(constructed, true);
    }
  }

  // Pattern 3: วันที่แบบตัวเลขคั่นด้วย / หรือ - เช่น "11/03/2569", "11/03/69", "11-03-2026"
  const numericDateRegex = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/;
  const numMatch = normalizedText.match(numericDateRegex);
  if (numMatch) {
    const day = parseInt(numMatch[1], 10);
    const month = parseInt(numMatch[2], 10) - 1;
    const yearAD = normalizeThaiYear(numMatch[3]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const constructed = new Date(yearAD, month, day, hours, minutes, seconds);
      if (!isNaN(constructed.getTime())) {
        return formatDateResult(constructed, true);
      }
    }
  }

  return formatDateResult(defaultDate, false);
}

function formatDateResult(dateObj, parsedFromText) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  const hh = String(dateObj.getHours()).padStart(2, "0");
  const mm = String(dateObj.getMinutes()).padStart(2, "0");
  const ss = String(dateObj.getSeconds()).padStart(2, "0");

  return {
    date: dateObj,
    iso: `${y}-${m}-${d}T${hh}:${mm}:${ss}`,
    dateOnly: `${y}-${m}-${d}`,
    timeOnly: `${hh}:${mm}`,
    yearAD: y,
    yearBE: y + 543,
    monthIndex: dateObj.getMonth(),
    day: dateObj.getDate(),
    parsedFromText
  };
}

/**
 * ============================================================================
 * 3. MULTI-BANK OCR & CREDIT CARD SMS EXTRACTION ENGINE
 * ============================================================================
 */
function extractAmount(text) {
  if (!text || typeof text !== "string") return 0;

  // ลำดับที่ 1: ค้นหาจาก Keyword ยอดเงินโดยตรง (แม่นยำที่สุดสำหรับสลิปธนาคารและ SMS)
  const keywordPatterns = [
    /(?:จำนวนเงิน|ยอดโอน|ยอดเงิน|จำนวน|ยอดชำระ|ใช้จ่าย|รูดซื้อ|ชำระ|Amount|Total)[:\s]*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.([0-9]{1,2}))?\s*(?:บาท|THB|฿)?/i,
    /(?:THB|฿)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.([0-9]{1,2}))?/i,
    /([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\.([0-9]{2})\s*(?:บาท|THB|฿|บ\.)/i,
    /([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\s*(?:บาท|THB|฿)/i
  ];

  for (const regex of keywordPatterns) {
    const match = text.match(regex);
    if (match) {
      const integerPart = match[1].replace(/,/g, "");
      const decimalPart = match[2] ? match[2].padEnd(2, "0") : "00";
      const val = parseFloat(`${integerPart}.${decimalPart}`);
      if (!isNaN(val) && val > 0 && val < 100000000) {
        return Number(val.toFixed(2));
      }
    }
  }

  // ลำดับที่ 2: กวาดหาตัวเลขทศนิยม 2 ตำแหน่งทั้งหมดในสลิป (ตัดค่าธรรมเนียม 0.00 ออก)
  const decimalMatches = [...text.matchAll(/\b([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\.([0-9]{2})\b/g)];
  for (const m of decimalMatches) {
    const fullNumber = parseFloat(`${m[1].replace(/,/g, "")}.${m[2]}`);
    if (fullNumber > 0 && fullNumber < 100000000) {
      return Number(fullNumber.toFixed(2));
    }
  }

  return 0;
}

function cleanMerchantName(rawName) {
  if (!rawName || typeof rawName !== "string") return "ไม่ระบุร้านค้า";

  let name = rawName
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // ลบคำนำหน้าทางธุรกรรมและคำนำหน้าชื่อบุคคล/นิติบุคคลที่พบบ่อย
  const prefixRegex =
    /^(?:ไปยัง|ผู้รับโอน|ผู้รับเงิน|โอนให้|โอนไปยัง|จ่ายบิล|ชำระเงินให้|ร้านค้า|ชื่อร้าน|ที่|ณ|To|Merchant|Paid to)[:\s]*/i;
  name = name.replace(prefixRegex, "").trim();

  const titleRegex =
    /^(?:นาย|นางสาว|นาง|น\.ส\.|ด\.ช\.|ด\.ญ\.|บจก\.|บมจ\.|หจก\.|บริษัท|ร้าน|MR\.|MRS\.|MS\.|MISS)\s*/i;
  // ลบซ้ำเผื่อกรณีเช่น "ไปยัง นาย สมชาย" หรือ "ไปยัง บจก. ซีพี ออลล์"
  name = name.replace(prefixRegex, "").replace(titleRegex, "").trim();

  // ตัดส่วนท้ายที่เป็นเลขบัญชี รหัสพร้อมเพย์ หรือยอดเงินที่ติดมาในบรรทัดเดียวกัน
  name = name
    .replace(/\s+(?:xxx|XXX|[0-9xX\-]{6,}).*$/, "")
    .replace(/\s+(?:จำนวนเงิน|ยอดเงิน|จำนวน|Amount|THB|บาท).*$/i, "")
    .replace(/\s+จำกัด(?:\s*\(มหาชน\))?$/i, "")
    .trim();

  return name || "ไม่ระบุร้านค้า";
}

function detectBankOrSource(text, qrData) {
  if (qrData && qrData.bankCode) {
    return {
      code: qrData.bankCode,
      name: qrData.bankName,
      channel: "BANK_SLIP"
    };
  }

  const upper = (text || "").toUpperCase();

  // ตรวจสอบ SMS บัตรเครดิตก่อน
  if (
    upper.includes("KTC") ||
    upper.includes("บัตรเครดิต") ||
    upper.includes("CARDX") ||
    upper.includes("บัตรกสิกร") ||
    upper.includes("KBANK-CC") ||
    upper.includes("KRUNGSRI FIRST CHOICE") ||
    upper.includes("บัตรกรุงศรี") ||
    /บัตร\s*x{2,}\d{3,4}/i.test(text) ||
    /CARD\s*ENDING/i.test(upper)
  ) {
    if (upper.includes("KTC")) return { code: "KTC", name: "บัตรเครดิต KTC", channel: "CREDIT_SMS" };
    if (upper.includes("CARDX") || upper.includes("SCB"))
      return { code: "CardX", name: "บัตรเครดิต CardX / SCB", channel: "CREDIT_SMS" };
    if (upper.includes("KBANK") || upper.includes("กสิกร"))
      return { code: "KBANK-CC", name: "บัตรเครดิตกสิกรไทย", channel: "CREDIT_SMS" };
    if (upper.includes("TTB") || upper.includes("ทหารไทย"))
      return { code: "TTB-CC", name: "บัตรเครดิต ttb", channel: "CREDIT_SMS" };
    if (upper.includes("BAY") || upper.includes("กรุงศรี") || upper.includes("KRUNGSRI"))
      return { code: "BAY-CC", name: "บัตรเครดิตกรุงศรี", channel: "CREDIT_SMS" };
    return { code: "CREDIT-CARD", name: "บัตรเครดิต", channel: "CREDIT_SMS" };
  }

  // ตรวจสอบสลิปธนาคารจากข้อความ OCR
  if (upper.includes("K PLUS") || upper.includes("กสิกรไทย") || upper.includes("KASIKORN")) {
    return { code: "KBANK", name: THAI_BANK_CODES["004"].name, channel: "BANK_SLIP" };
  }
  if (upper.includes("SCB") || upper.includes("ไทยพาณิชย์")) {
    return { code: "SCB", name: THAI_BANK_CODES["014"].name, channel: "BANK_SLIP" };
  }
  if (upper.includes("KRUNGTHAI") || upper.includes("กรุงไทย") || upper.includes("KTB")) {
    return { code: "KTB", name: THAI_BANK_CODES["006"].name, channel: "BANK_SLIP" };
  }
  if (upper.includes("BBL") || upper.includes("กรุงเทพ") || upper.includes("BANGKOK BANK")) {
    return { code: "BBL", name: THAI_BANK_CODES["002"].name, channel: "BANK_SLIP" };
  }
  if (upper.includes("TTB") || upper.includes("ทหารไทยธนชาต")) {
    return { code: "TTB", name: THAI_BANK_CODES["011"].name, channel: "BANK_SLIP" };
  }
  if (upper.includes("KMA") || upper.includes("กรุงศรี") || upper.includes("AYUDHYA")) {
    return { code: "BAY", name: THAI_BANK_CODES["025"].name, channel: "BANK_SLIP" };
  }
  if (upper.includes("MYMO") || upper.includes("ออมสิน")) {
    return { code: "GSB", name: THAI_BANK_CODES["030"].name, channel: "BANK_SLIP" };
  }

  return { code: "UNKNOWN", name: "รายการทั่วไป", channel: "MANUAL_OR_OCR" };
}

function extractMerchant(text, channel) {
  if (!text || typeof text !== "string") return "ไม่ระบุร้านค้า";

  // กรณีเป็น SMS บัตรเครดิต
  if (channel === "CREDIT_SMS") {
    const smsPatterns = [
      /(?:ที่|ณ|ร้าน|Merchant|at)\s+([A-Za-z0-9ก-๙\s\.\-\_\*\/&']{2,45}?)(?:\s+(?:จำนวน|ยอด|เป็นเงิน|วันที่|เมื่อ|\d{1,2}[\/\-]\d{1,2}|วงเงิน|คงเหลือ)|$)/i,
      /(?:รูดซื้อ|ใช้จ่าย|ชำระ)\s+(?:จำนวน\s*)?[0-9,]+\.?[0-9]*\s*(?:บาท|THB|บ\.)\s*(?:ที่|ณ)?\s*([A-Za-z0-9ก-๙\s\.\-\_\*\/&']{2,40})/i,
      /\b(?:THB|฿)\s*[0-9,]+\.?[0-9]*\s+(?:at|@)\s+([A-Za-z0-9ก-๙\s\.\-\_\*\/&']{2,40})/i
    ];

    for (const regex of smsPatterns) {
      const m = text.match(regex);
      if (m && m[1]) {
        const cleaned = cleanMerchantName(m[1]);
        if (cleaned && cleaned !== "ไม่ระบุร้านค้า") return cleaned;
      }
    }
  }

  // กรณีสลิปโอนเงิน แยกวิเคราะห์ทีละบรรทัดเพื่อความแม่นยำสูงสุด
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const receiverCueRegex = /^(?:ไปยัง|ผู้รับโอน|ผู้รับเงิน|โอนให้|ถึง|จ่ายบิล|ชำระให้|To|Merchant)$/i;
  const inlineReceiverRegex =
    /(?:ไปยัง|ผู้รับโอน|ผู้รับเงิน|โอนให้|จ่ายบิล|ชำระเงินให้|To|Merchant)[:\s]+([^\n\r]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ถ้าย่อหน้าเป็นคำว่า "ไปยัง" เดี่ยวๆ ชื่อผู้รับจะอยู่ในบรรทัดถัดไป
    if (receiverCueRegex.test(line) && i + 1 < lines.length) {
      const candidate = cleanMerchantName(lines[i + 1]);
      if (candidate && candidate !== "ไม่ระบุร้านค้า") {
        return candidate;
      }
    }

    // ถ้าอยู่ในบรรทัดเดียวกัน เช่น "ไปยัง: นาย สมชาย ใจดี" หรือ "ผู้รับโอน บจก. ซีพี ออลล์"
    const inlineMatch = line.match(inlineReceiverRegex);
    if (inlineMatch && inlineMatch[1]) {
      const candidate = cleanMerchantName(inlineMatch[1]);
      if (candidate && candidate !== "ไม่ระบุร้านค้า") {
        return candidate;
      }
    }
  }

  return "ไม่ระบุร้านค้า";
}

function classifyCategory(merchant, rawText = "") {
  const combined = `${merchant} ${rawText}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (combined.includes(kw.toLowerCase())) {
        return {
          id: rule.id,
          name: rule.name,
          icon: rule.icon
        };
      }
    }
  }
  return {
    id: "general",
    name: "โอนเงิน / อื่นๆ",
    icon: ""
  };
}

/**
 * สร้าง Deterministic Fingerprint สำหรับรายการที่ไม่มี QR Code (เช่น SMS บัตรเครดิต)
 * เพื่อป้องกันการบันทึกซ้ำหากผู้ใช้กดส่ง SMS เดิมซ้ำสองครั้ง
 */
function computeTransactionHash(sourceCode, dateIso, amount, merchant) {
  const seed = `${sourceCode}|${dateIso.substring(0, 16)}|${Number(amount).toFixed(2)}|${merchant}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `TX-${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

/**
 * ฟังก์ชันหลักในการแปลงข้อมูลดิบจาก Shortcut (OCR Text + QR Payload) ให้เป็น Transaction Object
 */
function parseSlipTransaction(input, options = {}) {
  let ocrText = "";
  let qrPayload = "";

  if (typeof input === "string") {
    // ตรวจสอบว่า input เป็น JSON string หรือ Plain Text
    const trimmed = input.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        ocrText = parsed.ocrText || parsed.text || parsed.sms || "";
        qrPayload = parsed.qrPayload || parsed.qr || "";
      } catch (_) {
        ocrText = input;
      }
    } else {
      ocrText = input;
    }
  } else if (input && typeof input === "object") {
    ocrText = input.ocrText || input.text || input.sms || "";
    qrPayload = input.qrPayload || input.qr || "";
  }

  const qrData = parseEMVCoQR(qrPayload);
  const sourceInfo = detectBankOrSource(ocrText, qrData);
  const dateInfo = parseThaiDate(ocrText, options.fallbackDate);
  const amount = extractAmount(ocrText);
  const merchant = extractMerchant(ocrText, sourceInfo.channel);
  const category = classifyCategory(merchant, ocrText);

  // ค้นหาเลขที่อ้างอิงจากข้อความ OCR หากไม่มี QR Code
  let fallbackRefFromText = null;
  if (!qrData.refId) {
    const refTextMatch = ocrText.match(
      /(?:เลขที่รายการ|รหัสอ้างอิง|เลขที่อ้างอิง|Ref(?:\.\s*No\.)?)[:\s]*([A-Za-z0-9]{8,35})/i
    );
    if (refTextMatch) {
      fallbackRefFromText = refTextMatch[1].trim();
    }
  }

  const refId =
    qrData.refId ||
    fallbackRefFromText ||
    computeTransactionHash(sourceInfo.code, dateInfo.iso, amount, merchant);

  return {
    id: refId,
    refId,
    hasVerifiedQR: Boolean(qrData.refId),
    bankCode: sourceInfo.code,
    bankName: sourceInfo.name,
    channel: sourceInfo.channel,
    amount,
    merchant,
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    timestamp: dateInfo.iso,
    dateOnly: dateInfo.dateOnly,
    timeOnly: dateInfo.timeOnly,
    yearAD: dateInfo.yearAD,
    monthIndex: dateInfo.monthIndex,
    rawQR: qrData.raw || null
  };
}

/**
 * ============================================================================
 * 4. SERVERLESS STORAGE ENGINE (iCloud Drive JSON + Memory Adapter)
 * ============================================================================
 */
class SlipDatabase {
  constructor(adapter = null) {
    this.adapter = adapter || createDefaultStorageAdapter();
  }

  loadState() {
    const raw = this.adapter.read();
    if (!raw) {
      return this.getInitialState();
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        version: parsed.version || SLIPTRACKER_VERSION,
        settings: Object.assign({ monthlyBudget: 15000, currency: "THB" }, parsed.settings || {}),
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
      };
    } catch (_) {
      return this.getInitialState();
    }
  }

  saveState(state) {
    this.adapter.write(JSON.stringify(state, null, 2));
  }

  getInitialState() {
    return {
      version: SLIPTRACKER_VERSION,
      settings: {
        monthlyBudget: 15000,
        currency: "THB"
      },
      transactions: []
    };
  }

  addTransaction(rawInput, options = {}) {
    const tx =
      rawInput && rawInput.refId && typeof rawInput.amount === "number"
        ? rawInput
        : parseSlipTransaction(rawInput, options);

    if (!tx.amount || tx.amount <= 0) {
      return {
        ok: false,
        status: "INVALID_AMOUNT",
        message: "ไม่พบยอดเงินที่ถูกต้องในสลิปหรือข้อความนี้",
        transaction: tx
      };
    }

    const state = this.loadState();

    // ตรวจสอบสลิปซ้ำด้วย Ref ID
    const duplicate = state.transactions.find((item) => item.refId === tx.refId);
    if (duplicate) {
      return {
        ok: false,
        status: "DUPLICATE",
        message: `สลิปนี้เคยบันทึกไปแล้ว (${duplicate.merchant} ฿${duplicate.amount.toLocaleString()})`,
        transaction: duplicate
      };
    }

    state.transactions.unshift(tx);
    // เรียงลำดับตามเวลาล่าสุดเสมอ
    state.transactions.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    this.saveState(state);

    return {
      ok: true,
      status: "SAVED",
      message: `บันทึกสำเร็จ: ${tx.merchant} ฿${tx.amount.toLocaleString()}`,
      transaction: tx
    };
  }

  getMonthlySummary(targetYear = null, targetMonthIndex = null) {
    const now = new Date();
    const year = targetYear !== null ? targetYear : now.getFullYear();
    const month = targetMonthIndex !== null ? targetMonthIndex : now.getMonth();

    const state = this.loadState();
    const monthlyTx = state.transactions.filter((tx) => {
      const d = new Date(tx.timestamp);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalSpent = Number(
      monthlyTx.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2)
    );
    const budget = Number(state.settings.monthlyBudget || 15000);
    const remaining = Number((budget - totalSpent).toFixed(2));
    const percentUsed = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

    const byCategoryMap = {};
    for (const tx of monthlyTx) {
      const catId = tx.categoryId || "general";
      if (!byCategoryMap[catId]) {
        byCategoryMap[catId] = {
          id: catId,
          name: tx.categoryName || "อื่นๆ",
          icon: tx.categoryIcon || "",
          total: 0,
          count: 0
        };
      }
      byCategoryMap[catId].total = Number((byCategoryMap[catId].total + tx.amount).toFixed(2));
      byCategoryMap[catId].count += 1;
    }

    const categories = Object.values(byCategoryMap).sort((a, b) => b.total - a.total);

    return {
      year,
      monthIndex: month,
      budget,
      totalSpent,
      remaining,
      percentUsed,
      transactionCount: monthlyTx.length,
      categories,
      recentTransactions: monthlyTx.slice(0, 10)
    };
  }

  getDailyTotals(days = 7) {
    const state = this.loadState();
    const totals = {};
    for (const tx of state.transactions) {
      const key = String(tx.timestamp || "").substring(0, 10);
      totals[key] = Number(((totals[key] || 0) + Number(tx.amount || 0)).toFixed(2));
    }

    const result = [];
    const now = new Date();
    for (let offset = days - 1; offset >= 0; offset--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      result.push({
        dateOnly: key,
        weekday: d.getDay(),
        isToday: offset === 0,
        total: totals[key] || 0
      });
    }
    return result;
  }

  updateBudget(newBudget) {
    const val = parseFloat(newBudget);
    if (isNaN(val) || val <= 0) return false;
    const state = this.loadState();
    state.settings.monthlyBudget = Math.round(val);
    this.saveState(state);
    return true;
  }
}

function createDefaultStorageAdapter() {
  // หากอยู่ในสภาพแวดล้อม Scriptable บน iOS ให้ใช้ iCloud Drive
  if (typeof FileManager !== "undefined") {
    let fm;
    try {
      fm = FileManager.iCloud();
    } catch (_) {
      fm = FileManager.local();
    }
    const dir = fm.joinPath(fm.documentsDirectory(), "SlipTracker");
    if (!fm.fileExists(dir)) {
      fm.createDirectory(dir, true);
    }
    const dbPath = fm.joinPath(dir, "transactions_db.json");

    return {
      type: "ICLOUD_FILE",
      path: dbPath,
      read() {
        if (!fm.fileExists(dbPath)) return null;
        return fm.readString(dbPath);
      },
      write(content) {
        fm.writeString(dbPath, content);
      }
    };
  }

  // Fallback สำหรับ In-Memory (ใช้ตอนรัน Unit Test บน Node.js)
  let memoryStore = null;
  return {
    type: "MEMORY",
    read() {
      return memoryStore;
    },
    write(content) {
      memoryStore = content;
    }
  };
}

/**
 * ============================================================================
 * 5. iOS HOME SCREEN WIDGET & INTERACTIVE DASHBOARD (Scriptable UI)
 * ============================================================================
 */
async function renderHomeWidget(db) {
  const summary = db.getMonthlySummary();
  const daily = db.getDailyTotals(7);
  const todayTotal = daily[daily.length - 1].total;

  const widget = new ListWidget();
  widget.setPadding(14, 16, 14, 14);

  // Frosted Dark Obsidian background (slightly translucent to blend with wallpaper)
  const gradient = new LinearGradient();
  gradient.locations = [0, 0.55, 1];
  gradient.colors = [
    new Color("#1E2330", 0.95),
    new Color("#141720", 0.97),
    new Color("#0D0F14", 0.98)
  ];
  widget.backgroundGradient = gradient;

  const root = widget.addStack();
  root.layoutHorizontally();

  // ---------------- LEFT COLUMN: metrics & capsule ----------------
  const left = root.addStack();
  left.layoutVertically();

  const label = left.addText("EXPENSE TRACKER");
  label.font = Font.semiboldSystemFont(9);
  label.textColor = new Color("#64748B");

  left.addSpacer(5);

  const todayRow = left.addStack();
  todayRow.layoutHorizontally();
  todayRow.bottomAlignContent();
  const baht = todayRow.addText("฿");
  baht.font = Font.mediumRoundedSystemFont(14);
  baht.textColor = new Color("#94A3B8");
  todayRow.addSpacer(2);
  const todayValue = todayRow.addText(formatMoney(todayTotal));
  todayValue.font = Font.boldRoundedSystemFont(22);
  todayValue.textColor = new Color("#F8FAFC");
  todayValue.minimumScaleFactor = 0.6;
  todayValue.lineLimit = 1;

  const todayCaption = left.addText("TODAY'S SPENT");
  todayCaption.font = Font.semiboldSystemFont(8);
  todayCaption.textColor = new Color("#475569");

  left.addSpacer(7);

  const monthRow = left.addStack();
  monthRow.layoutHorizontally();
  monthRow.centerAlignContent();
  const monthLabel = monthRow.addText("MONTH  ");
  monthLabel.font = Font.semiboldSystemFont(8);
  monthLabel.textColor = new Color("#475569");
  const monthValue = monthRow.addText(`฿${formatMoney(summary.totalSpent)}`);
  monthValue.font = Font.semiboldRoundedSystemFont(12);
  monthValue.textColor = new Color("#CBD5E1");
  monthValue.lineLimit = 1;
  monthValue.minimumScaleFactor = 0.7;

  left.addSpacer();

  const remainingRatio = summary.budget > 0 ? summary.remaining / summary.budget : 0;
  const isLow = summary.remaining < 0 || remainingRatio <= 0.15;
  const statusColor = new Color(isLow ? "#F87171" : "#38BDF8");

  const capsule = left.addStack();
  capsule.layoutHorizontally();
  capsule.centerAlignContent();
  capsule.setPadding(5, 10, 5, 10);
  capsule.cornerRadius = 12;
  capsule.backgroundColor = new Color("#1E293B", 0.5);

  const dot = capsule.addText("\u25CF");
  dot.font = Font.systemFont(7);
  dot.textColor = statusColor;
  capsule.addSpacer(5);
  const remLabel = capsule.addText(summary.remaining < 0 ? "OVER  " : "REMAINING  ");
  remLabel.font = Font.semiboldSystemFont(8);
  remLabel.textColor = new Color("#64748B");
  const remValue = capsule.addText(`฿${formatMoney(Math.abs(summary.remaining), true)}`);
  remValue.font = Font.boldRoundedSystemFont(11);
  remValue.textColor = statusColor;
  remValue.lineLimit = 1;
  remValue.minimumScaleFactor = 0.6;

  root.addSpacer(14);

  // ---------------- RIGHT COLUMN: 7-day velocity chart ----------------
  const card = root.addStack();
  card.layoutVertically();
  card.setPadding(10, 12, 8, 12);
  card.cornerRadius = 10;
  card.backgroundColor = new Color("#10131B", 0.6);

  const chartTitle = card.addText("7-DAY VELOCITY");
  chartTitle.font = Font.semiboldSystemFont(8);
  chartTitle.textColor = new Color("#64748B");

  card.addSpacer(6);

  const maxTotal = Math.max(...daily.map((d) => d.total), 0);
  const chartHeight = 56;
  const barsRow = card.addStack();
  barsRow.layoutHorizontally();
  barsRow.bottomAlignContent();

  const dayNames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  daily.forEach((d, i) => {
    const col = barsRow.addStack();
    col.layoutVertically();
    col.centerAlignContent();

    const slot = col.addStack();
    slot.size = new Size(14, chartHeight);
    slot.layoutVertically();
    slot.addSpacer();

    const barHeight = d.total > 0 && maxTotal > 0 ? Math.max(4, Math.round((d.total / maxTotal) * chartHeight)) : 4;
    const bar = slot.addStack();
    bar.size = new Size(10, barHeight);
    bar.cornerRadius = 3;
    if (d.isToday) {
      bar.backgroundColor = new Color("#38BDF8");
    } else if (d.total > 0) {
      bar.backgroundColor = new Color("#334155");
    } else {
      bar.backgroundColor = new Color("#1E2430");
    }

    col.addSpacer(4);

    const dayLabel = col.addText(d.isToday ? "TD" : dayNames[d.weekday]);
    dayLabel.font = d.isToday ? Font.boldSystemFont(7) : Font.mediumSystemFont(7);
    dayLabel.textColor = new Color(d.isToday ? "#38BDF8" : "#64748B");

    if (i < daily.length - 1) barsRow.addSpacer(4);
  });

  return widget;
}

function formatMoney(value, whole = false) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2
  });
}

async function presentInteractiveDashboard(db) {
  const summary = db.getMonthlySummary();
  const table = new UITable();
  table.showSeparators = true;

  // Header Row
  const headerRow = new UITableRow();
  headerRow.isHeader = true;
  headerRow.height = 75;
  headerRow.backgroundColor = new Color("#0F1219");
  const hCell = headerRow.addText(
    `EXPENSE TRACKER  |  ฿${formatMoney(summary.totalSpent)}`,
    `Budget ฿${formatMoney(summary.budget, true)}  |  Remaining ฿${formatMoney(summary.remaining)}  |  ${summary.transactionCount} transactions`
  );
  hCell.titleColor = new Color("#F8FAFC");
  hCell.subtitleColor = new Color("#94A3B8");
  table.addRow(headerRow);

  // Budget settings row
  const actionRow = new UITableRow();
  actionRow.height = 48;
  const actionCell = actionRow.addText("ตั้งงบประมาณรายเดือน", "แตะเพื่อแก้ไขงบประมาณ");
  actionCell.titleColor = new Color("#38BDF8");
  actionRow.onSelect = async () => {
    const prompt = new Alert();
    prompt.title = "ตั้งงบประมาณรายเดือน (บาท)";
    prompt.addTextField("15000", String(summary.budget));
    prompt.addAction("บันทึก");
    prompt.addCancelAction("ยกเลิก");
    const idx = await prompt.presentAlert();
    if (idx === 0) {
      db.updateBudget(prompt.textFieldValue(0));
    }
  };
  table.addRow(actionRow);

  // Recent transactions
  for (const tx of summary.recentTransactions) {
    const row = new UITableRow();
    row.height = 58;
    const left = row.addText(
      `${tx.merchant}`,
      `${tx.categoryName}  |  ${tx.bankName}  |  ${tx.dateOnly} ${tx.timeOnly}  |  Ref ${String(tx.refId).substring(0, 10)}`
    );
    left.widthWeight = 70;

    const right = row.addText(`฿${formatMoney(tx.amount)}`);
    right.rightAligned();
    right.titleColor = new Color("#F87171");
    right.widthWeight = 30;

    table.addRow(row);
  }

  await table.present(false);
}

/**
 * Entrypoint สำหรับเรียกจาก SlipLoader.js บน iOS
 */
async function runSlipTracker(context = {}) {
  const db = new SlipDatabase();
  const payload = context.inputPayload;

  // กรณีรันเป็น Home Screen Widget
  if (typeof config !== "undefined" && config.runsInWidget) {
    const widget = await renderHomeWidget(db);
    Script.setWidget(widget);
    return { ok: true, mode: "WIDGET" };
  }

  // กรณีรับข้อมูลสลิปหรือ SMS จาก Apple Shortcuts
  if (payload && (typeof payload === "string" || payload.ocrText || payload.text || payload.qrPayload)) {
    const result = db.addTransaction(payload);

    if (typeof Notification !== "undefined") {
      const notif = new Notification();
      notif.title = result.ok ? "บันทึกรายจ่ายสำเร็จ" : "แจ้งเตือน SlipTracker";
      notif.body = result.message;
      await notif.schedule();
    }

    return result;
  }

  // กรณีเปิดแอป Scriptable โดยตรง แสดง Dashboard
  if (typeof UITable !== "undefined") {
    await presentInteractiveDashboard(db);
    return { ok: true, mode: "DASHBOARD" };
  }

  return { ok: true, mode: "HEADLESS", summary: db.getMonthlySummary() };
}

// Export สำหรับรัน Unit Test บน Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SLIPTRACKER_VERSION,
    THAI_BANK_CODES,
    THAI_MONTH_MAP,
    parseTLV,
    parseEMVCoQR,
    normalizeThaiYear,
    parseThaiDate,
    extractAmount,
    cleanMerchantName,
    detectBankOrSource,
    extractMerchant,
    classifyCategory,
    parseSlipTransaction,
    SlipDatabase,
    runSlipTracker
  };
}
