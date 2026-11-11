// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: magic;

/**
 * ============================================================================
 * SLIPTRACKER — ONE-CLICK AUTO-UPDATE LOADER (iOS Scriptable)
 * ============================================================================
 * วิธีใช้งาน:
 * 1. คัดลอกโค้ดนี้ไปวางในแอป Scriptable แล้วตั้งชื่อสคริปต์ว่า "SlipDashboard"
 * 2. ตัว Loader จะดึงเอนจินหลัก (SlipCore.js) เวอร์ชันล่าสุดจาก GitHub อัตโนมัติ
 * 3. เก็บ Cache ลงใน iCloud Drive เพื่อให้ทำงานแบบ Offline ได้ 100% แม้ไม่มีเน็ต
 * ============================================================================
 */

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/Teenoiii/slip-tracker/main/scriptable/SlipCore.js";
const CACHE_FOLDER = "SlipTracker";
const CACHE_FILE = "SlipCore.cache.js";
const META_FILE = "SlipLoader.meta.json";

async function boot() {
  const fm = getFileManager();
  const baseDir = fm.joinPath(fm.documentsDirectory(), CACHE_FOLDER);

  if (!fm.fileExists(baseDir)) {
    fm.createDirectory(baseDir, true);
  }

  const cachePath = fm.joinPath(baseDir, CACHE_FILE);
  const metaPath = fm.joinPath(baseDir, META_FILE);

  // ดาวน์โหลดไฟล์จาก iCloud หากยังอยู่บน Cloud
  if (fm.fileExists(cachePath) && fm.isFileStoredIniCloud && fm.isFileStoredIniCloud(cachePath)) {
    try {
      await fm.downloadFileFromiCloud(cachePath);
    } catch (_) {
      // Fallback to remote fetch if iCloud download fails
    }
  }

  let inputPayload = null;
  if (typeof args !== "undefined") {
    if (args.shortcutParameter) {
      inputPayload = args.shortcutParameter;
    } else if (args.plainTexts && args.plainTexts.length > 0) {
      inputPayload = args.plainTexts[0];
    } else if (args.queryParameters && Object.keys(args.queryParameters).length > 0) {
      inputPayload = args.queryParameters;
    }
  }

  const forceUpdate =
    inputPayload &&
    typeof inputPayload === "object" &&
    inputPayload.action === "force_update";

  let coreCode = null;
  let updatedFromRemote = false;

  // พยายามดึงเวอร์ชันล่าสุดจาก GitHub (Timeout 4 วินาที เพื่อไม่ให้ Shortcut ช้า)
  if (forceUpdate || shouldCheckRemote(fm, metaPath)) {
    try {
      const req = new Request(GITHUB_RAW_URL);
      req.timeoutInterval = 4;
      const remoteCode = await req.loadString();

      if (remoteCode && remoteCode.includes("SLIPTRACKER_CORE_ENGINE")) {
        coreCode = remoteCode;
        fm.writeString(cachePath, coreCode);
        fm.writeString(
          metaPath,
          JSON.stringify({
            lastUpdated: new Date().toISOString(),
            source: GITHUB_RAW_URL,
            size: coreCode.length
          })
        );
        updatedFromRemote = true;
      }
    } catch (networkError) {
      console.warn(`[SlipLoader] Offline or GitHub unreachable: ${networkError.message}`);
    }
  }

  // หากดึงจาก Remote ไม่ได้ ให้ใช้ Cache ในเครื่อง
  if (!coreCode && fm.fileExists(cachePath)) {
    coreCode = fm.readString(cachePath);
  }

  if (!coreCode) {
    const errorMsg =
      "ไม่พบไฟล์ระบบ SlipCore ในเครื่อง และไม่สามารถเชื่อมต่ออินเทอร์เน็ตเพื่อดาวน์โหลดครั้งแรกได้ กรุณาต่ออินเทอร์เน็ตแล้วรันใหม่อีกครั้ง";
    if (typeof config !== "undefined" && config.runsWithSiri) {
      Script.setShortcutOutput({ ok: false, error: errorMsg });
    } else if (typeof Alert !== "undefined") {
      const alert = new Alert();
      alert.title = "SlipTracker — ติดตั้งไม่สำเร็จ";
      alert.message = errorMsg;
      alert.addAction("ตกลง");
      await alert.presentAlert();
    }
    Script.complete();
    return;
  }

  try {
    // รัน Core Engine ด้วย AsyncFunction พร้อมส่ง Context ของ Scriptable เข้าไปครบถ้วน
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
    const runner = new AsyncFunction(
      "LOADER_CONTEXT",
      `${coreCode}\n;if (typeof runSlipTracker === "function") { return await runSlipTracker(LOADER_CONTEXT); }`
    );

    const result = await runner({
      inputPayload,
      updatedFromRemote,
      cachePath,
      loaderVersion: "1.0.0"
    });

    if (typeof config !== "undefined" && config.runsWithSiri && result) {
      Script.setShortcutOutput(result);
    }
  } catch (execError) {
    console.error(`[SlipLoader] Execution Error: ${execError.message}`);
    if (typeof Alert !== "undefined" && (!config || !config.runsInWidget)) {
      const errAlert = new Alert();
      errAlert.title = "เกิดข้อผิดพลาดในระบบ SlipTracker";
      errAlert.message = String(execError.stack || execError.message || execError);
      errAlert.addAction("ปิด");
      await errAlert.presentAlert();
    }
  }

  Script.complete();
}

function getFileManager() {
  try {
    return FileManager.iCloud();
  } catch (_) {
    return FileManager.local();
  }
}

function shouldCheckRemote(fm, metaPath) {
  try {
    if (!fm.fileExists(metaPath)) return true;
    const meta = JSON.parse(fm.readString(metaPath));
    if (!meta || !meta.lastUpdated) return true;
    const elapsedMs = Date.now() - new Date(meta.lastUpdated).getTime();
    // เช็คอัปเดตทุกๆ 6 ชั่วโมง เพื่อความรวดเร็วเวลาสแกนสลิป
    return elapsedMs > 6 * 60 * 60 * 1000;
  } catch (_) {
    return true;
  }
}

await boot();
