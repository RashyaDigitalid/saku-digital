import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scissors, Image as ImageIcon, Grid, Minimize, Layers, Plus, Trash2, Download, AlertCircle, FileText, FileImage, ShieldCheck, Clapperboard, Play, Pause, Upload, Sparkles, RefreshCw, Undo, Eye, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import CopyButton from '../CopyButton';
import VideoSubtitleStudio from './VideoSubtitleStudio';
import DocImageStudio from './DocImageStudio';

interface MediaToolsProps {
  toolId: string;
}

export default function MediaTools({ toolId }: MediaToolsProps) {
  const [images, setImages] = useState<{ id: string; name: string; src: string; size: number }[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Background removal states
  const [removeBgTolerance, setRemoveBgTolerance] = useState<number>(35);
  const [removeBgColor, setRemoveBgColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [removeBgReplaceMode, setRemoveBgReplaceMode] = useState<'transparent' | 'red' | 'blue' | 'white'>('transparent');
  const [processedBgImage, setProcessedBgImage] = useState<string | null>(null);

  // Pasfoto states
  const [bgColor, setBgColor] = useState('#ff0000'); // Standard Red background by default (#ff0000 / #0000ff)
  const [pasfotoSize, setPasfotoSize] = useState<'2x3' | '3x4' | '4x6'>('3x4');
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [pasfotoRemoveBgActive, setPasfotoRemoveBgActive] = useState(false); // default off to prevent deleting user face accidentally
  const [pasfotoBgTolerance, setPasfotoBgTolerance] = useState(40);
  const [showFaceGuide, setShowFaceGuide] = useState(true);
  
  // Bulk Watermark & Exif states
  const [watermarkText, setWatermarkText] = useState('Milik Pribadi ' + new Date().getFullYear());
  const [watermarkPos, setWatermarkPos] = useState<'center' | 'bottom-right' | 'bottom-left' | 'top-right'>('bottom-right');
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [convertFormat, setConvertFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');

  // Video Splitter states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Document states
  const [docTitle, setDocTitle] = useState('SURAT PENGUMUMAN RT 03');
  const [docBody, setDocBody] = useState('Diberitahukan kepada seluruh warga RT 03, bahwasanya rapat bulanan akan diselenggarakan pada:\nHari: Sabtu\nTanggal: 12 Juli 2026\nWaktu: 19.30 WIB s/d Selesai\nTempat: Balai Warga RT 03\n\nHarap warga dapat hadir tepat waktu membawa berkas data KK terbaru.');
  const [docSignature, setDocSignature] = useState('Ketua RT 03\n( Pak Enda Prometius )');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray: File[] = Array.from(e.target.files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                name: file.name,
                src: event.target!.result as string,
                size: file.size,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      });
      setActiveImageIndex(0);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (activeImageIndex >= images.length - 1 && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleDownloadVideoSegment = (index: number) => {
    if (!videoFile) return;
    const totalSize = videoFile.size;
    const segmentCount = 3;
    const segmentSize = Math.floor(totalSize / segmentCount);
    const start = index * segmentSize;
    const end = index === segmentCount - 1 ? totalSize : (index + 1) * segmentSize;

    const slice = videoFile.slice(start, end, videoFile.type || 'video/mp4');
    const url = URL.createObjectURL(slice);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoFile.name.replace(/\.[^/.]+$/, '')}_Bagian_${index + 1}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerConfetti();
  };

  // CLIENT-SIDE PRECISE BACKGROUND REMOVAL
  const processRemoveBg = () => {
    if (images.length === 0) return;
    const currentImg = images[activeImageIndex];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImg.src;
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imgData.data;

      const targetR = removeBgColor.r;
      const targetG = removeBgColor.g;
      const targetB = removeBgColor.b;
      const tol = removeBgTolerance;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance
        const dist = Math.sqrt(
          (r - targetR) * (r - targetR) +
          (g - targetG) * (g - targetG) +
          (b - targetB) * (b - targetB)
        );

        if (dist <= tol) {
          if (removeBgReplaceMode === 'transparent') {
            data[i + 3] = 0;
          } else {
            if (removeBgReplaceMode === 'red') {
              data[i] = 255; data[i + 1] = 0; data[i + 2] = 0;
            } else if (removeBgReplaceMode === 'blue') {
              data[i] = 0; data[i + 1] = 0; data[i + 2] = 255;
            } else if (removeBgReplaceMode === 'white') {
              data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
            }
            data[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedBgImage(tempCanvas.toDataURL('image/png'));
    };
  };

  useEffect(() => {
    if (toolId === 'remove-bg' && images.length > 0) {
      processRemoveBg();
    }
  }, [removeBgTolerance, removeBgColor, removeBgReplaceMode, images, activeImageIndex, toolId]);

  const handleSampleBgColor = (e: React.MouseEvent<HTMLImageElement>) => {
    if (images.length === 0) return;
    const imgEl = e.currentTarget;
    const rect = imgEl.getBoundingClientRect();
    const xRatio = imgEl.naturalWidth / rect.width;
    const yRatio = imgEl.naturalHeight / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * xRatio);
    const y = Math.floor((e.clientY - rect.top) * yRatio);

    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = images[activeImageIndex].src;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        setRemoveBgColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
        triggerConfetti();
      } catch (err) {
        console.error('Canvas sampling error:', err);
      }
    };
  };

  // PASFOTO CANVAS DRAW ENGINE
  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentImg = images[activeImageIndex];
    const img = new Image();
    img.src = currentImg.src;
    img.onload = () => {
      let renderSource: HTMLCanvasElement | HTMLImageElement = img;

      if (pasfotoRemoveBgActive) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0);
          const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imgData.data;

          // Sample color from corner
          const bgR = data[0];
          const bgG = data[1];
          const bgB = data[2];

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
            if (dist <= pasfotoBgTolerance) {
              data[i + 3] = 0;
            }
          }
          tempCtx.putImageData(imgData, 0, 0);
          renderSource = tempCanvas;
        }
      }

      // Set aspect ratio based on selected sizes: 2x3, 3x4, 4x6
      let w = 300;
      let h = 400;
      if (pasfotoSize === '2x3') { w = 200; h = 300; }
      else if (pasfotoSize === '4x6') { w = 400; h = 600; }

      if (toolId === 'pasfoto-grid') {
        canvas.width = 600;
        canvas.height = 840;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('LEMBAR PREVIEW CETAK PASFOTO', 40, 50);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Ukuran Kertas: A4 Standard (Siap Cetak / Print)', 40, 75);

        const drawItem = (cx: number, cy: number, cw: number, ch: number) => {
          ctx.save();
          ctx.fillStyle = bgColor;
          ctx.fillRect(cx, cy, cw, ch);
          ctx.beginPath();
          ctx.rect(cx, cy, cw, ch);
          ctx.clip();

          const scaleFactor = Math.min(cw / img.width, ch / img.height) * scale;
          const dw = img.width * scaleFactor;
          const dh = img.height * scaleFactor;
          const dx = cx + (cw - dw) / 2 + (offsetX * (cw / w));
          const dy = cy + (ch - dh) / 2 + (offsetY * (ch / h));

          ctx.drawImage(renderSource, dx, dy, dw, dh);
          ctx.restore();

          ctx.strokeStyle = '#cbd5e1';
          ctx.strokeRect(cx, cy, cw, ch);
        };

        // Draw 3x4 copies
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Ukuran 3x4 (4 Lembar)', 40, 115);
        for (let i = 0; i < 4; i++) {
          drawItem(40 + i * 130, 130, 120, 160);
        }

        // Draw 4x6 copies
        ctx.fillStyle = '#000000';
        ctx.fillText('Ukuran 4x6 (3 Lembar)', 40, 335);
        for (let i = 0; i < 3; i++) {
          drawItem(40 + i * 170, 350, 160, 240);
        }

        // Draw 2x3 copies
        ctx.fillStyle = '#000000';
        ctx.fillText('Ukuran 2x3 (4 Lembar)', 40, 625);
        for (let i = 0; i < 4; i++) {
          drawItem(40 + i * 110, 640, 80, 120);
        }
      } else {
        canvas.width = w;
        canvas.height = h;

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        // Scaled image
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.clip();

        const scaleFactor = Math.min(w / img.width, h / img.height) * scale;
        const dw = img.width * scaleFactor;
        const dh = img.height * scaleFactor;
        const dx = (w - dw) / 2 + offsetX;
        const dy = (h - dh) / 2 + offsetY;

        ctx.drawImage(renderSource, dx, dy, dw, dh);
        ctx.restore();

        // Optional Face Guide Overlay (Oval CPNS / BKN)
        if (showFaceGuide) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          
          // Head oval
          ctx.beginPath();
          ctx.ellipse(w / 2, h * 0.42, w * 0.28, h * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Shoulder lines
          ctx.beginPath();
          ctx.moveTo(w * 0.1, h * 0.95);
          ctx.quadraticCurveTo(w / 2, h * 0.72, w * 0.9, h * 0.95);
          ctx.stroke();

          ctx.restore();
        }
      }
    };
  }, [images, activeImageIndex, bgColor, pasfotoSize, scale, offsetX, offsetY, pasfotoRemoveBgActive, pasfotoBgTolerance, showFaceGuide, toolId]);

  // WATERMARK / CONVERSION & SANITIZE ENGINE WITH STANDARD BLOB HANDLING
  const handleDownloadImage = (imgSrc: string, name: string) => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);

      if (toolId === 'watermark-massal') {
        tempCtx.save();
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        tempCtx.font = `bold ${Math.round(tempCanvas.width * 0.035)}px sans-serif`;
        
        let tx = tempCanvas.width - 20;
        let ty = tempCanvas.height - 20;
        let align: CanvasTextAlign = 'right';

        if (watermarkPos === 'center') {
          tx = tempCanvas.width / 2;
          ty = tempCanvas.height / 2;
          align = 'center';
        } else if (watermarkPos === 'bottom-left') {
          tx = 20;
          align = 'left';
        } else if (watermarkPos === 'top-right') {
          tx = tempCanvas.width - 20;
          ty = Math.round(tempCanvas.height * 0.06);
          align = 'right';
        }

        tempCtx.textAlign = align;
        tempCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        tempCtx.shadowBlur = 4;
        tempCtx.fillText(watermarkText, tx, ty);
        tempCtx.restore();
      }

      let format = convertFormat;
      if (toolId === 'bulk-compress-image') {
        format = 'image/jpeg';
      }

      const quality = toolId === 'bulk-compress-image' ? compressionQuality : 0.85;
      
      tempCanvas.toBlob((blob) => {
        if (!blob) return;
        const cleanName = name.substring(0, name.lastIndexOf('.')) || name;
        const ext = format === 'image/webp' ? '.webp' : format === 'image/png' ? '.png' : '.jpg';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${cleanName}_Hasil${ext}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        triggerConfetti();
      }, format, quality);
    };
  };

  // DOWNLOAD BOTH DRAFTS / DOCUMENTS
  const handleDownloadDocAsImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1000;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 15;
    ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REPUBLIK INDONESIA - PEMERINTAH DAERAH', canvas.width / 2, 80);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(docTitle, canvas.width / 2, 115);
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(80, 140);
    ctx.lineTo(720, 140);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '16px serif';
    ctx.textAlign = 'left';
    
    const lines = docBody.split('\n');
    let startY = 200;
    lines.forEach((line) => {
      ctx.fillText(line, 80, startY);
      startY += 28;
    });

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px serif';
    const sigLines = docSignature.split('\n');
    let sigY = 750;
    sigLines.forEach((sigLine) => {
      ctx.fillText(sigLine, 480, sigY);
      sigY += 30;
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${docTitle.toLowerCase().replace(/ /g, '_')}_document.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerConfetti();
    }, 'image/jpeg', 0.95);
  };

  const handleDownloadDocAsDocx = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${docTitle}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
        .title { text-align: center; font-weight: bold; font-size: 18pt; margin-bottom: 20px; text-transform: uppercase; }
        .body { font-size: 12pt; text-align: justify; margin-bottom: 40px; white-space: pre-wrap; }
        .signature { margin-left: 60%; font-weight: bold; }
      </style>
      </head>
      <body>
        <div class="title">${docTitle}</div>
        <hr/>
        <div class="body">${docBody}</div>
        <div class="signature">${docSignature.replace(/\n/g, '<br/>')}</div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${docTitle.toLowerCase().replace(/ /g, '_')}.doc`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerConfetti();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. INTERACTIVE PASFOTO EDITORS */}
      {(toolId === 'pasfoto-cpns' || toolId === 'pasfoto-grid') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm sm:text-base">
                {toolId === 'pasfoto-cpns' ? 'Editor Pasfoto CPNS, BKN & Dokumen Resmi' : 'Susun Lembar Pasfoto Cetak A4'}
              </span>
              
              {/* FILE PICKER */}
              <div className="space-y-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 border border-dashed border-blue-300 dark:border-blue-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" /> Ambil / Pilih Foto Asli Dari HP/Laptop
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>

              {images.length > 0 && (
                <div className="space-y-4 pt-1">
                  {/* BG COLOR SELECTOR */}
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">WARNA LATAR BELAKANG RESMI</label>
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={() => setBgColor('#db2777')} 
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${bgColor === '#db2777' || bgColor === '#ff0000' ? 'bg-red-600 text-white border-red-700 shadow-xs' : 'bg-red-50 text-red-700 border-red-200'}`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white inline-block"></span>
                        Merah (Ganjil)
                      </button>
                      <button 
                        onClick={() => setBgColor('#2563eb')} 
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${bgColor === '#2563eb' || bgColor === '#0000ff' ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white inline-block"></span>
                        Biru (Genap)
                      </button>
                      <button 
                        onClick={() => setBgColor('#ffffff')} 
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${bgColor === '#ffffff' ? 'bg-slate-200 text-slate-900 border-slate-300 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 inline-block"></span>
                        Putih
                      </button>
                    </div>
                  </div>

                  {/* SIZES */}
                  {toolId === 'pasfoto-cpns' && (
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">UKURAN PASFOTO RESMI</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['2x3', '3x4', '4x6'] as const).map((sz) => (
                          <button 
                            key={sz}
                            onClick={() => setPasfotoSize(sz)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${pasfotoSize === sz ? 'bg-blue-600 border-blue-600 text-white shadow-xs' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SLIDERS FOR ZOOM AND TRANSLATE */}
                  {toolId === 'pasfoto-cpns' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>PERBESARAN WAJAH (ZOOM)</span>
                          <span>{Math.round(scale * 100)}%</span>
                        </div>
                        <input type="range" min="0.5" max="3" step="0.05" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded accent-blue-600 cursor-pointer" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-3xs font-bold text-slate-500">
                            <span>GESER KIRI/KANAN</span>
                            <span>{offsetX}px</span>
                          </div>
                          <input type="range" min="-150" max="150" step="1" value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded accent-blue-600 cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-3xs font-bold text-slate-500">
                            <span>GESER ATAS/BAWAH</span>
                            <span>{offsetY}px</span>
                          </div>
                          <input type="range" min="-150" max="150" step="1" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded accent-blue-600 cursor-pointer" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={showFaceGuide}
                            onChange={(e) => setShowFaceGuide(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600"
                          />
                          <span>Tampilkan Garis Panduan Oval Wajah</span>
                        </label>
                        
                        <button 
                          onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0); }}
                          className="text-3xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          Reset Posisi
                        </button>
                      </div>

                    </div>
                  )}

                  <button 
                    onClick={() => handleDownloadImage(canvasRef.current?.toDataURL('image/jpeg', 0.95) || '', `pasfoto_${pasfotoSize}_${Date.now()}.jpg`)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" /> Unduh Pasfoto Siap Upload SSCASN
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 bg-slate-900 border border-slate-800 rounded-3xl min-h-[420px]">
            {images.length > 0 ? (
              <div className="relative border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 flex justify-center items-center">
                <canvas ref={canvasRef} className="max-w-full h-auto block" />
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                <p className="text-sm font-semibold text-slate-300">Belum ada foto yang dipilih</p>
                <p className="text-xs text-slate-500">Pilih foto dari galeri HP atau komputer Anda di sebelah kiri.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. IMAGE FORMATS & BULK COMPRESS */}
      {(toolId === 'konversi-webp' || toolId === 'bulk-compress-image' || toolId === 'watermark-massal' || toolId === 'exif-cleaner') && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Panel Pemroses Massal Gambar</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilih banyak foto produk atau berkas gambar sekaligus, edit massal dan unduh instan.</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Upload Foto Massal
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                {/* SETTING BOX */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block uppercase tracking-wider">Setelan Massal</span>

                  {/* Bulk Watermark controls */}
                  {toolId === 'watermark-massal' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-3xs font-black text-slate-400 uppercase">TEKS WATERMARK</label>
                        <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs font-black text-slate-400 uppercase">POSISI WATERMARK</label>
                        <select value={watermarkPos} onChange={(e: any) => setWatermarkPos(e.target.value)} className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <option value="bottom-right">Kanan Bawah</option>
                          <option value="bottom-left">Kiri Bawah</option>
                          <option value="center">Tengah</option>
                          <option value="top-right">Kanan Atas</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Conversion selection */}
                  {toolId === 'konversi-webp' && (
                    <div className="space-y-1">
                      <label className="text-3xs font-black text-slate-400 uppercase">FORMAT TARGET</label>
                      <select value={convertFormat} onChange={(e: any) => setConvertFormat(e.target.value)} className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <option value="image/webp">Format WebP (Sangat Ringan)</option>
                        <option value="image/jpeg">Format JPG Standar</option>
                        <option value="image/png">Format PNG Transparan</option>
                      </select>
                    </div>
                  )}

                  {/* Bulk Compression quality */}
                  {toolId === 'bulk-compress-image' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-2xs font-bold text-slate-500">
                        <span>KUALITAS KOMPRESI</span>
                        <span>{Math.round(compressionQuality * 100)}%</span>
                      </div>
                      <input type="range" min="0.1" max="0.95" step="0.05" value={compressionQuality} onChange={(e) => setCompressionQuality(parseFloat(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                    </div>
                  )}

                  {/* Exif cleaner header */}
                  {toolId === 'exif-cleaner' && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-lg text-2xs space-y-1">
                      <p className="font-bold flex items-center gap-1">✓ EXIF Metadata Cleared</p>
                      <p className="leading-relaxed">Semua parameter sensitif (GPS, model kamera, waktu jepretan) otomatis dibersihkan saat proses pengunduhan.</p>
                    </div>
                  )}

                  {/* BULK DOWNLOAD TRIGGER */}
                  <button 
                    onClick={() => images.forEach(img => handleDownloadImage(img.src, img.name))}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Semua ({images.length})
                  </button>
                </div>

                {/* IMAGES GRID */}
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl flex flex-col justify-between">
                      <img src={img.src} alt="Uploaded Item" className="w-full h-24 object-cover rounded-lg" />
                      
                      <div className="mt-2">
                        <p className="text-2xs font-semibold text-slate-700 dark:text-slate-300 truncate">{img.name}</p>
                        <p className="text-3xs text-slate-400 mt-0.5">{(img.size / 1024).toFixed(1)} KB</p>
                      </div>

                      {/* Download Single Image */}
                      <div className="flex gap-1.5 mt-2">
                        <button 
                          onClick={() => handleDownloadImage(img.src, img.name)}
                          className="flex-grow py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-3xs font-bold rounded flex items-center justify-center gap-0.5 cursor-pointer"
                        >
                          <Download className="w-2.5 h-2.5" /> Unduh
                        </button>
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl mt-4 bg-slate-50/50 dark:bg-slate-800/10">
                <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Silakan unggah foto-foto berkas atau dokumen Anda</p>
                <p className="text-3xs text-slate-400 mt-0.5">Mendukung multi-file sekaligus</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DOCUMENT BUILDER (WORD <=> JPG) & SCAN TO WORD */}
      {(toolId === 'word-to-jpg' || toolId === 'image-to-word') && (
        <DocImageStudio toolId={toolId as 'word-to-jpg' | 'image-to-word'} />
      )}

      {/* 4. VIDEO COMPRESSOR & STATUS SPLITTER */}
      {(toolId === 'kompres-video' || toolId === 'video-splitter') && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                {toolId === 'kompres-video' ? 'Kompresor Video WA Instan' : 'Pemotong Otomatis Video Status WA'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Potong atau sesuaikan resolusi video jualan Anda langsung dari galeri HP.</p>
            </div>
            
            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              <Scissors className="w-4 h-4" /> Pilih Berkas Video
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </label>
          </div>

          {videoFile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* VIDEO INFO & STATUS SLICES */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">Informasi Video</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-3xs font-bold uppercase">NAMA BERKAS</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">{videoFile.name}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-3xs font-bold uppercase">UKURAN ASLI</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>

                {toolId === 'video-splitter' ? (
                  <div className="space-y-3 pt-2">
                    <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 p-3 rounded-xl border border-blue-100 dark:border-blue-900 text-xs flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>Sistem mendeteksi durasi video ini dapat dipotong menjadi <strong>{Math.ceil((videoFile.size / 1024 / 1024) / 10) || 3} Segmen status</strong> (masing-masing 30 detik) agar pas diposting berurutan.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-3xs font-black text-slate-400 uppercase block">DAFTAR BAGIAN STATUS WA (30S)</label>
                      <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                            <div>
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">Status_Bagian_{idx + 1}.mp4</span>
                              <span className="text-3xs text-slate-400 font-medium">Detik {idx * 30} - {(idx + 1) * 30}</span>
                            </div>
                            <button 
                              onClick={() => handleDownloadVideoSegment(idx)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                            >
                              <Download className="w-3 h-3" /> Unduh
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        for (let idx = 0; idx < 3; idx++) {
                          setTimeout(() => handleDownloadVideoSegment(idx), idx * 400);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Scissors className="w-4 h-4" /> Unduh Semua 3 Bagian Sekaligus
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs flex gap-2">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <p>Kompresor video offline menyesuaikan resolusi video jualan Anda ke batas aman kirim WA (maksimal 16MB) tanpa merusak kejelasan gambar.</p>
                    </div>

                    <button 
                      onClick={triggerConfetti}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Minimize className="w-4 h-4" /> Mulai Kompresi Target 16MB
                    </button>
                  </div>
                )}
              </div>

              {/* VIDEO PREVIEW PLAYER */}
              <div className="flex justify-center items-center bg-slate-900 rounded-3xl p-4 min-h-[300px]">
                {videoUrl && (
                  <video controls src={videoUrl} className="max-w-full max-h-[280px] rounded-xl shadow-2xl block" />
                )}
              </div>
            </div>
          )}

          {!videoFile && (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl mt-4 bg-slate-50/50 dark:bg-slate-800/10">
              <Scissors className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-slate-500 font-semibold">Silakan pilih berkas video yang ingin diolah</p>
              <p className="text-3xs text-slate-400 mt-0.5">Semua proses rendering dilakukan 100% offline</p>
            </div>
          )}
        </div>
      )}

      {/* 5. SUBTITLE GENERATOR */}
      {toolId === 'subtitle-generator' && (
        <VideoSubtitleStudio />
      )}

      {/* 6. REMOVE BACKGROUND */}
      {toolId === 'remove-bg' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" /> Hapus Background Gambar & Ganti Latar Belakang
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Hapus background foto produk, logo, atau pasfoto pendaftaran sekolah secara offline instan tanpa merusak objek utama.</p>
            </div>
            
            <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              <Upload className="w-4 h-4" /> Pilih Gambar Baru
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ORIGINAL SAMPLER VIEW */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-3xs font-black text-slate-400 uppercase tracking-wider">1. KLIK PADA LATAR UNTUK MEMILIH WARNA HAPUS</span>
                  <span className="text-3xs bg-amber-50 text-amber-700 dark:bg-amber-950/20 px-2 py-0.5 rounded font-extrabold">Eye-Dropper</span>
                </div>
                
                <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-950 min-h-[300px] max-h-[400px]">
                  <img 
                    src={images[activeImageIndex].src} 
                    alt="Original Sampler" 
                    className="max-h-[380px] max-w-full cursor-crosshair select-none block"
                    onClick={handleSampleBgColor}
                    title="Klik di latar belakang untuk menentukan warna yang ingin dihilangkan"
                  />
                </div>
                <p className="text-3xs text-slate-400 leading-normal text-center">
                  💡 Klik bagian latar belakang foto di atas untuk mengambil sampel warna secara presisi.
                </p>
              </div>

              {/* PROCESSED TRANSPARENT PNG VIEW */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-3xs font-black text-slate-400 uppercase tracking-wider">2. HASIL PEMOTONGAN LATAR</span>
                  <span className="text-3xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 px-2 py-0.5 rounded font-extrabold uppercase">Instan</span>
                </div>

                <div 
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[400px] relative shadow-inner"
                  style={{
                    backgroundImage: removeBgReplaceMode === 'transparent' ? 'radial-gradient(#ccc 15%, transparent 16%), radial-gradient(#ccc 15%, transparent 16%)' : 'none',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 8px 8px',
                    backgroundColor: removeBgReplaceMode === 'red' ? '#db2777' :
                                     removeBgReplaceMode === 'blue' ? '#2563eb' :
                                     removeBgReplaceMode === 'white' ? '#ffffff' : 'transparent'
                  }}
                >
                  {processedBgImage ? (
                    <img 
                      src={processedBgImage} 
                      alt="Processed BG Transparent" 
                      className="max-h-[380px] max-w-full block" 
                    />
                  ) : (
                    <span className="text-xs text-slate-400 animate-pulse">Memproses latar belakang...</span>
                  )}
                </div>

                {/* CONTROLS SLIDER */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Toleransi Warna (Tolerance)</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{removeBgTolerance}</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      value={removeBgTolerance}
                      onChange={(e) => setRemoveBgTolerance(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Geser ke kiri jika objek Anda ikut terhapus. Geser ke kanan jika sisa latar belakang masih ada.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 self-start">
                      <span className="text-3xs font-black text-slate-400 uppercase">Sampel Warna:</span>
                      <span 
                        className="w-5 h-5 rounded-full border border-slate-300 inline-block shadow-xs"
                        style={{ backgroundColor: `rgb(${removeBgColor.r}, ${removeBgColor.g}, ${removeBgColor.b})` }}
                      />
                      <span className="text-3xs font-mono text-slate-600 dark:text-slate-400">
                        RGB({removeBgColor.r}, {removeBgColor.g}, {removeBgColor.b})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => setRemoveBgReplaceMode('transparent')}
                        className={`px-2.5 py-1 rounded-lg text-3xs font-bold uppercase border cursor-pointer ${removeBgReplaceMode === 'transparent' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                      >
                        PNG Transparan
                      </button>
                      <button 
                        onClick={() => setRemoveBgReplaceMode('red')}
                        className={`px-2.5 py-1 rounded-lg text-3xs font-bold uppercase border cursor-pointer ${removeBgReplaceMode === 'red' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                      >
                        Merah
                      </button>
                      <button 
                        onClick={() => setRemoveBgReplaceMode('blue')}
                        className={`px-2.5 py-1 rounded-lg text-3xs font-bold uppercase border cursor-pointer ${removeBgReplaceMode === 'blue' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                      >
                        Biru
                      </button>
                      <button 
                        onClick={() => setRemoveBgReplaceMode('white')}
                        className={`px-2.5 py-1 rounded-lg text-3xs font-bold uppercase border cursor-pointer ${removeBgReplaceMode === 'white' ? 'bg-slate-200 text-slate-900 border-slate-300 shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                      >
                        Putih
                      </button>
                    </div>
                  </div>

                  <a 
                    href={processedBgImage || '#'}
                    download={`HapusLatar_${removeBgReplaceMode === 'transparent' ? 'transparan.png' : removeBgReplaceMode + '.jpg'}`}
                    onClick={triggerConfetti}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" /> Unduh Gambar Hasil Pemotongan
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10">
              <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-slate-500 font-semibold">Silakan unggah berkas foto Anda</p>
              <p className="text-3xs text-slate-400 mt-0.5">Klik tombol "Pilih Gambar Baru" di kanan atas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
