import React, { useState, useMemo, useEffect } from 'react';
import { TOOLS, TOOL_GROUPS } from './tools';
import ToolWrapper from './components/ToolWrapper';
import FaqSection from './components/FaqSection';
import LegalModal, { LegalModalType } from './components/LegalModals';
import { 
  Search, ArrowLeft, Moon, Sun, X, Heart, 
  Share2, Send, Users, ChevronRight,
  ShieldAlert, EyeOff, FileSpreadsheet, Video, Scissors,
  UserCheck, Grid, RefreshCw, Minimize2, Copy, Trash2, Clapperboard,
  Layers, FileArchive, Columns, FileImage, FileDown, SearchCode,
  FilePlus, PenTool, FileSignature, Printer, Tags, BadgeInfo,
  Fingerprint, ScanText, Volume2, CalendarDays, Hourglass, FileText,
  Calculator, TrendingUp, TrendingDown, Target, QrCode, Barcode,
  Link as LinkIcon, BookmarkCheck, Navigation, Smile, Sparkles,
  CalendarHeart, CheckCircle2, ShieldCheck, HelpCircle, Activity,
  Zap, Globe, Lock, Mail, BookOpen, ExternalLink
} from 'lucide-react';
import { startPresenceTracker, startTrafficStatsTracker } from './lib/traffic';

// Helper component to render tool icon
function ToolIcon({ name, className }: { name: string; className?: string }) {
  const cn = className || "w-5 h-5";
  switch (name) {
    case 'ShieldAlert': return <ShieldAlert className={cn} />;
    case 'EyeOff': return <EyeOff className={cn} />;
    case 'FileSpreadsheet': return <FileSpreadsheet className={cn} />;
    case 'FileWord': return <FileText className={cn} />;
    case 'Video': return <Video className={cn} />;
    case 'Scissors': return <Scissors className={cn} />;
    case 'UserCheck': return <UserCheck className={cn} />;
    case 'Grid': return <Grid className={cn} />;
    case 'RefreshCw': return <RefreshCw className={cn} />;
    case 'Minimize2': return <Minimize2 className={cn} />;
    case 'Copy': return <Copy className={cn} />;
    case 'Trash2': return <Trash2 className={cn} />;
    case 'Clapperboard': return <Clapperboard className={cn} />;
    case 'Layers': return <Layers className={cn} />;
    case 'FileArchive': return <FileArchive className={cn} />;
    case 'Columns': return <Columns className={cn} />;
    case 'FileImage': return <FileImage className={cn} />;
    case 'FileDown': return <FileDown className={cn} />;
    case 'SearchCode': return <SearchCode className={cn} />;
    case 'FilePlus': return <FilePlus className={cn} />;
    case 'PenTool': return <PenTool className={cn} />;
    case 'FileSignature': return <FileSignature className={cn} />;
    case 'Printer': return <Printer className={cn} />;
    case 'Tags': return <Tags className={cn} />;
    case 'BadgeInfo': return <BadgeInfo className={cn} />;
    case 'Fingerprint': return <Fingerprint className={cn} />;
    case 'ScanText': return <ScanText className={cn} />;
    case 'Volume2': return <Volume2 className={cn} />;
    case 'CalendarDays': return <CalendarDays className={cn} />;
    case 'Hourglass': return <Hourglass className={cn} />;
    case 'FileText': return <FileText className={cn} />;
    case 'Calculator': return <Calculator className={cn} />;
    case 'TrendingUp': return <TrendingUp className={cn} />;
    case 'TrendingDown': return <TrendingDown className={cn} />;
    case 'Target': return <Target className={cn} />;
    case 'QrCode': return <QrCode className={cn} />;
    case 'Barcode': return <Barcode className={cn} />;
    case 'Link': return <LinkIcon className={cn} />;
    case 'BookmarkCheck': return <BookmarkCheck className={cn} />;
    case 'Navigation': return <Navigation className={cn} />;
    case 'Smile': return <Smile className={cn} />;
    case 'CalendarHeart': return <CalendarHeart className={cn} />;
    default: return <Sparkles className={cn} />;
  }
}

