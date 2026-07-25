import React, { useState, useMemo, useEffect } from 'react';
import { TOOLS, TOOL_GROUPS } from './tools';
import { Tool } from './types';
import ToolWrapper from './components/ToolWrapper';
import { 
  Search, ShieldCheck, Zap, Smartphone, ArrowLeft, Globe, 
  Sparkles, Award, Star, Share2, Compass, Moon, Sun, X, Heart, Coffee,
  HelpCircle, ChevronDown, ChevronUp, Check, MessageSquare, Send,
  Users, Activity, TrendingUp
} from 'lucide-react';

export default function App() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(148);
  const [totalProcessedToday, setTotalProcessedToday] = useState(() => {
    const saved = localStorage.getItem('sakudigital_total_processed');
    return saved ? parseInt(saved, 10) : 18420;
  });

  // Keep totalProcessedToday saved locally and simulate micro active sessions
  useEffect(() => {
    localStorage.setItem('sakudigital_total_processed', totalProcessedToday.toString());
  }, [totalProcessedToday]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = prev + delta;
        return next < 110 ? 125 : next > 230 ? 195 : next;
      });
      setTotalProcessedToday(prev => {
        const updated = prev + 1;
        localStorage.setItem('sakudigital_total_processed', updated.toString());
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Dynamic filter and search logic
  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const activeTool = useMemo(() => {
    if (!selectedToolId) return null;
    return TOOLS.find((t) => t.id === selectedToolId) || null;
  }, [selectedToolId]);

  // Find complementary reverse tool
  const reverseTool = useMemo(() => {
    if (!activeTool || !activeTool.reverseOf) return null;
    return TOOLS.find((t) => t.id === activeTool.reverseOf) || null;
  }, [activeTool]);

  const handleToggleReverse = (reverseId: string) => {
    setSelectedToolId(reverseId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SakuDigital — Alat Administrasi & UMKM Indonesia Gratis',
          text: 'SakuDigital: Portal Offline Tools & Alat Administrasi Gratis terlengkap untuk membantu UMKM Indonesia. 100% Aman & Tanpa Database!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Tautan SakuDigital berhasil disalin ke papan klip! Silakan bagikan ke WhatsApp atau Media Sosial Anda.');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const faqData = [
    {
      q: "Apa itu SakuDigital?",
      a: "SakuDigital adalah portal Offline Tools & Alat Administrasi Gratis serbaguna yang dirancang khusus untuk mempercepat transformasi digital UMKM Indonesia. Kami menyediakan 43+ alat produktivitas administrasi kantor, pengolahan media/gambar lokal, kalkulator bisnis UMKM, serta penunjang kebutuhan instansi daerah secara praktis."
    },
    {
      q: "Apakah data saya aman saat diunggah atau diproses di SakuDigital?",
      a: "Sangat aman! SakuDigital mengusung penuh konsep Offline Tools di mana seluruh pemrosesan berkas rahasia (seperti PDF, foto KTP, pasfoto CPNS, atau ijazah) diproses murni secara lokal langsung di dalam browser perangkat Anda. Tidak ada satu byte pun data yang dikirim ke server luar, bebas dari risiko kebocoran data."
    },
    {
      q: "Alat bisnis & UMKM apa saja yang tersedia di SakuDigital?",
      a: "SakuDigital menyediakan kalkulator potongan admin toko online (Shopee, Tokopedia, TikTok Shop, Lazada), kalkulator harga jual target profit, kalkulator HPP & BEP (balik modal), pembuat QR Code & Barcode kasir, pembuat Link Bio Brosur UMKM, serta Ekstraktor Foto Nota ke Excel (CSV) secara gratis."
    },
    {
      q: "Bagaimana cara menyalin hasil perhitungan atau generator teks?",
      a: "Setiap output hasil kalkulasi, teks OCR, kode NIP, atau generator kalimat dilengkapi dengan 'Tombol Salin' (Copy Button) universal. Cukup klik satu kali, hasil teks akan langsung tersimpan di papan klip (clipboard) HP atau komputer Anda tanpa perlu memblok teks secara manual."
    },
    {
      q: "Apakah ada alat untuk menghitung selamatan kematian adat Jawa?",
      a: "Tentu saja! Fitur 'Selamatan Kematian Jawa' kami dirancang untuk menghitung tanggal tahlilan/selamatan kematian secara otomatis, mulai dari 3 hari, 7 hari, 40 hari, 100 hari, Pendak pisan, Pendak pindo, hingga Nyewu (1000 hari). Anda bisa menyalin jadwal hasil hitungan tersebut atau langsung mencetak/menyimpannya dalam bentuk PDF secara instan."
    },
    {
      q: "Bagaimana cara mengamankan foto KTP agar terhindar dari penyalahgunaan?",
      a: "Anda bisa menggunakan alat 'Watermark KTP' dan 'Sensor Redaktur KTP' di SakuDigital. Alat ini memungkinkan Anda memberikan cap air khusus (watermark) atau menutup/menyensor informasi sensitif seperti nomor NIK secara instan sebelum dikirim untuk verifikasi. Semuanya diproses 100% lokal tanpa khawatir bocor."
    },
    {
      q: "Apakah ada alat untuk kompres file PDF dan konversi berkas?",
      a: "Ya! Kami menyediakan alat 'Kompresor PDF Target 200KB/500KB' untuk membantu mengecilkan ukuran berkas pendaftaran kerja, CPNS, penggabung/pemecah PDF, serta konversi bolak-balik PDF ke Gambar JPG & Word."
    },
    {
      q: "Apakah SakuDigital memiliki alat pengolahan gambar & video?",
      a: "Lengkap! Tersedia pengubah format WebP ke JPG/PNG, kompresor video WA pas 16MB, pemotong video status WA per 30 detik, editor subtitle SRT/WebVTT, pembersih metadata foto (Exif Cleaner), pembuatan pasfoto CPNS & grid cetak A4, hingga penghapus background gambar otomatis."
    },
    {
      q: "Apakah bisa mencetak label undangan pernikahan / acara kantor di SakuDigital?",
      a: "Bisa! Kami menyediakan alat cetak label undangan presisi untuk ukuran kertas Label 103 (undangan umum) dan Label 121 (inventaris/kode barang). Anda bisa langsung mencetak hasil dari browser ke printer."
    },
    {
      q: "Bagaimana SakuDigital membantu pegawai negeri atau instansi kepegawaian?",
      a: "Kami menyediakan berbagai utilitas perkantoran seperti 'Kalkulator Pensiun PNS' untuk mengetahui TMT pensiun dan sisa masa aktif kerja pegawai, generator nomor NIP otomatis, pemecah digit NIP, generator surat izin/lamaran, hingga pembuat tanda tangan digital transparan secara praktis."
    },
    {
      q: "Apakah SakuDigital benar-benar gratis selamanya?",
      a: "Ya! Sebagai portal penyedia Alat Administrasi Gratis untuk membantu UMKM Indonesia dan administrasi kantor desa/instansi daerah, SakuDigital 100% gratis selamanya tanpa ada biaya berlangganan tersembunyi, tanpa daftar akun, serta bersih dari iklan yang mengganggu kenyamanan Anda."
    },
    {
      q: "Dapatkah SakuDigital dijalankan di HP / Smartphone?",
      a: "Tentu saja! Aplikasi berbasis web Offline Tools ini dirancang fully responsive dengan pendekatan Mobile-First. Semua tombol, input, tabel hasil, serta tata letak teks telah dioptimalkan agar sangat nyaman dibaca, ramah di mata, serta mudah digunakan lewat layar sentuh HP Anda."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-white text-slate-950'}`}>
      
      {/* GLOBAL NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-900/85 border-b border-slate-300 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedToolId(null); setSearchQuery(''); }}>
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-500/20">
              S
            </span>
            <div>
              <span className="font-extrabold text-base tracking-tight block text-slate-950 dark:text-white">SakuDigital</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Alat Mandiri Gratis</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="px-3 py-2.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-sm shadow-emerald-500/20"
              title="Bagikan SakuDigital"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bagikan Aplikasi</span>
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all cursor-pointer border border-slate-300 dark:border-transparent"
              title="Ganti Tema"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>
      {/* CORE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW A: FULL CATALOG */}
        {!activeTool ? (
          <div className="space-y-10 animate-fade-in">
            
            {/* HERO PROMOTION ACCENT */}
            <div className="text-center space-y-4 py-8">
              <span className="px-3 py-1.5 bg-emerald-600 text-white dark:bg-emerald-950/80 dark:text-emerald-400 text-3xs font-black uppercase tracking-widest rounded-full border border-emerald-500 dark:border-emerald-900/80 inline-flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse fill-amber-300" /> SakuDigital Versi Profesional Pro
              </span>
              <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-none max-w-3xl mx-auto ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Alat Administrasi Gratis, Gambar <br/>
                & Bisnis UMKM Indonesia Instan
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Portal penyedia <strong>Alat Administrasi Gratis</strong> dan <strong>Offline Tools</strong> terbaik untuk memajukan daya saing bisnis <strong>UMKM Indonesia</strong>. 43 alat instan pendukung kepegawaian PNS, pengamanan KTP, sensor KTP, hapus background, edit pasfoto, serta kalkulator keuangan yang diproses 100% aman langsung di browser Anda.
              </p>

              {/* FLOATING KEYPOINTS & LIVE VISITOR STATS */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Aman & Lokal</span>
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500" /> Super Cepat (Tidak Lemot)</span>
                  <span className="flex items-center gap-1"><Smartphone className="w-4 h-4 text-emerald-500" /> Sempurna untuk Layar HP</span>
                </div>

                {/* REAL-TIME STATS COUNTER BAR */}
                <div className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-3xs md:text-xs text-slate-600 dark:text-slate-400 font-bold shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span><strong className="text-slate-900 dark:text-white font-extrabold">{liveVisitors}</strong> Pengguna Aktif Live</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span><strong className="text-slate-900 dark:text-white font-extrabold">{totalProcessedToday.toLocaleString('id-ID')}</strong> Dokumen Diproses Hari Ini</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTIONS FILTER & INSTANT SEARCH */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                
                {/* SEARCH INPUT */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute top-3.5 left-4 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari alat (misal: KTP, pasfoto, HPP, NIP, shopee, kiblat)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-xs bg-[#f4f4f4] dark:bg-[#f4f4f4] border border-[#f80820] dark:border-[#f80820] rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-[#f91403] dark:text-[#f91403]" 
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* QUICK GROUP BUTTONS */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 ${
                      selectedCategory === 'all' 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md ring-4 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-950 scale-105' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>Semua ({TOOLS.length})</span>
                  </button>
                  {TOOL_GROUPS.map((grp) => {
                    let styleClasses = '';
                    if (grp.id === 'media') {
                      styleClasses = 'bg-[#0b8e91] border-[#f10202] text-[#eee3e3] hover:bg-[#065e60] hover:text-white';
                    } else if (grp.id === 'admin') {
                      styleClasses = 'bg-[#0ca295] border-[#ed0505] text-[#f2eced] hover:bg-[#086e65] hover:text-white';
                    } else if (grp.id === 'bisnis') {
                      styleClasses = 'bg-[#01a6a0] border-[#ed0101] text-[#f6eae9] hover:bg-[#01706c] hover:text-white';
                    } else if (grp.id === 'sosial') {
                      styleClasses = 'bg-[#0ba087] border-[#f70606] text-[#f4e9ea] hover:bg-[#076b5a] hover:text-white';
                    } else {
                      styleClasses = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white';
                    }

                    if (selectedCategory === grp.id) {
                      styleClasses += ' ring-4 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-950 scale-105 shadow-md';
                    }

                    return (
                      <button 
                        key={grp.id}
                        onClick={() => setSelectedCategory(grp.id)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 ${styleClasses}`}
                      >
                        {selectedCategory === grp.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{grp.name.replace('Grup ', '')}</span>
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* WEBSITE SAFETY & INFO ROW (BENTO STYLE) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-emerald-500/40 dark:border-emerald-900/60 p-5 rounded-3xl flex flex-col sm:flex-row items-start gap-4 shadow-sm">
                <span className="p-2.5 bg-emerald-500/10 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-950 dark:text-white flex items-center gap-1.5">
                    Garansi Keamanan 100% Offline (SakuDigital Privacy Guard)
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
                    SakuDigital berkomitmen menjaga keamanan privasi data warga Indonesia. Seluruh foto KTP, pasfoto, ijazah PDF, dan perhitungan keuangan diproses <strong>secara langsung di dalam browser Anda (client-side)</strong>. Tidak ada satu byte pun data yang dikirim ke server. Web ini 100% bebas dari database online dan pendaftaran login, sehingga aman mutlak dari kebocoran data!
                  </p>
                </div>
              </div>

              {/* NEAT AND STANDARD GOOGLE ADSENSE BANNER SPACE */}
              <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 p-4 rounded-3xl flex flex-col justify-center items-center text-center space-y-1 select-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Ruang Iklan Banner</span>
                <div className="py-1">
                  <p className="text-3xs text-slate-400 dark:text-slate-500 leading-normal max-w-xs font-medium">
                    Iklan banner otomatis akan tampil di area ini.
                  </p>
                </div>
              </div>
            </div>

            {/* TOOLS CATALOG GRID */}
            <div>
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={() => { setSelectedToolId(tool.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="group bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800/60 p-5 rounded-3xl hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            tool.category === 'media' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' :
                            tool.category === 'admin' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20' :
                            tool.category === 'bisnis' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' :
                            'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                          }`}>
                            {tool.category === 'media' ? '📷 Media' :
                             tool.category === 'admin' ? '📁 Admin' :
                             tool.category === 'bisnis' ? '💼 Duit' : '🕌 Sosial'}
                          </span>
                          
                          {tool.badge && (
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950 dark:text-slate-100 group-hover:text-emerald-600 transition-colors text-sm line-clamp-1">{tool.name}</h3>
                          <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{tool.description}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                          Buka Alat Sekarang →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center border border-slate-300 dark:border-slate-900 rounded-3xl bg-white dark:bg-slate-900 space-y-2">
                  <p className="text-sm font-semibold text-slate-500">Alat atau utilitas yang dicari tidak ditemukan.</p>
                  <p className="text-xs text-slate-400">Silahkan cari kata kunci lain atau pilih kategori di atas.</p>
                </div>
              )}
            </div>

            {/* FAQ SECTION FOR SEO */}
            <div className="mt-16 pt-10 border-t border-slate-300 dark:border-slate-800/80">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* SAWIRA CTA CARD DI ATAS FAQ */}
                <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-slate-900/90 dark:to-slate-900/80 border border-amber-200 dark:border-slate-850 p-6 rounded-3xl text-center space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500 pointer-events-none">
                    <Heart className="w-32 h-32 fill-amber-500" />
                  </div>
                  
                  <div className="space-y-2 relative z-10">
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-3xs font-black uppercase tracking-wider rounded-lg inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-amber-500 text-amber-500" /> Kopi Hangat Untuk Kreator
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-amber-100">Aplikasi Ini Bermanfaat Bagi Anda?</h3>
                    <p className="text-xs text-slate-800 dark:text-slate-200 max-w-lg mx-auto leading-relaxed font-medium">
                      SakuDigital dikembangkan secara mandiri, 100% gratis, & tanpa iklan yang mengganggu. Jika Anda merasa terbantu, mari dukung keberlangsungan server dan perkembangan fitur baru kami dengan traktir kopi hangat.
                    </p>
                  </div>

                  <div className="flex justify-center relative z-10">
                    <a 
                      href="https://saweria.co/RashRays" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm shadow-amber-500/10 hover:shadow-md transition-all hover:scale-105"
                    >
                      <Heart className="w-4 h-4 fill-white text-rose-100" /> Dukung via Saweria
                    </a>
                  </div>
                </div>

                <div className="text-center space-y-2 pt-4">
                  <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl inline-block border border-emerald-200">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-slate-200">Tanya Jawab Pintar (FAQ)</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">Segala informasi penting seputar privasi aman, luring, dan penggunaan gratis SakuDigital.</p>
                </div>

                <div className="space-y-3">
                  {faqData.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-850 rounded-2xl overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 font-bold text-slate-950 dark:text-white text-xs cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 border border-slate-200">
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </button>
                        
                        {isOpen && (
                          <div className="px-5 pb-4 pt-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-850 animate-fade-in font-medium">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        ) : (
          
          // VIEW B: ACTIVE WORKSPACE
          <div className="space-y-6 animate-fade-in">
            
            {/* BACK BUTTON & BREADCRUMBS */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedToolId(null)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="hover:underline cursor-pointer" onClick={() => setSelectedToolId(null)}>Katalog Utama</span>
                <span>/</span>
                <span className="capitalize">{activeTool.category}</span>
                <span>/</span>
                <span className="text-slate-950 dark:text-white font-bold">{activeTool.name}</span>
              </div>
            </div>

            {/* DYNAMIC COMPONENT LOADER WRAPPER */}
            <ToolWrapper 
              tool={activeTool} 
              reverseTool={reverseTool} 
              onToggleReverse={handleToggleReverse} 
            />

          </div>
        )}

      </main>

      {/* GLOBAL FOOTER */}
      <footer className="mt-16 border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 transition-colors text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <p className="font-extrabold text-slate-950 dark:text-slate-200">SakuDigital — Saku Keuangan & Administrasi Gratis Selamanya</p>
          <p className="max-w-md mx-auto leading-relaxed text-slate-600 dark:text-slate-450">Dirancang khusus untuk mendukung operasional desa, masjid, kepegawaian, instansi daerah, dan pegiat UMKM digital Indonesia.</p>
          
          {/* SUPPORT & FEEDBACK SECTION (GRID GANDA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* CARD 1: DONASI / DUKUNGAN (SAWERIA) */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-300 dark:border-slate-800/80 space-y-3.5 text-left flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dukung Keberlangsungan SakuDigital</span>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Traktir Kopi untuk Pengembang</h4>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  SakuDigital 100% gratis, bebas akun, dan tanpa iklan mengganggu. Jika Anda merasa terbantu, mari traktir segelas kopi hangat demi keberlangsungan sewa server & pengembangan fitur baru!
                </p>
              </div>
              <div className="pt-3">
                <a 
                  href="https://saweria.co/RashRays" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105"
                >
                  <Heart className="w-3.5 h-3.5 fill-white text-rose-100" /> Dukung via Saweria
                </a>
              </div>
            </div>

            {/* CARD 2: SARAN & MASUKAN  */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-300 dark:border-slate-800/80 space-y-3.5 text-left flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Saran & Ide Fitur Baru</span>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Kotak Masukan</h4>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Untuk menjaga privasi dan keamanan bersama, kami menggunakan Google Form resmi yang diproteksi dari bot spam & judol. Kirimkan ide fitur atau laporan alat error dengan tenang.
                </p>
              </div>
              <div className="pt-3">
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeA5jKH8eKsxKgs8VAmvLWWbfhsmqbLqdzKr45lSyphA5EaHQ/viewform?usp=header" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-sm shadow-emerald-500/10"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-100" /> Isi Formulir Saran Google Form
                </a>
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-2">
            Dibuat secara profesional dengan penuh <Heart className="w-3 h-3 text-rose-500 animate-pulse fill-rose-500" /> oleh SakuDigital Indonesia.
          </p>
        </div>
      </footer>

    </div>
  );
}
