========================================================
  INTEGRATE-DEEPLAKE-NEXT
  -----------------------------------------------------
  Next.js + Midtrans + Kill Bill Integration + Xendit
========================================================

Project ini berisi contoh integrasi antara Next.js dengan layanan Midtrans dan 
Kill Bill. Struktur folder Next.js berada di dalam folder "integrate-deeplake-next", 
terutama di direktori "src/app/".

Daftar Isi:
1. Struktur Folder
2. Deskripsi Folder
3. Cara Menjalankan Proyek
4. Integrasi Midtrans dan Kill Bill
5. Lisensi


========================================================
1. STRUKTUR FOLDER
========================================================

Berikut struktur umum proyek di folder "integrate-deeplake-next":

integrate-deeplake-next
└── src
    └── app
        ├── api
        │   ├── midtrans
        │   │   └── routeMidtrans.ts   (Contoh nama file)
        │   ├── killbill
        │   │   └── routeKillbill.ts   (Contoh nama file)
        │   └── ... (route API lainnya)
        ├── fonts
        ├── lib
        │   ├── killbill.ts
        │   └── midtrans.ts
        ├── test-kb-mid-integ
        │   └── ... (UI terkait Kill Bill & Midtrans)
        ├── test-nextflow
        ├── test-visionx-engine
        ├── testing
        ├── favicon.ico
        ├── globals.css
        ├── layout.tsx
        └── page.tsx


========================================================
2. DESKRIPSI FOLDER
========================================================

1. api/
   - Berisi route API untuk komunikasi dengan Midtrans dan Kill Bill.
   - Contoh:
     • routeMidtrans.ts (menerima permintaan transaksi, menangani callback dll.)
     • routeKillbill.ts (membuat/mengelola tagihan, subscription, dsb. di Kill Bill)

2. fonts/
   - Folder opsional untuk menyimpan berkas font khusus.

3. lib/
   - Menyimpan helper atau client library.
   - killbill.ts: Fungsi/folder inisialisasi, API client Kill Bill.
   - midtrans.ts: Fungsi/folder inisialisasi, API client Midtrans.

4. test-kb-mid-integ/
   - Berisi UI (frontend) untuk menampilkan dan menguji integrasi Kill Bill & Midtrans.
   - Dapat berisi formulir pembayaran/subscribe, dsb.

5. test-nextflow/
   - Folder percobaan atau testing untuk alur Next.js tertentu.

6. test-visionx-engine/
   - Folder percobaan lain atau integrasi dengan engine terkait (visionx).

7. testing/
   - Dapat berisi skrip testing atau sandbox.

8. favicon.ico, globals.css, layout.tsx, page.tsx
   - favicon.ico: Ikon untuk browser/tab.
   - globals.css: Gaya global yang diterapkan di seluruh aplikasi.
   - layout.tsx: Layout global, mis. header/footer umum di setiap halaman.
   - page.tsx: File halaman utama (root) Next.js.


========================================================
3. CARA MENJALANKAN PROYEK
========================================================

1. Pindah ke folder "integrate-deeplake-next":
   > cd integrated-next-deep/integrate-deeplake-next

2. Instal dependensi:
   > npm install
     atau
   > yarn install

3. Buat atau edit file .env.local untuk menyimpan konfigurasi API:
   --------------------------------------------------
   MIDTRANS_SERVER_KEY=...
   MIDTRANS_CLIENT_KEY=...
   KILLBILL_HOST=...
   KILLBILL_API_KEY=...
   KILLBILL_API_SECRET=...
   --------------------------------------------------
   Pastikan file ini tidak diunggah ke repository publik.

4. Jalankan aplikasi (development mode):
   > npm run dev
     atau
   > yarn dev
   Aplikasi akan tersedia di http://localhost:3000


========================================================
4. INTEGRASI MIDTRANS DAN KILL BILL
========================================================

-- Midtrans --
• Folder/route: src/app/api/midtrans/
• Menyediakan endpoint untuk pembuatan transaksi, notifikasi (callback) pembayaran, 
  dan pengecekan status pembayaran.

-- Kill Bill --
• Folder/route: src/app/api/killbill/
• Berfungsi untuk membuat dan mengelola subscription, faktur, atau billing cycle. 
• File helper/klien: src/app/lib/killbill.ts

Alur sederhana integrasi:
1. User memilih produk/layanan di UI (folder test-kb-mid-integ).
2. UI mengirim permintaan transaksi ke API Midtrans.
3. Midtrans mengirim notifikasi webhook ke endpoint Next.js setelah pembayaran.
4. Status pembayaran dicatat, dapat di-update ke Kill Bill untuk penagihan berkala.

