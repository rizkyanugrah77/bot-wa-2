// ================= IMPORT =================
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { google } = require("googleapis");

// ================= CONFIG =================
const SPREADSHEET_ID = "16Rd7n84Lky9YOIqbpfiEVzT0_fiVZgT_924SqnZJAjY";

// ================= GOOGLE SHEETS =================
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function saveToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:O",
    valueInputOption: "USER_ENTERED",
    resource: { values: [data] },
  });
}

// ================= HELPER =================
function id(prefix) {
  return prefix + Date.now();
}

function normalizeText(value) {
  return (value || "").trim().toLowerCase();
}

function getMenuChoice(msg) {
  return normalizeText(msg.selectedButtonId || msg.selectedRowId || msg.body);
}

function getServiceChoice(msg) {
  const choice = getMenuChoice(msg);

  if (["1", "deskripsi", "deskripsi baju"].includes(choice)) {
    return { id_layanan: "L001", nama_layanan: "Deskripsi Baju" };
  }

  if (["2", "order", "order jasa", "jasa"].includes(choice)) {
    return { id_layanan: "L002", nama_layanan: "Order Jasa" };
  }

  return null;
}

function getJenisChoice(msg) {
  const choice = getMenuChoice(msg);

  if (["1", "kaos"].includes(choice)) return "Kaos";
  if (["2", "hoodie"].includes(choice)) return "Hoodie";
  if (["3", "kemeja"].includes(choice)) return "Kemeja";

  return null;
}

function getBahanChoice(msg) {
  const choice = getMenuChoice(msg);

  if (["1", "katun"].includes(choice)) return "Katun";
  if (["2", "wol"].includes(choice)) return "Wol";
  if (["3", "biasa"].includes(choice)) return "Biasa";

  return null;
}

function getWarnaChoice(msg) {
  const choice = getMenuChoice(msg);

  if (["1", "hijau"].includes(choice)) return "Hijau";
  if (["2", "merah"].includes(choice)) return "Merah";
  if (["3", "ungu"].includes(choice)) return "Ungu";

  return null;
}

function getUkuranChoice(msg) {
  const choice = (msg.selectedButtonId || msg.selectedRowId || msg.body || "")
    .trim()
    .toUpperCase();

  if (["1", "S"].includes(choice)) return "S";
  if (["2", "M"].includes(choice)) return "M";
  if (["3", "L"].includes(choice)) return "L";
  if (["4", "XL"].includes(choice)) return "XL";

  return null;
}

function getConfirmationChoice(msg) {
  const choice = getMenuChoice(msg);

  if (["1", "ya", "y"].includes(choice)) return "ya";
  if (["2", "tidak", "t", "no"].includes(choice)) return "tidak";

  return null;
}

function formatSummary(data) {
  return [
    `Nama: ${data.nama}`,
    `Produk: ${data.nama_produk}`,
    `Jenis: ${data.jenis}`,
    `Bahan: ${data.bahan}`,
    `Warna: ${data.warna}`,
    `Ukuran: ${data.ukuran}`,
    `Deskripsi: ${data.deskripsi}`,
    `Catatan: ${data.catatan}`,
  ].join("\n");
}

const SERVICE_OPTIONS_TEXT =
  "1\uFE0F\u20E3 \u{1F4DD} Deskripsi Baju\n2\uFE0F\u20E3 \u{1F6CD}\uFE0F Order Jasa";
const JENIS_OPTIONS_TEXT =
  "1\uFE0F\u20E3 \u{1F455} Kaos\n2\uFE0F\u20E3 \u{1F9E5} Hoodie\n3\uFE0F\u20E3 \u{1F454} Kemeja";
const BAHAN_OPTIONS_TEXT =
  "1\uFE0F\u20E3 \u{1F33F} Katun\n2\uFE0F\u20E3 \u{1F411} Wol\n3\uFE0F\u20E3 \u26AA Biasa";
const WARNA_OPTIONS_TEXT =
  "1\uFE0F\u20E3 \u{1F7E2} Hijau\n2\uFE0F\u20E3 \u{1F534} Merah\n3\uFE0F\u20E3 \u{1F7E3} Ungu";
