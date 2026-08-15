import React, { useState, useRef } from 'react';
import { 
  FileText, FileImage, Download, Upload, Trash2, Eye, Sparkles, 
  Layers, RefreshCw, CheckCircle2, AlertCircle, Copy, FilePlus, ArrowRight,
  BookOpen, MoveUp, MoveDown, Check, Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } from 'docx';
import { createWorker } from 'tesseract.js';

interface DocImageStudioProps {
  toolId: 'word-to-jpg' | 'image-to-word';
}

export default function DocImageStudio({ toolId }: DocImageStudioProps) {
  const triggerSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // ----------------------------------------------------
  // STATES FOR WORD TO JPG (word-to-jpg)
  // ----------------------------------------------------
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [wordDocTitle, setWordDocTitle] = useState('DOKUMEN RESMI ADMINISTRASI');
  const [wordDocContent, setWordDocContent] = useState<string>('');
  const [wordDocHtml, setWordDocHtml] = useState<string>('');
  const [isParsingWord, setIsParsingWord] = useState(false);
  const [wordParseError, setWordParseError] = useState<string | null>(null);
  const [docHeaderStyle, setDocHeaderStyle] = useState<'garuda' | 'modern' | 'simple'>('garuda');
  const [paperTheme, setPaperTheme] = useState<'white' | 'cream' | 'formal'>('white');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<number>(15);
  const [lineSpacing, setLineSpacing] = useState<number>(1.6);
  const [renderedJpgs, setRenderedJpgs] = useState<{ page: number; dataUrl: string }[]>([]);
  const [isRenderingJpg, setIsRenderingJpg] = useState(false);
  const wordFileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle upload of real .docx / .doc / .txt
  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setWordFile(file);
    setWordParseError(null);
    setIsParsingWord(true);
    setRenderedJpgs([]);

    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase();
        setWordDocTitle(cleanTitle || 'DOKUMEN RESMI');
        setWordDocContent(textResult.value || 'Dokumen berhasil diekstrak.');
        setWordDocHtml(htmlResult.value || '');
      } else if (file.name.toLowerCase().endsWith('.txt')) {
        const text = await file.text();
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase();
        setWordDocTitle(cleanTitle || 'DOKUMEN TEKS');
        setWordDocContent(text);
        setWordDocHtml(`<p>${text.replace(/\n/g, '<br/>')}</p>`);
      } else {
        // Fallback for .doc or other formats
        const text = await file.text();
        const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
        setWordDocTitle(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
        setWordDocContent(cleanText.length > 20 ? cleanText : `[Dokumen ${file.name} telah dimuat ke editor]\n\nSilakan tinjau dan sesuaikan teks sebelum mengekspor ke JPG.`);
        setWordDocHtml(`<p>${(cleanText || file.name).replace(/\n/g, '<br/>')}</p>`);
      }
    } catch (err: any) {
      console.error('Error parsing document:', err);
      setWordParseError('Gagal membaca struktur berkas Word secara otomatis. Anda dapat mengetik / menempel isi draf pada editor di bawah.');
      setWordDocContent('Draf teks dokumen...');
    } finally {
      setIsParsingWord(false);
    }
  };

  // Convert parsed text into paginated high-res A4 JPEG canvases
  const generateA4JpgPages = async () => {
    setIsRenderingJpg(true);
    try {
      const pageWidth = 1240; // High-res A4 width @ 150 DPI
      const pageHeight = 1754; // High-res A4 height @ 150 DPI
      const margin = 100;
      const contentWidth = pageWidth - margin * 2;
      
      const paragraphs = (wordDocContent || 'Tidak ada konten').split('\n');
      const pagesData: { page: number; dataUrl: string }[] = [];

      // Temporary canvas to measure font text wrapping
      const measureCanvas = document.createElement('canvas');
      const mCtx = measureCanvas.getContext('2d')!;
      
      const fontName = fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' : 
                       fontFamily === 'mono' ? 'Courier, monospace' : 'Arial, sans-serif';
      
      const bodyFontSize = Math.round(fontSize * 1.5);
      const lineHeightPx = Math.round(bodyFontSize * lineSpacing);
      
      mCtx.font = `${bodyFontSize}px ${fontName}`;

      // Wrap text into visual lines
      const wrappedLines: { text: string; isBold?: boolean; isHeader?: boolean; isSpace?: boolean }[] = [];
      
      for (const p of paragraphs) {
        if (p.trim() === '') {
          wrappedLines.push({ text: '', isSpace: true });
          continue;
        }

        const words = p.split(' ');
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
          const width = mCtx.measureText(testLine).width;
          if (width > contentWidth && currentLine !== '') {
            wrappedLines.push({ text: currentLine });
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          wrappedLines.push({ text: currentLine });
        }
      }

      // Paginate lines into pages
      let currentLineIdx = 0;
      let pageNum = 1;

      while (currentLineIdx < wrappedLines.length || pageNum === 1) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = pageWidth;
        pageCanvas.height = pageHeight;
        const ctx = pageCanvas.getContext('2d')!;

        // 1. Background Paper
        if (paperTheme === 'cream') {
          ctx.fillStyle = '#fefcf6';
        } else if (paperTheme === 'formal') {
          ctx.fillStyle = '#f8fafc';
        } else {
          ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(0, 0, pageWidth, pageHeight);

        // Elegant A4 outer border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, pageWidth - 40, pageHeight - 40);

        let yPos = margin + 20;

        // 2. Header (Only on Page 1)
        if (pageNum === 1) {
          if (docHeaderStyle === 'garuda') {
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(bodyFontSize * 1.35)}px ${fontName}`;
            ctx.textAlign = 'center';
            ctx.fillText('REPUBLIK INDONESIA', pageWidth / 2, yPos);
            yPos += 34;

            ctx.font = `bold ${Math.round(bodyFontSize * 1.15)}px ${fontName}`;
            ctx.fillText(wordDocTitle, pageWidth / 2, yPos);
            yPos += 28;

            // Double header line
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(margin, yPos);
            ctx.lineTo(pageWidth - margin, yPos);
            ctx.stroke();

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margin, yPos + 4);
            ctx.lineTo(pageWidth - margin, yPos + 4);
            ctx.stroke();

            yPos += 45;
          } else if (docHeaderStyle === 'modern') {
            ctx.fillStyle = '#0284c7';
            ctx.font = `bold ${Math.round(bodyFontSize * 1.3)}px ${fontName}`;
            ctx.textAlign = 'left';
            ctx.fillText(wordDocTitle, margin, yPos);
            yPos += 24;

            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(margin, yPos);
            ctx.lineTo(margin + 200, yPos);
            ctx.stroke();

            yPos += 40;
          } else {
            // Simple
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(bodyFontSize * 1.2)}px ${fontName}`;
            ctx.textAlign = 'center';
            ctx.fillText(wordDocTitle, pageWidth / 2, yPos);
            yPos += 40;
          }
        }

        // 3. Body Text
        ctx.fillStyle = '#1e293b';
        ctx.font = `${bodyFontSize}px ${fontName}`;
        ctx.textAlign = 'left';

        const maxYPos = pageHeight - margin - 80;

        while (currentLineIdx < wrappedLines.length && yPos < maxYPos) {
          const item = wrappedLines[currentLineIdx];
          if (item.isSpace) {
            yPos += Math.round(lineHeightPx * 0.7);
          } else {
            ctx.fillText(item.text, margin, yPos);
            yPos += lineHeightPx;
          }
          currentLineIdx++;
        }

        // 4. Page Footer
        ctx.fillStyle = '#94a3b8';
        ctx.font = `italic 14px ${fontName}`;
        ctx.textAlign = 'center';
        ctx.fillText(`Halaman ${pageNum}`, pageWidth / 2, pageHeight - 50);

        const dataUrl = pageCanvas.toDataURL('image/jpeg', 0.95);
        pagesData.push({ page: pageNum, dataUrl });

        pageNum++;
        if (currentLineIdx >= wrappedLines.length) break;
      }

      setRenderedJpgs(pagesData);
      triggerSuccess();
    } catch (err) {
      console.error('Error generating JPG:', err);
    } finally {
      setIsRenderingJpg(false);
    }
  };

  const downloadSingleJpg = (dataUrl: string, pageNum: number) => {
    const link = document.createElement('a');
    const baseName = wordFile ? wordFile.name.replace(/\.[^/.]+$/, '') : 'dokumen';
    link.download = `${baseName}_halaman_${pageNum}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess();
  };

  const downloadAllJpgs = () => {
    renderedJpgs.forEach((item, idx) => {
      setTimeout(() => {
        downloadSingleJpg(item.dataUrl, item.page);
      }, idx * 400);
    });
  };

  // ----------------------------------------------------
  // STATES FOR IMAGE TO WORD (image-to-word)
  // ----------------------------------------------------
  const [imageFiles, setImageFiles] = useState<{ id: string; file: File; src: string; name: string; size: number }[]>([]);
  const [imageToWordMode, setImageToWordMode] = useState<'embed' | 'ocr'>('embed');
  const [ocrTextResult, setOcrTextResult] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newItems: { id: string; file: File; src: string; name: string; size: number }[] = [];
    const filesList = Array.from(e.target.files) as File[];
    
    filesList.forEach((file: File) => {
      const src = URL.createObjectURL(file);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        src,
        name: file.name,
        size: file.size
      });
    });

    setImageFiles((prev) => [...prev, ...newItems]);
    setOcrTextResult('');
  };

  const removeImageItem = (id: string) => {
    setImageFiles((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImageItem = (idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === imageFiles.length - 1) return;
    const newArr = [...imageFiles];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    const temp = newArr[idx];
    newArr[idx] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setImageFiles(newArr);
  };

  // 1. Convert Scanned Images Directly into Microsoft Word (.docx) with Embedded High-Res Images
  const handleExportDocxWithImages = async () => {
    if (imageFiles.length === 0) return;
    setIsGeneratingDocx(true);

    try {
      const docChildren: any[] = [
        new Paragraph({
          text: "LAMPIRAN DOKUMEN & FOTO BERKAS",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        })
      ];

      for (let i = 0; i < imageFiles.length; i++) {
        const item = imageFiles[i];
        const arrayBuffer = await item.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Gambar #${i + 1}: ${item.name}`,
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 200, after: 120 }
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: uint8Array,
                transformation: {
                  width: 500,
                  height: 380,
                },
                type: item.file.type.includes('png') ? 'png' : 'jpg',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: docChildren,
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Dokumen_Lampiran_Foto_${Date.now()}.docx`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccess();
    } catch (err) {
      console.error('Error creating docx with images:', err);
      alert('Terjadi kendala saat menyusun berkas Word. Silakan coba kembali.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // 2. Perform OCR on uploaded images and extract text
  const handlePerformOcr = async () => {
    if (imageFiles.length === 0) return;
    setIsProcessingOcr(true);
    setOcrProgress(0);
    setOcrTextResult('');

    try {
      const worker = await createWorker('ind+eng');
      let combinedText = '';

      for (let i = 0; i < imageFiles.length; i++) {
        const item = imageFiles[i];
        const { data: { text } } = await worker.recognize(item.src);
        combinedText += `--- HASIL EKSTRAKSI: ${item.name} ---\n\n${text}\n\n`;
        setOcrProgress(Math.round(((i + 1) / imageFiles.length) * 100));
      }

      await worker.terminate();
      setOcrTextResult(combinedText.trim());
      triggerSuccess();
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Gagal mengekstrak teks otomatis. Pastikan foto jelas dan memiliki pencahayaan cukup.');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // 3. Export OCR recognized text as genuine .docx file
  const handleExportOcrToDocx = async () => {
    if (!ocrTextResult) return;
    setIsGeneratingDocx(true);

    try {
      const lines = ocrTextResult.split('\n');
      const paragraphs = lines.map((line) => {
        if (line.startsWith('--- HASIL EKSTRAKSI')) {
          return new Paragraph({
            text: line,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 }
          });
        }
        return new Paragraph({
          text: line,
          spacing: { after: 100 }
        });
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "HASIL EKSTRAKSI TEKS DOKUMEN (OCR)",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            }),
            ...paragraphs
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Ekstraksi_Teks_Word_${Date.now()}.docx`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccess();
    } catch (err) {
      console.error('Docx OCR export error:', err);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. TOOL: WORD TO JPG (word-to-jpg) */}
      {/* ========================================================================= */}
      {toolId === 'word-to-jpg' && (
        <div className="space-y-6">
          {/* HEADER & UPLOAD BAR */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5 text-sky-600" />
                  Konverter File Word (.docx) ke Lembar Gambar JPG
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih berkas dokumen Word asli dari memori HP/komputer Anda. Sistem akan memformat teks secara otomatis ke tata letak A4 resmi beresolusi tinggi (150-300 DPI).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={wordFileInputRef}
                  onChange={handleWordUpload}
                  accept=".docx,.doc,.txt,.rtf" 
                  className="hidden" 
                />
                <button 
                  onClick={() => wordFileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" /> Pilih File Word (.docx)
                </button>
              </div>
            </div>

            {wordFile && (
              <div className="flex items-center justify-between bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 p-3 rounded-xl text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-bold text-sky-900 dark:text-sky-200 truncate">{wordFile.name}</span>
                  <span className="text-3xs text-sky-600 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full font-mono font-bold">
                    {(wordFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  onClick={() => { setWordFile(null); setWordDocContent(''); setRenderedJpgs([]); }}
                  className="text-rose-600 text-3xs font-bold hover:underline cursor-pointer"
                >
                  Ganti Berkas
                </button>
              </div>
            )}

            {isParsingWord && (
              <div className="text-center py-4 text-xs text-sky-600 font-bold animate-pulse">
                Memindai dan mengekstrak struktur teks dokumen Word...
              </div>
            )}
          </div>

          {/* DOCUMENT CONTROLS & LIVE EDITOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider">
                  Pengaturan Tampilan Lembar A4
                </span>

                <div className="space-y-1">
                  <label className="text-3xs font-black text-slate-400 uppercase">Judul Dokumen / Kop</label>
                  <input 
                    type="text" 
                    value={wordDocTitle} 
                    onChange={(e) => setWordDocTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase">Gaya Kop Surat</label>
                    <select 
                      value={docHeaderStyle} 
                      onChange={(e: any) => setDocHeaderStyle(e.target.value)}
                      className="w-full text-xs p-2 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    >
                      <option value="garuda">Resmi / Pemerintah</option>
                      <option value="modern">Perusahaan Modern</option>
                      <option value="simple">Minimalis / Polos</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase">Tema Kertas</label>
                    <select 
                      value={paperTheme} 
                      onChange={(e: any) => setPaperTheme(e.target.value)}
                      className="w-full text-xs p-2 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    >
                      <option value="white">Putih Bersih (A4)</option>
                      <option value="cream">Kertas Halus (Cream)</option>
                      <option value="formal">Abu Arsip Resmi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase">Gaya Font</label>
                    <select 
                      value={fontFamily} 
                      onChange={(e: any) => setFontFamily(e.target.value)}
                      className="w-full text-xs p-2 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    >
                      <option value="serif">Times New Roman (Serif)</option>
                      <option value="sans">Arial / Segoe (Clean)</option>
                      <option value="mono">Courier (Mesin Tik)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-3xs font-black text-slate-400 uppercase">
                      <span>Ukuran Teks</span>
                      <span>{fontSize}pt</span>
                    </div>
                    <input 
                      type="range" 
                      min="11" 
                      max="20" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-sky-600 mt-1 cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs font-black text-slate-400 uppercase">Draf Isi Teks Dokumen</label>
                  <textarea 
                    rows={8}
                    value={wordDocContent}
                    onChange={(e) => setWordDocContent(e.target.value)}
                    placeholder="Teks dari file Word akan otomatis masuk di sini..."
                    className="w-full text-xs p-3 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 resize-none font-serif leading-relaxed"
                  />
                </div>

                <button 
                  onClick={generateA4JpgPages}
                  disabled={isRenderingJpg}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {isRenderingJpg ? 'Sedang Merender Lembar JPG...' : 'Render Lembar JPG (Resolusi Tinggi)'}
                </button>
              </div>
            </div>

            {/* RESULTS PREVIEW & DOWNLOADS */}
            <div className="lg:col-span-7 space-y-4">
              {renderedJpgs.length > 0 ? (
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Hasil Render ({renderedJpgs.length} Halaman JPG Siap Unduh)
                    </span>
                    <button 
                      onClick={downloadAllJpgs}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-3xs rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh Semua Halaman (.JPG)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                    {renderedJpgs.map((item) => (
                      <div key={item.page} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-2">
                        <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-600">
                          <img src={item.dataUrl} alt={`Halaman ${item.page}`} className="w-full h-auto block" />
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-3xs text-slate-300 font-bold">Halaman {item.page}</span>
                          <button 
                            onClick={() => downloadSingleJpg(item.dataUrl, item.page)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-3xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Unduh JPG
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[450px]">
                  <FileImage className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Belum ada lembar JPG yang dirender
                  </p>
                  <p className="text-3xs text-slate-400 mt-1 max-w-sm">
                    Pilih berkas Word di atas atau sesuaikan isi draf, lalu klik tombol "Render Lembar JPG" untuk melihat pratinjau dan mengunduh berkas gambar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOOL: IMAGE TO WORD (image-to-word) */}
      {/* ========================================================================= */}
      {toolId === 'image-to-word' && (
        <div className="space-y-6">
          {/* HEADER & UPLOAD */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Konverter Foto / Gambar Scan ke Microsoft Word (.docx)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung foto scan ijazah, surat edaran, nota kuitansi, atau dokumen administratif dari memori galeri HP.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={imageFileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*" 
                  multiple
                  className="hidden" 
                />
                <button 
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" /> Unggah Foto Dokumen
                </button>
              </div>
            </div>

            {/* MODE SELECTION TABS */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setImageToWordMode('embed')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${imageToWordMode === 'embed' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-indigo-600" />
                  <span className="font-extrabold text-xs">Mode Lampiran Dokumen Asli</span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">
                  Menyusun foto scan asli ke dalam lembar dokumen Word .docx dengan margin rapi.
                </p>
              </button>

              <button 
                onClick={() => setImageToWordMode('ocr')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${imageToWordMode === 'ocr' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-extrabold text-xs">Mode Ekstraksi Teks (OCR)</span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">
                  Mendeteksi dan menyalin tulisan dari foto menjadi teks yang bisa diedit di Word.
                </p>
              </button>
            </div>
          </div>

          {/* MAIN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: IMAGE LIST */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Daftar Foto Diunggah ({imageFiles.length})
                  </span>
                  {imageFiles.length > 0 && (
                    <button 
                      onClick={() => imageFileInputRef.current?.click()}
                      className="text-3xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FilePlus className="w-3 h-3" /> Tambah Foto
                    </button>
                  )}
                </div>

                {imageFiles.length > 0 ? (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {imageFiles.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                        <img src={item.src} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0" />
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                          <p className="text-3xs text-slate-400 mt-0.5">{(item.size / 1024).toFixed(1)} KB • Urutan #{idx + 1}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => moveImageItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Pindah ke Atas"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => moveImageItem(idx, 'down')}
                            disabled={idx === imageFiles.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Pindah ke Bawah"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => removeImageItem(item.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => imageFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer hover:bg-indigo-50/20 transition-all"
                  >
                    <FileImage className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Berkas Foto Scan Anda</p>
                    <p className="text-3xs text-slate-400 mt-0.5">Mendukung format JPG, PNG, WebP</p>
                  </div>
                )}

                {imageFiles.length > 0 && imageToWordMode === 'embed' && (
                  <button 
                    onClick={handleExportDocxWithImages}
                    disabled={isGeneratingDocx}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingDocx ? 'Menyusun File Word...' : 'Unduh Berkas Word (.docx)'}
                  </button>
                )}

                {imageFiles.length > 0 && imageToWordMode === 'ocr' && (
                  <button 
                    onClick={handlePerformOcr}
                    disabled={isProcessingOcr}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isProcessingOcr ? `Memindai OCR (${ocrProgress}%)...` : 'Mulai Ekstraksi Teks (OCR)'}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: PREVIEW & OCR TEXT */}
            <div className="lg:col-span-7 space-y-4">
              {imageToWordMode === 'ocr' ? (
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Teks Hasil Ekstraksi OCR (Bisa Diedit)
                    </span>
                    {ocrTextResult && (
                      <button 
                        onClick={handleExportOcrToDocx}
                        disabled={isGeneratingDocx}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-3xs rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3 h-3" /> Unduh Dokumen Word (.docx)
                      </button>
                    )}
                  </div>

                  <textarea 
                    rows={14}
                    value={ocrTextResult}
                    onChange={(e) => setOcrTextResult(e.target.value)}
                    placeholder="Klik tombol 'Mulai Ekstraksi Teks (OCR)' untuk mendeteksi tulisan dari foto scan..."
                    className="w-full text-xs p-3.5 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono resize-none leading-relaxed"
                  />

                  {ocrTextResult && (
                    <p className="text-3xs text-slate-400">
                      💡 Anda dapat mengoreksi ejaan atau memodifikasi teks di atas sebelum mengunduhnya ke file Word .docx resmi.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 min-h-[400px] flex flex-col justify-center">
                  <div className="text-center text-slate-400 space-y-2">
                    <FileText className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                    <h4 className="font-bold text-white text-sm">Mode Dokumen Lampiran Siap Digunakan</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Semua foto yang Anda unggah akan otomatis disusun rapi dalam lembar A4 Microsoft Word (.docx) asli.
                    </p>
                    {imageFiles.length > 0 && (
                      <div className="pt-3">
                        <button 
                          onClick={handleExportDocxWithImages}
                          disabled={isGeneratingDocx}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-lg cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Unduh Dokumen Word (.docx) Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
