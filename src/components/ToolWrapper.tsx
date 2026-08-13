import React from 'react';
import { ArrowLeftRight, HelpCircle, Sparkles, Heart } from 'lucide-react';
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
        <p className="text-sm font-semibold text-slate-600">Alat ini sedang dikembangkan oleh tim ahli KreasiKaDigital</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* COMPLEMENTARY TOOL SWITCHER (MINIMAL) */}
      {reverseTool && (
        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs">
          <span className="text-slate-600 dark:text-slate-300">
            Alat alternatif: <strong className="text-blue-600 dark:text-blue-400">{reverseTool.name}</strong>
          </span>
          <button
            onClick={() => onToggleReverse(reverseTool.id)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-3xs sm:text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <ArrowLeftRight className="w-3 h-3" /> Buka
          </button>
        </div>
      )}

      {/* CORE ACTIVE TOOL SCREEN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs overflow-hidden">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{tool.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tool.description}</p>
        </div>
        
        {renderToolBody()}

        {/* SAWERIA SUPPORT REMINDER IN ACTIVE TOOL */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-2xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-center sm:text-left">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Alat Ajaib diproses 100% lokal & gratis. Terbantu dengan alat ini?</span>
          </div>
          <a 
            href="https://saweria.co/RashRays" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg inline-flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-2xs"
          >
            <Heart className="w-3 h-3 fill-white" />
            <span>Dukung via Saweria</span>
          </a>
        </div>
      </div>
    </div>
  );
}