export default function App() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);
  
  // Real-time & all-time traffic statistics
  const [liveVisitors, setLiveVisitors] = useState(1);
  const [totalVisits, setTotalVisits] = useState(1284);
  const [totalProcessed, setTotalProcessed] = useState(3842);

  // Legal & Info Modal State
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Connect to Firestore real-time presence & global traffic stats
  useEffect(() => {
    const unsubscribePresence = startPresenceTracker((count) => {
      setLiveVisitors(count);
    });

    const unsubscribeTraffic = startTrafficStatsTracker((stats) => {
      if (stats.totalVisits) setTotalVisits(stats.totalVisits);
      if (stats.totalProcessed) setTotalProcessed(stats.totalProcessed);
    });

    return () => {
      unsubscribePresence();
      unsubscribeTraffic();
    };
  }, []);

  // Filter tools
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
          title: 'Alat Ajaib — Portal Alat Online & Pemroses Berkas Praktis Gratis',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Tautan disalin ke clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          
          <div 
            onClick={() => { setSelectedToolId(null); setSearchQuery(''); }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-xs">
              A
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Alat Ajaib</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Portal Alat Online Gratis</span>
            </div>
          </div>

          {/* REALTIME STATS BADGES */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-3xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <Users className="w-3 h-3" />
              <span>{liveVisitors} online</span>
            </div>

            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-3xs font-semibold text-slate-600 dark:text-slate-300">
              <Activity className="w-3 h-3 text-blue-500" />
              <span>{totalVisits.toLocaleString('id-ID')} kunjungan</span>
            </div>

            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-3xs font-semibold text-slate-600 dark:text-slate-300">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{totalProcessed.toLocaleString('id-ID')} tugas selesai</span>
            </div>

            <a 
              href="https://saweria.co/RashRays" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-3xs sm:text-xs rounded-lg inline-flex items-center gap-1 sm:gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Dukung Alat Ajaib via Saweria"
            >
              <Heart className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Saweria</span>
            </a>

            <button 
              onClick={handleShare}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Bagikan"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Ganti Tema"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* MAIN BODY */}
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        
        {/* VIEW 1: CATALOG OF COMPACT BUTTONS */}
        {!activeTool ? (
          <div className="space-y-6">
            
            {/* SEARCH & CATEGORY BAR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl space-y-2.5 shadow-xs">
              
              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari 43+ alat (contoh: kompres pdf, selamatan jawa, subtitle, barcode, admin shopee)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400" 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CATEGORY PILLS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs font-semibold">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    selectedCategory === 'all' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Semua ({TOOLS.length})
                </button>

                {TOOL_GROUPS.map((grp) => {
                  const isSelected = selectedCategory === grp.id;
                  return (
                    <button 
                      key={grp.id}
                      onClick={() => setSelectedCategory(grp.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {grp.name.replace('Grup ', '')}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* MINIMALIST TOOL BUTTONS GRID */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {filteredTools.map((tool) => {
                  return (
                    <button 
                      key={tool.id}
                      onClick={() => { setSelectedToolId(tool.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 p-3 rounded-xl transition-all duration-150 active:scale-[0.98] shadow-2xs hover:shadow-xs flex items-center justify-between gap-2.5 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          tool.category === 'media' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                          tool.category === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                          tool.category === 'bisnis' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                        }`}>
                          <ToolIcon name={tool.iconName} className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                            {tool.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 capitalize block truncate">
                            {tool.badge ? tool.badge : tool.category}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500">Alat tidak ditemukan. Coba kata kunci lain.</p>
              </div>
            )}

            {/* FULL SEO FAQ SECTION (ACCORDION) */}
            <FaqSection />

          </div>
        ) : (
          
          /* VIEW 2: ACTIVE TOOL WORKSPACE */
          <div className="space-y-3">
            
            {/* BACK BUTTON */}
            <div>
              <button 
                onClick={() => setSelectedToolId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Katalog Alat</span>
              </button>
            </div>

            {/* COMPONENT */}
            <ToolWrapper 
              tool={activeTool} 
              reverseTool={reverseTool} 
              onToggleReverse={handleToggleReverse} 
            />

          </div>
        )}

      </main>

      {/* PRO HIGH-CONTRAST SUPPORT SAWERIA CARD */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-slate-900 border-2 border-amber-400/90 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 text-center md:text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
              <Heart className="w-6 h-6 fill-slate-950 text-slate-950" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-extrabold text-amber-300 tracking-wide">
                Dukung Alat Ajaib Tetap 100% Gratis & Selalu Diperbarui
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed max-w-3xl font-medium">
                Dukung kami untuk terus mengembangkan portal alat ini agar tetap gratis, aman, dan selalu diperbarui. Setiap apresiasi Anda sangat berharga bagi keberlanjutan pemeliharaan server ini.
              </p>
            </div>
          </div>
          <a
            href="https://saweria.co/RashRays"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Dukung Alat Ajaib via Saweria"
          >
            <Heart className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Dukung via Saweria</span>
          </a>
        </div>
      </div>

      {/* CORPORATE / COMPREHENSIVE FOOTER */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-8">
          
          {/* 4-COLUMN FOOTER LINKS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            
            {/* COL 1: TENTANG KAMI */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tentang Kami</h4>
              <ul className="space-y-2 text-2xs">
                <li>
                  <button 
                    onClick={() => setLegalModalType('about')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Profil Alat Ajaib
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModalType('about')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Visi & Misi Kami
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModalType('about')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Keamanan Lokal (Client-Side)
                  </button>
                </li>
              </ul>
            </div>

            {/* COL 2: PUSAT ALAT & FITUR */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Koleksi Alat</h4>
              <ul className="space-y-2 text-2xs">
                <li>
                  <button 
                    onClick={() => { setSelectedToolId(null); setSelectedCategory('media'); }}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Media & Video Editor
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedToolId(null); setSelectedCategory('admin'); }}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Dokumen & Administrasi
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedToolId(null); setSelectedCategory('bisnis'); }}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Bisnis, Kasir & UMKM
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedToolId(null); setSelectedCategory('utilitas'); }}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Utilitas Sehari-hari
                  </button>
                </li>
              </ul>
            </div>

            {/* COL 3: BANTUAN & PANDUAN */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Bantuan</h4>
              <ul className="space-y-2 text-2xs">
                <li>
                  <button 
                    onClick={() => { setSelectedToolId(null); }}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Pertanyaan Umum (FAQ)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModalType('sitemap')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Peta Situs (Sitemap)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModalType('contact')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Hubungi Kami (Contact Us)
                  </button>
                </li>
              </ul>
            </div>

            {/* COL 4: LEGALITAS & PRIVASI */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Kebijakan & Legal</h4>
              <ul className="space-y-2 text-2xs">
                <li>
                  <button 
                    onClick={() => setLegalModalType('privacy')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Pemberitahuan Privasi
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModalType('terms')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Ketentuan Penggunaan
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLegalModalType('cookie')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    Pemberitahuan Cookie
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* BOTTOM BAR: BRAND & BUTTONS */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="w-5 h-5 rounded bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  A
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Alat Ajaib</span>
              </div>
              <p className="text-3xs text-slate-400">
                &copy; 2026 Alat Ajaib. All rights reserved. Portal Alat Online & Pemroses Berkas Praktis Gratis.
              </p>
            </div>

            {/* SUPPORT & FEEDBACK BUTTONS */}
            <div className="flex items-center gap-2">
              <a 
                href="https://saweria.co/RashRays" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-3xs rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-white" /> Dukung Saweria
              </a>

              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSeA5jKH8eKsxKgs8VAmvLWWbfhsmqbLqdzKr45lSyphA5EaHQ/viewform?usp=header" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-3xs rounded-xl inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" /> Saran Fitur
              </a>
            </div>

          </div>

        </div>
      </footer>

      {/* POPUP LEGAL & INFO MODAL */}
      <LegalModal 
        type={legalModalType} 
        onClose={() => setLegalModalType(null)} 
        onSelectTool={(toolId) => setSelectedToolId(toolId)}
      />

    </div>
  );
}
