import React from 'react';
import { ArrowLeftRight, HelpCircle } from 'lucide-react';
import { Tool } from '../types';
import KtpTools from './tools/KtpTools';
import MediaTools from './tools/MediaTools';
import PdfTools from './tools/PdfTools';
import AdminTools from './tools/AdminTools';
import BusinessTools from './tools/BusinessTools';
import SocialTools from './tools/SocialTools';

interface ToolWrapperProps {
  tool: Tool;
  reverseTool: Tool | null;
  onToggleReverse: (reverseId: string) => void;
}

export default function ToolWrapper({ tool, reverseTool, onToggleReverse }: ToolWrapperProps) {
  // Determine which subcomponent group to load based on the active tool's category / ID
  const renderToolBody = () => {
    const id = tool.id;

    // Route to correct modular subcomponents
    if (id === 'watermark-ktp' || id === 'redaktur-ktp') {
      return <KtpTools toolId={id} />;
    }
    
    if (
      id === 'word-to-jpg' || 
      id === 'image-to-word' || 
      id === 'kompres-video' || 
      id === 'video-splitter' || 
      id === 'pasfoto-cpns' || 
      id === 'pasfoto-grid' || 
      id === 'konversi-webp' || 
      id === 'bulk-compress-image' || 
      id === 'watermark-massal' || 
      id === 'exif-cleaner' ||
      id === 'subtitle-generator' ||
      id === 'remove-bg'
    ) {
      return <MediaTools toolId={id} />;
    }

    if (
      id === 'kompres-pdf' ||
      id === 'pdf-merger' ||
      id === 'pdf-to-jpg' ||
      id === 'jpg-to-pdf' ||
      id === 'ekstrak-pdf' ||
      id === 'text-to-pdf'
    ) {
      return <PdfTools toolId={id} />;
    }

    if (
      id === 'generator-surat' ||
      id === 'digital-signature' ||
      id === 'label-103' ||
      id === 'label-121' ||
      id === 'pemecah-nip' ||
      id === 'nip-generator' ||
      id === 'ocr-scan' ||
      id === 'text-to-speech' ||
      id === 'hitung-umur' ||
      id === 'pensiun-countdown' ||
      id === 'word-counter'
    ) {
      return <AdminTools toolId={id} />;
    }

    if (
      id === 'potongan-admin' ||
      id === 'target-pricing' ||
      id === 'kalkulator-hpp' ||
      id === 'bep-calculator' ||
      id === 'qr-tool' ||
      id === 'barcode-tool' ||
      id === 'link-bio' ||
      id === 'nota-extractor'
    ) {
      return <BusinessTools toolId={id} />;
    }

    if (
      id === 'jadwal-sholat' ||
      id === 'qibla-compass' ||
      id === 'font-aesthetic' ||
      id === 'font-normalizer' ||
      id === 'selamatan-jawa' ||
      id === 'text-repeater'
    ) {
      return <SocialTools toolId={id} />;
    }

    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-600">Alat ini sedang dikembangkan oleh tim ahli SakuDigital</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* COMPLEMENTARY TOOL SWITCHER HEADER ACCENT */}
      {reverseTool && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-100 dark:border-blue-900/40 rounded-2xl gap-3">
          <div className="space-y-0.5">
            <span className="text-3xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Fitur Pendukung SakuDigital</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alat ini memiliki fungsi <strong className="text-blue-600 dark:text-blue-400">kebalikan / komplementer</strong> untuk melengkapi kebutuhan Anda.
            </span>
          </div>

          <button
            onClick={() => onToggleReverse(reverseTool.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/90 dark:hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Tukar ke: {reverseTool.name}
          </button>
        </div>
      )}

      {/* CORE ACTIVE TOOL SCREEN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm overflow-hidden">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 break-words">{tool.name}</h2>
          <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{tool.description}</p>
        </div>
        
        {renderToolBody()}
      </div>
    </div>
  );
}
