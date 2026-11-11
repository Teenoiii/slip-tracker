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

  async getAllRecords() {
    const state = this.loadState();
    return Array.isArray(state.transactions) ? state.transactions : [];
  }

  async getMonthlyBudget() {
    const state = this.loadState();
    return Number((state.settings && state.settings.monthlyBudget) || 15000);
  }

  addManualTransaction(amount, merchantName) {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      return {
        ok: false,
        status: "INVALID_AMOUNT",
        message: "กรุณาระบุยอดเงินที่มากกว่า 0 บาท"
      };
    }

    const cleanedMerchant = cleanMerchantName(merchantName || "รายการจดเอง");
    const dateInfo = formatDateResult(new Date(), false);
    const category = classifyCategory(cleanedMerchant, "");
    const refId = computeTransactionHash("MANUAL", dateInfo.iso, val, cleanedMerchant);

    const tx = {
      id: refId,
      refId,
      hasVerifiedQR: false,
      bankCode: "MANUAL",
      bankName: "จดรายการเอง",
      channel: "MANUAL",
      amount: Number(val.toFixed(2)),
      merchant: cleanedMerchant,
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon,
      timestamp: dateInfo.iso,
      dateOnly: dateInfo.dateOnly,
      timeOnly: dateInfo.timeOnly,
      yearAD: dateInfo.yearAD,
      monthIndex: dateInfo.monthIndex,
      rawQR: null
    };

    return this.addTransaction(tx);
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
const THAI_WEEKDAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** ชื่อหมวดหมู่ที่แสดงในหน้า Dashboard (อ้างอิงจาก categoryId เพื่อไม่กระทบข้อมูลเดิม) */
const CATEGORY_LABELS_TH = {
  food: "อาหาร",
  shopping: "ช้อปปิ้ง",
  transport: "เดินทาง",
  bills: "บิล/ค่าใช้จ่าย",
  entertainment: "บันเทิง",
  general: "ทั่วไป"
};

/** ชื่อธนาคารแบบสั้นภาษาไทยสำหรับแท็กในประวัติรายการ */
const BANK_LABELS_TH = {
  KBANK: "กสิกรไทย",
  SCB: "ไทยพาณิชย์",
  KTB: "กรุงไทย",
  BBL: "กรุงเทพ",
  TTB: "ทีทีบี",
  BAY: "กรุงศรี",
  GSB: "ออมสิน",
  CIMB: "ซีไอเอ็มบี",
  UOB: "ยูโอบี",
  BAAC: "ธ.ก.ส.",
  TISCO: "ทิสโก้",
  KKP: "เกียรตินาคินภัทร",
  LHB: "แลนด์ แอนด์ เฮ้าส์",
  KTC: "บัตรเคทีซี",
  CardX: "บัตรการ์ดเอ็กซ์",
  "KBANK-CC": "บัตรกสิกรไทย",
  "TTB-CC": "บัตรทีทีบี",
  "BAY-CC": "บัตรกรุงศรี",
  "CREDIT-CARD": "บัตรเครดิต",
  MANUAL: "จดเอง",
  UNKNOWN: "ทั่วไป"
};

function categoryLabelTh(categoryId, fallback = "ทั่วไป") {
  return CATEGORY_LABELS_TH[categoryId] || fallback;
}

function bankLabelTh(code) {
  return BANK_LABELS_TH[code] || String(code || "ทั่วไป");
}

function localYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** เช่น "พ. 11 พ.ย." */
function formatThaiShortDate(d) {
  return `${THAI_WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

/** เช่น "11 พ.ย. 69 14:20 น." จากสตริง ISO (ปี ค.ศ.) */
function formatThaiDateTime(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return "-";
  const monthIndex = parseInt(m[2], 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "-";
  const yearBE2 = String((parseInt(m[1], 10) + 543) % 100).padStart(2, "0");
  const base = `${parseInt(m[3], 10)} ${THAI_MONTHS_SHORT[monthIndex]} ${yearBE2}`;
  return m[4] ? `${base} ${m[4]}:${m[5]} น.` : base;
}

/** ยอดย่อสำหรับป้ายบนแท่งกราฟ เช่น 575, 4.4k */
function formatCompactAmount(value) {
  const n = Number(value) || 0;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(Math.round(n));
}

function formatMoney(value, whole = false) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2
  });
}

function recordDateString(r) {
  return String((r && (r.dateOnly || r.timestamp || r.date)) || "");
}

/** รวมยอดรายวันย้อนหลัง `days` วัน (เก่า -> ใหม่) วันสุดท้ายคือวันนี้ตามเวลาท้องถิ่น */
function buildDailyTotals(records, days = 7, now = new Date()) {
  const totals = {};
  for (const r of records || []) {
    const key = recordDateString(r).substring(0, 10);
    totals[key] = (totals[key] || 0) + (Number(r.amount) || 0);
  }
  const result = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = localYMD(d);
    result.push({
      dateOnly: key,
      day: d.getDate(),
      isToday: offset === 0,
      total: Number((totals[key] || 0).toFixed(2))
    });
  }
  return result;
}

function csvEscape(value) {
  const s = String(value === null || value === undefined ? "" : value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** สร้างไฟล์ CSV (UTF-8 พร้อม BOM เพื่อให้ Excel อ่านภาษาไทยได้) */
function buildCsv(records) {
  const header = ["วันที่", "เวลา", "ร้านค้า", "หมวดหมู่", "ธนาคาร", "รหัสอ้างอิง", "ยอดเงิน"];
  const rows = (records || []).map((r) => [
    recordDateString(r).substring(0, 10),
    r.timeOnly || recordDateString(r).substring(11, 16),
    r.merchant || "",
    categoryLabelTh(r.categoryId, r.categoryName),
    bankLabelTh(r.bankCode),
    r.refId || "",
    Number(r.amount || 0).toFixed(2)
  ]);
  return "\uFEFF" + [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
}

/** ค้นหาจากชื่อร้านค้า ธนาคาร หมวดหมู่ รหัสอ้างอิง หรือยอดเงิน */
function filterTransactions(records, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return records;
  return records.filter((r) => {
    const haystack = [
      r.merchant,
      r.bankCode,
      bankLabelTh(r.bankCode),
      categoryLabelTh(r.categoryId, r.categoryName),
      r.refId,
      Number(r.amount || 0).toFixed(2),
      String(Number(r.amount || 0))
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}


function renderHomeWidget(recordsOrDb = [], budgetArg = 15000) {
  let records = [];
  let budget = Number(budgetArg) || 15000;

  // รองรับทั้งการส่ง (records, budget) และการส่ง (db)
  if (Array.isArray(recordsOrDb)) {
    records = recordsOrDb;
  } else if (recordsOrDb && typeof recordsOrDb.loadState === "function") {
    const state = recordsOrDb.loadState();
    records = Array.isArray(state.transactions) ? state.transactions : [];
    budget = Number((state.settings && state.settings.monthlyBudget) || 15000);
  }

  const now = new Date();
  const daily = buildDailyTotals(records, 7, now);
  const todaySpent = daily[daily.length - 1].total;
  const currentMonth = localYMD(now).substring(0, 7);
  const monthSpent = Number(
    records
      .filter((r) => recordDateString(r).startsWith(currentMonth))
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
      .toFixed(2)
  );

  const spentPercent = budget > 0 ? Math.min(100, Math.round((monthSpent / budget) * 100)) : 0;
  const remainPercent = Math.max(0, 100 - spentPercent);
  const isOver = budget > 0 && monthSpent > budget;
  const isNearLimit = isOver || remainPercent <= 15;
  const accentHex = isNearLimit ? "#FB7185" : "#38BDF8";

  const widget = new ListWidget();
  widget.setPadding(14, 16, 14, 16);
  if (typeof URLScheme !== "undefined" && URLScheme.forRunningScript) {
    widget.url = URLScheme.forRunningScript();
  }

  // พื้นหลังกระจกฝ้าโปร่งแสง
  const gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("#151A24", 0.75), new Color("#0C0F15", 0.88)];
  widget.backgroundGradient = gradient;

  // ---------------- แถบหัวข้อ ----------------
  const header = widget.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  const statusDot = header.addStack();
  statusDot.size = new Size(6, 6);
  statusDot.cornerRadius = 3;
  statusDot.backgroundColor = new Color("#10B981");
  header.addSpacer(5);

  const appName = header.addText("บันทึกรายจ่าย");
  appName.font = Font.semiboldSystemFont(8.5);
  appName.textColor = new Color("#94A3B8");
  header.addSpacer(4);

  const divider = header.addText("·");
  divider.font = Font.mediumSystemFont(8.5);
  divider.textColor = new Color("#475569");
  header.addSpacer(4);

  const dateText = header.addText(formatThaiShortDate(now));
  dateText.font = Font.mediumSystemFont(8.5);
  dateText.textColor = new Color("#64748B");

  header.addSpacer();

  const pill = header.addStack();
  pill.setPadding(2, 7, 2, 7);
  pill.cornerRadius = 8;
  pill.backgroundColor = new Color(accentHex, 0.14);
  const pillLabel = isOver ? "เกินงบ" : isNearLimit ? "ใกล้แตะงบ" : `งบคงเหลือ ${remainPercent}%`;
  const pillText = pill.addText(pillLabel);
  pillText.font = Font.semiboldSystemFont(8);
  pillText.textColor = new Color(accentHex);

  widget.addSpacer(8);

  // ---------------- เนื้อหา 2 คอลัมน์ ----------------
  const body = widget.addStack();
  body.layoutHorizontally();

  // คอลัมน์ซ้าย: ยอดเด่นและหลอดงบประมาณ
  const left = body.addStack();
  left.layoutVertically();
  left.size = new Size(135, 0);

  const heroRow = left.addStack();
  heroRow.layoutHorizontally();
  heroRow.bottomAlignContent();
  const baht = heroRow.addText("฿");
  baht.font = Font.systemFont(14);
  baht.textColor = new Color("#94A3B8");
  heroRow.addSpacer(2);
  const heroValue = heroRow.addText(formatMoney(todaySpent));
  heroValue.font = Font.boldSystemFont(24);
  heroValue.textColor = new Color("#FFFFFF");
  heroValue.lineLimit = 1;
  heroValue.minimumScaleFactor = 0.6;

  const heroLabel = left.addText("ยอดใช้วันนี้");
  heroLabel.font = Font.mediumSystemFont(8.5);
  heroLabel.textColor = new Color("#64748B");

  left.addSpacer(8);

  const monthText = left.addText(`เดือนนี้ ฿${formatMoney(monthSpent, true)}`);
  monthText.font = Font.systemFont(9);
  monthText.textColor = new Color("#94A3B8");
  monthText.lineLimit = 1;

  left.addSpacer(4);

  const track = left.addStack();
  track.layoutHorizontally();
  track.size = new Size(135, 3.5);
  track.cornerRadius = 2;
  track.backgroundColor = new Color("#FFFFFF", 0.12);
  if (monthSpent > 0) {
    const fill = track.addStack();
    fill.size = new Size(Math.max(4, Math.round((135 * spentPercent) / 100)), 3.5);
    fill.cornerRadius = 2;
    fill.backgroundColor = new Color(isOver ? "#F87171" : "#38BDF8");
  }

  left.addSpacer();
  body.addSpacer();

  // คอลัมน์ขวา: สถิติ 7 วัน
  const card = body.addStack();
  card.layoutVertically();
  card.setPadding(7, 8, 6, 8);
  card.cornerRadius = 10;
  card.backgroundColor = new Color("#0D111A", 0.55);
  card.borderWidth = 0.5;
  card.borderColor = new Color("#FFFFFF", 0.08);

  const cardTitle = card.addText("สถิติ 7 วัน");
  cardTitle.font = Font.semiboldSystemFont(7.5);
  cardTitle.textColor = new Color("#64748B");

  card.addSpacer(4);

  const maxTotal = Math.max(...daily.map((d) => d.total), 0);
  const barsRow = card.addStack();
  barsRow.layoutHorizontally();
  barsRow.bottomAlignContent();

  daily.forEach((d, index) => {
    const col = barsRow.addStack();
    col.layoutVertically();
    col.centerAlignContent();

    const slot = col.addStack();
    slot.layoutVertically();
    slot.centerAlignContent();
    slot.size = new Size(13, 44);
    slot.addSpacer();

    if (d.total > 0) {
      const amountLabel = slot.addText(formatCompactAmount(d.total));
      amountLabel.font = Font.mediumSystemFont(6.5);
      amountLabel.textColor = new Color(d.isToday ? accentHex : "#94A3B8");
      amountLabel.lineLimit = 1;
      amountLabel.minimumScaleFactor = 0.6;
      slot.addSpacer(1);

      const barHeight = Math.max(5, Math.round((d.total / maxTotal) * 28));
      const bar = slot.addStack();
      bar.size = new Size(8, barHeight);
      bar.cornerRadius = 4;
      if (d.isToday) {
        bar.backgroundColor = new Color(accentHex);
      } else {
        bar.backgroundColor = new Color(d.total >= maxTotal * 0.5 ? "#3B82F6" : "#334155");
      }
    } else {
      const emptyBar = slot.addStack();
      emptyBar.size = new Size(6, 4);
      emptyBar.cornerRadius = 2;
      emptyBar.backgroundColor = new Color("#252D3D");
    }

    col.addSpacer(3);

    const dayLabel = col.addText(d.isToday ? "วันนี้" : String(d.day));
    dayLabel.font = d.isToday ? Font.boldSystemFont(7) : Font.systemFont(7);
    dayLabel.textColor = new Color(d.isToday ? accentHex : "#64748B");
    dayLabel.lineLimit = 1;

    if (index < daily.length - 1) barsRow.addSpacer(2);
  });

  widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  return widget;
}


async function runShortcutByName(name) {
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(name)}`;
  if (typeof Safari !== "undefined") {
    Safari.open(url);
  }
}

