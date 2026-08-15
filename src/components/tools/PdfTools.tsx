import React, { useState, useRef } from 'react';
import { 
  FileArchive, Columns, FileImage, FileDown, SearchCode, FilePlus, 
  Download, Trash2, Plus, ArrowRight, Eye, ShieldAlert, Sparkles, 
  CheckCircle2, RefreshCw, Layers, Copy, FileText, MoveUp, MoveDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import CopyButton from '../CopyButton';

interface PdfToolsProps {
  toolId: string;
}

export default function PdfTools({ toolId }: PdfToolsProps) {
  const triggerSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // ----------------------------------------------------
  // HELPER: PDF.JS LOADER
  // ----------------------------------------------------
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = (err) => {
        console.error("Gagal memuat pdf.js", err);
        reject(err);
      };
      document.head.appendChild(script);
    });
  };

  // ----------------------------------------------------
  // 1. STATE: JPG TO PDF
  // ----------------------------------------------------
  const [images, setImages] = useState<{ id: string; file: File; name: string; src: string; size: number }[]>([]);
  const [isGeneratingPdfFromImages, setIsGeneratingPdfFromImages] = useState(false);
  const jpgToPdfInputRef = useRef<HTMLInputElement | null>(null);

  const handleJpgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newItems: { id: string; file: File; name: string; src: string; size: number }[] = [];
    const filesList = Array.from(e.target.files) as File[];
    
    filesList.forEach((file: File) => {
      const src = URL.createObjectURL(file);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        src,
        size: file.size,
      });
    });

    setImages((prev) => [...prev, ...newItems]);
  };

  const removeJpg = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveJpg = (idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === images.length - 1) return;
    const newArr = [...images];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    const temp = newArr[idx];
    newArr[idx] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setImages(newArr);
  };

  // Real compilation using pdf-lib
  const handleCompileJpgToPdf = async () => {
    if (images.length === 0) return;
    setIsGeneratingPdfFromImages(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const arrayBuffer = await item.file.arrayBuffer();
        let pdfImage;
        if (item.file.type.includes('png')) {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          // jpg / jpeg / webp
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        }

        // Standard A4: 595.28 x 841.89 points
        const a4Width = 595.28;
        const a4Height = 841.89;
        const page = pdfDoc.addPage([a4Width, a4Height]);

        const imgDims = pdfImage.scaleToFit(a4Width - 40, a4Height - 40);

        page.drawImage(pdfImage, {
          x: (a4Width - imgDims.width) / 2,
          y: (a4Height - imgDims.height) / 2,
          width: imgDims.width,
          height: imgDims.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Gabungan_Foto_Dokumen_${Date.now()}.pdf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccess();
    } catch (err) {
      console.error('Error creating PDF from images:', err);
      alert('Gagal menyusun PDF dari gambar. Pastikan format gambar berupa JPG atau PNG valid.');
    } finally {
      setIsGeneratingPdfFromImages(false);
    }
  };

  // ----------------------------------------------------
  // 2. STATE: PDF TO JPG & EKSTRAK PDF & KOMPRES PDF
  // ----------------------------------------------------
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPagesCount, setPdfPagesCount] = useState(0);
  const [pdfDataUriList, setPdfDataUriList] = useState<string[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [targetSize, setTargetSize] = useState<'200kb' | '500kb'>('200kb');
  const [compressedPdfBlobUrl, setCompressedPdfBlobUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const singlePdfInputRef = useRef<HTMLInputElement | null>(null);

  const handleSinglePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setPdfFile(file);
    setPdfPagesCount(0);
    setPdfDataUriList([]);
    setExtractedText('');
    setCompressedPdfBlobUrl(null);
    setCompressedSize(null);
    setIsProcessingPdf(true);

    try {
      const pdfjs = await loadPdfJs();
      const fileBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(fileBuffer);
      const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
      setPdfPagesCount(pdf.numPages);

      const uris: string[] = [];
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        
        // Render high-res canvas (scale 1.8 for crisp quality)
        const viewport = page.getViewport({ scale: 1.8 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          uris.push(canvas.toDataURL('image/jpeg', 0.92));
        }

        // Extract text
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `[HALAMAN ${i}]\n${pageText}\n\n`;
      }

      setPdfDataUriList(uris);
      setExtractedText(fullText.trim() || 'Tidak ada teks berbasis font terdeteksi (PDF mungkin berupa hasil foto/scan murni).');
      triggerSuccess();
    } catch (err: any) {
      console.error('Error processing PDF:', err);
      alert('Gagal memproses berkas PDF. Pastikan file PDF tidak terkunci kata sandi.');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleDownloadPdfPageAsJpg = (pageIndex: number) => {
    if (!pdfDataUriList[pageIndex] || !pdfFile) return;
    const link = document.createElement('a');
    link.download = `${pdfFile.name.replace(/\.pdf$/i, '')}_Halaman_${pageIndex + 1}.jpg`;
    link.href = pdfDataUriList[pageIndex];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess();
  };

  const handleDownloadAllPagesAsJpg = () => {
    pdfDataUriList.forEach((uri, idx) => {
      setTimeout(() => {
        handleDownloadPdfPageAsJpg(idx);
      }, idx * 350);
    });
  };

  // Real PDF Compression by rendering pages with smart JPEG quality downscaling
  const handlePerformRealCompression = async () => {
    if (!pdfFile || pdfDataUriList.length === 0) return;
    setIsCompressing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const quality = targetSize === '200kb' ? 0.6 : 0.78;
      const scaleFactor = targetSize === '200kb' ? 0.75 : 0.9;

      const pdfjs = await loadPdfJs();
      const fileBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(fileBuffer) }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scaleFactor });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Embed into new PDF
          const res = await fetch(compressedDataUrl);
          const imgBuffer = await res.arrayBuffer();
          const embeddedImg = await pdfDoc.embedJpg(imgBuffer);

          const pageDims: [number, number] = [viewport.width, viewport.height];
          const newPage = pdfDoc.addPage(pageDims);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });
        }
      }

      const compressedBytes = await pdfDoc.save();
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompressedPdfBlobUrl(url);
      setCompressedSize(blob.size);
      triggerSuccess();
    } catch (err) {
      console.error('Error compressing PDF:', err);
      alert('Gagal mengompresi PDF. Silakan coba kembali.');
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadCompressedPdf = () => {
    if (!compressedPdfBlobUrl || !pdfFile) return;
    const link = document.createElement('a');
    link.download = `${pdfFile.name.replace(/\.pdf$/i, '')}_kompres_${targetSize}.pdf`;
    link.href = compressedPdfBlobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess();
  };

  // ----------------------------------------------------
  // 3. STATE: PDF MERGER
  // ----------------------------------------------------
  const [pdfMergeList, setPdfMergeList] = useState<{ id: string; file: File; name: string; size: number }[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const mergeFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMergeFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newItems: { id: string; file: File; name: string; size: number }[] = [];
    const filesList = Array.from(e.target.files) as File[];
    
    filesList.forEach((file: File) => {
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
      });
    });

    setPdfMergeList((prev) => [...prev, ...newItems]);
  };

  const removeMergePdf = (id: string) => {
    setPdfMergeList((prev) => prev.filter((p) => p.id !== id));
  };

  const moveMergePdf = (idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === pdfMergeList.length - 1) return;
    const newArr = [...pdfMergeList];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    const temp = newArr[idx];
    newArr[idx] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setPdfMergeList(newArr);
  };

  // Real PDF Merge with pdf-lib
  const handlePerformMerge = async () => {
    if (pdfMergeList.length < 2) {
      alert('Harap masukkan minimal 2 berkas PDF untuk digabungkan.');
      return;
    }
    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfMergeList) {
        const fileBuffer = await item.file.arrayBuffer();
        const srcPdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `PDF_Gabungan_Resmi_${Date.now()}.pdf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccess();
    } catch (err) {
      console.error('Error merging PDFs:', err);
      alert('Gagal menggabungkan berkas PDF. Pastikan seluruh file PDF valid dan tidak diproteksi password.');
    } finally {
      setIsMerging(false);
    }
  };

  // ----------------------------------------------------
  // 4. STATE: TEXT TO PDF
  // ----------------------------------------------------
  const [textToPdfTitle, setTextToPdfTitle] = useState('SURAT PERNYATAAN ADMINISTRASI');
  const [textToPdfBody, setTextToPdfBody] = useState(
    'Yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa seluruh data dan dokumen yang terlampir adalah benar, sah, dan dapat dipertanggungjawabkan di hadapan hukum.\n\nDemikian pernyataan ini dibuat secara sadar tanpa paksaan untuk dipergunakan sebagaimana mestinya.'
  );
  const [textToPdfSigner, setTextToPdfSigner] = useState('Petugas / Pemohon,\n\n\n\n( Budi Santoso )');
  const [isGeneratingTextPdf, setIsGeneratingTextPdf] = useState(false);
  const docUploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleDocForTextUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const text = await file.text();
    setTextToPdfTitle(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
    setTextToPdfBody(text.trim() || 'Draf isi teks dokumen...');
  };

  // Generate real PDF from text using pdf-lib with wrapping
  const handleGenerateTextPdf = async () => {
    setIsGeneratingTextPdf(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      const a4Width = 595.28;
      const a4Height = 841.89;
      const margin = 50;
      const contentWidth = a4Width - margin * 2;

      let page = pdfDoc.addPage([a4Width, a4Height]);
      let y = a4Height - margin;

      // Header Title
      page.drawText('REPUBLIK INDONESIA', {
        x: margin,
        y: y,
        size: 16,
        font: fontTimesBold,
        color: rgb(0.1, 0.15, 0.3),
      });
      y -= 22;

      page.drawText(textToPdfTitle, {
        x: margin,
        y: y,
        size: 13,
        font: fontTimesBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 14;

      // Divider Line
      page.drawLine({
        start: { x: margin, y: y },
        end: { x: a4Width - margin, y: y },
        thickness: 1.5,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 30;

      // Body lines with word wrapping
      const paragraphs = textToPdfBody.split('\n');
      const fontSize = 11;
      const lineHeight = 16;

      for (const p of paragraphs) {
        if (p.trim() === '') {
          y -= lineHeight * 0.8;
          continue;
        }

        const words = p.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = fontTimes.widthOfTextAtSize(testLine, fontSize);

          if (width > contentWidth && currentLine !== '') {
            if (y < margin + 120) {
              // Add new page if space runs out
              page = pdfDoc.addPage([a4Width, a4Height]);
              y = a4Height - margin;
            }
            page.drawText(currentLine, {
              x: margin,
              y: y,
              size: fontSize,
              font: fontTimes,
              color: rgb(0.15, 0.15, 0.15),
            });
            y -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (y < margin + 120) {
            page = pdfDoc.addPage([a4Width, a4Height]);
            y = a4Height - margin;
          }
          page.drawText(currentLine, {
            x: margin,
            y: y,
            size: fontSize,
            font: fontTimes,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= lineHeight;
        }
      }

      // Signature Block
      y -= 40;
      if (y < margin + 80) {
        page = pdfDoc.addPage([a4Width, a4Height]);
        y = a4Height - margin;
      }

      const sigLines = textToPdfSigner.split('\n');
      for (const sLine of sigLines) {
        page.drawText(sLine, {
          x: a4Width - margin - 180,
          y: y,
          size: 11,
          font: fontTimesBold,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= 14;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${textToPdfTitle.toLowerCase().replace(/ /g, '_')}.pdf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccess();
    } catch (err) {
      console.error('Error generating text PDF:', err);
    } finally {
      setIsGeneratingTextPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER NOTICE */}
      <div className="bg-sky-50 dark:bg-sky-950/30 p-4 rounded-2xl border border-sky-200 dark:border-sky-800/60 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-sm mb-0.5">Pemrosesan Dokumen PDF Asli 100% Privat & Aman</p>
          <p className="leading-relaxed text-3xs text-sky-700 dark:text-sky-300">
            Seluruh berkas diproses langsung pada peramban peranti Anda tanpa transmisi ke server eksternal. Mendukung berkas resmi ijazah, transkrip, surat lamaran, CPNS, dan BKN.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOOL: JPG TO PDF */}
      {/* ========================================================================= */}
      {toolId === 'jpg-to-pdf' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                <FileImage className="w-5 h-5 text-sky-600" />
                Gabungkan Foto / Gambar Scan ke Berkas PDF Tunggal
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unggah beberapa foto berkas asli dari galeri/memori HP, sesuaikan urutannya, dan susun ke lembar PDF A4 resmi.
              </p>
            </div>
            
            <button 
              onClick={() => jpgToPdfInputRef.current?.click()}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Unggah Foto Berkas
            </button>
            <input ref={jpgToPdfInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleJpgUpload} />
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* SIDEBAR SETTINGS */}
              <div className="lg:col-span-4 space-y-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  Pengaturan Dokumen
                </span>
                
                <div className="text-xs bg-white dark:bg-slate-850 p-3.5 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumlah Halaman:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{images.length} Lembar</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format Lembar:</span>
                    <strong className="text-slate-800 dark:text-slate-200">A4 Standard (Resmi)</strong>
                  </div>
                </div>

                <button 
                  onClick={handleCompileJpgToPdf}
                  disabled={isGeneratingPdfFromImages}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  {isGeneratingPdfFromImages ? 'Menyusun Dokumen PDF...' : 'Buat & Unduh File PDF Asli'}
                </button>
              </div>

              {/* IMAGES REORDERABLE LIST */}
              <div className="lg:col-span-8 space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-3xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <img src={img.src} alt={img.name} className="w-12 h-12 object-cover rounded-lg border shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{img.name}</p>
                      <p className="text-3xs text-slate-400 mt-0.5">{(img.size / 1024).toFixed(1)} KB • Halaman #{idx + 1}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => moveJpg(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Pindah ke Atas"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => moveJpg(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Pindah ke Bawah"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => removeJpg(img.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div 
              onClick={() => jpgToPdfInputRef.current?.click()}
              className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer hover:bg-sky-50/20 transition-all"
            >
              <FileImage className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Berkas Foto Scan Anda</p>
              <p className="text-3xs text-slate-400 mt-0.5">Mendukung format JPG, JPEG, PNG, WebP</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOOLS: PDF TO JPG, KOMPRES PDF, EKSTRAK PDF */}
      {/* ========================================================================= */}
      {(toolId === 'kompres-pdf' || toolId === 'pdf-to-jpg' || toolId === 'ekstrak-pdf') && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                <FileArchive className="w-5 h-5 text-sky-600" />
                {toolId === 'kompres-pdf' ? 'Kompresor Berkas PDF (Target 200KB / 500KB)' : 
                 toolId === 'pdf-to-jpg' ? 'Konverter PDF ke Gambar JPG Tiap Halaman' : 
                 'Pengekstrak Teks Asli dari Dokumen PDF'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pilih dokumen PDF asli dari memori perangkat untuk diproses dengan cepat.
              </p>
            </div>
            
            <button 
              onClick={() => singlePdfInputRef.current?.click()}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <FileDown className="w-4 h-4" /> {pdfFile ? 'Ganti Berkas PDF' : 'Pilih Berkas PDF Asli'}
            </button>
            <input ref={singlePdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleSinglePdfUpload} />
          </div>

          {pdfFile && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* SIDE CONTROLS */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="font-extrabold text-xs text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                    Informasi Dokumen
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-3xs text-slate-400 block font-bold">NAMA BERKAS</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate mt-0.5">{pdfFile.name}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-3xs text-slate-400 block font-bold">UKURAN ASLI</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{(pdfFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  {/* KOMPRES PDF ACTION */}
                  {toolId === 'kompres-pdf' && (
                    <div className="space-y-3 pt-2">
                      <label className="text-3xs font-black text-slate-400 uppercase">PILIH TARGET UKURAN MAKSIMAL</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { setTargetSize('200kb'); setCompressedPdfBlobUrl(null); }}
                          className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer transition-all ${targetSize === '200kb' ? 'bg-sky-600 border-sky-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                          Target ≤ 200 KB (CPNS)
                        </button>
                        <button 
                          onClick={() => { setTargetSize('500kb'); setCompressedPdfBlobUrl(null); }}
                          className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer transition-all ${targetSize === '500kb' ? 'bg-sky-600 border-sky-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                          Target ≤ 500 KB (Lamaran)
                        </button>
                      </div>

                      <button 
                        onClick={handlePerformRealCompression}
                        disabled={isCompressing}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                      >
                        <FileArchive className="w-4 h-4" />
                        {isCompressing ? 'Sedang Mengompresi Halaman...' : 'Mulai Kompresi Dokumen Sekarang'}
                      </button>

                      {compressedSize && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                          <div className="flex justify-between items-center text-emerald-900 dark:text-emerald-200">
                            <span>Ukuran Berhasil Dikecilkan:</span>
                            <strong>{(compressedSize / 1024).toFixed(1)} KB</strong>
                          </div>
                          <button 
                            onClick={downloadCompressedPdf}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh Berkas PDF Kompresi
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PDF TO JPG ACTION */}
                  {toolId === 'pdf-to-jpg' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-3xs font-bold text-slate-500">Ditemukan {pdfPagesCount} Halaman</span>
                        <button 
                          onClick={handleDownloadAllPagesAsJpg}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-3xs rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Unduh Semua Lembar JPG
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {Array.from({ length: pdfPagesCount }).map((_, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-850 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-3xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Hal #{idx + 1}</span>
                            <button 
                              onClick={() => handleDownloadPdfPageAsJpg(idx)}
                              className="px-2 py-1 bg-sky-50 dark:bg-sky-950/30 text-sky-600 hover:bg-sky-100 rounded font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> JPG
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EKSTRAK PDF ACTION */}
                  {toolId === 'ekstrak-pdf' && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-3xs font-black text-slate-400 uppercase">TEKS HASIL EKSTRAKSI</label>
                        <CopyButton textToCopy={extractedText} label="Salin Teks" />
                      </div>
                      <textarea 
                        rows={8}
                        value={extractedText}
                        readOnly
                        className="w-full text-xs p-3 bg-white dark:bg-slate-900 border rounded-xl font-mono resize-none leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PREVIEW CANVAS VIEW */}
              <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-5 border border-slate-800 flex flex-col items-center justify-center min-h-[380px]">
                {isProcessingPdf ? (
                  <div className="text-center text-xs text-sky-400 space-y-3">
                    <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="font-bold">Membaca dan merender halaman PDF...</p>
                  </div>
                ) : pdfDataUriList.length > 0 ? (
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                      <span>Pratinjau Halaman 1 dari {pdfPagesCount}</span>
                      <button 
                        onClick={() => handleDownloadPdfPageAsJpg(0)}
                        className="text-sky-400 hover:underline font-bold text-3xs flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Unduh Lembar 1 (.JPG)
                      </button>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto flex justify-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <img src={pdfDataUriList[0]} alt="Halaman 1" className="max-h-[330px] w-auto rounded-lg shadow-xl" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    Pilih berkas PDF untuk menampilkan pratinjau
                  </div>
                )}
              </div>
            </div>
          )}

          {!pdfFile && (
            <div 
              onClick={() => singlePdfInputRef.current?.click()}
              className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer hover:bg-sky-50/20 transition-all"
            >
              <FileArchive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Berkas PDF Asli Anda</p>
              <p className="text-3xs text-slate-400 mt-0.5">Mendukung berkas resmi maksimal 50 MB</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TOOL: PDF MERGER */}
      {/* ========================================================================= */}
      {toolId === 'pdf-merger' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                <Columns className="w-5 h-5 text-sky-600" />
                Penggabung Beberapa Berkas PDF (PDF Merger)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unggah beberapa berkas PDF sekaligus, atur urutannya, dan gabungkan menjadi 1 file PDF utuh secara instan.
              </p>
            </div>

            <button 
              onClick={() => mergeFileInputRef.current?.click()}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Berkas PDF
            </button>
            <input ref={mergeFileInputRef} type="file" multiple accept="application/pdf" className="hidden" onChange={handleMergeFilesUpload} />
          </div>

          {pdfMergeList.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* SIDEBAR */}
              <div className="lg:col-span-4 space-y-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  Ringkasan Gabung
                </span>
                
                <div className="text-xs bg-white dark:bg-slate-850 p-3.5 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Berkas:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{pdfMergeList.length} File PDF</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Ukuran:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {(pdfMergeList.reduce((acc, p) => acc + p.size, 0) / 1024).toFixed(1)} KB
                    </strong>
                  </div>
                </div>

                <button 
                  onClick={handlePerformMerge}
                  disabled={isMerging}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <Columns className="w-4 h-4" />
                  {isMerging ? 'Sedang Menggabungkan PDF...' : 'Gabungkan & Unduh PDF'}
                </button>
              </div>

              {/* LIST PDF */}
              <div className="lg:col-span-8 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {pdfMergeList.map((pdf, idx) => (
                  <div key={pdf.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-3xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{pdf.name}</p>
                      <p className="text-3xs text-slate-400 mt-0.5">{(pdf.size / 1024).toFixed(1)} KB • Urutan #{idx + 1}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => moveMergePdf(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Pindah ke Atas"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => moveMergePdf(idx, 'down')}
                        disabled={idx === pdfMergeList.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Pindah ke Bawah"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => removeMergePdf(pdf.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div 
              onClick={() => mergeFileInputRef.current?.click()}
              className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer hover:bg-sky-50/20 transition-all"
            >
              <Columns className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Minimal 2 File PDF</p>
              <p className="text-3xs text-slate-400 mt-0.5">Klik di sini untuk mengunggah berkas PDF dari memori</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TOOL: TEXT TO PDF */}
      {/* ========================================================================= */}
      {toolId === 'text-to-pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Editor Draf Berkas PDF</span>
                
                <button 
                  onClick={() => docUploadInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 text-sky-600 font-bold text-3xs rounded-lg border border-sky-200 dark:border-sky-800 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Unggah File Teks (.txt)
                </button>
                <input 
                  ref={docUploadInputRef} 
                  type="file" 
                  accept=".txt,.doc" 
                  className="hidden" 
                  onChange={handleDocForTextUpload} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-black text-slate-400 uppercase">JUDUL DOKUMEN</label>
                <input 
                  type="text" 
                  value={textToPdfTitle} 
                  onChange={(e) => setTextToPdfTitle(e.target.value)} 
                  className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-bold" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-black text-slate-400 uppercase">ISI TEKS DOKUMEN</label>
                <textarea 
                  rows={8} 
                  value={textToPdfBody} 
                  onChange={(e) => setTextToPdfBody(e.target.value)} 
                  className="w-full text-xs p-3 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-serif resize-none leading-relaxed" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-black text-slate-400 uppercase">BLOK TANDA TANGAN</label>
                <textarea 
                  rows={3} 
                  value={textToPdfSigner} 
                  onChange={(e) => setTextToPdfSigner(e.target.value)} 
                  className="w-full text-xs p-3 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-serif resize-none" 
                />
              </div>

              <button 
                onClick={handleGenerateTextPdf}
                disabled={isGeneratingTextPdf}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <FilePlus className="w-4 h-4" />
                {isGeneratingTextPdf ? 'Membuat File PDF...' : 'Cetak & Unduh File PDF Asli'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col justify-center min-h-[420px]">
            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl w-full text-xs font-serif min-h-[350px] flex flex-col justify-between border-t-8 border-sky-600">
              <div className="space-y-4">
                <div className="text-center border-b pb-3 space-y-1">
                  <p className="font-bold text-sm tracking-wider">REPUBLIK INDONESIA</p>
                  <p className="font-bold text-xs uppercase text-slate-700">{textToPdfTitle}</p>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{textToPdfBody}</p>
              </div>
              <div className="text-right pt-6 pr-4">
                <p className="whitespace-pre-wrap font-bold text-slate-800">{textToPdfSigner}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
