// ================= IMPORT =================
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { google } = require("googleapis");

// ================= CONFIG =================
const SPREADSHEET_ID = "1H3Hlx6sosbgH5nWzNOt8WTwbTmt57cQfq-PilmTYMeU";

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

async function sendServiceMenu(replyTarget) {
  return replyTarget.reply(
    "Halo, selamat datang.\n\nSilakan pilih layanan:\n1. Deskripsi Baju\n2. Order Jasa\n\nBalas dengan angka 1 atau 2."
  );
}

async function sendJenisMenu(replyTarget) {
  return replyTarget.reply(
    "Pilih jenis baju:\n1. Kaos\n2. Hoodie\n3. Kemeja\n\nBalas dengan angka 1, 2, atau 3."
  );
}

async function sendUkuranMenu(replyTarget) {
  return replyTarget.reply(
    "Pilih ukuran:\n1. S\n2. M\n3. L\n4. XL\n\nBalas dengan angka 1, 2, 3, atau 4."
  );
}

async function sendConfirmationMenu(replyTarget, data) {
  return replyTarget.reply(
    `Mohon cek data pesanan Anda:\n\n${formatSummary(
      data
    )}\n\nBalas YA untuk simpan pesanan.\nBalas TIDAK untuk batal.\nAnda juga bisa kirim 1 untuk YA dan 2 untuk TIDAK.`
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
        "Pilihan belum sesuai.\n\nSilakan pilih:\n1. Deskripsi Baju\n2. Order Jasa"
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
    return msg.reply("Silakan ketik nama produk.");
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
        "Pilihan jenis belum sesuai.\n\nPilih salah satu:\n1. Kaos\n2. Hoodie\n3. Kemeja"
      );
    }

    u.jenis = jenis;
    u.step = 5;
    return msg.reply("Silakan ketik bahan.");
  }

  if (u.step === 5) {
    u.bahan = text;
    u.step = 6;
    return msg.reply("Silakan ketik warna.");
  }

  if (u.step === 6) {
    u.warna = text;
    u.step = 7;
    return sendUkuranMenu(msg);
  }

  if (u.step === 7) {
    const ukuran = getUkuranChoice(msg);

    if (!ukuran) {
      return msg.reply(
        "Pilihan ukuran belum sesuai.\n\nPilih salah satu:\n1. S\n2. M\n3. L\n4. XL"
      );
    }

    u.ukuran = ukuran;
    u.step = 8;
    return msg.reply("Silakan ketik deskripsi pesanan.");
  }

  if (u.step === 8) {
    u.deskripsi = text;
    u.step = 9;
    return msg.reply("Silakan ketik catatan tambahan. Jika tidak ada, balas: -");
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
          "Pesanan berhasil disimpan.\n\nSilakan transfer ke:\nBCA xxxxxxxxxxxx\nRp 50.000\n\nSetelah transfer, kirim bukti pembayaran ya."
        );
      } catch (error) {
        console.error("Gagal menyimpan ke Google Sheets:", error);
        return msg.reply(
          "Konfirmasi sudah diterima, tetapi data gagal disimpan ke Google Sheets.\n\nSilakan cek `credentials.json`, akses spreadsheet, dan nama sheet `Sheet1`."
        );
      }
    } else if (confirmation === "tidak") {
      await msg.reply("Pesanan dibatalkan. Jika ingin mulai lagi, silakan ketik menu.");
    } else {
      return msg.reply(
        "Balasan belum sesuai.\n\nBalas YA untuk simpan pesanan atau TIDAK untuk batal.\nAnda juga bisa kirim 1 untuk YA dan 2 untuk TIDAK."
      );
    }

    users[user] = { step: 0 };
  }
});

// ================= START =================
client.initialize().catch((err) => {
  console.error("Gagal inisialisasi WhatsApp client:", err);
  console.error(
    "Jika error masih sama, hapus folder .wwebjs_auth dan .wwebjs_cache lalu login ulang."
  );
});
