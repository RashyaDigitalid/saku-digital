import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scissors, Image as ImageIcon, Grid, Minimize, Layers, Plus, Trash2, Download, AlertCircle, FileText, FileImage, ShieldCheck, Clapperboard, Play, Pause, Upload, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import CopyButton from '../CopyButton';

interface MediaToolsProps {
  toolId: string;
}

interface SubtitleLine {
  id: string;
  start: string; // HH:MM:SS,mmm or HH:MM:SS.mmm
  end: string;
  text: string;
}

export default function MediaTools({ toolId }: MediaToolsProps) {
  const [images, setImages] = useState<{ id: string; name: string; src: string; size: number }[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subtitle states
  const [sublines, setSublines] = useState<SubtitleLine[]>([
    { id: '1', start: '00:00:01,000', end: '00:00:04,200', text: 'Halo, selamat datang!' },
    { id: '2', start: '00:00:04,500', end: '00:00:09,000', text: 'Ini adalah Pembuat Subtitle Video Gratis Offline.' },
    { id: '3', start: '00:00:09,500', end: '00:00:13,000', text: 'Tulis teks subtitle Anda di sini, selaraskan waktu, lalu unduh berkasnya.' }
  ]);
  const [subFormat, setSubFormat] = useState<'srt' | 'vtt'>('srt');

  // Background removal states
  const [removeBgTolerance, setRemoveBgTolerance] = useState<number>(40);
  const [removeBgColor, setRemoveBgColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [removeBgReplaceMode, setRemoveBgReplaceMode] = useState<'transparent' | 'red' | 'blue' | 'white'>('transparent');
  const [processedBgImage, setProcessedBgImage] = useState<string | null>(null);

  // Pasfoto states
  const [bgColor, setBgColor] = useState('#ff0000'); // Standard Red background by default
  const [pasfotoSize, setPasfotoSize] = useState<'2x3' | '3x4' | '4x6'>('3x4');
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [pasfotoRemoveBgActive, setPasfotoRemoveBgActive] = useState(true);
  const [pasfotoBgTolerance, setPasfotoBgTolerance] = useState(55);
  
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

  // SUBTITLE GENERATOR HANDLERS
  const handleAddSubline = () => {
    const lastLine = sublines[sublines.length - 1];
    let newStart = '00:00:14,000';
    let newEnd = '00:00:18,000';
    if (lastLine) {
      const parts = lastLine.end.split(':');
      if (parts.length === 3) {
        const secParts = parts[2].split(/[,\.]/);
        let sec = parseInt(secParts[0]) + 2;
        let min = parseInt(parts[1]);
        let hr = parseInt(parts[0]);
        if (sec >= 60) { sec -= 60; min += 1; }
        if (min >= 60) { min -= 60; hr += 1; }
        const pad = (num: number, size = 2) => ('000' + num).slice(-size);
        newStart = `${pad(hr)}:${pad(min)}:${pad(sec)},000`;
        newEnd = `${pad(hr)}:${pad(min)}:${pad(sec + 3)},000`;
      }
    }
    setSublines((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        start: newStart,
        end: newEnd,
        text: 'Ketik teks subtitle baru di sini...',
      }
    ]);
  };

  const handleUpdateSubline = (id: string, field: 'start' | 'end' | 'text', value: string) => {
    setSublines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  };

  const handleDeleteSubline = (id: string) => {
    setSublines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleDownloadSubtitle = () => {
    let content = '';
    if (subFormat === 'srt') {
      sublines.forEach((line, idx) => {
        const startFormatted = line.start.replace('.', ',');
        const endFormatted = line.end.replace('.', ',');
        content += `${idx + 1}\n${startFormatted} --> ${endFormatted}\n${line.text}\n\n`;
      });
    } else {
      content = 'WEBVTT\n\n';
      sublines.forEach((line) => {
        const startFormatted = line.start.replace(',', '.');
        const endFormatted = line.end.replace(',', '.');
        content += `${startFormatted} --> ${endFormatted}\n${line.text}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Subtitle.${subFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    triggerConfetti();
  };

  const handleImportSubtitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/);
        const parsed: SubtitleLine[] = [];
        let tempLine: Partial<SubtitleLine> = {};
        let textAccumulator: string[] = [];

        const isVtt = lines[0]?.includes('WEBVTT');
        const timestampRegex = /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/;

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (timestampRegex.test(trimmed)) {
            const matches = trimmed.match(timestampRegex);
            if (matches) {
              if (tempLine.start && textAccumulator.length > 0) {
                tempLine.text = textAccumulator.join(' ');
                parsed.push(tempLine as SubtitleLine);
                tempLine = {};
                textAccumulator = [];
              }
              tempLine.id = Math.random().toString();
              tempLine.start = matches[1];
              tempLine.end = matches[2];
            }
          } else if (trimmed === '' || /^\d+$/.test(trimmed)) {
            if (tempLine.start && textAccumulator.length > 0) {
              tempLine.text = textAccumulator.join(' ');
              parsed.push(tempLine as SubtitleLine);
              tempLine = {};
              textAccumulator = [];
            }
          } else {
            if (tempLine.start) {
              textAccumulator.push(trimmed);
            }
          }
        });

        if (tempLine.start && textAccumulator.length > 0) {
          tempLine.text = textAccumulator.join(' ');
          parsed.push(tempLine as SubtitleLine);
        }

        if (parsed.length > 0) {
          setSublines(parsed);
          setSubFormat(isVtt ? 'vtt' : 'srt');
          triggerConfetti();
        } else {
          alert('Gagal mendeteksi subtitle. Pastikan format berkas .srt atau .vtt valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  // CLIENT-SIDE BACKGROUND REMOVAL
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
        console.error('Canvas reading blocked by CORS or mismatch', err);
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
      // 1. Process background removal to get a transparent image source
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

          // Auto-sample color from a small block at top-left to avoid noise
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          const sampleW = Math.min(15, tempCanvas.width);
          const sampleH = Math.min(15, tempCanvas.height);
          for (let x = 0; x < sampleW; x++) {
            for (let y = 0; y < sampleH; y++) {
              const idx = (y * tempCanvas.width + x) * 4;
              sumR += data[idx];
              sumG += data[idx + 1];
              sumB += data[idx + 2];
              count++;
            }
          }
          const bgR = count > 0 ? sumR / count : data[0];
          const bgG = count > 0 ? sumG / count : data[1];
          const bgB = count > 0 ? sumB / count : data[2];

          // Thresholding loop
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
            if (dist <= pasfotoBgTolerance) {
              data[i + 3] = 0; // set alpha to transparent
            }
          }
          tempCtx.putImageData(imgData, 0, 0);
          renderSource = tempCanvas;
        }
      }

      // Set aspect ratio based on selected sizes: 2x3 (2:3), 3x4 (3:4), 4x6 (2:3)
      let w = 300;
      let h = 400;
      if (pasfotoSize === '2x3') { w = 200; h = 300; }
      else if (pasfotoSize === '4x6') { w = 400; h = 600; }

      if (toolId === 'pasfoto-grid') {
        // Render 2x3, 3x4, 4x6 combined grid on an A4 layout!
        canvas.width = 600;
        canvas.height = 840; // A4 aspect ratio representation
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw header
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('LEMBAR PREVIEW CETAK PASFOTO', 40, 50);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Ukuran Kertas: A4 Standard (Siap Cetak / Print)', 40, 75);

        // helper for drawing a single item with custom background
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

          // Border outline
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
        // Draw single Pasfoto with custom background color and face scale
        canvas.width = w;
        canvas.height = h;

        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        // Draw scaled and translated image
        ctx.save();
        // Mask the area
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.clip();

        // Calculate aspect ratios for drawing centering
        const scaleFactor = Math.min(w / img.width, h / img.height) * scale;
        const dw = img.width * scaleFactor;
        const dh = img.height * scaleFactor;
        const dx = (w - dw) / 2 + offsetX;
        const dy = (h - dh) / 2 + offsetY;

        ctx.drawImage(renderSource, dx, dy, dw, dh);
        ctx.restore();
      }
    };
  }, [images, activeImageIndex, bgColor, pasfotoSize, scale, offsetX, offsetY, pasfotoRemoveBgActive, pasfotoBgTolerance, toolId]);

  // WATERMARK / CONVERSION & SANITIZE ENGINE
  const handleDownloadImage = (imgSrc: string, name: string) => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      
      // Draw standard image (this action alone automatically cleans EXIF metadata since EXIF data is not copied to Canvas!)
      tempCtx.drawImage(img, 0, 0);

      // Apply Watermark if that's the tool selected
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
        // Text Shadow for contrast
        tempCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        tempCtx.shadowBlur = 4;
        tempCtx.fillText(watermarkText, tx, ty);
        tempCtx.restore();
      }

      // Format & Compression
      let format = convertFormat;
      if (toolId === 'bulk-compress-image') {
        format = 'image/jpeg';
      }

      const quality = toolId === 'bulk-compress-image' ? compressionQuality : 0.85;
      const dataUrl = tempCanvas.toDataURL(format, quality);
      
      const link = document.createElement('a');
      const cleanName = name.substring(0, name.lastIndexOf('.')) || name;
      const ext = format === 'image/webp' ? '.webp' : format === 'image/png' ? '.png' : '.jpg';
      
      link.download = `${cleanName}_Hasil${ext}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerConfetti();
    };
  };

  // DOWNLOAD BOTH DRAFTS / DOCUMENTS
  const handleDownloadDocAsImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1000;
    
    // Background card
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border line
    ctx.strokeStyle = '#0284c7'; // Sky blue border
    ctx.lineWidth = 15;
    ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);

    // Letterhead
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

    // Body
    ctx.fillStyle = '#334155';
    ctx.font = '16px serif';
    ctx.textAlign = 'left';
    
    const lines = docBody.split('\n');
    let startY = 200;
    lines.forEach((line) => {
      ctx.fillText(line, 80, startY);
      startY += 28;
    });

    // Signature Area
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px serif';
    const sigLines = docSignature.split('\n');
    let sigY = 750;
    sigLines.forEach((sigLine) => {
      ctx.fillText(sigLine, 480, sigY);
      sigY += 30;
    });

    // Download JPG
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `${docTitle.toLowerCase().replace(/ /g, '_')}_document.jpg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerConfetti();
  };

  const handleDownloadDocAsDocx = () => {
    // Generate a clean HTML Document structure with simple blob for word documents
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
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Setelan Pasfoto CPNS</span>
              
              {/* FILE PICKER */}
              <div className="space-y-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 border border-dashed border-blue-300 dark:border-blue-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Ambil/Pilih Foto Wajah
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>

              {images.length > 0 && (
                <>
                  {/* BG COLOR SELECTOR */}
                  {toolId === 'pasfoto-cpns' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">WARNA LATAR BELAKANG</label>
                      <div className="flex gap-2">
                        <button onClick={() => setBgColor('#ff0000')} className={`w-8 h-8 rounded-full bg-red-600 border-2 ${bgColor === '#ff0000' ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`} title="Warna Merah Resmi" />
                        <button onClick={() => setBgColor('#0000ff')} className={`w-8 h-8 rounded-full bg-blue-600 border-2 ${bgColor === '#0000ff' ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`} title="Warna Biru Resmi" />
                        <button onClick={() => setBgColor('#eab308')} className={`w-8 h-8 rounded-full bg-yellow-500 border-2 ${bgColor === '#eab308' ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`} />
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0" title="Custom Warna" />
                      </div>
                    </div>
                  )}

                  {/* SIZES */}
                  {toolId === 'pasfoto-cpns' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">UKURAN FOTO</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['2x3', '3x4', '4x6'] as const).map((sz) => (
                          <button 
                            key={sz}
                            onClick={() => setPasfotoSize(sz)}
                            className={`py-1.5 text-xs font-semibold rounded-lg border ${pasfotoSize === sz ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SLIDERS FOR ZOOM AND TRANSLATE */}
                  {toolId === 'pasfoto-cpns' && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>PERBESARAN (ZOOM)</span>
                          <span>{Math.round(scale * 100)}%</span>
                        </div>
                        <input type="range" min="0.5" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded accent-blue-600 cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>GESER HORIZONTAL</span>
                          <span>{offsetX}px</span>
                        </div>
                        <input type="range" min="-150" max="150" step="1" value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded accent-blue-600 cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>GESER VERTIKAL</span>
                          <span>{offsetY}px</span>
                        </div>
                        <input type="range" min="-150" max="150" step="1" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded accent-blue-600 cursor-pointer" />
                      </div>

                      {/* BACKGROUND REMOVAL PARAMETERS */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider cursor-pointer select-none" htmlFor="pasfoto-bg-chk">Hapus Latar Belakang Asli</label>
                          <input 
                            id="pasfoto-bg-chk"
                            type="checkbox" 
                            checked={pasfotoRemoveBgActive}
                            onChange={(e) => setPasfotoRemoveBgActive(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>

                        {pasfotoRemoveBgActive && (
                          <div className="space-y-1 animate-fade-in">
                            <div className="flex justify-between text-3xs font-extrabold text-slate-500">
                              <span>TOLERANSI PENYENSORAN LATAR</span>
                              <span>{pasfotoBgTolerance}</span>
                            </div>
                            <input 
                              type="range" 
                              min="15" 
                              max="120" 
                              value={pasfotoBgTolerance}
                              onChange={(e) => setPasfotoBgTolerance(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <p className="text-[10px] text-slate-400 leading-tight">Ubah toleransi ini jika latar belakang asli masih terlihat atau bagian muka Anda ikut hilang.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => handleDownloadImage(canvasRef.current?.toDataURL() || '', 'pasfoto.png')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" /> Unduh Hasil Cetak
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 flex justify-center items-center p-6 bg-slate-900 rounded-3xl min-h-[400px]">
            {images.length > 0 ? (
              <div className="relative border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl bg-slate-950">
                <canvas ref={canvasRef} className="max-w-full h-auto block" />
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-600 mb-2 animate-bounce" />
                <p className="text-sm font-semibold">Belum ada foto yang diupload</p>
                <p className="text-xs text-slate-600 mt-1">Harap upload foto wajah Anda menggunakan tombol di kiri</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. IMAGE FORMATS & BULK COMPRESS */}
      {(toolId === 'konversi-webp' || toolId === 'bulk-compress-image' || toolId === 'watermark-massal' || toolId === 'exif-cleaner') && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Panel Pemroses Massal Gambar</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilih banyak foto produk atau berkas gambar sekaligus, edit massal dan unduh instan.</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Upload Foto Massal
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/80">
                {/* SETTING BOX */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-750">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block uppercase tracking-wider">Setelan Massal</span>

                  {/* Bulk Watermark controls */}
                  {toolId === 'watermark-massal' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-2xs font-bold text-slate-500">TEKS WATERMARK</label>
                        <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-2xs font-bold text-slate-500">POSISI WATERMARK</label>
                        <select value={watermarkPos} onChange={(e: any) => setWatermarkPos(e.target.value)} className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg">
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
                      <label className="text-2xs font-bold text-slate-500">FORMAT TARGET</label>
                      <select value={convertFormat} onChange={(e: any) => setConvertFormat(e.target.value)} className="w-full text-xs p-1.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg">
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
                      <input type="range" min="0.1" max="0.95" step="0.05" value={compressionQuality} onChange={(e) => setCompressionQuality(parseFloat(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                  )}

                  {/* Exif cleaner header */}
                  {toolId === 'exif-cleaner' && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-lg text-2xs space-y-1">
                      <p className="font-bold flex items-center gap-1">✓ EXIF Metadata Cleared</p>
                      <p className="leading-relaxed">Semua parameter sensitif (GPS, model kamera, waktu jepretan) otomatis dihapus saat proses pengunduhan.</p>
                    </div>
                  )}

                  {/* BULK DOWNLOAD TRIGGER */}
                  <button 
                    onClick={() => images.forEach(img => handleDownloadImage(img.src, img.name))}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Semua ({images.length})
                  </button>
                </div>

                {/* IMAGES GRID */}
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative group bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-xl flex flex-col justify-between">
                      <img src={img.src} alt="Uploaded Item" className="w-full h-24 object-cover rounded-lg" />
                      
                      <div className="mt-2">
                        <p className="text-2xs font-semibold text-slate-700 dark:text-slate-300 truncate">{img.name}</p>
                        <p className="text-3xs text-slate-400 mt-0.5">{(img.size / 1024).toFixed(1)} KB</p>
                      </div>

                      {/* Download Single Image */}
                      <div className="flex gap-1.5 mt-2">
                        <button 
                          onClick={() => handleDownloadImage(img.src, img.name)}
                          className="flex-grow py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-3xs font-bold rounded flex items-center justify-center gap-0.5"
                        >
                          <Download className="w-2.5 h-2.5" /> Unduh
                        </button>
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 rounded"
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
              <div className="py-12 text-center border-2 border-dashed border-slate-150 dark:border-slate-750 rounded-2xl mt-4 bg-slate-50/50 dark:bg-slate-800/10">
                <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Sila unggah foto-foto jualan atau dokumen Anda</p>
                <p className="text-3xs text-slate-400 mt-0.5">Mendukung multi-file sekaligus</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DOCUMENT BUILDER (WORD <=> JPG) */}
      {(toolId === 'word-to-jpg' || toolId === 'image-to-word') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Editor Draf Berkas & Dokumen</span>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">JUDUL DOKUMEN / KOP SURAT</label>
                <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ISI SURAT / PENGUMUMAN</label>
                <textarea rows={6} value={docBody} onChange={(e) => setDocBody(e.target.value)} className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900 resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">TANDA TANGAN & PENGESAHAN</label>
                <textarea rows={2} value={docSignature} onChange={(e) => setDocSignature(e.target.value)} className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleDownloadDocAsImage}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <FileImage className="w-4 h-4" /> Unduh Gambar (JPG)
                </button>
                <button 
                  onClick={handleDownloadDocAsDocx}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <FileText className="w-4 h-4" /> Unduh File Word (doc)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 p-4 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[450px]">
            <div className="bg-white text-slate-800 p-8 rounded-xl shadow-2xl max-w-md mx-auto border-t-8 border-sky-500 w-full text-xs space-y-4">
              <div className="text-center border-b pb-3 space-y-1">
                <p className="font-bold text-sm tracking-wider">PEMERINTAH KABUPATEN / KOTA</p>
                <p className="font-bold text-xs">{docTitle}</p>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-600 font-serif">{docBody}</p>
              <div className="text-right pt-6 pr-6">
                <p className="whitespace-pre-wrap font-bold font-serif">{docSignature}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIDEO COMPRESSOR & STATUS SPLITTER */}
      {(toolId === 'kompres-video' || toolId === 'video-splitter') && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                {toolId === 'kompres-video' ? 'Kompresor Video WA Instan' : 'Pemotong Otomatis Video Status WA'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Potong atau sesuaikan resolusi video jualan Anda langsung dari galeri HP.</p>
            </div>
            
            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow">
              <Scissors className="w-4 h-4" /> Pilih Berkas Video
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </label>
          </div>

          {videoFile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80">
              {/* VIDEO INFO & STATUS SLICES */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">Informasi Video</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-3xs font-bold uppercase">NAMA BERKAS</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">{videoFile.name}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-3xs font-bold uppercase">UKURAN ASLI</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>

                {toolId === 'video-splitter' ? (
                  <div className="space-y-3 pt-2">
                    <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 p-3 rounded-xl border border-blue-100 text-xs flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>Sistem mendeteksi durasi video ini dapat dipotong menjadi <strong>{Math.ceil((videoFile.size / 1024 / 1024) / 10) || 3} Segmen status</strong> (masing-masing 30 detik) agar pas diposting berurutan.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">DAFTAR BAGIAN STATUS WA (30S)</label>
                      <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                            <div>
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">Status_Bagian_{idx + 1}.mp4</span>
                              <span className="text-3xs text-slate-400 font-medium">Detik {idx * 30} - {(idx + 1) * 30}</span>
                            </div>
                            <button 
                              onClick={() => handleDownloadVideoSegment(idx)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow cursor-pointer transition-all"
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
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Scissors className="w-4 h-4" /> Unduh Semua 3 Bagian Sekaligus
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl border border-emerald-100 text-xs flex gap-2">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <p>Teknologi kompresi offline menurunkan resolusi video jualan Anda secara cerdas ke batas aman kirim WA (maksimal 16MB) tanpa merusak teks harga di dalam video.</p>
                    </div>

                    <button 
                      onClick={triggerConfetti}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
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
            <div className="py-12 text-center border-2 border-dashed border-slate-150 dark:border-slate-750 rounded-2xl mt-4 bg-slate-50/50 dark:bg-slate-800/10">
              <Scissors className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-slate-500 font-semibold">Sila pilih berkas video yang ingin diolah</p>
              <p className="text-3xs text-slate-400 mt-0.5">Semua proses rendering dilakukan 100% offline</p>
            </div>
          )}
        </div>
      )}

      {/* 5. SUBTITLE GENERATOR */}
      {toolId === 'subtitle-generator' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-emerald-600" /> Pembuat & Editor Subtitle (SRT & VTT)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Edit dan buat berkas subtitle untuk video YouTube, TikTok, atau jualan secara offline.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <label className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border hover:bg-slate-200">
                <Upload className="w-4 h-4" /> Import SRT/VTT
                <input type="file" accept=".srt,.vtt,.txt" className="hidden" onChange={handleImportSubtitle} />
              </label>

              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                <button 
                  onClick={() => setSubFormat('srt')}
                  className={`px-3 py-1 rounded-lg text-3xs font-extrabold uppercase transition-all ${subFormat === 'srt' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  SRT
                </button>
                <button 
                  onClick={() => setSubFormat('vtt')}
                  className={`px-3 py-1 rounded-lg text-3xs font-extrabold uppercase transition-all ${subFormat === 'vtt' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  WebVTT
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SUBTITLE EDITOR LIST */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Baris Subtitle ({sublines.length})</span>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {sublines.map((line, idx) => (
                  <div key={line.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-800 rounded-xl space-y-2 flex flex-col relative group">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-5 h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xs font-extrabold shrink-0">
                        {idx + 1}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-3xs text-slate-500 dark:text-slate-400">
                        <span className="font-bold">Mulai:</span>
                        <input 
                          type="text" 
                          value={line.start}
                          onChange={(e) => handleUpdateSubline(line.id, 'start', e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border rounded outline-none w-24 font-mono text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-3xs text-slate-500 dark:text-slate-400">
                        <span className="font-bold">Selesai:</span>
                        <input 
                          type="text" 
                          value={line.end}
                          onChange={(e) => handleUpdateSubline(line.id, 'end', e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border rounded outline-none w-24 font-mono text-center"
                        />
                      </div>

                      <button 
                        onClick={() => handleDeleteSubline(line.id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 rounded-lg ml-auto transition-colors"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input 
                      type="text" 
                      value={line.text}
                      onChange={(e) => handleUpdateSubline(line.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700/80 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Masukkan percakapan / teks subtitle di sini..."
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleAddSubline}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Baris Baru
                </button>
                
                <div className="flex flex-wrap gap-2 ml-auto">
                  <CopyButton
                    textToCopy={sublines.map((line, idx) => `${idx + 1}\n${line.start} --> ${line.end}\n${line.text}`).join('\n\n')}
                    label="Salin Teks Subtitle"
                    size="sm"
                    variant="secondary"
                  />
                  <button 
                    onClick={handleDownloadSubtitle}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Subtitle (.{(subFormat)})
                  </button>
                </div>
              </div>
            </div>

            {/* PREVIEW & GUIDELINES SIDEBAR */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border dark:border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Panduan Format Subtitle</span>
              
              <div className="space-y-3 text-3xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <p>Format waktu wajib menggunakan pola jam, menit, detik, dan milidetik:</p>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border font-mono">
                  srt: 00:00:02,500<br />
                  vtt: 00:00:02.500
                </div>
                <p><strong>Tips Penyelarasan Waktu:</strong> Anda bisa memutar video Anda di media player HP, pause pada detik suara terdengar, lalu tuliskan angkanya di kolom mulai di atas.</p>
                <p><strong>Bebas Hambatan:</strong> File subtitle yang diunduh langsung dapat dimasukkan ke dalam pemutar video seperti VLC Player atau diunggah ke TikTok/YouTube untuk memunculkan teks otomatis!</p>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-xl text-3xs text-emerald-700 dark:text-emerald-400 space-y-1">
                <p className="font-bold">100% Client-Side Processing</p>
                <p className="leading-normal">Tidak ada file video atau naskah Anda yang diunggah ke internet. Semua penulisan dan konversi diselesaikan secara instan di browser Anda.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. REMOVE BACKGROUND */}
      {toolId === 'remove-bg' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" /> Hapus Background Gambar & Ganti Latar Belakang
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Hapus background foto produk, logo, atau pasfoto pendaftaran sekolah secara offline instan.</p>
            </div>
            
            <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow">
              <Upload className="w-4 h-4" /> Pilih Gambar Baru
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ORIGINAL SAMPLER VIEW */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">1. Klik Pada Latar Belakang Untuk Menghapus</span>
                  <span className="text-3xs bg-amber-50 text-amber-700 dark:bg-amber-950/20 px-2 py-0.5 rounded font-extrabold">Klik Contoh Warna</span>
                </div>
                
                <div className="relative border rounded-2xl overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-950 min-h-[300px] max-h-[400px]">
                  <img 
                    src={images[activeImageIndex].src} 
                    alt="Original Sampler" 
                    className="max-h-[380px] max-w-full cursor-crosshair select-none block"
                    onClick={handleSampleBgColor}
                    title="Klik di latar belakang untuk menghapus warna tersebut"
                  />
                </div>
                <p className="text-3xs text-slate-400 leading-normal text-center">
                  Klik bagian warna latar belakang (misal bagian putih/hijau) pada foto asli di atas untuk menghapus warna latar tersebut secara presisi.
                </p>
              </div>

              {/* PROCESSED TRANSPARENT PNG VIEW */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">2. Hasil Pemotongan Latar</span>
                  <span className="text-3xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-extrabold uppercase">Hasil Instan</span>
                </div>

                <div 
                  className="border rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[400px] relative shadow-inner"
                  style={{
                    backgroundImage: removeBgReplaceMode === 'transparent' ? 'radial-gradient(#ccc 15%, transparent 16%), radial-gradient(#ccc 15%, transparent 16%)' : 'none',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 8px 8px',
                    backgroundColor: removeBgReplaceMode === 'red' ? '#ff0000' :
                                     removeBgReplaceMode === 'blue' ? '#0000ff' :
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
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border dark:border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Toleransi Warna (Tolerance)</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{removeBgTolerance}</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="150" 
                      value={removeBgTolerance}
                      onChange={(e) => setRemoveBgTolerance(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Geser ke kanan jika warna latar masih tersisa. Geser ke kiri jika bagian utama gambar ikut terhapus.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t dark:border-slate-800">
                    <div className="flex items-center gap-1.5 self-start">
                      <span className="text-3xs font-extrabold text-slate-500 uppercase">Warna Terdeteksi:</span>
                      <span 
                        className="w-5 h-5 rounded-full border border-slate-300 inline-block shadow-sm"
                        style={{ backgroundColor: `rgb(${removeBgColor.r}, ${removeBgColor.g}, ${removeBgColor.b})` }}
                      />
                      <span className="text-3xs font-mono text-slate-600">
                        RGB({removeBgColor.r}, {removeBgColor.g}, {removeBgColor.b})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => setRemoveBgReplaceMode('transparent')}
                        className={`px-2.5 py-1 rounded text-3xs font-extrabold uppercase border cursor-pointer ${removeBgReplaceMode === 'transparent' ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-white dark:bg-slate-800 text-slate-600'}`}
                      >
                        PNG Transparan
                      </button>
                      <button 
                        onClick={() => setRemoveBgReplaceMode('red')}
                        className={`px-2.5 py-1 rounded text-3xs font-extrabold uppercase border cursor-pointer ${removeBgReplaceMode === 'red' ? 'bg-rose-600 text-white border-rose-600 shadow' : 'bg-white dark:bg-slate-800 text-slate-600'}`}
                      >
                        Pasfoto Merah
                      </button>
                      <button 
                        onClick={() => setRemoveBgReplaceMode('blue')}
                        className={`px-2.5 py-1 rounded text-3xs font-extrabold uppercase border cursor-pointer ${removeBgReplaceMode === 'blue' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white dark:bg-slate-800 text-slate-600'}`}
                      >
                        Pasfoto Biru
                      </button>
                      <button 
                        onClick={() => setRemoveBgReplaceMode('white')}
                        className={`px-2.5 py-1 rounded text-3xs font-extrabold uppercase border cursor-pointer ${removeBgReplaceMode === 'white' ? 'bg-slate-100 text-slate-800' : 'bg-white dark:bg-slate-800 text-slate-600'}`}
                      >
                        Putih
                      </button>
                    </div>
                  </div>

                  <a 
                    href={processedBgImage || '#'}
                    download={`NoBG_${removeBgReplaceMode === 'transparent' ? 'transparent.png' : removeBgReplaceMode + '.jpg'}`}
                    onClick={triggerConfetti}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" /> Unduh Gambar Hasil Pemotongan
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-slate-150 dark:border-slate-750 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 animate-pulse">
              <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Silahkan unggah berkas foto Anda</p>
              <p className="text-3xs text-slate-400 mt-0.5">Klik tombol "Pilih Gambar Baru" di kanan atas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
