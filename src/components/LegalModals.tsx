import React from 'react';
import { X, ShieldCheck, FileText, Info, Lock, Globe, Mail, BookOpen, CheckCircle } from 'lucide-react';
import { TOOLS, TOOL_GROUPS } from '../tools';

export type LegalModalType = 
  | 'about' 
  | 'privacy' 
  | 'terms' 
  | 'cookie' 
  | 'sitemap' 
  | 'contact' 
  | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
  onSelectTool?: (toolId: string) => void;
}

export default function LegalModal({ type, onClose, onSelectTool }: LegalModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            {type === 'about' && <Info className="w-4 h-4 text-emerald-600" />}
            {type === 'privacy' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
            {type === 'terms' && <FileText className="w-4 h-4 text-emerald-600" />}
            {type === 'cookie' && <Lock className="w-4 h-4 text-emerald-600" />}
            {type === 'sitemap' && <Globe className="w-4 h-4 text-emerald-600" />}
            {type === 'contact' && <Mail className="w-4 h-4 text-emerald-600" />}
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {type === 'about' && 'Tentang Kami — Alat Ajaib'}
              {type === 'privacy' && 'Pemberitahuan Privasi Konsumen (Privacy Policy)'}
              {type === 'terms' && 'Ketentuan Penggunaan (Terms of Service)'}
              {type === 'cookie' && 'Pemberitahuan Cookie & Keamanan Data'}
              {type === 'sitemap' && 'Peta Situs (Sitemap Direktori Alat)'}
              {type === 'contact' && 'Kontak & Dukungan Pelanggan'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          
          {/* TENTANG KAMI */}
          {type === 'about' && (
            <div className="space-y-3">
              <p>
                <strong>Alat Ajaib</strong> adalah portal utilitas online mandiri dan pemroses berkas gratis yang dibuat untuk mempermudah produktivitas masyarakat, pelaku UMKM, staf administrasi, serta kreator digital Indonesia.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Visi & Misi</h4>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>Menyediakan alat kerja digital berkualitas tinggi tanpa biaya langganan.</li>
                <li>Menjamin privasi pengguna dengan pemrosesan berkas 100% lokal (client-side).</li>
                <li>Mendukung kemudahan operasional UMKM melalui kalkulator biaya admin marketplace, pembuat QRIS/barcode, dan pemroses dokumen.</li>
              </ul>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Keunggulan Teknologi</h4>
              <p>
                Seluruh pengolahan gambar, PDF, kompresi video, dan audio dijalankan secara instan di peramban (browser) Anda melalui teknologi WebAssembly dan Canvas API tanpa menyimpan data di server eksternal.
              </p>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {type === 'privacy' && (
            <div className="space-y-3">
              <p className="text-3xs text-slate-400">Terakhir diperbarui: 2026</p>
              <p>
                Di <strong>Alat Ajaib</strong>, privasi dan kerahasiaan data pengunjung adalah prioritas utama kami.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">1. Pemrosesan Data Lokal</h4>
              <p>
                Seluruh dokumen PDF, foto KTP, rekaman video, dan berkas yang Anda unggah ke dalam alat diolah langsung pada peramban perangkat Anda (Client-Side). Kami <strong>tidak pernah</strong> mengunggah atau menyimpan berkas sensitif Anda ke server kami.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">2. Data Statistik Anonim</h4>
              <p>
                Kami hanya mencatat metrik agregat anonim seperti jumlah pengguna aktif secara langsung (live presence) dan total frekuensi alat yang dijalankan untuk meningkatkan stabilitas sistem.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">3. Perlindungan Pihak Ketiga</h4>
              <p>
                Kami tidak menjual, menyewakan, atau mendistribusikan data pengunjung kepada pihak manapun.
              </p>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {type === 'terms' && (
            <div className="space-y-3">
              <p>
                Dengan mengakses dan menggunakan <strong>Alat Ajaib</strong>, Anda menyetujui ketentuan penggunaan berikut:
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">1. Penggunaan yang Sah</h4>
              <p>
                Anda setuju untuk menggunakan layanan ini hanya untuk tujuan yang sah dan tidak melanggar hukum di Republik Indonesia. Dilarang menggunakan alat untuk memalsukan identitas resmi atau dokumen terlarang.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">2. Batasan Tanggung Jawab</h4>
              <p>
                Alat Ajaib disediakan "sebagaimana adanya" (as is). Meskipun kami mengupayakan hasil perhitungan matematika, kompresi berkas, dan kalkulasi seakurat mungkin, pengguna disarankan untuk memeriksa kembali hasil penting sebelum digunakan pada transaksi resmi.
              </p>
            </div>
          )}

          {/* COOKIE POLICY */}
          {type === 'cookie' && (
            <div className="space-y-3">
              <p>
                Alat Ajaib menggunakan penyimpanan lokal (Local Storage & Session Storage) semata-mata untuk menyimpan preferensi tampilan Anda (seperti mode Gelap/Terang) dan menghitung sesi kunjungan secara anonim.
              </p>
              <p>
                Kami tidak menggunakan cookie pelacak lintas situs yang invasif untuk mengumpulkan profil pribadi Anda.
              </p>
            </div>
          )}

          {/* SITEMAP */}
          {type === 'sitemap' && (
            <div className="space-y-3">
              <p>Daftar lengkap 43+ alat yang tersedia di portal Alat Ajaib:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (onSelectTool) onSelectTool(t.id);
                      onClose();
                    }}
                    className="p-2 text-left bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{t.name}</span>
                    <span className="text-3xs text-slate-400 capitalize">{t.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CONTACT */}
          {type === 'contact' && (
            <div className="space-y-3">
              <p>
                Apakah Anda memiliki masukan fitur baru, laporan kendala teknis, atau penawaran kerja sama?
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Email Tim Dukungan:</span>
                </div>
                <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">EndaPrometius@gmail.com</p>
              </div>
              <p>
                Anda juga dapat mengisi formulir aspirasi dan saran fitur melalui tombol Saran di bagian footer.
              </p>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
