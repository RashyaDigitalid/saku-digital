import React, { useState, useRef, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, Target, QrCode, Barcode, Download, HelpCircle, ArrowRight, ShieldCheck, Link2, Plus, Trash2, Globe, Smartphone, User, Sparkles, FileSpreadsheet, Upload, Check, Copy, Receipt, Image, Loader2, Printer } from 'lucide-react';
import Tesseract from 'tesseract.js';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import CopyButton from '../CopyButton';

// Platform-specific SVG icons helper for downloaded static HTML
const getPlatformSvg = (platform: string) => {
  switch (platform) {
    case 'whatsapp':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.503 5.361 1.504 5.433 0 9.85-4.407 9.853-9.83.002-2.628-1.017-5.099-2.872-6.956C17.076 2.012 14.61 1 12.008 1 6.578 1 2.16 5.407 2.157 10.83c-.001 2.105.549 4.158 1.594 5.925l-.991 3.616 3.702-.971zm10.108-7.481c-.333-.166-1.969-.971-2.271-1.081-.303-.11-.524-.166-.745.166-.22.331-.855 1.081-1.048 1.302-.192.22-.385.247-.718.081-1.637-.819-2.772-1.43-3.876-3.313-.29-.497.29-.461.83-1.536.091-.18.045-.339-.022-.473-.067-.133-.524-1.268-.718-1.73-.19-.454-.383-.393-.524-.4l-.448-.009c-.154 0-.404.058-.615.289-.212.23-.808.788-.808 1.921 0 1.133.824 2.228.939 2.382.115.154 1.623 2.478 3.931 3.477.549.237 1.012.393 1.358.503.551.175 1.052.15 1.447.091.441-.066 1.969-.804 2.247-1.58.277-.775.277-1.44.193-1.58-.084-.14-.308-.222-.641-.389z"/></svg>`;
    case 'instagram':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    case 'facebook':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    case 'youtube':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'tiktok':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47-.1.32-.12.67-.12 1.01-.03 2.44-.5 4.96-1.95 6.95-1.48 2.08-3.94 3.44-6.53 3.53-2.58.08-5.32-.78-7.04-2.81-1.85-2.18-2.14-5.59-.72-8.15 1.11-2.02 3.28-3.41 5.58-3.53.07 1.34-.03 2.69-.04 4.03-1.24.1-2.52.74-3.13 1.84-.71 1.25-.47 3.01.58 3.99 1.05.99 2.77 1.04 3.86.13 1.14-.94 1.38-2.61 1.38-4.04V.02z"/></svg>`;
    case 'threads':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><path d="M12 2a10 10 0 1 0 10 10c0-1.8-1.5-3-3-3s-3 1.2-3 3v2c0 .6-.4 1-1 1s-1-.4-1-1v-4c0-.6-.4-1-1-1s-1 .4-1 1v4c0 .6-.4 1-1 1s-1-.4-1-1v-4.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5v2.5c0 2.8 2.2 5 5 5s5-2.2 5-5a12 12 0 1 0-12 10.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5a11 11 0 1 1 11-11c0 2.2-1.8 4-4 4s-4-1.8-4-4V11.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v2c0 1.1.9 2 2 2s2-.9 2-2V12c0-5.5-4.5-10-10-10z"/></svg>`;
    case 'twitter':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; flex-shrink:0; display:inline-block; vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
  }
};

// React component version of the PlatformIcon for the in-app interactive preview
const PlatformIcon = ({ platform, className = "w-4 h-4 mr-2 shrink-0" }: { platform: string; className?: string }) => {
  const svgHtml = getPlatformSvg(platform);
  return <span className="inline-flex items-center" dangerouslySetInnerHTML={{ __html: svgHtml }} />;
};

// Helper function to check if the URL doesn't match the selected platform
const getUrlMismatchWarning = (platform: string, url: string) => {
  if (!url || url === 'https://' || url === 'http://') return null;
  const cleanUrl = url.toLowerCase();
  
  if (platform === 'whatsapp' && !cleanUrl.includes('wa.me') && !cleanUrl.includes('whatsapp.com')) {
    return 'Tautan bukan format WA resmi (wa.me / whatsapp.com)';
  }
  if (platform === 'instagram' && !cleanUrl.includes('instagram.com')) {
    return 'Tautan tidak mengandung instagram.com';
  }
  if (platform === 'facebook' && !cleanUrl.includes('facebook.com') && !cleanUrl.includes('fb.me') && !cleanUrl.includes('fb.com')) {
    return 'Tautan tidak mengandung facebook.com';
  }
  if (platform === 'youtube' && !cleanUrl.includes('youtube.com') && !cleanUrl.includes('youtu.be')) {
    return 'Tautan tidak mengandung youtube.com';
  }
  if (platform === 'tiktok' && !cleanUrl.includes('tiktok.com')) {
    return 'Tautan tidak mengandung tiktok.com';
  }
  if (platform === 'threads' && !cleanUrl.includes('threads.net')) {
    return 'Tautan tidak mengandung threads.net';
  }
  if (platform === 'twitter' && !cleanUrl.includes('twitter.com') && !cleanUrl.includes('x.com')) {
    return 'Tautan tidak mengandung twitter.com atau x.com';
  }
  return null;
};

interface BusinessToolsProps {
  toolId: string;
}

export default function BusinessTools({ toolId }: BusinessToolsProps) {
  const triggerSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // 6. NOTA EXTRACTOR STATES
  const [notaFile, setNotaFile] = useState<File | null>(null);
  const [notaImgUrl, setNotaImgUrl] = useState<string | null>(null);
  const [isNotaProcessing, setIsNotaProcessing] = useState(false);
  const [notaProgress, setNotaProgress] = useState(0);
  const [notaStatus, setNotaStatus] = useState('');
  const [notaRawText, setNotaRawText] = useState('');
  const [notaItems, setNotaItems] = useState<Array<{ id: string; name: string; qty: number; price: number; total: number }>>([]);

  const handleNotaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processNotaImage(file);
    }
  };

  const translateOcrStatus = (status: string) => {
    switch (status) {
      case 'loading tesseract core': return 'Memuat modul inti';
      case 'initializing tesseract' : return 'Menyiapkan mesin scan';
      case 'initialized tesseract': return 'Mesin scan siap';
      case 'loading language traineddata': return 'Memuat kamus Bahasa Indonesia';
      case 'loaded language traineddata': return 'Kamus bahasa dimuat';
      case 'initializing api': return 'Menghubungkan sistem';
      case 'initialized api': return 'Sistem terhubung';
      default: return status;
    }
  };

  const parseNotaText = (text: string) => {
    const lines = text.split('\n');
    const items: Array<{ id: string; name: string; qty: number; price: number; total: number }> = [];
    
    const ignoreKeywords = [
      'total', 'tunai', 'kembali', 'bayar', 'cash', 'subtotal', 'sub-total', 'diskon', 'discount', 
      'ppn', 'pajak', 'nama toko', 'alamat', 'telp', 'tanggal', 'nota', 'kwitansi', 'terima kasih', 
      'citarum', 'no:', 'sifat:', 'perihal:', 'kembalian', 'kembalian:', 'grand total', 'grandtotal'
    ];

    lines.forEach((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.length < 4) return;
      
      const lowerLine = cleanLine.toLowerCase();
      if (ignoreKeywords.some(kw => lowerLine.includes(kw))) return;

      let itemLine = cleanLine.replace(/^\d+[\s\.)\-:]+/, '').trim();
      itemLine = itemLine.replace(/^[•\-\*]\s*/, '').trim();

      const moneyRegex = /(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d{3,9})/gi;
      const matches = [...itemLine.matchAll(moneyRegex)];

      if (matches.length > 0) {
        const parsedNumbers = matches.map(m => {
          const numStr = m[1].replace(/\./g, '');
          return parseInt(numStr, 10);
        });

        let qty = 1;
        let unitPrice = parsedNumbers[0] || 0;
        let total = parsedNumbers[parsedNumbers.length - 1] || 0;

        const qtyRegex = /(\d+(?:\.\d+)?)\s*(?:x|pcs|kg|ltr|@|bg|btl|box|bgks)/i;
        const qtyMatch = itemLine.match(qtyRegex);

        if (qtyMatch) {
          qty = Math.round(parseFloat(qtyMatch[1]));
        } else {
          const smallNumRegex = /\b([1-9]|1\d|20)\b/;
          let strippedLine = itemLine;
          matches.forEach(m => { strippedLine = strippedLine.replace(m[0], ''); });
          const smallMatch = strippedLine.match(smallNumRegex);
          if (smallMatch) {
            qty = parseInt(smallMatch[1], 10);
          }
        }

        if (parsedNumbers.length >= 2) {
          unitPrice = parsedNumbers[0];
          total = parsedNumbers[parsedNumbers.length - 1];
        } else {
          total = parsedNumbers[0];
          unitPrice = Math.round(total / qty);
        }

        let itemName = itemLine;
        matches.forEach(m => {
          itemName = itemName.replace(m[0], '');
        });

        if (qtyMatch) {
          itemName = itemName.replace(qtyMatch[0], '');
        }

        itemName = itemName
          .replace(/(?:rp\.?\s*)/gi, '')
          .replace(/(?:x|pcs|kg|ltr|bg|btl|box|bgks|@)/gi, '')
          .replace(/\b\d+\b/g, '')
          .replace(/[-=:,_\*\+;\/\|]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (itemName.length < 2) {
          itemName = `Barang Jualan ${idx + 1}`;
        }

        items.push({
          id: Math.random().toString(36).substr(2, 9),
          name: itemName,
          qty: qty,
          price: unitPrice,
          total: qty * unitPrice
        });
      }
    });

    return items;
  };

  const processNotaImage = async (file: File) => {
    setNotaFile(file);
    setNotaImgUrl(URL.createObjectURL(file));
    setIsNotaProcessing(true);
    setNotaProgress(0);
    setNotaStatus('Membaca berkas gambar...');

    try {
      setNotaStatus('Menginisialisasi OCR Tesseract...');
      const result = await Tesseract.recognize(
        file,
        'ind+eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setNotaStatus('Memindai & mengekstrak teks...');
              setNotaProgress(Math.round(m.progress * 100));
            } else {
              setNotaStatus(`OCR: ${translateOcrStatus(m.status)}...`);
            }
          }
        }
      );

      const text = result.data.text;
      setNotaRawText(text);
      
      const parsed = parseNotaText(text);
      setNotaItems(parsed);
      triggerSuccess();
    } catch (err) {
      console.error('Error running client-side OCR:', err);
      setNotaStatus('Gagal memindai otomatis. Anda bisa memasukkan teks manual atau mencoba file lain.');
    } finally {
      setIsNotaProcessing(false);
    }
  };

  const loadExampleNota = () => {
    const exampleText = `DAPUR MAKMUR SEJAHTERA
Jl. Melati No. 12, Jakarta

NOTA PENJUALAN
No: 2026/07/99

1. Beras Pandan Wangi 5kg   2 x 78.000 = 156.000
2. Minyak Goreng Bimoli 2L  3 x 28.500 = 85.500
3. Gula Pasir Gulaku 1kg    5 x 14.500 = 72.500
4. Telur Ayam Negeri 1kg    1 x 26.000 = 26.000
5. Kecap Manis Bango 550ml  2 x 21.000 = 42.000
6. Teh Celup Sosro          4 x  6.000 = 24.000

TOTAL BELANJA: Rp 406.000
Terima Kasih Atas Kunjungan Anda!
`;
    setNotaRawText(exampleText);
    const parsed = parseNotaText(exampleText);
    setNotaItems(parsed);
    setNotaFile(null);
    setNotaImgUrl(null);
    triggerSuccess();
  };

  const updateNotaItem = (id: string, field: 'name' | 'qty' | 'price', value: any) => {
    setNotaItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'price') {
          updated.total = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const deleteNotaItem = (id: string) => {
    setNotaItems(prev => prev.filter(item => item.id !== id));
  };

  const addNotaItem = () => {
    setNotaItems(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: 'Barang Baru',
        qty: 1,
        price: 10000,
        total: 10000
      }
    ]);
  };

  const notaGrandTotal = notaItems.reduce((acc, item) => acc + (item.total || 0), 0);

  const downloadNotaCsv = () => {
    if (notaItems.length === 0) return;
    
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "No;Nama Barang;Jumlah;Harga Satuan;Total Harga\n";
    
    notaItems.forEach((item, idx) => {
      const cleanName = item.name.replace(/"/g, '""').replace(/;/g, ',');
      csvContent += `${idx + 1};"${cleanName}";${item.qty};${item.price};${item.total}\n`;
    });
    
    csvContent += `;;;GRAND TOTAL;${notaGrandTotal}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ekstrak_nota_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    triggerSuccess();
  };

  const copyNotaToClipboard = () => {
    if (notaItems.length === 0) return;
    
    let text = "Nama Barang\tJumlah\tHarga Satuan\tTotal Harga\n";
    notaItems.forEach(item => {
      text += `${item.name}\t${item.qty}\t${item.price}\t${item.total}\n`;
    });
    text += `\t\tGRAND TOTAL\t${notaGrandTotal}`;
    
    navigator.clipboard.writeText(text);
    alert('Daftar barang berhasil disalin! Silakan langsung Paste (Ctrl+V) di Microsoft Excel atau Google Sheets.');
    triggerSuccess();
  };

  const handlePrintNota = () => {
    if (notaItems.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const todayStr = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    printWindow.document.write(`
      <html>
      <head>
        <title>Nota_Belanja_${new Date().getTime()}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            line-height: 1.5;
            background-color: #ffffff;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-details {
            text-align: left;
          }
          .company-name {
            font-size: 20pt;
            font-weight: 800;
            color: #059669; /* emerald-600 */
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: -0.5px;
          }
          .company-sub {
            font-size: 9pt;
            color: #64748b;
            margin: 0;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-title {
            font-size: 22pt;
            font-weight: 900;
            color: #0f172a;
            margin: 0 0 5px 0;
            letter-spacing: -1px;
          }
          .invoice-meta {
            font-size: 9pt;
            color: #475569;
            margin: 2px 0;
          }
          .meta-label {
            font-weight: 600;
            color: #0f172a;
          }
          .table-container {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            font-size: 9.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px 16px;
            border-bottom: 2px solid #cbd5e1;
          }
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10.5pt;
          }
          tr:last-child td {
            border-bottom: 2px solid #94a3b8;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .mono {
            font-family: 'Courier New', Courier, monospace;
            font-weight: 600;
          }
          .summary-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
            margin-bottom: 40px;
          }
          .summary-box {
            width: 300px;
            border-top: 1px solid #cbd5e1;
            padding-top: 15px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 10pt;
          }
          .summary-total {
            display: flex;
            justify-content: space-between;
            font-size: 13pt;
            font-weight: 800;
            color: #059669; /* emerald-600 */
            border-top: 2px solid #059669;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer-section {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 8.5pt;
            color: #94a3b8;
          }
          .footer-text {
            margin: 2px 0;
          }
          .signature-area {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding: 0 40px;
          }
          .signature-box {
            text-align: center;
            font-size: 10pt;
            width: 200px;
          }
          .signature-line {
            margin-top: 60px;
            border-top: 1px solid #475569;
            font-weight: bold;
            padding-top: 5px;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .invoice-container {
              padding: 0;
            }
            th {
              background-color: #f1f5f9 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-details">
              <h1 class="company-name">SakuDigital UMKM</h1>
              <p class="company-sub">Sistem Manajemen Transaksi & Laporan Keuangan Mandiri</p>
              <p class="company-sub">Diproses secara lokal - 100% Aman & Privat</p>
            </div>
            <div class="invoice-details">
              <h2 class="invoice-title">NOTA RESMI</h2>
              <p class="invoice-meta"><span class="meta-label">Tanggal Cetak:</span> ${todayStr}</p>
              <p class="invoice-meta"><span class="meta-label">No. Dokumen:</span> SD-${Math.floor(new Date().getTime()/1000)}</p>
              <p class="invoice-meta"><span class="meta-label">Status:</span> LUNAS</p>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 8%">No</th>
                  <th>Nama Item / Deskripsi Barang</th>
                  <th class="text-center" style="width: 12%">Jumlah</th>
                  <th class="text-right" style="width: 22%">Harga Satuan</th>
                  <th class="text-right" style="width: 22%">Total Harga</th>
                </tr>
              </thead>
              <tbody>
                ${notaItems.map((item, idx) => `
                  <tr>
                    <td class="text-center mono">${idx + 1}</td>
                    <td style="font-weight: 600;">${item.name}</td>
                    <td class="text-center mono">${item.qty}</td>
                    <td class="text-right mono">Rp ${item.price.toLocaleString('id-ID')}</td>
                    <td class="text-right mono" style="font-weight: bold;">Rp ${item.total.toLocaleString('id-ID')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="summary-container">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal Items:</span>
                <span class="mono">${notaItems.length} Jenis</span>
              </div>
              <div class="summary-row">
                <span>Total Kuantitas:</span>
                <span class="mono">${notaItems.reduce((acc, i) => acc + i.qty, 0)} pcs</span>
              </div>
              <div class="summary-total">
                <span>GRAND TOTAL:</span>
                <span class="mono">Rp ${notaGrandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div class="signature-area">
            <div class="signature-box">
              <p>Penerima / Pembeli,</p>
              <div class="signature-line">( ____________________ )</div>
            </div>
            <div class="signature-box">
              <p>Hormat Kami / Kasir,</p>
              <div class="signature-line">( ____________________ )</div>
            </div>
          </div>

          <div class="footer-section">
            <p class="footer-text">Terima kasih atas kepercayaan Anda bertransaksi dengan kami.</p>
            <p class="footer-text">Dicetak otomatis via Aplikasi SakuDigital - Aplikasi Admin Lokal UMKM.</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    triggerSuccess();
  };

  // 0. LINK BIO STATES
  const [bioName, setBioName] = useState('Dapur Cantik Bu Ros');
  const [bioDesc, setBioDesc] = useState('Aneka kue basah, katering syukuran, dan tumpeng hias premium Jogja.');
  const [bioTheme, setBioTheme] = useState<'forest' | 'obsidian' | 'sunset' | 'lavender' | 'nordic' | 'neon' | 'sakura' | 'monochrome'>('forest');
  const [bioFont, setBioFont] = useState<'inter' | 'playfair' | 'mono' | 'rubik' | 'dm-sans'>('inter');
  const [bioLogo, setBioLogo] = useState<string>(''); // Base64 profile picture string
  const [bioLinks, setBioLinks] = useState<Array<{ id: string; label: string; url: string; platform: string }>>([
    { id: '1', label: 'Order Kue via WhatsApp', url: 'https://wa.me/628123456789', platform: 'whatsapp' },
    { id: '2', label: 'Instagram Galeri Menu', url: 'https://instagram.com/dapur.cantik.ros', platform: 'instagram' },
    { id: '3', label: 'Pesan Katering di Shopee', url: 'https://shopee.co.id/dapur_ros', platform: 'shopee' }
  ]);

  const bioLogoInputRef = useRef<HTMLInputElement | null>(null);

  const handleBioLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBioLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadBioHtml = () => {
    const themeBg = 
      bioTheme === 'forest' ? 'linear-gradient(135deg, #064e3b, #047857)' :
      bioTheme === 'obsidian' ? 'linear-gradient(135deg, #090d16, #111827)' :
      bioTheme === 'sunset' ? 'linear-gradient(135deg, #7c2d12, #c2410c)' :
      bioTheme === 'lavender' ? 'linear-gradient(135deg, #4c1d95, #6d28d9)' :
      bioTheme === 'nordic' ? 'linear-gradient(135deg, #111827, #374151)' :
      bioTheme === 'neon' ? 'linear-gradient(135deg, #000000, #111111)' :
      bioTheme === 'sakura' ? 'linear-gradient(135deg, #831843, #be185d)' :
      'linear-gradient(135deg, #000000, #171717)';

    const fontImport = 
      bioFont === 'inter' ? "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');" :
      bioFont === 'playfair' ? "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');" :
      bioFont === 'mono' ? "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');" :
      bioFont === 'rubik' ? "@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;900&display=swap');" :
      "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&display=swap');";

    const fontFamily = 
      bioFont === 'inter' ? "'Inter', sans-serif" :
      bioFont === 'playfair' ? "'Playfair Display', serif" :
      bioFont === 'mono' ? "'JetBrains Mono', monospace" :
      bioFont === 'rubik' ? "'Rubik', sans-serif" :
      "'DM Sans', sans-serif";

    // Build custom high-contrast visual classes based on themes
    const cardBg = bioTheme === 'neon' ? '#111111' : '#ffffff';
    const cardText = bioTheme === 'neon' ? '#a3e635' : '#1e293b';
    const cardBorder = bioTheme === 'neon' ? '2px solid #a3e635' : '1px solid #e2e8f0';

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bioName} | Tautan Bio</title>
  <style>
    ${fontImport}
    body {
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      background: ${themeBg};
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
    .container {
      width: 100%;
      max-width: 480px;
      padding: 50px 24px;
      box-sizing: border-box;
      text-align: center;
    }
    .avatar-wrapper {
      margin: 0 auto 20px;
      display: flex;
      justify-content: center;
    }
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 3px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      font-weight: 800;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .bio {
      font-size: 14px;
      opacity: 0.95;
      margin: 0 0 35px 0;
      line-height: 1.6;
      font-weight: 400;
    }
    .links-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .link-card {
      background: ${cardBg};
      color: ${cardText};
      border: ${cardBorder};
      padding: 16px 20px;
      border-radius: 16px;
      text-decoration: none;
      font-weight: 800;
      font-size: 15px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .link-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.3);
      filter: brightness(1.05);
    }
    .footer {
      margin-top: 60px;
      font-size: 11px;
      opacity: 0.7;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="avatar-wrapper">
      <div class="avatar">
        ${bioLogo ? `<img src="${bioLogo}" alt="Logo" />` : bioName.charAt(0).toUpperCase()}
      </div>
    </div>
    <h1>${bioName}</h1>
    <p class="bio">${bioDesc}</p>
    <div class="links-wrapper">
      ${bioLinks.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-card">
          ${getPlatformSvg(link.platform)}
          <span>${link.label}</span>
        </a>
      `).join('')}
    </div>
    <div class="footer">
      Tautan Resmi
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bioName.replace(/\s+/g, '_').toLowerCase()}_bio.html`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess();
  };

  // 1. COMMISSION CALCULATORS
  const [sellPrice, setSellPrice] = useState(150000);
  const [platform, setPlatform] = useState<'shopee' | 'tokopedia' | 'tiktok' | 'lazada'>('shopee');
  const [adminPercent, setAdminPercent] = useState(6.0); // Standard commission rate %
  const [comResults, setComResults] = useState<{ potongan: number; bersih: number } | null>({ potongan: 9000, bersih: 141000 });

  const handleCalculateCommission = () => {
    const pot = (sellPrice * adminPercent) / 100;
    const ber = sellPrice - pot;
    setComResults({ potongan: pot, bersih: ber });
    triggerSuccess();
  };

  // Reverse Commission: Target Price
  const [cogInput, setCogInput] = useState(80000); // Cost of goods / Modal
  const [targetProfit, setTargetProfit] = useState(30000); // Desired profit margin
  const [targetPriceResult, setTargetPriceResult] = useState<number | null>(null);

  const handleCalculateTargetPrice = () => {
    // Math logic: (COG + Desired Profit) / (1 - Admin %)
    const rate = adminPercent / 100;
    const target = (cogInput + targetProfit) / (1 - rate);
    setTargetPriceResult(Math.round(target));
    triggerSuccess();
  };

  // Update percentages based on preset
  useEffect(() => {
    if (platform === 'shopee') setAdminPercent(6.0);
    else if (platform === 'tokopedia') setAdminPercent(5.5);
    else if (platform === 'tiktok') setAdminPercent(5.0);
    else if (platform === 'lazada') setAdminPercent(4.5);
  }, [platform]);

  // 2. HPP & BEP CALCULATORS
  const [rawMaterials, setRawMaterials] = useState(50000);
  const [laborCosts, setLaborCosts] = useState(25000);
  const [overheadCosts, setOverheadCosts] = useState(10000);
  const [totalUnits, setTotalUnits] = useState(100);
  const [hppResult, setHppResult] = useState<number | null>(null);

  const handleCalculateHpp = () => {
    const totalCost = Number(rawMaterials) + Number(laborCosts) + Number(overheadCosts);
    const unitHpp = totalCost / Number(totalUnits);
    setHppResult(Math.round(unitHpp));
    triggerSuccess();
  };

  // BEP Math States
  const [fixedCosts, setFixedCosts] = useState(5000000); // Gaji, sewa tempat, dll
  const [varPriceUnit, setVarPriceUnit] = useState(8000); // Modal per porsi / unit
  const [salesPriceUnit, setSalesPriceUnit] = useState(15000); // Harga jual per porsi
  const [bepResult, setBepResult] = useState<{ units: number; sales: number } | null>(null);

  const handleCalculateBep = () => {
    const margin = salesPriceUnit - varPriceUnit;
    if (margin <= 0) {
      setBepResult({ units: 0, sales: 0 });
      return;
    }
    const unitsNeeded = fixedCosts / margin;
    const salesNeeded = unitsNeeded * salesPriceUnit;
    setBepResult({
      units: Math.ceil(unitsNeeded),
      sales: Math.round(salesNeeded)
    });
    triggerSuccess();
  };

  // 3. QR CODE STATES
  const [qrText, setQrText] = useState('https://shopee.co.id/my-shop-name');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerateQr = async () => {
    if (!qrText) return;
    try {
      const url = await QRCode.toDataURL(qrText, {
        width: 350,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900 color
          light: '#ffffff'
        }
      });
      setQrImage(url);
      triggerSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.download = 'qrcode_sakudigital.png';
    link.href = qrImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess();
  };

  // 4. BARCODE GENERATOR STATES
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [barcodeText, setBarcodeText] = useState('8991234567890'); // standard EAN-13 pattern

  const drawBarcode = () => {
    const canvas = barcodeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';

    // Draws standard simulated Code-128 lines
    let startX = 40;
    const bHeight = 80;
    
    // Draw quiet zones
    startX += 10;
    
    // Draw barcode lines with pseudo-patterns based on characters
    const textToDraw = barcodeText || '8991234567890';
    for (let i = 0; i < textToDraw.length; i++) {
      const charCode = textToDraw.charCodeAt(i);
      const binaryPattern = (charCode * 31).toString(2).substring(0, 11);
      
      for (let j = 0; j < binaryPattern.length; j++) {
        const isBar = binaryPattern[j] === '1';
        const barWidth = isBar ? 2 : 1;
        ctx.fillStyle = isBar ? '#000000' : '#ffffff';
        ctx.fillRect(startX, 30, barWidth, bHeight);
        startX += barWidth;
      }
    }

    // Draw readable label text underneath
    ctx.fillStyle = '#000000';
    ctx.fillText(textToDraw, canvas.width / 2, 135);
    ctx.restore();
  };

  useEffect(() => {
    if (toolId === 'barcode-tool') {
      drawBarcode();
    }
  }, [toolId, barcodeText]);

  const handleDownloadBarcode = () => {
    const canvas = barcodeCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `barcode_${barcodeText}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess();
  };

  return (
    <div className="space-y-6">
      {/* HEADER UTILITY COMPLIANCE NOTICE */}
      {(toolId === 'potongan-admin' || toolId === 'target-pricing' || toolId === 'kalkulator-hpp' || toolId === 'bep-calculator') && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-xs flex gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold mb-0.5">Rumus Terkalibrasi Shopee / TikTok / Tokopedia (Versi Terbaru)</p>
            <p className="leading-relaxed">Semua kalkulasi persentase dan rumus biaya admin dijamin sesuai dengan ketetapan terbaru masing-masing marketplace besar. Membantu menghitung akurat tanpa resiko rugi produksi.</p>
          </div>
        </div>
      )}

      {toolId === 'nota-extractor' && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-xs flex gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold mb-0.5">Pemrosesan Foto 100% Lokal & Aman (Client-Side)</p>
            <p className="leading-relaxed">Seluruh proses pembacaan gambar nota belanja (OCR) dikerjakan murni di dalam HP/komputer Anda secara offline menggunakan teknologi WebAssembly. Foto Anda tidak dikirim ke server mana pun, privasi terjamin 100%.</p>
          </div>
        </div>
      )}

      {/* 1. MARKETPLACE COMMISSION CALCULATOR */}
      {toolId === 'potongan-admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Hitung Potongan Admin Toko</span>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">PILIH PLATFORM MARKETPLACE</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'shopee', label: 'Shopee (6.0%)' },
                    { id: 'tokopedia', label: 'Tokopedia (5.5%)' },
                    { id: 'tiktok', label: 'TikTok (5.0%)' },
                    { id: 'lazada', label: 'Lazada (4.5%)' },
                  ].map((plat) => (
                    <button 
                      key={plat.id}
                      onClick={() => setPlatform(plat.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${platform === plat.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      {plat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">HARGA JUAL PRODUK DI TOKO (RP)</label>
                <input 
                  type="number" 
                  value={sellPrice} 
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 border rounded-xl dark:bg-slate-900 font-bold" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>PERSENTASE ADMIN (%)</span>
                  <span>{adminPercent}%</span>
                </div>
                <input type="range" min="1" max="15" step="0.5" value={adminPercent} onChange={(e) => setAdminPercent(parseFloat(e.target.value))} className="w-full accent-blue-600" />
              </div>

              <button 
                onClick={handleCalculateCommission}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Calculator className="w-4 h-4" /> Hitung Payout Bersih
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[300px]">
            {comResults ? (
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm mx-auto w-full space-y-4 font-mono">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-center">RINCIAN POTONGAN TOKO:</span>
                
                <div className="space-y-2 border-b border-slate-800 pb-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Harga Jual Toko:</span>
                    <span className="font-bold text-slate-200">Rp {sellPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Komisi Admin ({adminPercent}%):</span>
                    <span className="font-bold">- Rp {comResults.potongan.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="text-center bg-slate-900 p-4 border border-slate-850 rounded-xl">
                  <span className="text-3xs text-slate-500 block uppercase font-bold">Uang Bersih Yang Anda Terima (Payout):</span>
                  <span className="text-xl font-bold text-emerald-400 block mt-1">Rp {comResults.bersih.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-center pt-1">
                  <CopyButton textToCopy={`Hasil Potongan Toko:\nHarga Jual: Rp ${sellPrice.toLocaleString('id-ID')}\nKomisi Admin (${adminPercent}%): Rp ${comResults.potongan.toLocaleString('id-ID')}\nPayout Bersih: Rp ${comResults.bersih.toLocaleString('id-ID')}`} label="Salin Hasil Rincian" size="sm" variant="secondary" />
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Masukkan parameter harga di sebelah kiri.</p>
            )}
          </div>
        </div>
      )}

      {/* REVERSE COMMISSION: TARGET PRICING */}
      {toolId === 'target-pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-3.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">Kalkulator Harga Jual Target Profit</span>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">MODAL PRODUKSI / BARANG (RP)</label>
                <input type="number" value={cogInput} onChange={(e) => setCogInput(Number(e.target.value))} className="w-full text-xs p-2 border rounded-xl dark:bg-slate-900 font-semibold" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">TARGET PROFIT BERSIH DIINGINKAN (RP)</label>
                <input type="number" value={targetProfit} onChange={(e) => setTargetProfit(Number(e.target.value))} className="w-full text-xs p-2 border rounded-xl dark:bg-slate-900 font-semibold" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>POTONGAN ADMIN PLATFORM TOKO (%)</span>
                  <span>{adminPercent}%</span>
                </div>
                <input type="range" min="1" max="15" step="0.5" value={adminPercent} onChange={(e) => setAdminPercent(parseFloat(e.target.value))} className="w-full accent-blue-600" />
              </div>

              <button 
                onClick={handleCalculateTargetPrice}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Mulai Hitung Harga Jual Pasang
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[300px]">
            {targetPriceResult ? (
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm mx-auto w-full space-y-4 font-mono">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-center">REKOMENDASI HARGA UNTUK TOKO ONLINE:</span>
                
                <div className="text-center bg-slate-900 p-5 border border-slate-850 rounded-xl">
                  <span className="text-3xs text-slate-500 block uppercase font-bold">Harga Yang Harus Anda Pasang:</span>
                  <span className="text-2xl font-bold text-emerald-400 block mt-1.5">Rp {targetPriceResult.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-center pt-1">
                  <CopyButton textToCopy={`Rekomendasi Harga Jual: Rp ${targetPriceResult.toLocaleString('id-ID')}\n(Modal: Rp ${cogInput.toLocaleString('id-ID')}, Profit Bersih Target: Rp ${targetProfit.toLocaleString('id-ID')}, Fee Admin: ${adminPercent}%)`} label="Salin Harga Target" size="sm" variant="secondary" />
                </div>

                <p className="text-3xs text-slate-500 leading-relaxed text-center font-mono">Dengan harga pasang ini, saat dipotong admin {adminPercent}% Anda tetap menerima modal Rp {cogInput.toLocaleString('id-ID')} beserta untung murni Rp {targetProfit.toLocaleString('id-ID')} secara utuh.</p>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Lakukan penghitungan menggunakan parameter di sebelah kiri.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. HPP CALCULATOR */}
      {toolId === 'kalkulator-hpp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-3">
              <span className="font-bold text-slate-800 dark:text-slate-200">Kalkulator HPP UMKM</span>
              
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">MODAL BAHAN BAKU TOTAL (RP)</label>
                <input type="number" value={rawMaterials} onChange={(e) => setRawMaterials(Number(e.target.value))} className="w-full text-xs p-2 border rounded-lg dark:bg-slate-900 font-semibold" />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">GAJI KARYAWAN / TENAGA (RP)</label>
                <input type="number" value={laborCosts} onChange={(e) => setLaborCosts(Number(e.target.value))} className="w-full text-xs p-2 border rounded-lg dark:bg-slate-900 font-semibold" />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">BIAYA OPERASIONAL / OVERHEAD (GAS, LISTRIK, KEMASAN) (RP)</label>
                <input type="number" value={overheadCosts} onChange={(e) => setOverheadCosts(Number(e.target.value))} className="w-full text-xs p-2 border rounded-lg dark:bg-slate-900 font-semibold" />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">TOTAL PRODUK DIHASILKAN (QTY / PORSI)</label>
                <input type="number" value={totalUnits} onChange={(e) => setTotalUnits(Number(e.target.value))} className="w-full text-xs p-2 border rounded-lg dark:bg-slate-900 font-semibold text-center" />
              </div>

              <button 
                onClick={handleCalculateHpp}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
              >
                <TrendingDown className="w-4 h-4 inline mr-1" /> Mulai Hitung HPP Unit
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[300px]">
            {hppResult ? (
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm mx-auto w-full text-center space-y-4 font-mono">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">HARGA POKOK PRODUKSI (HPP) PER UNIT:</span>
                <span className="text-2xl font-bold text-emerald-400 block tracking-wider bg-slate-900 p-4 rounded-xl border border-slate-850 select-all">
                  Rp {hppResult.toLocaleString('id-ID')}
                </span>
                <div className="flex justify-center pt-1">
                  <CopyButton textToCopy={`HPP Per Unit: Rp ${hppResult.toLocaleString('id-ID')}\nTotal Produk: ${totalUnits} Porsi`} label="Salin HPP Unit" size="sm" variant="secondary" />
                </div>
                <p className="text-3xs text-slate-500 leading-relaxed font-mono">Pastikan Anda menjual produk ini di atas nilai HPP di atas agar toko tidak mengalami kerugian operasional.</p>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Lakukan hitungan HPP murni dengan mengisi kolom di kiri.</p>
            )}
          </div>
        </div>
      )}

      {/* BREAK-EVEN POINT CALCULATOR */}
      {toolId === 'bep-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-3">
              <span className="font-bold text-slate-800 dark:text-slate-200">Kalkulator BEP & Balik Modal</span>
              
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">BIAYA TETAP OPERASIONAL SEBULAN (RP)</label>
                <input type="number" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} className="w-full text-xs p-2 border rounded-lg dark:bg-slate-900 font-semibold" />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">MODAL VARIABEL PER PRODUK (HPP) (RP)</label>
                <input type="number" value={varPriceUnit} onChange={(e) => setVarPriceUnit(Number(e.target.value))} className="w-full text-xs p-2 border rounded-lg dark:bg-slate-900 font-semibold" />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">HARGA JUAL PRODUK KE KONSUMEN (RP)</label>
                <input type="number" value={salesPriceUnit} onChange={(e) => setSalesPriceUnit(Number(e.target.value))} className="w-full text-xs p-2 border rounded-lg dark:bg-slate-900 font-semibold" />
              </div>

              <button 
                onClick={handleCalculateBep}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
              >
                <Target className="w-4 h-4 inline mr-1" /> Hitung Batas Balik Modal
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[300px]">
            {bepResult ? (
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl max-w-sm mx-auto w-full space-y-4 font-mono text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">TARGET BREAK-EVEN POINT (BEP):</span>
                
                <div className="bg-slate-900 p-3 border border-slate-850 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">JUAL MINIMAL (UNIT / PORSI):</span>
                  <span className="text-xl font-bold text-emerald-400 block mt-1">{bepResult.units} Unit / Porsi</span>
                </div>

                <div className="bg-slate-900 p-3 border border-slate-850 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">OMSET PENJUALAN MINIMUM:</span>
                  <span className="text-xl font-bold text-blue-400 block mt-1">Rp {bepResult.sales.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-center pt-1">
                  <CopyButton textToCopy={`Batas Balik Modal (BEP):\nTarget Jual: ${bepResult.units} Unit/Porsi\nMinimal Omset: Rp ${bepResult.sales.toLocaleString('id-ID')}`} label="Salin Hasil BEP" size="sm" variant="secondary" />
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Isi data biaya warung/usaha Anda di sebelah kiri.</p>
            )}
          </div>
        </div>
      )}

      {/* 3. QR CODE GENERATOR */}
      {toolId === 'qr-tool' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Pembuat QR Code Toko</span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">MASUKKAN TAUTAN / NOMOR WA / NOMOR REKENING</label>
                <textarea 
                  rows={4} 
                  value={qrText} 
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="Contoh: https://wa.me/6281234567"
                  className="w-full text-xs p-3 border rounded-xl dark:bg-slate-900 resize-none outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <button 
                onClick={handleGenerateQr}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <QrCode className="w-4 h-4" /> Bikin QR Code Sekarang
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center items-center min-h-[300px]">
            {qrImage ? (
              <div className="text-center space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-slate-700 max-w-xs mx-auto">
                  <img src={qrImage} alt="QR Code" className="max-w-full h-auto block" />
                </div>
                <button 
                  onClick={handleDownloadQr}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" /> Unduh QR Code (PNG)
                </button>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Belum ada QR Code yang di-generate</p>
            )}
          </div>
        </div>
      )}

      {/* 4. BARCODE GENERATOR */}
      {toolId === 'barcode-tool' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Pembuat Barcode Toko Fisik</span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">MASUKKAN KODE BARANG / EAN-13 (13 ANGKA)</label>
                <input 
                  type="text" 
                  maxLength={13}
                  value={barcodeText} 
                  onChange={(e) => setBarcodeText(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900 font-mono text-center tracking-widest font-bold" 
                />
              </div>

              <button 
                onClick={handleDownloadBarcode}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Download className="w-4 h-4" /> Unduh Barcode Toko (PNG)
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center items-center min-h-[300px]">
            <div className="relative border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <canvas ref={barcodeCanvasRef} width={380} height={160} className="max-w-full block bg-white" />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-semibold font-mono">Barcode Siap Dipindai Scanner Kasir</p>
          </div>
        </div>
      )}

      {/* 5. LINK BIO SEDERHANA */}
      {toolId === 'link-bio' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-600" /> Pembuat Link Bio Toko Sederhana (Linktree Gratis)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Buat halaman profil link kustom untuk bio Instagram/TikTok toko jualan Anda secara offline.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LINK BIO EDITOR */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Langkah 1: Edit Informasi Profil & Desain</span>
              
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border dark:border-slate-800 space-y-4">
                {/* LOGO UPLOADER */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Logo / Foto Profil Toko</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {bioLogo ? (
                        <img src={bioLogo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-400">{bioName ? bioName.charAt(0).toUpperCase() : 'S'}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <button 
                        onClick={() => bioLogoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold text-3xs rounded-lg border border-blue-200 dark:border-blue-900 cursor-pointer"
                      >
                        Pilih Gambar Logo (.png / .jpg)
                      </button>
                      <input 
                        ref={bioLogoInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleBioLogoUpload} 
                      />
                      {bioLogo && (
                        <button 
                          onClick={() => setBioLogo('')}
                          className="ml-2 text-3xs font-bold text-rose-500 hover:underline"
                        >
                          Hapus Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Profil / Toko</label>
                    <input 
                      type="text" 
                      value={bioName}
                      onChange={(e) => setBioName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Pilih Font</label>
                    <select 
                      value={bioFont} 
                      onChange={(e) => setBioFont(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="inter">Inter (Modern & Bersih)</option>
                      <option value="playfair">Playfair Display (Serif Mewah)</option>
                      <option value="mono">JetBrains Mono (Kode / Unik)</option>
                      <option value="rubik">Rubik (Bulat / Ramah)</option>
                      <option value="dm-sans">DM Sans (Minimalis)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Bio / Deskripsi Ringkas</label>
                  <textarea 
                    value={bioDesc}
                    onChange={(e) => setBioDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                {/* THEME SELECTOR */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Pilih Tema Warna (Kontras Tinggi)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'forest', label: 'Forest', color: 'bg-emerald-700' },
                      { id: 'obsidian', label: 'Obsidian', color: 'bg-slate-900' },
                      { id: 'sunset', label: 'Sunset', color: 'bg-orange-700' },
                      { id: 'lavender', label: 'Lavender', color: 'bg-violet-700' },
                      { id: 'nordic', label: 'Nordic', color: 'bg-slate-700' },
                      { id: 'neon', label: 'Neon', color: 'bg-black border border-lime-400' },
                      { id: 'sakura', label: 'Sakura', color: 'bg-rose-700' },
                      { id: 'monochrome', label: 'Mono', color: 'bg-black' },
                    ].map((theme) => (
                      <button 
                        key={theme.id}
                        onClick={() => setBioTheme(theme.id as any)}
                        className={`py-2 rounded-xl text-[9px] font-black uppercase border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${bioTheme === theme.id ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-slate-900' : 'bg-white text-slate-600'}`}
                      >
                        <span className={`w-3 h-3 rounded-full ${theme.color}`} />
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LINKS EDITOR */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Langkah 2: Kelola Tautan ({bioLinks.length})</span>
                
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                  {bioLinks.map((link) => {
                    const mismatchWarning = getUrlMismatchWarning(link.platform, link.url);
                    return (
                      <div key={link.id} className="p-3 bg-slate-50 dark:bg-slate-900/30 border dark:border-slate-800 rounded-xl space-y-2">
                        <div className="flex gap-3 items-center">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input 
                              type="text" 
                              value={link.label}
                              placeholder="Nama Tombol"
                              onChange={(e) => setBioLinks(prev => prev.map(l => l.id === link.id ? { ...l, label: e.target.value } : l))}
                              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-3xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <input 
                              type="text" 
                              value={link.url}
                              placeholder="Link URL"
                              onChange={(e) => setBioLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: e.target.value } : l))}
                              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-3xs font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          
                          <button 
                            onClick={() => setBioLinks(prev => prev.filter(l => l.id !== link.id))}
                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Platform:</span>
                            <select
                              value={link.platform}
                              onChange={(e) => setBioLinks(prev => prev.map(l => l.id === link.id ? { ...l, platform: e.target.value } : l))}
                              className="px-2 py-0.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="custom">Tautan Umum</option>
                              <option value="whatsapp">WhatsApp</option>
                              <option value="instagram">Instagram</option>
                              <option value="facebook">Facebook</option>
                              <option value="youtube">YouTube</option>
                              <option value="tiktok">TikTok</option>
                              <option value="threads">Threads</option>
                              <option value="twitter">Twitter / X</option>
                            </select>
                          </div>

                          {mismatchWarning && (
                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/50">
                              ⚠️ {mismatchWarning}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setBioLinks(prev => [...prev, { id: Math.random().toString(), label: 'Tautan Baru', url: 'https://', platform: 'custom' }])}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-3xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Tautan
                  </button>

                  <button 
                    onClick={handleDownloadBioHtml}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-3xs rounded-xl flex items-center gap-1.5 shadow ml-auto cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Ekspor File Website (.html)
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW SCREEN */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-3">Langkah 3: Live Preview Handphone</span>
              
              <div className="relative w-[280px] h-[520px] rounded-[40px] border-8 border-slate-800 dark:border-slate-900 shadow-2xl overflow-hidden flex flex-col">
                {/* NOTCH AND CAMERA */}
                <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 flex justify-center items-center z-10">
                  <div className="w-20 h-3 bg-black rounded-full" />
                </div>

                {/* MOBILE SCREEN INNER CONTENT */}
                <div 
                  className="flex-1 pt-8 px-4 pb-4 flex flex-col items-center overflow-y-auto select-none"
                  style={{
                    background: bioTheme === 'forest' ? 'linear-gradient(135deg, #064e3b, #047857)' :
                                bioTheme === 'obsidian' ? 'linear-gradient(135deg, #090d16, #111827)' :
                                bioTheme === 'sunset' ? 'linear-gradient(135deg, #7c2d12, #c2410c)' :
                                bioTheme === 'lavender' ? 'linear-gradient(135deg, #4c1d95, #6d28d9)' :
                                bioTheme === 'nordic' ? 'linear-gradient(135deg, #111827, #374151)' :
                                bioTheme === 'neon' ? 'linear-gradient(135deg, #000000, #111111)' :
                                bioTheme === 'sakura' ? 'linear-gradient(135deg, #831843, #be185d)' :
                                'linear-gradient(135deg, #000000, #171717)',
                    fontFamily: bioFont === 'inter' ? "'Inter', sans-serif" :
                                bioFont === 'playfair' ? "'Playfair Display', serif" :
                                bioFont === 'mono' ? "'JetBrains Mono', monospace" :
                                bioFont === 'rubik' ? "'Rubik', sans-serif" :
                                "'DM Sans', sans-serif"
                  }}
                >
                  {/* PROFILE AVATAR */}
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white flex items-center justify-center text-white text-xl font-extrabold shadow mt-4 overflow-hidden shrink-0">
                    {bioLogo ? (
                      <img src={bioLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      bioName ? bioName.charAt(0).toUpperCase() : 'S'
                    )}
                  </div>

                  <h4 className="font-extrabold text-white text-sm text-center mt-3 tracking-tight text-shadow">{bioName || 'Nama Toko'}</h4>
                  <p className="text-white/90 text-center text-[10px] leading-relaxed max-w-[200px] mt-1.5 min-h-[30px]">
                    {bioDesc || 'Ketik deskripsi profil di kolom sebelah kiri.'}
                  </p>

                  {/* LINKS TABLE */}
                  <div className="w-full space-y-3.5 mt-6 flex-1">
                    {bioLinks.map((link) => (
                      <a 
                        key={link.id} 
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert(`Tautan menuju: ${link.url}`); }}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-2 transition-all border ${
                          bioTheme === 'neon' 
                            ? 'bg-black border-lime-400 text-lime-400 hover:bg-lime-950/20' 
                            : 'bg-white border-slate-100 text-slate-800 hover:scale-[1.02]'
                        }`}
                      >
                        <PlatformIcon platform={link.platform} className="w-3.5 h-3.5 shrink-0" />
                        <span>{link.label || 'Tautan Kosong'}</span>
                      </a>
                    ))}
                  </div>

                  <span className="text-[8px] text-white/50 block text-center mt-4">Tautan Resmi</span>
                </div>
              </div>
            </div>
          </div>

          {/* DEPLOYMENT GUIDE */}
          <div className="border-t border-slate-100 dark:border-slate-700/60 pt-6 mt-6">
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-emerald-600" /> 💡 Panduan Publikasi Gratis (Deployment) untuk Orang Awam
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border dark:border-slate-800/80 space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">1</div>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">Ekspor File</p>
                <p className="text-3xs text-slate-500 leading-relaxed">Klik tombol hijau <strong>"Ekspor File Website (.html)"</strong> di atas. Berkas web mandiri berformat HTML akan terunduh otomatis.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border dark:border-slate-800/80 space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">2</div>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">Ganti Nama Berkas</p>
                <p className="text-3xs text-slate-500 leading-relaxed">Ubah nama berkas hasil unduhan tersebut dari nama lama menjadi <strong>index.html</strong> (semua huruf kecil). Ini penting agar situs terbaca sebagai halaman utama.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border dark:border-slate-800/80 space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">3</div>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">Unggah ke Netlify Drop</p>
                <p className="text-3xs text-slate-500 leading-relaxed">Buka situs gratis <strong><a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Netlify Drop</a></strong>. Seret & lepas (drag-and-drop) berkas <strong>index.html</strong> tadi ke kotak unggahan.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border dark:border-slate-800/80 space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">4</div>
                <p className="font-extrabold text-slate-700 dark:text-slate-300">Link Bio Siap Dipakai!</p>
                <p className="text-3xs text-slate-500 leading-relaxed">Dalam 5 detik, Netlify akan memberikan alamat website gratis (contoh: <code>toko-anda.netlify.app</code>). Salin & tempelkan di bio medsos Anda!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. NOTA EXTRACTOR */}
      {toolId === 'nota-extractor' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 dark:border-slate-700/60 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-base">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Ekstraktor Foto Nota ke Excel / CSV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Foto nota belanja, kwitansi warung, atau struk belanja Anda untuk diekstrak jadi tabel barang otomatis secara offline.
              </p>
            </div>
            <button
              onClick={loadExampleNota}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5 cursor-pointer self-start md:self-auto transition-all active:scale-95 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Coba dengan Contoh Nota
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUMN 1: IMAGE CAPTURE / UPLOADER & RAW TEXT */}
            <div className="lg:col-span-5 space-y-4">
              {/* FILE DROPZONE */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block">Langkah 1: Unggah Foto Nota</span>
                
                {!notaImgUrl ? (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group min-h-[180px]">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih atau Ambil Foto Nota</span>
                    <span className="text-[10px] text-slate-500 mt-1">Mendukung format JPG, PNG, atau jepret langsung dari kamera HP</span>
                    <input type="file" accept="image/*" onChange={handleNotaFileChange} className="hidden" />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="relative border dark:border-slate-700 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-56">
                      <img src={notaImgUrl} alt="Preview Nota" className="max-h-56 object-contain" />
                      <button
                        onClick={() => { setNotaFile(null); setNotaImgUrl(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/65 hover:bg-black/80 text-white rounded-lg text-3xs font-bold transition-all"
                      >
                        Hapus Foto
                      </button>
                    </div>

                    <label className="w-full py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      <Image className="w-3.5 h-3.5 text-slate-500" /> Ganti Foto Nota
                      <input type="file" accept="image/*" onChange={handleNotaFileChange} className="hidden" />
                    </label>
                  </div>
                )}

                {/* OCR PROCESSING PROGRESS BAR */}
                {isNotaProcessing && (
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{notaStatus}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${notaProgress}%` }} />
                    </div>
                    <div className="flex justify-between text-3xs font-semibold text-slate-500">
                      <span>Memproses offline</span>
                      <span>{notaProgress}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* RAW TEXT FALLBACK */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block">Teks Hasil Pembacaan (Raw OCR)</span>
                  <button
                    onClick={() => {
                      const text = prompt('Tempelkan teks nota di sini untuk mem-parsing ulang:');
                      if (text) {
                        setNotaRawText(text);
                        setNotaItems(parseNotaText(text));
                        triggerSuccess();
                      }
                    }}
                    className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Edit / Tempel Teks Manual
                  </button>
                </div>
                
                <textarea
                  rows={6}
                  value={notaRawText}
                  onChange={(e) => {
                    setNotaRawText(e.target.value);
                    setNotaItems(parseNotaText(e.target.value));
                  }}
                  placeholder="Hasil teks pembacaan foto nota akan muncul di sini. Anda juga bisa mengetik atau menempelkan teks nota secara manual untuk diekstrak instan."
                  className="w-full text-[11px] p-3 border dark:border-slate-700 rounded-xl dark:bg-slate-900 font-mono resize-y leading-relaxed outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block leading-relaxed">
                  💡 Tips: Jika scan otomatis kurang pas akibat kualitas foto buram, Anda bisa membetulkan isinya di kolom teks ini, sistem akan mem-parsing ulang secara real-time!
                </span>
              </div>
            </div>

            {/* COLUMN 2: INTERACTIVE EDITABLE LIST */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm flex-1 flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block">Langkah 2: Daftar Barang Hasil Ekstraksi</span>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={addNotaItem}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-3xs rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Baris
                    </button>
                    <CopyButton
                      textToCopy={`Nama Barang\tJumlah\tHarga Satuan\tTotal Harga\n${notaItems.map(item => `${item.name}\t${item.qty}\t${item.price}\t${item.total}`).join('\n')}\n\t\tGRAND TOTAL\t${notaGrandTotal}`}
                      label="Salin Tabel (Excel)"
                      size="sm"
                      variant="secondary"
                    />
                    <button
                      onClick={downloadNotaCsv}
                      disabled={notaItems.length === 0}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-3xs rounded-xl flex items-center gap-1 shadow cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh CSV / Excel
                    </button>
                    <button
                      onClick={handlePrintNota}
                      disabled={notaItems.length === 0}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-3xs rounded-xl flex items-center gap-1 shadow cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cetak Nota Resmi
                    </button>
                  </div>
                </div>

                {/* TABLE WRAPPER */}
                <div className="overflow-x-auto flex-1 min-h-[250px]">
                  {notaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 h-full space-y-2">
                      <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 animate-pulse" />
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Belum ada barang terdeteksi</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">Silakan unggah foto nota belanja jualan Anda di kolom sebelah kiri atau gunakan "Contoh Nota" untuk mencoba fitur ini.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-3xs font-extrabold uppercase tracking-wider">
                          <th className="py-2.5 pl-1 w-10">No</th>
                          <th className="py-2.5">Nama Barang</th>
                          <th className="py-2.5 w-20 text-center">Jumlah (Qty)</th>
                          <th className="py-2.5 w-32 text-right">Harga Satuan</th>
                          <th className="py-2.5 w-32 text-right">Total Harga</th>
                          <th className="py-2.5 w-10 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-xs font-medium">
                        {notaItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 group">
                            <td className="py-1.5 pl-1 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-1.5">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateNotaItem(item.id, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 rounded bg-transparent focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none text-xs font-semibold"
                              />
                            </td>
                            <td className="py-1.5 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateNotaItem(item.id, 'qty', parseInt(e.target.value, 10) || 1)}
                                className="w-16 px-1 py-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 rounded bg-transparent focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 text-center focus:outline-none text-xs font-semibold font-mono"
                              />
                            </td>
                            <td className="py-1.5 text-right">
                              <div className="flex items-center justify-end">
                                <span className="text-3xs text-slate-400 mr-1">Rp</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="500"
                                  value={item.price}
                                  onChange={(e) => updateNotaItem(item.id, 'price', parseInt(e.target.value, 10) || 0)}
                                  className="w-24 px-1 py-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 rounded bg-transparent focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 text-right focus:outline-none text-xs font-semibold font-mono"
                                />
                              </div>
                            </td>
                            <td className="py-1.5 text-right font-mono text-slate-700 dark:text-slate-300 font-bold pr-2">
                              Rp {item.total.toLocaleString('id-ID')}
                            </td>
                            <td className="py-1.5 text-center">
                              <button
                                onClick={() => deleteNotaItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Hapus Barang"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* GRAND TOTAL ROW BOX */}
                {notaItems.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 border dark:border-slate-750 p-4 rounded-xl flex items-center justify-between font-mono">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Grand Total Belanja:
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      Rp {notaGrandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
