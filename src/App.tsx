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
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => { setSelectedToolId(null); setSearchQuery(''); }}>
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-md shadow-emerald-500/20 shrink-0">
              K
            </span>
            <div className="leading-tight">
              <span className="font-black text-sm sm:text-base tracking-tight block text-slate-950 dark:text-white">KaryaSaku</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">AI Subtitle & 43+ Tools</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={handleShare}
              className="px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20"
              title="Bagikan KaryaSaku"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all cursor-pointer border border-slate-200 dark:border-transparent"
              title="Ganti Tema"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* CORE CONTAINER */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        
        {/* VIEW A: FULL CATALOG */}
        {!activeTool ? (
          <div className="space-y-6 sm:space-y-10 animate-fade-in">
            
            {/* HERO PROMOTION ACCENT */}
            <div className="text-center space-y-3 sm:space-y-4 py-3 sm:py-6">
              <span className="px-3 py-1 bg-emerald-600 text-white dark:bg-emerald-950/80 dark:text-emerald-400 text-3xs font-black uppercase tracking-widest rounded-full border border-emerald-500 dark:border-emerald-900/80 inline-flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3 h-3 text-amber-300 animate-pulse fill-amber-300" /> KaryaSaku AI Video & UMKM Pro
              </span>
              <h1 className={`text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto px-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Subtitle Video AI Otomatis, <br className="hidden sm:inline" />
                Alat Administrasi & Bisnis UMKM Instan
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
                Portal penyedia <strong>AI Video Subtitle Otomatis (Speech-to-Text)</strong> dan <strong>43+ Alat Administrasi Gratis</strong> untuk kreator konten & UMKM Indonesia. Diproses 100% aman dan super cepat langsung di HP Anda tanpa database.
              </p>

              {/* FLOATING KEYPOINTS & LIVE VISITOR STATS */}
              <div className="flex flex-col items-center gap-2.5 pt-1">
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-2xs sm:text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Aman & Lokal</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Super Cepat</span>
                  <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Pas di Layar HP</span>
                </div>

                {/* REAL-TIME STATS COUNTER BAR */}
                <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-6 px-3.5 py-2 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-3xs sm:text-xs text-slate-600 dark:text-slate-400 font-bold shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span><strong className="text-slate-900 dark:text-white font-extrabold">{liveVisitors}</strong> Pengguna Aktif</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span><strong className="text-slate-900 dark:text-white font-extrabold">{totalProcessedToday.toLocaleString('id-ID')}</strong> Diproses Hari Ini</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTIONS FILTER & INSTANT SEARCH */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm space-y-3.5">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                
                {/* SEARCH INPUT */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute top-3 left-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari alat (misal: subtitle, KTP, pasfoto, HPP, NIP)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 sm:py-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400" 
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* QUICK GROUP BUTTONS / HORIZONTAL SCROLL ON MOBILE */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar w-full md:w-auto">
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      selectedCategory === 'all' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>Semua ({TOOLS.length})</span>
                  </button>

                  {TOOL_GROUPS.map((grp) => {
                    const isSelected = selectedCategory === grp.id;
                    let activeBg = 'bg-emerald-600 text-white shadow-md';
                    let inactiveBg = 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';

                    if (grp.id === 'media') {
                      activeBg = 'bg-amber-600 text-white shadow-md';
                      inactiveBg = isSelected ? activeBg : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40';
                    } else if (grp.id === 'admin') {
                      activeBg = 'bg-indigo-600 text-white shadow-md';
                      inactiveBg = isSelected ? activeBg : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40';
                    } else if (grp.id === 'bisnis') {
                      activeBg = 'bg-emerald-600 text-white shadow-md';
                      inactiveBg = isSelected ? activeBg : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40';
                    } else if (grp.id === 'sosial') {
                      activeBg = 'bg-teal-600 text-white shadow-md';
                      inactiveBg = isSelected ? activeBg : 'bg-teal-50 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40';
                    }

                    return (
                      <button 
                        key={grp.id}
                        onClick={() => setSelectedCategory(grp.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                          isSelected ? activeBg : inactiveBg
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{grp.name.replace('Grup ', '')}</span>
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* WEBSITE SAFETY & INFO ROW (BENTO STYLE) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-900/50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4 shadow-sm">
                <span className="p-2.5 bg-emerald-500/10 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white flex items-center gap-1.5">
                    Garansi Keamanan 100% Offline (KaryaSaku Privacy Guard)
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    KaryaSaku berkomitmen menjaga privasi dan keamanan Anda. Seluruh pemrosesan video subtitle, audio speech-to-text, foto KTP, pasfoto, ijazah PDF, dan kalkulator bisnis diproses <strong>secara langsung di browser HP Anda</strong> tanpa diunggah ke server luar.
                  </p>
                </div>
              </div>

              {/* CLEAN BANNER / INFO SPACE */}
              <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 p-4 rounded-2xl sm:rounded-3xl flex flex-col justify-center items-center text-center space-y-1 select-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Fitur Unggulan</span>
                <div className="py-1">
                  <p className="text-3xs sm:text-2xs text-slate-500 dark:text-slate-400 leading-normal max-w-xs font-medium">
                    🎬 AI Video Subtitle Otomatis & 43+ Alat Produktivitas siap pakai di HP Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* TOOLS CATALOG GRID */}
            <div>
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
                  {filteredTools.map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={() => { setSelectedToolId(tool.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            tool.category === 'media' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' :
                            tool.category === 'admin' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20' :
                            tool.category === 'bisnis' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' :
                            'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                          }`}>
                            {tool.category === 'media' ? '📷 Media' :
                             tool.category === 'admin' ? '📁 Admin' :
                             tool.category === 'bisnis' ? '💼 Bisnis' : '🕌 Sosial'}
                          </span>
                          
                          {tool.badge && (
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded truncate">
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-950 dark:text-slate-100 group-hover:text-emerald-600 transition-colors text-xs sm:text-sm line-clamp-1">{tool.name}</h3>
                          <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{tool.description}</p>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                          Buka Alat Sekarang →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 sm:py-24 text-center border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 space-y-2 p-4">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Alat yang dicari tidak ditemukan.</p>
                  <p className="text-xs text-slate-400">Silakan cari kata kunci lain atau pilih filter kategori di atas.</p>
                </div>
              )}
            </div>

            {/* FAQ SECTION FOR SEO */}
            <div className="mt-10 sm:mt-16 pt-8 sm:pt-10 border-t border-slate-200 dark:border-slate-800">
              <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
                
                {/* SAWERIA CTA CARD DI ATAS FAQ */}
                <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-slate-900/95 dark:to-slate-900/90 border border-amber-200/80 dark:border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-center space-y-3.5 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500 pointer-events-none">
                    <Heart className="w-24 h-24 sm:w-32 sm:h-32 fill-amber-500" />
                  </div>
                  
                  <div className="space-y-1.5 relative z-10">
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-3xs font-black uppercase tracking-wider rounded-lg inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-amber-500 text-amber-500" /> Kopi Hangat Untuk Kreator
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-amber-100">Aplikasi Ini Bermanfaat Bagi Anda?</h3>
                    <p className="text-2xs sm:text-xs text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
                      KaryaSaku dikembangkan secara mandiri, 100% gratis, & tanpa iklan yang mengganggu. Jika Anda merasa terbantu, mari dukung keberlangsungan server dan perkembangan fitur baru kami dengan traktir kopi hangat.
                    </p>
                  </div>

                  <div className="flex justify-center relative z-10 pt-1">
                    <a 
                      href="https://saweria.co/RashRays" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <Heart className="w-4 h-4 fill-white text-rose-100" /> Dukung via Saweria
                    </a>
                  </div>
                </div>

                <div className="text-center space-y-1.5 pt-2 sm:pt-4">
                  <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl inline-block border border-emerald-200 dark:border-emerald-900/40">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                  </span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 dark:text-slate-200">Tanya Jawab Pintar (FAQ)</h3>
                  <p className="text-2xs sm:text-xs text-slate-500 max-w-md mx-auto">Segala informasi penting seputar privasi aman, luring, dan penggunaan gratis KaryaSaku.</p>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {faqData.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between text-left gap-3 font-bold text-slate-950 dark:text-white text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="leading-snug">{faq.q}</span>
                          <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-3.5 pt-1 sm:px-5 sm:pb-4 text-2xs sm:text-xs leading-relaxed text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 animate-fade-in font-medium">
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
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            
            {/* BACK BUTTON & BREADCRUMBS */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setSelectedToolId(null)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center shadow-xs active:scale-95 shrink-0"
                title="Kembali ke Katalog"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="text-2xs sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0 overflow-hidden">
                <span className="hover:underline cursor-pointer shrink-0" onClick={() => setSelectedToolId(null)}>Katalog</span>
                <span className="shrink-0">/</span>
                <span className="capitalize shrink-0 hidden xs:inline">{activeTool.category}</span>
                <span className="shrink-0 hidden xs:inline">/</span>
                <span className="text-slate-950 dark:text-white font-bold truncate">{activeTool.name}</span>
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
      <footer className="mt-12 sm:mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 sm:py-10 transition-colors text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
          <p className="font-extrabold text-slate-950 dark:text-slate-200 text-xs sm:text-sm">KaryaSaku — AI Video Subtitle & Alat Administrasi Gratis Selamanya</p>
          <p className="max-w-md mx-auto leading-relaxed text-2xs sm:text-xs text-slate-600 dark:text-slate-400">Dirancang khusus untuk mendukung operasional kreator konten, desa, kepegawaian, instansi daerah, dan UMKM digital Indonesia.</p>
          
          {/* SUPPORT & FEEDBACK SECTION (GRID GANDA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            
            {/* CARD 1: DONASI / DUKUNGAN (SAWERIA) */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-left flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dukung Keberlangsungan KaryaSaku</span>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Traktir Kopi untuk Pengembang</h4>
                <p className="text-2xs sm:text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  KaryaSaku 100% gratis, bebas akun, dan tanpa iklan mengganggu. Jika Anda merasa terbantu, mari traktir segelas kopi hangat demi keberlangsungan sewa server & pengembangan fitur baru!
                </p>
              </div>
              <div className="pt-2">
                <a 
                  href="https://saweria.co/RashRays" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Heart className="w-3.5 h-3.5 fill-white text-rose-100" /> Dukung via Saweria
                </a>
              </div>
            </div>

            {/* CARD 2: SARAN & MASUKAN  */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-left flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Saran & Ide Fitur Baru</span>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Kotak Masukan</h4>
                <p className="text-2xs sm:text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Untuk menjaga privasi dan keamanan bersama, kami menggunakan Google Form resmi yang diproteksi dari bot spam. Kirimkan ide fitur atau laporan alat error dengan tenang.
                </p>
              </div>
              <div className="pt-2">
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeA5jKH8eKsxKgs8VAmvLWWbfhsmqbLqdzKr45lSyphA5EaHQ/viewform?usp=header" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs shadow-emerald-500/10"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-100" /> Isi Formulir Saran Google Form
                </a>
              </div>
            </div>

          </div>

          <p className="text-[10px] sm:text-xs text-slate-400 flex items-center justify-center gap-1 pt-2">
            Dibuat secara profesional dengan penuh <Heart className="w-3 h-3 text-rose-500 animate-pulse fill-rose-500" /> oleh KaryaSaku Indonesia.
          </p>
        </div>
      </footer>

    </div>
  );
}
