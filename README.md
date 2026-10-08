# InsoLab — Shopify Theme

Tema Shopify untuk **InsoLab** (custom insoles, Malaysia). Dibina daripada reka
bentuk laman statik InsoLab dan disesuaikan sepenuhnya untuk Shopify.

Repo ini **boleh disambung terus dengan Shopify** — sama ada melalui
**Shopify CLI** (sync dua hala) atau **integrasi GitHub rasmi Shopify**
(auto-deploy bila push).

---

## 1. Struktur repo

Semua fail tema berada di **akar repo** — ini keperluan Shopify.

```
.
├── assets/           71 fail  (CSS, JS, lib, imej, video)
├── config/           settings_schema.json  (tetapan tema)
│                     settings_data.json    (TIDAK di-commit — Shopify simpan)
├── layout/           theme.liquid
├── locales/          en.default.json
├── sections/         13 seksyen (semua boleh edit dari theme editor)
├── snippets/         komponen kecil yang diguna semula
├── templates/        index.json (homepage), product.json, cart.liquid,
│                     page.liquid, 404.liquid
│
├── .github/          workflow CI (bukan fail tema)
├── .shopifyignore    fail yang TIDAK dihantar ke Shopify
├── .theme-check.yml  konfigurasi linter Shopify
├── shopify.theme.toml  sambungan ke kedai (bukan fail tema)
├── package.json      arahan npm untuk CLI
└── README.md         fail ini
```

---

## 2. Cara sambung dengan Shopify

### Pilihan A — Shopify CLI (sync dua hala, untuk pembangunan)

Shopify CLI membenarkan anda tarik, ubah dan hantar perubahan tema secara
langsung ke kedai.

```bash
npm install                       # pasang Shopify CLI (devDependency)
npx shopify auth login            # log masuk ke kedai Shopify
npm run dev                       # pratonton langsung + auto-sync
npm run pull                      # tarik tema dari Shopify ke fail tempatan
npm run push                      # hantar fail tempatan ke Shopify
npm run check                     # jalankan linter Theme Check
```

`npm run dev` membuka pratonton di pelayar. Setiap kali anda simpan fail,
Shopify akan muat semula halaman secara automatik. Ini cara terpantas untuk
mengedit.

**Sebelum guna `push`/`pull`,** isi `shopify.theme.toml`:

```toml
[environments.default]
store = "KEDAI-ANDA.myshopify.com"
path  = "."
theme = "ID_TEMA"
```

Cari `ID_TEMA` dengan `npx shopify theme list`.

### Pilihan B — Integrasi GitHub rasmi Shopify (auto-deploy bila push)

1. Shopify Admin → **Online Store → Themes**
2. Klik **Add theme → Connect from GitHub**
3. Pilih repo `maryamstore6/insolab-shopify` dan branch `main`
4. Setiap `git push` ke `main` akan dikemas kini ke tema itu

> Syarat: kedai mesti pada pelan yang menyokong integrasi GitHub, dan app
> Shopify GitHub mesti diberi akses kepada repo ini.

### Pilihan C — Muat naik zip (paling mudah, sekali sahaja)

```bash
npm run release:zip        # atau: python3 -m zipfile -c insolab-shopify-theme.zip assets config layout locales sections snippets templates
```

Kemudian Shopify Admin → **Online Store → Themes → Add theme → Upload zip file**.

Fail zip **mesti** ada fail tema di akar (tiada folder pembalut). Workflow
`.github/workflows/release-zip.yml` membina zip yang betul secara automatik
apabila anda push tag `v*`.

---

## 3. Edit laman (untuk yang bukan teknikal)

Buka **Shopify Admin → Online Store → Themes → Customize**.

Semua yang berikut boleh diubah **tanpa sentuh kod**:

| Nak ubah | Di mana |
|---|---|
| Teks hero, tajuk, butang | Klik bahagian pada pratonton, edit panel kiri |
| Gambar | Panel kiri → pilih **Add image** / tukar gambar |
| Warna brand | **Theme settings** (ikon gear) → Warna |
| Font | **Theme settings** → Tipografi |
| Nombor WhatsApp | **Theme settings** → WhatsApp → *Nombor WhatsApp* (pautan) + *Nombor untuk dipaparkan* (teks) |
| Font | **Theme settings** → Tipografi (senarai pilihan, bukan taip nama) |
| Susunan seksyen | Seret seksyen pada senarai kiri |
| Tambah/buang seksyen | **Add section** / **Remove section** |
| Soalan lazim (FAQ) | Klik seksyen Soalan Lazim → tambah/edit kumpulan & soalan |
| Harga produk | **Products** (bukan dalam tema) |

### Bagaimana produk berfungsi

Seksyen **Order** dan **Produk** mengambil data daripada **Products** dalam
Shopify. Untuk tambah atau tukar harga:

1. Shopify Admin → **Products**
2. Cipta/ubah produk
3. Harga, stok dan varian semua datang dari sini

Borang pesanan menggunakan `{% form 'product' %}` Shopify sebenar → masuk ke
**Orders** dan **checkout** Shopify. Tiada borang palsu.

---

## 4. Seksyen yang ada

