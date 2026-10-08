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
├── assets/           67 fail  (CSS, JS, lib, imej)
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
| Nombor WhatsApp | **Theme settings** → WhatsApp |
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

## 6. Nota penting

**Pembayaran:** Shopify Payments **tidak tersedia di Malaysia**. Untuk terima
bayaran, guna manual bank transfer, Billplz, senangPay atau Stripe.

**Penafian MDA:** Produk InsoLab dipasarkan sebagai produk keselesaan dan
sokongan, **bukan** alat perubatan. Semua teks penafian dikekalkan di footer
dan nota borang pesanan.

**Jangan commit kredensial.** Jangan letak token, kunci API atau
`config/settings_data.json` dalam repo ini.

---

## 7. Status semasa

- `shopify theme check` → **22 fail, 0 offenses** ✅
- 13 seksyen, schema JSON sah semua
- Semua rujukan `asset_url` disahkan wujud (tiada 404)
- Fail zip: 89 fail, fail tema di akar (tiada folder pembalut)
