# MULIA GROUP — JO PRODUKSI

Aplikasi Job Order Produksi untuk Vercel + Google Drive.

## Deploy ke GitHub + Vercel

1. Upload seluruh isi folder ini ke repository GitHub.
2. Import repository tersebut ke Vercel.
3. Framework: **Other** / static + serverless API.
4. Vercel akan membaca `vercel.json`.
5. Setelah deploy, buka **Vercel → Project → Settings → Environment Variables**.
6. Tambahkan:
   - `GOOGLE_DRIVE_FOLDER_ID`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
7. Redeploy.

## Google Drive

Folder root Google Drive harus dibagikan ke email Service Account sebagai **Editor**.

Aplikasi akan menggunakan folder:

`PRODUKSI - JO/database/jo-index.json`

Credential Service Account hanya boleh disimpan di Vercel Environment Variables, **jangan di-commit ke GitHub**.

## Fitur V9

- Dashboard JO
- PIC Produksi
- Filter berdasarkan PIC
- Detail beberapa item dalam satu JO
- Spesifikasi produksi
- Gambar kerja
- Progress per tahap
- Catatan progress
- Foto progress
- Print / Save as PDF
- Backup / import JSON
- Endpoint Google Drive
