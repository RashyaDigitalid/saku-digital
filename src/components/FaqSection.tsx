import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Sparkles, Zap, Lock, Smartphone, CheckCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'umum' | 'keamanan' | 'fitur' | 'biaya';
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'umum',
    question: 'Apa itu Alat Ajaib dan apa saja fasilitas yang ditawarkannya?',
    answer: 'Alat Ajaib adalah portal utilitas digital online terpadu dan pemroses berkas gratis yang dirancang khusus untuk mempermudah pekerjaan harian masyarakat, staf administrasi, mahasiswa, pelaku UMKM, hingga pembuat konten di Indonesia. Portal ini menyediakan 43+ alat serbaguna yang terbagi dalam kategori Media & Video, Dokumen & PDF, Bisnis & Kasir UMKM, serta Utilitas Sehari-hari. Seluruh alat dapat digunakan langsung dari peramban (browser) tanpa perlu mengunduh software, tanpa pendaftaran akun, dan tanpa batasan kuota penggunaan.'
  },
  {
    id: 'faq-2',
    category: 'keamanan',
    question: 'Apakah berkas PDF, dokumen rahasia, foto KTP, dan video saya aman saat diproses?',
    answer: '100% Sangat Aman dan Terjamin Kerahasiannya. Alat Ajaib mengusung arsitektur Client-Side Local Processing (Pemrosesan Sisi Klien). Artinya, saat Anda mengompres dokumen PDF, menyensor NIK KTP, memotong video, atau mengedit foto, seluruh proses komputasi dijalankan secara lokal oleh mesin peramban di perangkat (HP/Laptop) Anda sendiri. Berkas, foto, dan data pribadi Anda TIDAK PERNAH diunggah, dikirim, atau disimpan ke server luar/pihak ketiga, sehingga bebas dari risiko kebocoran data atau intipan pihak lain.'
  },
  {
    id: 'faq-3',
    category: 'biaya',
    question: 'Apakah seluruh fasilitas dan alat di Alat Ajaib gratis selamanya?',
    answer: 'Ya, seluruh 43+ alat di Alat Ajaib dapat Anda gunakan secara 100% gratis selamanya tanpa ada biaya langganan tersembunyi, tanpa versi uji coba yang membatasi hasil, dan tanpa perlu memasukkan kartu kredit. Apabila Anda merasa terbantu dengan keberadaan portal ini, Anda juga dapat memberikan apresiasi sukarela melalui tautan dukungan Saweria yang tersedia di bagian atas dan bawah halaman.'
  },
  {
    id: 'faq-4',
    category: 'fitur',
    question: 'Alat apa saja yang paling populer dan sering digunakan di Alat Ajaib?',
    answer: 'Alat-alat favorit pilihan pengguna antara lain: 1) Kompresor PDF Target 200KB / 500KB untuk berkas pendaftaran CPNS, BUMN, dan kedinasan; 2) Sensor NIK KTP & Watermark Keamanan untuk mencegah penyalahgunaan pinjaman online ilegal; 3) Pemotong Video WhatsApp Status 30 Detik; 4) Editor Subtitle Video (format .SRT dan .VTT); 5) Hitung Selamatan Kematian Adat Jawa (Geblag hingga 1000 Hari Nyewu); 6) Kalkulator Potongan Admin Marketplace (Shopee, Tokopedia, TikTok Shop, Lazada); serta 7) Pembuat Pasfoto Standar Cetak & Pembuat QR Code/Barcode Kasir.'
  },
  {
    id: 'faq-5',
    category: 'fitur',
    question: 'Bagaimana cara kerja dan keakuratan alat Hitung Selamatan Kematian Adat Jawa?',
    answer: 'Alat Hitung Selamatan Kematian Jawa di Alat Ajaib diprogram menggunakan kalkulasi astronomi kalender Hijriah dan sistem Pasaran Jawa tradisional (Legi, Pahing, Pon, Wage, Kliwon). Anda cukup memasukkan tanggal dan jam almarhum/almarhumah meninggal dunia. Sistem akan secara otomatis dan presisi menentukan tanggal peringatan Geblag (Hari H), 3 Hari, 7 Hari, 40 Hari, 100 Hari, Pendak 1 (1 Tahun), Pendak 2 (2 Tahun), serta Nyewu (1000 Hari) lengkap dengan nama hari dan pasarannya, plus tombol cetak laporan ringkas siap pakai.'
  },
  {
    id: 'faq-6',
    category: 'fitur',
    question: 'Bagaimana cara mengompres dokumen PDF agar ukurannya di bawah 200KB atau 500KB untuk CPNS?',
    answer: 'Cukup pilih alat "Kompres PDF Target Ukuran" di katalog Alat Ajaib, lalu unggah dokumen PDF Anda. Tentukan batas ukuran target yang diinginkan (misalnya 200KB atau 500KB). Mesin optimasi gambar dan font lokal kami akan mempresi struktur PDF secara pintar agar ukuran berkas mengecil signifikan tanpa mengorbankan keterbacaan teks dan kejelasan stempel resmi.'
  },
  {
    id: 'faq-7',
    category: 'keamanan',
    question: 'Bagaimana cara mengamankan foto KTP/SIM dari risiko penyalahgunaan pinjol ilegal?',
    answer: 'Gunakan alat "Watermark KTP & Dokumen" serta "Sensor Redaktur KTP" di Alat Ajaib. Anda dapat menambahkan cap air khusus bertuliskan tujuan verifikasi (contoh: "VERIFIKASI SEWA MOBIL TGL 12/08/2026") secara menyilang pada foto KTP, atau memblok bagian nomor NIK dan alamat yang sensitif dengan warna hitam/sensor sebelum dokumen dikirimkan melalui pesan digital.'
  },
  {
    id: 'faq-8',
    category: 'fitur',
    question: 'Bagaimana kalkulator potongan admin toko online membantu penjual UMKM?',
    answer: 'Kalkulator Biaya Admin Marketplace dirancang khusus untuk pedagang di Shopee, Tokopedia, TikTok Shop, dan Lazada. Dengan memasukkan harga jual dan kategori produk (Non-Star, Star Seller, Mall, atau Power Merchant), Anda bisa mengetahui secara akurat berapa rupiah potongan komisi platform, biaya gratis ongkir, dan berapa bersih pendapatan yang diterima toko Anda. Alat ini juga memiliki fitur kalkulator balik modal (BEP) dan penentu harga jual target profit.'
  },
  {
    id: 'faq-9',
    category: 'umum',
    question: 'Apakah Alat Ajaib dapat digunakan dengan lancar di HP Android dan iPhone?',
    answer: 'Sangat Bisa. Seluruh antarmuka Alat Ajaib dirancang dengan prinsip Responsive Mobile-First, sehingga sangat ringan, cepat, dan nyaman dioperasikan dari layar smartphone Android maupun iPhone menggunakan browser populer seperti Google Chrome, Safari, Mozilla Firefox, Opera, atau Samsung Internet.'
  },
  {
    id: 'faq-10',
    category: 'fitur',
    question: 'Bagaimana cara menyalin hasil teks atau mengunduh berkas yang sudah diproses?',
    answer: 'Setiap alat di Alat Ajaib dilengkapi dengan tombol respon cepat seperti "Salin Teks" (Copy Button) dengan konfirmasi visual, tombol "Download Berkas" (.pdf, .srt, .vtt, .png, .jpg), atau tombol "Cetak". Setelah selesai memproses, cukup klik tombol tersebut dan hasil akan langsung tersimpan di clipboard atau folder unduhan perangkat Anda.'
  }
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Pertanyaan Umum (FAQ) & Panduan Alat Ajaib
            </h2>
            <p className="text-2xs sm:text-xs text-slate-500">
              Informasi lengkap seputar keamanan berkas, cara pakai, dan legalitas.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {FAQ_DATA.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div 
              key={item.id}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(item.id)}
                className="w-full p-3 text-left flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {item.question}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
              </button>

              {isOpen && (
                <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