const UKURAN_OPTIONS_TEXT =
  "1\uFE0F\u20E3 \u{1F4CF} S\n2\uFE0F\u20E3 \u{1F4CF} M\n3\uFE0F\u20E3 \u{1F4CF} L\n4\uFE0F\u20E3 \u{1F4CF} XL";
const CONFIRMATION_OPTIONS_TEXT =
  "1\uFE0F\u20E3 \u2705 YA\n2\uFE0F\u20E3 \u274C TIDAK";

async function sendServiceMenu(replyTarget) {
  return replyTarget.reply(
    `Halo, selamat datang.\n\nSilakan pilih layanan:\n${SERVICE_OPTIONS_TEXT}\n\nBalas dengan angka 1 atau 2.`,
  );
}

async function sendJenisMenu(replyTarget) {
  return replyTarget.reply(
    `Pilih jenis baju:\n${JENIS_OPTIONS_TEXT}\n\nBalas dengan angka 1, 2, atau 3.`,
  );
}

async function sendBahanMenu(replyTarget) {
  return replyTarget.reply(
    `Pilih bahan:\n${BAHAN_OPTIONS_TEXT}\n\nBalas dengan angka 1, 2, atau 3.`,
  );
}

async function sendWarnaMenu(replyTarget) {
  return replyTarget.reply(
    `Pilih warna:\n${WARNA_OPTIONS_TEXT}\n\nBalas dengan angka 1, 2, atau 3.`,
  );
}

async function sendUkuranMenu(replyTarget) {
  return replyTarget.reply(
    `Pilih ukuran:\n${UKURAN_OPTIONS_TEXT}\n\nBalas dengan angka 1, 2, 3, atau 4.`,
  );
}

async function sendConfirmationMenu(replyTarget, data) {
  return replyTarget.reply(
    `Mohon cek data pesanan Anda:\n\n${formatSummary(
      data,
    )}\n\nPilih konfirmasi:\n${CONFIRMATION_OPTIONS_TEXT}\n\nBalas YA/TIDAK atau angka 1/2.`,
  );
}

// ================= BOT =================
const client = new Client({
  authStrategy: new LocalAuth(),
  authTimeoutMs: 60000,
  webVersionCache: {
    type: "none",
  },
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan QR...");
});

client.on("ready", () => {
  console.log("Bot siap!");
});

client.on("authenticated", () => {
  console.log("Autentikasi berhasil.");
});

client.on("auth_failure", (message) => {
  console.error("Autentikasi gagal:", message);
});

client.on("disconnected", (reason) => {
  console.error("Bot terputus:", reason);
});

let users = {};