async function promptManualEntry(db) {
  const form = new Alert();
  form.title = "จดรายการเอง";
  form.message = "กรอกยอดเงินและชื่อร้านค้า";
  const amountField = form.addTextField("ยอดเงิน (บาท)", "");
  if (amountField && typeof amountField.setDecimalPadKeyboard === "function") {
    amountField.setDecimalPadKeyboard();
  }
  form.addTextField("ชื่อร้านค้า", "");
  form.addAction("บันทึก");
  form.addCancelAction("ยกเลิก");

  const choice = await form.presentAlert();
  if (choice !== 0) return;

  const amount = parseFloat(String(form.textFieldValue(0)).replace(/,/g, ""));
  const result = db.addManualTransaction(amount, form.textFieldValue(1));

  const notice = new Alert();
  notice.title = result.ok ? "บันทึกแล้ว" : "บันทึกไม่สำเร็จ";
  notice.message = result.message;
  notice.addAction("ตกลง");
  await notice.presentAlert();
}

async function presentInteractiveDashboard(db) {
  const table = new UITable();
  table.showSeparators = false;
  let query = "";

  const addTapRow = (height, handler) => {
    const row = new UITableRow();
    row.height = height;
    row.dismissOnSelect = false;
    if (handler) row.onSelect = handler;
    table.addRow(row);
    return row;
  };

  const render = () => {
    table.removeAllRows();
    const state = db.loadState();
    const allRecords = state.transactions;
    const summary = db.getMonthlySummary();
    const todayTotal = buildDailyTotals(allRecords, 1)[0].total;

    // ---- แถบนำทาง ----
    const nav = new UITableRow();
    nav.height = 52;
    nav.dismissOnSelect = false;
    nav.backgroundColor = new Color("#0C0F15");

    const closeCell = nav.addText("ปิด");
    closeCell.titleColor = new Color("#94A3B8");
    closeCell.titleFont = Font.mediumSystemFont(15);
    closeCell.widthWeight = 22;
    closeCell.leftAligned();
    closeCell.onTap = () => Script.complete();

    const titleCell = nav.addText("ภาพรวมรายจ่าย");
    titleCell.titleColor = new Color("#F8FAFC");
    titleCell.titleFont = Font.boldSystemFont(16);
    titleCell.widthWeight = 56;
    titleCell.centerAligned();

    const exportCell = nav.addText("ส่งออก CSV");
    exportCell.titleColor = new Color("#38BDF8");
    exportCell.titleFont = Font.mediumSystemFont(13);
    exportCell.widthWeight = 22;
    exportCell.rightAligned();
    exportCell.onTap = async () => {
      if (typeof DocumentPicker !== "undefined") {
        await DocumentPicker.exportString(buildCsv(db.loadState().transactions), "บันทึกรายจ่าย.csv");
      }
    };
    table.addRow(nav);

    // ---- การ์ดสรุปยอดคู่ ----
    const totals = new UITableRow();
    totals.height = 86;
    totals.backgroundColor = new Color("#0C0F15");
    const todayCell = totals.addText(`฿${formatMoney(todayTotal)}`, "ยอดใช้วันนี้");
    todayCell.titleColor = new Color("#FB7185");
    todayCell.titleFont = Font.boldSystemFont(24);
    todayCell.subtitleColor = new Color("#94A3B8");
    todayCell.subtitleFont = Font.mediumSystemFont(11);
    todayCell.widthWeight = 50;
    todayCell.centerAligned();
    const monthCell = totals.addText(`฿${formatMoney(summary.totalSpent)}`, "ยอดรวมเดือนนี้");
    monthCell.titleColor = new Color("#38BDF8");
    monthCell.titleFont = Font.boldSystemFont(24);
    monthCell.subtitleColor = new Color("#94A3B8");
    monthCell.subtitleFont = Font.mediumSystemFont(11);
    monthCell.widthWeight = 50;
    monthCell.centerAligned();
    table.addRow(totals);

    // ---- งบประมาณ ----
    const budgetRow = addTapRow(48, async () => {
      const prompt = new Alert();
      prompt.title = "ตั้งงบประมาณรายเดือน (บาท)";
      prompt.addTextField("15000", String(summary.budget));
      prompt.addAction("บันทึก");
      prompt.addCancelAction("ยกเลิก");
      if ((await prompt.presentAlert()) === 0) {
        db.updateBudget(prompt.textFieldValue(0));
        render();
      }
    });
    budgetRow.backgroundColor = new Color("#111722");
    const budgetCell = budgetRow.addText(
      `งบประมาณเดือนนี้ ฿${formatMoney(summary.budget, true)}`,
      `คงเหลือ ฿${formatMoney(summary.remaining)} · แตะเพื่อแก้ไขงบ`
    );
    budgetCell.titleColor = new Color("#E2E8F0");
    budgetCell.titleFont = Font.semiboldSystemFont(13);
    budgetCell.subtitleColor = new Color("#94A3B8");
    budgetCell.subtitleFont = Font.systemFont(11);

    // ---- ปุ่มลัด 3 รายการ ----
    const scanRow = addTapRow(48, () => runShortcutByName("ScanSlipToApp"));
    scanRow.backgroundColor = new Color("#064E3B");
    const scanCell = scanRow.addText("สแกนสลิปล่าสุด", "อ่านสลิปล่าสุดในอัลบั้มรูปภาพอัตโนมัติ");
    scanCell.titleColor = new Color("#34D399");
    scanCell.titleFont = Font.boldSystemFont(14);
    scanCell.subtitleColor = new Color("#A7F3D0");
    scanCell.subtitleFont = Font.systemFont(11);

    const pickRow = addTapRow(48, () => runShortcutByName("PickSlipToApp"));
    pickRow.backgroundColor = new Color("#3B0764");
    const pickCell = pickRow.addText("เลือกสลิปจากอัลบั้ม", "เลือกรูปสลิปเองได้หลายรายการ");
    pickCell.titleColor = new Color("#C084FC");
    pickCell.titleFont = Font.boldSystemFont(14);
    pickCell.subtitleColor = new Color("#E9D5FF");
    pickCell.subtitleFont = Font.systemFont(11);

    const manualRow = addTapRow(48, async () => {
      await promptManualEntry(db);
      render();
    });
    manualRow.backgroundColor = new Color("#7C2D12");
    const manualCell = manualRow.addText("จดรายการเอง", "กรอกยอดเงินและชื่อร้านค้าด้วยตัวเอง");
    manualCell.titleColor = new Color("#FB923C");
    manualCell.titleFont = Font.boldSystemFont(14);
    manualCell.subtitleColor = new Color("#FED7AA");
    manualCell.subtitleFont = Font.systemFont(11);

    // ---- สรุปหมวดหมู่ ----
    const catHeader = new UITableRow();
    catHeader.isHeader = true;
    catHeader.height = 36;
    catHeader.backgroundColor = new Color("#0C0F15");
    const catHeaderCell = catHeader.addText("สรุปตามหมวดหมู่เดือนนี้");
    catHeaderCell.titleColor = new Color("#94A3B8");
    catHeaderCell.titleFont = Font.semiboldSystemFont(12);
    table.addRow(catHeader);

    const categoryOrder = ["food", "shopping", "transport", "bills", "general"];
    const catMap = {};
    for (const c of summary.categories) {
      catMap[c.id] = c;
    }
    for (const catId of categoryOrder) {
      const item = catMap[catId] || { id: catId, total: 0, count: 0 };
      const r = new UITableRow();
      r.height = 42;
      r.backgroundColor = new Color("#0F141E");
      const left = r.addText(categoryLabelTh(catId), `${item.count} รายการ`);
      left.titleColor = new Color("#E2E8F0");
      left.titleFont = Font.mediumSystemFont(13);
      left.subtitleColor = new Color("#64748B");
      left.subtitleFont = Font.systemFont(10);
      left.widthWeight = 65;

      const right = r.addText(`฿${formatMoney(item.total)}`);
      right.rightAligned();
      right.titleColor = new Color("#CBD5E1");
      right.titleFont = Font.semiboldSystemFont(13);
      right.widthWeight = 35;
      table.addRow(r);
    }

    // ---- ช่องค้นหา ----
    const searchRow = addTapRow(48, async () => {
      const prompt = new Alert();
      prompt.title = "ค้นหารายการ";
      prompt.addTextField("ค้นหารายการ, ร้านค้า, หรือยอดเงิน...", query);
      prompt.addAction("ค้นหา");
      prompt.addAction("ล้างคำค้น");
      prompt.addCancelAction("ยกเลิก");
      const idx = await prompt.presentAlert();
      if (idx === 0) {
        query = prompt.textFieldValue(0).trim();
        render();
      } else if (idx === 1) {
        query = "";
        render();
      }
    });
    searchRow.backgroundColor = new Color("#161E2E");
    const searchCell = searchRow.addText(
      query ? `คำค้นหา: "${query}"` : "ค้นหารายการ, ร้านค้า, หรือยอดเงิน...",
      query ? "แตะเพื่อเปลี่ยนหรือล้างคำค้น" : "แตะเพื่อกรองประวัติรายการด้านล่าง"
    );
    searchCell.titleColor = new Color(query ? "#38BDF8" : "#94A3B8");
    searchCell.titleFont = Font.mediumSystemFont(13);
    searchCell.subtitleColor = new Color("#64748B");
    searchCell.subtitleFont = Font.systemFont(10);

    // ---- ประวัติรายการ ----
    const filtered = filterTransactions(allRecords, query);
    const listHeader = new UITableRow();
    listHeader.isHeader = true;
    listHeader.height = 36;
    listHeader.backgroundColor = new Color("#0C0F15");
    const listHeaderCell = listHeader.addText(`ประวัติรายการ (${filtered.length} รายการ)`);
    listHeaderCell.titleColor = new Color("#94A3B8");
    listHeaderCell.titleFont = Font.semiboldSystemFont(12);
    table.addRow(listHeader);

    if (filtered.length === 0) {
      const emptyRow = new UITableRow();
      emptyRow.height = 56;
      emptyRow.backgroundColor = new Color("#0F141E");
      const emptyCell = emptyRow.addText("ไม่พบรายการที่ตรงกับเงื่อนไข");
      emptyCell.titleColor = new Color("#64748B");
      emptyCell.titleFont = Font.systemFont(13);
      emptyCell.centerAligned();
      table.addRow(emptyRow);
    } else {
      for (const tx of filtered.slice(0, 50)) {
        const row = new UITableRow();
        row.height = 62;
        row.backgroundColor = new Color("#0F141E");

        const catTh = categoryLabelTh(tx.categoryId, tx.categoryName);
        const bankTh = bankLabelTh(tx.bankCode);
        const dateTh = formatThaiDateTime(tx.timestamp || `${tx.dateOnly}T${tx.timeOnly || "00:00"}`);
        const refShort = String(tx.refId || "").substring(0, 10);

        const left = row.addText(
          `${tx.merchant || "ไม่ระบุร้านค้า"}`,
          `[${bankTh}] · ${catTh} · ${dateTh} · อ้างอิง ${refShort}`
        );
        left.titleColor = new Color("#F8FAFC");
        left.titleFont = Font.semiboldSystemFont(14);
        left.subtitleColor = new Color("#94A3B8");
        left.subtitleFont = Font.systemFont(11);
        left.widthWeight = 70;

        const right = row.addText(`-฿${formatMoney(tx.amount)}`);
        right.rightAligned();
        right.titleColor = new Color("#FB7185");
        right.titleFont = Font.boldSystemFont(14);
        right.widthWeight = 30;

        table.addRow(row);
      }
    }

    table.reload();
  };

  render();
  await table.present(false);
}


/**
 * Entrypoint สำหรับเรียกจาก SlipLoader.js บน iOS
 */
async function runSlipTracker(context = {}) {
  const db = new SlipDatabase();
  const payload = context && context.inputPayload;

  // กรณีรันเป็น Home Screen Widget (Critical Lifecycle Fix)
  if (typeof config !== "undefined" && config.runsInWidget) {
    const records = await db.getAllRecords();
    const budget = await db.getMonthlyBudget();
    const widget = await renderHomeWidget(records, budget);
    Script.setWidget(widget);
    Script.complete();
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
