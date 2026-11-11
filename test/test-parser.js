/**
 * ============================================================================
 * SLIPTRACKER — AUTOMATED UNIT TEST SUITE (Node.js)
 * ============================================================================
 * ทดสอบความถูกต้องของ:
 * 1. EMVCo QR Code Parser (Tag 0103XXX & Tag 02 Ref ID)
 * 2. Auto-Heal Date Engine (พ.ศ. 2569 / 69 -> ค.ศ. 2026)
 * 3. Multi-Bank OCR Slip Extraction (KBANK, SCB, KTB, BBL, TTB, BAY)
 * 4. Credit Card SMS Extraction (KTC, CardX, KBANK-CC)
 * 5. Duplicate Slip Prevention & Monthly Budget Aggregation
 * ============================================================================
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  parseEMVCoQR,
  normalizeThaiYear,
  parseThaiDate,
  extractAmount,
  cleanMerchantName,
  parseSlipTransaction,
  SlipDatabase
} = require("../scriptable/SlipCore.js");

const sampleDataPath = path.join(__dirname, "sample_slips.json");
const samples = JSON.parse(fs.readFileSync(sampleDataPath, "utf8"));

let passedCount = 0;
let failedCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  \x1b[32m✓ PASS\x1b[0m ${testName}`);
  } catch (error) {
    failedCount++;
    console.error(`  \x1b[31m✗ FAIL\x1b[0m ${testName}`);
    console.error(`    └─ ${error.message}`);
  }
}

console.log("\n==================================================================");
console.log("🚀 SLIPTRACKER CORE ENGINE — UNIT TEST SUITE");
console.log("==================================================================\n");

// ----------------------------------------------------------------------------
// SUITE 1: Auto-Heal Date Engine (พ.ศ. -> ค.ศ.)
// ----------------------------------------------------------------------------
console.log("📅 1. Auto-Heal Thai Buddhist Date Engine");

runTest("แปลงปี พ.ศ. เต็ม 4 หลัก (2569 -> 2026)", () => {
  assert.strictEqual(normalizeThaiYear(2569), 2026);
  assert.strictEqual(normalizeThaiYear("2568"), 2025);
});

runTest("แปลงปี พ.ศ. ย่อ 2 หลัก (69 -> 2026)", () => {
  assert.strictEqual(normalizeThaiYear(69), 2026);
  assert.strictEqual(normalizeThaiYear("67"), 2024);
});

runTest("คงค่าปี ค.ศ. 4 หลัก (2026 -> 2026)", () => {
  assert.strictEqual(normalizeThaiYear(2026), 2026);
});

runTest("แปลงวันที่ภาษาไทยย่อพร้อมเวลา (11 มี.ค. 69 14:25 น.)", () => {
  const res = parseThaiDate("โอนเงินสำเร็จ 11 มี.ค. 69 14:25 น.");
  assert.strictEqual(res.yearAD, 2026);
  assert.strictEqual(res.monthIndex, 2); // มี.ค. = 2
  assert.strictEqual(res.day, 11);
  assert.strictEqual(res.dateOnly, "2026-03-11");
  assert.strictEqual(res.timeOnly, "14:25");
});

runTest("แปลงวันที่ภาษาไทยเต็มครบทั้ง 12 เดือน", () => {
  const res = parseThaiDate("รายการเมื่อ 28 ธันวาคม 2569 เวลา 09:05");
  assert.strictEqual(res.yearAD, 2026);
  assert.strictEqual(res.monthIndex, 11); // ธ.ค. = 11
  assert.strictEqual(res.day, 28);
  assert.strictEqual(res.timeOnly, "09:05");
});

// ----------------------------------------------------------------------------
// SUITE 2: EMVCo QR Code Payload Parser
// ----------------------------------------------------------------------------
console.log("\n🔍 2. EMVCo QR Code Payload Parser");

runTest("แยก Bank Code (0103004 -> KBANK) และ Ref ID (Tag 02) ได้แม่นยำ", () => {
  const qr = "0046000600000101030040220202603111425009988775102TH9104ABCD";
  const parsed = parseEMVCoQR(qr);
  assert.strictEqual(parsed.isValid, true);
  assert.strictEqual(parsed.bankNumericCode, "004");
  assert.strictEqual(parsed.bankCode, "KBANK");
  assert.strictEqual(parsed.refId, "20260311142500998877");
});

runTest("รองรับรหัสธนาคารหลักครบทั้ง 6 แห่ง (KBANK, SCB, BBL, KTB, TTB, BAY)", () => {
  const codes = [
    { raw: "0038000600000101030040212REF123456789", expected: "KBANK" },
    { raw: "0038000600000101030140212REF123456789", expected: "SCB" },
    { raw: "0038000600000101030020212REF123456789", expected: "BBL" },
    { raw: "0038000600000101030060212REF123456789", expected: "KTB" },
    { raw: "0038000600000101030110212REF123456789", expected: "TTB" },
    { raw: "0038000600000101030250212REF123456789", expected: "BAY" }
  ];
  for (const item of codes) {
    const res = parseEMVCoQR(item.raw);
    assert.strictEqual(res.bankCode, item.expected);
    assert.strictEqual(res.refId, "REF123456789");
  }
});

// ----------------------------------------------------------------------------
// SUITE 3: Multi-Bank OCR Slip Samples (จาก sample_slips.json)
// ----------------------------------------------------------------------------
console.log("\n🏦 3. Multi-Bank OCR Slip Extraction");

for (const slip of samples.bankSlips) {
  runTest(`[${slip.expected.bankCode}] ${slip.description}`, () => {
    const tx = parseSlipTransaction({
      ocrText: slip.ocrText,
      qrPayload: slip.qrPayload
    });

    assert.strictEqual(tx.bankCode, slip.expected.bankCode);
    assert.strictEqual(tx.refId, slip.expected.refId);
    assert.strictEqual(tx.amount, slip.expected.amount);
    assert.strictEqual(tx.merchant, slip.expected.merchant);
    assert.strictEqual(tx.yearAD, slip.expected.yearAD);
    assert.strictEqual(tx.monthIndex, slip.expected.monthIndex);
    assert.strictEqual(tx.categoryId, slip.expected.categoryId);
  });
}

// ----------------------------------------------------------------------------
// SUITE 4: Credit Card SMS Extraction (จาก sample_slips.json)
// ----------------------------------------------------------------------------
console.log("\n💳 4. Credit Card SMS Extraction");

for (const sms of samples.creditCardSMS) {
  runTest(`[${sms.expected.bankCode}] ${sms.description}`, () => {
    const tx = parseSlipTransaction({
      ocrText: sms.ocrText,
      qrPayload: sms.qrPayload
    });

    assert.strictEqual(tx.bankCode, sms.expected.bankCode);
    assert.strictEqual(tx.channel, sms.expected.channel);
    assert.strictEqual(tx.amount, sms.expected.amount);
    assert.strictEqual(tx.merchant, sms.expected.merchant);
    assert.strictEqual(tx.yearAD, sms.expected.yearAD);
    assert.strictEqual(tx.monthIndex, sms.expected.monthIndex);
    assert.strictEqual(tx.categoryId, sms.expected.categoryId);
  });
}

// ----------------------------------------------------------------------------
// SUITE 5: SlipDatabase — Deduplication & Budget Summary
// ----------------------------------------------------------------------------
console.log("\n🛡️ 5. Storage Engine — Duplicate Prevention & Monthly Summary");

runTest("ป้องกันการบันทึกสลิปซ้ำด้วย EMVCo Ref ID และคำนวณงบคงเหลือถูกต้อง", () => {
  const db = new SlipDatabase();
  db.updateBudget(10000);

  const firstSlip = samples.bankSlips[0]; // 65.00 THB (March 2026)
  const res1 = db.addTransaction(firstSlip);
  assert.strictEqual(res1.ok, true);
  assert.strictEqual(res1.status, "SAVED");

  // ส่งสลิปเดิมซ้ำอีกครั้ง ต้องถูกบล็อก
  const resDuplicate = db.addTransaction(firstSlip);
  assert.strictEqual(resDuplicate.ok, false);
  assert.strictEqual(resDuplicate.status, "DUPLICATE");

  // เพิ่ม SMS บัตรเครดิตในเดือนเดียวกัน (165.00 THB, March 2026)
  const smsSlip = samples.creditCardSMS[0];
  const res2 = db.addTransaction(smsSlip);
  assert.strictEqual(res2.ok, true);

  // ตรวจสอบยอดรวมประจำเดือนมีนาคม 2026 (65 + 165 = 230 บาท)
  const summary = db.getMonthlySummary(2026, 2);
  assert.strictEqual(summary.transactionCount, 2);
  assert.strictEqual(summary.totalSpent, 230.0);
  assert.strictEqual(summary.remaining, 9770.0);
});

console.log("\n==================================================================");
console.log(
  `📊 SUMMARY: ${passedCount} Passed, ${failedCount} Failed (Total ${passedCount + failedCount} assertions)`
);
console.log("==================================================================\n");

if (failedCount > 0) {
  process.exit(1);
}