// ================= LOGIC =================
client.on("message", async (msg) => {
  const user = msg.from;
  const text = (msg.body || "").trim();

  if (!users[user]) users[user] = { step: 0 };
  const u = users[user];

  if (["halo", "menu"].includes(normalizeText(text))) {
    users[user] = {
      step: 1,
      id_customer: id("CUST"),
      no_wa: user,
    };

    return sendServiceMenu(msg);
  }

  if (u.step === 1) {
    const service = getServiceChoice(msg);

    if (!service) {
      return msg.reply(
        `Pilihan belum sesuai.\n\nSilakan pilih:\n${SERVICE_OPTIONS_TEXT}`,
      );
    }

    u.id_layanan = service.id_layanan;
    u.nama_layanan = service.nama_layanan;
    u.step = 2;
    return msg.reply("Silakan ketik nama Anda.");
  }

  if (u.step === 2) {
    u.nama = text;
    u.step = 3;
    return msg.reply("Silakan ketik nama produk");
  }

  if (u.step === 3) {
    u.nama_produk = text;
    u.step = 4;
    return sendJenisMenu(msg);
  }

  if (u.step === 4) {
    const jenis = getJenisChoice(msg);

    if (!jenis) {
      return msg.reply(
        `Pilihan jenis belum sesuai.\n\nPilih salah satu:\n${JENIS_OPTIONS_TEXT}`,
      );
    }

    u.jenis = jenis;
    u.step = 5;
    return sendBahanMenu(msg);
  }

  if (u.step === 5) {
    const bahan = getBahanChoice(msg);

    if (!bahan) {
      return msg.reply(
        `Pilihan bahan belum sesuai.\n\nPilih salah satu:\n${BAHAN_OPTIONS_TEXT}`,
      );
    }

    u.bahan = bahan;
    u.step = 6;
    return sendWarnaMenu(msg);
  }

  if (u.step === 6) {
    const warna = getWarnaChoice(msg);

    if (!warna) {
      return msg.reply(
        `Pilihan warna belum sesuai.\n\nPilih salah satu:\n${WARNA_OPTIONS_TEXT}`,
      );
    }

    u.warna = warna;
    u.step = 7;
    return sendUkuranMenu(msg);
  }

  if (u.step === 7) {
    const ukuran = getUkuranChoice(msg);

    if (!ukuran) {
      return msg.reply(
        `Pilihan ukuran belum sesuai.\n\nPilih salah satu:\n${UKURAN_OPTIONS_TEXT}`,
      );
    }

    u.ukuran = ukuran;
    u.step = 8;
    return msg.reply("Silakan ketik deskripsi pesanan.");
  }

  if (u.step === 8) {
    u.deskripsi = text;
    u.step = 9;
    return msg.reply(
      "Silakan ketik catatan tambahan. Jika tidak ada, balas: -",
    );
  }

  if (u.step === 9) {
    u.catatan = text;
    u.id_order = id("ORD");
    u.id_detail = id("DTL");
    u.tanggal = new Date().toLocaleString("id-ID");
    u.step = 10;
    return sendConfirmationMenu(msg, u);
  }

  if (u.step === 10) {
    const confirmation = getConfirmationChoice(msg);
    const harga = 50000;
    const admin = 2500;
    const tax = harga * 0.1;
    const total = harga + admin + tax;
    if (confirmation === "ya") {
      try {
        await saveToSheet([
          u.id_customer,
          u.nama,
          u.no_wa,
          u.id_layanan,
          u.nama_layanan,
          u.id_order,
          u.tanggal,
          u.catatan,
          u.id_detail,
          u.nama_produk,
          u.jenis,
          u.bahan,
          u.warna,
          u.ukuran,
          u.deskripsi,
        ]);

        await msg.reply(
          `Pesanan berhasil disimpan ✅

🧾 *INVOICE PEMBAYARAN*

Harga Produk : Rp ${harga.toLocaleString("id-ID")}
Biaya Admin : Rp ${admin.toLocaleString("id-ID")}
Tax (10%) : Rp ${tax.toLocaleString("id-ID")}
-------------------------- +
*Total Bayar : Rp ${total.toLocaleString("id-ID")}*

Silakan transfer ke:
🏦 BSI 7174124943

Setelah transfer, kirim bukti pembayaran ya 🙏`,
        );
      } catch (error) {
        console.error("Gagal menyimpan ke Google Sheets:", error);
        return msg.reply(
          "Konfirmasi sudah diterima, tetapi data gagal disimpan ke Google Sheets.\n\nSilakan cek `credentials.json`, akses spreadsheet, dan nama sheet `Sheet1`.",
        );
      }
    } else if (confirmation === "tidak") {
      await msg.reply(
        "Pesanan dibatalkan. Jika ingin mulai lagi, silakan ketik menu.",
      );
    } else {
      return msg.reply(
        `Balasan belum sesuai.\n\nPilih salah satu:\n${CONFIRMATION_OPTIONS_TEXT}\n\nBalas YA/TIDAK atau angka 1/2.`,
      );
    }

    users[user] = { step: 0 };
  }
});

// ================= START =================
client.initialize().catch((err) => {
  console.error("Gagal inisialisasi WhatsApp client:", err);
  console.error(
    "Jika error masih sama, hapus folder .wwebjs_auth dan .wwebjs_cache lalu login ulang.",
  );
});