| Fail | Nama | Boleh edit |
|---|---|---|
| `sections/header.liquid` | Header & menu | ✅ |
| `sections/hero.liquid` | Hero utama | ✅ |
| `sections/marquee.liquid` | Teks bergerak | ✅ |
| `sections/kenapa.liquid` | Kenapa InsoLab | ✅ |
| `sections/products.liquid` | Pameran produk | ✅ |
| `sections/split-video.liquid` | Video + teks (×2) | ✅ |
| `sections/process.liquid` | Proses 6 langkah | ✅ |
| `sections/testimonials.liquid` | Testimoni | ✅ |
| `sections/guarantee.liquid` | Jaminan | ✅ |
| `sections/faq.liquid` | Soalan Lazim (kumpulan bersarang) | ✅ |
| `sections/cta.liquid` | Ajakan akhir | ✅ |
| `sections/footer.liquid` | Footer | ✅ |
| `sections/main-product.liquid` | Halaman produk + buy box | ✅ |

Setiap seksyen ada `{% schema %}` dengan `presets` — boleh ditambah, dibuang
dan disusun semula dari theme editor.

---

## 5. CI dan kualiti

| Workflow | Bila | Apa | Status |
|---|---|---|---|
| `theme-check.yml` | Setiap push/PR ke `main` | Lint Liquid + JSON, gagal jika ada error | ✅ lulus |
| `deploy-theme.yml` | Push ke `main` | Hantar tema ke Shopify (perlu secrets) | ✅ lulus (skip bila token tiada) |
| `release-zip.yml` | Tag `v*` atau manual | Bina zip + lampir pada Release | ✅ sedia |

### Secrets untuk `deploy-theme.yml`

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Nilai |
|---|---|
| `SHOPIFY_CLI_THEME_TOKEN` | Token "Theme access" dari Shopify |
| `SHOPIFY_FLAG_STORE` | `kedai-anda.myshopify.com` (pilihan) |

Cara dapatkan token: Shopify Admin → **Online Store → Themes → ⋯ → Theme access
→ Create token**.

Bila token belum diset, workflow Deploy akan **skip dengan warning** (bukan
gagal) — jadi CI sentiasa hijau walaupun kedai belum bersedia.

---

## 6. Video

Dua video imprint terbina dalam `assets/` (setiap satu ada `.webm` + `.mp4` +
poster), dan sudah disambung ke dua seksyen **Split (video + teks)** di laman
utama — satu tunjuk panduan imprint, satu tunjuk imprint dewasa:

| Fail | Saiz | Digunakan oleh |
|---|---|---|
| `imprint-guide.webm` / `.mp4` | 2.65 / 5.06 MB | Split 1 (Panduan imprint) |
| `imprint-adult.webm` / `.mp4` | 1.64 / 3.28 MB | Split 2 (Imprint dewasa) |

Untuk tukar, buka **Customize → Split (video + teks) → Video terbina dalam**:

| Pilihan | Maksud |
|---|---|
| Panduan imprint | Guna video panduan (default Split 1) |
| Imprint dewasa | Guna video imprint dewasa (default Split 2) |
| Tiada (guna poster) | Tunjuk gambar poster sahaja |

**Keutamaan:** kalau anda muat naik video sendiri (medan **Video Shopify**)
atau isi **pautan fail video**, itu yang akan dimainkan — video terbina dalam
hanya jadi sandaran.

Kedua-dua video sudah ditetapkan: **Split 1** = Panduan imprint,
**Split 2** = Imprint dewasa (jadi laman tidak main klip sama dua kali).

**Nota video:** video main automatik tetapi **senyap** dan **tiada butang
kawalan** — ia berfungsi sebagai latar, bukan video yang perlu dikawal. Ia guna
`preload="metadata"`, jadi hanya metadata dimuat masa halaman buka; fail penuh
dimuat bila pembaca skrol sampai ke situ.

Video guna `preload="metadata"` + `poster`, jadi ia **tidak** dimuat turun
sepenuhnya semasa halaman dibuka — hanya poster. Video dimainkan bila pembaca
skrol ke situ.

## 7. Nota penting

**Pembayaran:** Shopify Payments **tidak tersedia di Malaysia**. Untuk terima
bayaran, guna manual bank transfer, Billplz, senangPay atau Stripe.

**Penafian MDA:** Produk InsoLab dipasarkan sebagai produk keselesaan dan
sokongan, **bukan** alat perubatan. Semua teks penafian dikekalkan di footer
dan nota borang pesanan.

**Jangan commit kredensial.** Jangan letak token, kunci API atau
`config/settings_data.json` dalam repo ini.

---

## 8. Status semasa

- `shopify theme check` → **36 fail, 0 offenses** ✅
- **18 seksyen**, semua schema JSON sah + ada presets
- **12 templat** (index, product, cart, page, 404, search, collection,
  list-collections, blog, article, gift_card, password)
- **71 aset** (18 MB) — semua fail disahkan tidak rosak, tiada subfolder
- Semua rujukan `asset_url` disahkan wujud (tiada 404)
- Gambar responsif: WebP dahulu, JPEG sebagai sandaran (hero, proses, arch)
- Fail zip: **106 entri, 16.86 MB** — fail tema di akar (tiada folder pembalut),
  had Shopify 50 MB
