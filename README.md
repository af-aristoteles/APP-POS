<div align="center">
  <br/>
  
  <!-- Logo -->
  <img src="public/pwa-192x192.png" width="80" height="80" alt="POS Logo" style="border-radius:12px;border:3px solid #111" />

  <h1 style="border:none;margin:8px 0 0">APP-POS</h1>

  <p><strong>Sistem Point of Sale Modern</strong> — Web-based POS dengan manajemen stok, laporan, dan multi-role.</p>

  <p>
    <img src="https://img.shields.io/badge/Vue_3-4FC08D?logo=vuedotjs&labelColor=111&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&labelColor=111&logoColor=white" />
    <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&labelColor=111&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&labelColor=111&logoColor=white" />
    <img src="https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&labelColor=111&logoColor=white" />
    <img src="https://img.shields.io/badge/Vercel-000000?logo=vercel&labelColor=111&logoColor=white" />
  </p>

  <br/>
</div>

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Panduan Installasi](#-panduan-installasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Setup Database Supabase](#-setup-database-supabase)
- [Deploy ke Vercel](#-deploy-ke-vercel)
- [Struktur Project](#-struktur-project)
- [API Endpoints (Supabase)](#-api-endpoints-supabase)
- [Lisensi](#-lisensi)

---

## ✨ Fitur

### 🔐 Authentication & Role Management
| Fitur | Admin | Kasir |
|---|---|---|
| Login / Logout | ✅ | ✅ |
| Register akun baru | ✅ | ❌ |
| Reset password (via email) | ✅ | ✅ |
| Manajemen user (CRUD) | ✅ | ❌ |
| Dashboard statistik | ✅ | ❌ |
| POS / Kasir | ✅ | ✅ |
| Manajemen produk & kategori | ✅ | ❌ |
| Riwayat transaksi | ✅ | ❌ |
| Laporan & export | ✅ | ❌ |
| Peringatan stok | ✅ | ❌ |
| Profil & ganti password | ✅ | ✅ |

### 🛒 Point of Sale
- Cari & filter produk real-time
- Keranjang dengan kontrol quantity
- **Metode bayar: Tunai** dengan hitung kembalian otomatis
- **Struk digital** dengan barcode (CODE128)
- Cetak struk (browser print)
- Notifikasi transaksi via **Telegram**

### 📦 Manajemen Produk
- CRUD produk & kategori
- Upload gambar produk (via Supabase Storage)
- Stok otomatis berkurang saat checkout
- **Auto-nonaktif** produk saat stok habis (≤ 0)
- Peringatan stok menipis / habis

### 📊 Laporan & Export
- Filter laporan berdasarkan **range tanggal**
- Statistik: total penjualan, rata-rata, jumlah item terjual
- **Top 10 produk** terlaris
- Grafik penjualan harian
- **Export CSV** (buka di Excel)
- **Cetak PDF** (browser print)

### 🔔 Peringatan Stok (Telegram)
- Terkirim otomatis saat stok ≤ minimum
- **Maksimal 1x per hari** per produk
- Dikirim saat dashboard dibuka
- Format pesan: nama produk, stok saat ini, level (menipis/kritis/habis)

### 📱 PWA (Progressive Web App)
- **Installable** — bisa dipasang sebagai aplikasi desktop / mobile
- **Service Worker** — cache otomatis asset untuk loading cepat
- **Offline-ready** — asset tetap bisa diakses meski tanpa internet

### 🎨 Tampilan
- **Neobrutalism** design — border tebal, warna kontras tinggi
- **Responsive** — mobile, tablet, desktop
- Boxed layout dengan sidebar navigasi

---

## 🛠 Tech Stack

| Teknologi | Fungsi |
|---|---|
| [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`) | Frontend framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling utility-first |
| [Pinia](https://pinia.vuejs.org/) | State management |
| [Vue Router](https://router.vuejs.org/) | Routing & guards |
| [Supabase](https://supabase.com/) | Auth, Database (PostgreSQL), Storage |
| [JsBarcode](https://github.com/lindell/JsBarcode) | Generate barcode struk |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | PWA manifest & service worker |
| [Vercel](https://vercel.com/) | Hosting (free tier) |
| [Telegram Bot API](https://core.telegram.org/bots/api) | Notifikasi stok & transaksi |

---

## 📸 Screenshots

| Login | Dashboard | POS | Laporan |
|---|---|---|---|
| ![Login](https://ik.imagekit.io/11ladp3yp/Screenshot%202026-05-10%20141531.png) | ![Dashboard](https://ik.imagekit.io/11ladp3yp/Screenshot%202026-05-10%20141554.png) | ![POS](https://ik.imagekit.io/11ladp3yp/Screenshot%202026-05-10%20141613.png) | ![Laporan](https://ik.imagekit.io/11ladp3yp/Screenshot%202026-05-10%20141701.png) |

---

## 🚀 Panduan Installasi

### Prerequisites
- **Node.js** ≥ 20
- **npm** atau **pnpm**
- Akun [Supabase](https://supabase.com/) (free tier cukup)
- Akun [Vercel](https://vercel.com/) (untuk hosting)

### 1. Clone Repository

```bash
git clone https://github.com/af-aristoteles/APP-POS.git
cd APP-POS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Opsional — untuk notifikasi Telegram
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_CHAT_ID=your-chat-id
```

Dapatkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari:
**Supabase Dashboard** → **Settings** → **API** → Project URL & anon/public key.

### 4. Setup Database

Buka **Supabase Dashboard** → **SQL Editor** → **New Query** → paste isi file `supabase-setup.sql` → **Run**.

Atau jalankan via terminal:

```bash
npx supabase db push
```

### 5. Matikan Email Confirmation

**Supabase Dashboard** → **Authentication** → **Providers** → **Email** → **Toggle OFF** "Confirm email" → **Save**.

> ⚠️ Wajib dilakukan agar user bisa langsung login tanpa verifikasi email.

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:5173

### 7. Setup Redirect URL (untuk reset password)

**Supabase Dashboard** → **Authentication** → **URL Configuration** → **Redirect URLs** → tambahkan:

```
http://localhost:5173/reset-password
https://your-app.vercel.app/reset-password
```

### 8. Build untuk Production

```bash
npm run build
```

---

## 🔧 Konfigurasi Environment

| Variable | Wajib? | Deskripsi |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Anon/public key dari Supabase |
| `VITE_TELEGRAM_BOT_TOKEN` | ❌ | Token bot Telegram untuk notifikasi |
| `VITE_TELEGRAM_CHAT_ID` | ❌ | Chat ID tujuan notifikasi |

---

## 🗄 Setup Database Supabase

File `supabase-setup.sql` berisi semua yang dibutuhkan:

### Tabel

| Tabel | Fungsi |
|---|---|
| `user_profiles` | Data user (nama, role admin/kasir) |
| `categories` | Kategori produk |
| `products` | Data produk (harga, stok, dll) |
| `transactions` | Transaksi penjualan |
| `transaction_items` | Item dalam transaksi |
| `stock_alerts` | Log peringatan stok menipis |

### Trigger

| Trigger | Fungsi |
|---|---|
| `on_auth_user_created` | Auto-buat profile saat user register |
| `set_invoice_number` | Generate nomor invoice otomatis (INV-YYYYMMDD-XXXX) |
| `trigger_update_stock` | Update stok & buat alert saat transaksi |
| `update_products_updated_at` | Update timestamp otomatis |
| `update_categories_updated_at` | Update timestamp otomatis |

### Seed Data

- **6 kategori**: Minuman, Makanan, Snack, Elektronik, Kecantikan, Kebutuhan Rumah Tangga
- **8 produk contoh**: Kopi Susu, Teh Botol, Air Mineral, Nasi Goreng, Mie Instan, Roti Bakar, Keripik Singkong, Coklat Batang

---

## 🌐 Deploy ke Vercel

### Via Vercel Dashboard (rekomendasi)

1. Push repository ke GitHub
2. Buka [vercel.com](https://vercel.com) → **Add New** → **Project**
3. Pilih repository `APP-POS`
4. **Framework Preset**: otomatis terdeteksi sebagai **Vite**
5. Tambahkan **Environment Variables** (sama seperti di `.env`)
6. Klik **Deploy**

### Via CLI

```bash
npx vercel --prod
```

File `vercel.json` sudah disediakan untuk menangani SPA routing dan security headers.

---

## 📁 Struktur Project

```
APP-POS/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── assets/
│   │   └── main.css             # Global CSS + Tailwind
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.vue    # Layout utama (sidebar + header)
│   │       ├── Header.vue       # Top bar
│   │       └── Sidebar.vue      # Navigasi sidebar
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── telegram.ts          # Telegram bot API
│   │   └── utils.ts             # Helper functions
│   ├── router/
│   │   └── index.ts             # Routes + role-based guards
│   ├── stores/
│   │   ├── auth.ts              # Auth state (login, register, forgot/reset)
│   │   ├── cart.ts              # Cart + checkout
│   │   ├── product.ts           # Produk & kategori CRUD
│   │   └── transaction.ts       # Transaksi state
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── ForgotPasswordView.vue
│   │   ├── ResetPasswordView.vue
│   │   ├── DashboardView.vue
│   │   ├── POSView.vue
│   │   ├── ProductsView.vue
│   │   ├── CategoriesView.vue
│   │   ├── TransactionsView.vue
│   │   ├── ReportsView.vue
│   │   ├── AlertsView.vue
│   │   ├── UsersView.vue
│   │   └── ProfileView.vue
│   ├── App.vue
│   └── main.ts
├── supabase-setup.sql           # Full database schema
├── vercel.json                  # Vercel config
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📡 API Endpoints (Supabase)

Aplikasi menggunakan Supabase client-side SDK, bukan REST API langsung. Semua query dilakukan via Supabase JavaScript client (`@supabase/supabase-js`).

### Auth
| Method | Endpoint | Deskripsi |
|---|---|---|
| `signInWithPassword` | `auth/v1/token?grant_type=password` | Login |
| `signUp` | `auth/v1/signup` | Register |
| `signOut` | `auth/v1/logout` | Logout |
| `resetPasswordForEmail` | `auth/v1/recover` | Lupa password |
| `updateUser` | `auth/v1/user` | Update password |

### Database (REST via client)
| Tabel | Operasi |
|---|---|
| `user_profiles` | SELECT, INSERT, UPDATE, DELETE |
| `categories` | SELECT, INSERT, UPDATE, DELETE |
| `products` | SELECT, INSERT, UPDATE, DELETE |
| `transactions` | SELECT, INSERT (with trigger) |
| `transaction_items` | SELECT, INSERT |
| `stock_alerts` | SELECT, INSERT, UPDATE |

---

## 🤝 Kontribusi

Pull request dipersilakan. Untuk perubahan besar, buka issue dulu untuk diskusi.

1. Fork repository
2. Buat branch fitur (`git checkout -b fitur/foo`)
3. Commit perubahan (`git commit -m 'feat: tambah foo'`)
4. Push ke branch (`git push origin fitur/foo`)
5. Buat Pull Request

---

## 📄 Lisensi

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Dibuat dengan ❤️ oleh <a href="https://github.com/af-aristoteles">af-aristoteles</a></sub>
  <br/>
  <sub>© 2026 — APP-POS</sub>
</div>
