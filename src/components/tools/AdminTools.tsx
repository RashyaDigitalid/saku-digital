import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Printer, BadgeInfo, ScanText, Volume2, CalendarDays, 
  Download, Trash2, Edit3, Fingerprint, Sparkles, RefreshCw, 
  VolumeX, Copy, FileText, Type, Check, CheckCircle2, ShieldCheck, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Tesseract from 'tesseract.js';
import CopyButton from '../CopyButton';

interface AdminToolsProps {
  toolId: string;
}

export default function AdminTools({ toolId }: AdminToolsProps) {
  const triggerSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // ----------------------------------------------------
  // 1. GENERATOR SURAT RESMI & IZIN SAKIT LENGKAP
  // ----------------------------------------------------
  const [letterType, setLetterType] = useState<'sakit_kerja' | 'sakit_sekolah' | 'sakit_kuliah' | 'izin_cuti' | 'izin_keperluan'>('sakit_kerja');
  const [senderName, setSenderName] = useState('Budi Santoso');
  const [senderIdNumber, setSenderIdNumber] = useState('3273012345670001'); // NIK / NIM / NISN
  const [senderRole, setSenderRole] = useState('Staff Operasional');
  const [targetRecipient, setTargetRecipient] = useState('Manager HRD PT Maju Bersama');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [sickReason, setSickReason] = useState('Kondisi badan demam tinggi dan flu berat, sesuai anjuran dokter perlu istirahat total.');
  const [letterCity, setLetterCity] = useState('Jakarta');
  const [doctorNoteAttached, setDoctorNoteAttached] = useState(true);

  // ----------------------------------------------------
  // 1. DIGITAL SIGNATURE IN LETTER GENERATOR
  // ----------------------------------------------------
  const letterSigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLetterSigning, setIsLetterSigning] = useState(false);
  const [hasLetterSignature, setHasLetterSignature] = useState(false);

  const getLetterCoords = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startLetterSign = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) e.preventDefault();
    const canvas = letterSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const { x, y } = getLetterCoords(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsLetterSigning(true);
  };

  const drawLetterSign = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isLetterSigning) return;
    if ('touches' in e && e.cancelable) e.preventDefault();
    const canvas = letterSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getLetterCoords(canvas, e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasLetterSignature(true);
  };

  const stopLetterSign = () => {
    setIsLetterSigning(false);
  };

  const clearLetterSignature = () => {
    const canvas = letterSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasLetterSignature(false);
  };

  // Generate Letter Text
  const formatIndoDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const calculateDayDuration = () => {
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return 1;
    }
  };

  const letterSubjectTitle = {
    sakit_kerja: 'Permohonan Izin Sakit Tidak Masuk Kerja',
    sakit_sekolah: 'Surat Izin Tidak Masuk Sekolah Karena Sakit',
    sakit_kuliah: 'Surat Permohonan Izin Sakit Perkuliahan',
    izin_cuti: 'Permohonan Izin Cuti Kerja',
    izin_keperluan: 'Surat Izin Tidak Masuk Karena Urusan Mendesak',
  }[letterType];

  const letterRecipientRole = {
    sakit_kerja: 'Yth. Pimpinan / Bagian HRD',
    sakit_sekolah: 'Yth. Bapak/Ibu Wali Kelas / Kepala Sekolah',
    sakit_kuliah: 'Yth. Bapak/Ibu Dosen Pengampu / Ketua Program Studi',
    izin_cuti: 'Yth. Pimpinan Perusahaan / Atasan Langsung',
    izin_keperluan: 'Yth. Pimpinan / Atasan Terkait',
  }[letterType];

  const idLabel = {
    sakit_kerja: 'Nomor Induk Karyawan (NIK/NIP)',
    sakit_sekolah: 'Nomor Induk Siswa (NISN/NIS)',
    sakit_kuliah: 'Nomor Induk Mahasiswa (NIM)',
    izin_cuti: 'Nomor Pegawai / NIK',
    izin_keperluan: 'Identitas Diri / NIK',
  }[letterType];

  const roleLabel = {
    sakit_kerja: 'Jabatan / Divisi',
    sakit_sekolah: 'Kelas / Jurusan',
    sakit_kuliah: 'Program Studi / Semester',
    izin_cuti: 'Jabatan / Bagian',
    izin_keperluan: 'Bagian / Posisi',
  }[letterType];

  // Full formatted letter string
  const fullLetterBody = `Kepada:
${letterRecipientRole}
${targetRecipient}
Di Tempat

Perihal: ${letterSubjectTitle}

Dengan hormat,
Saya yang bertanda tangan di bawah ini:

Nama Lengkap : ${senderName}
${idLabel} : ${senderIdNumber}
${roleLabel} : ${senderRole}

Dengan ini bermaksud untuk memberitahukan dan mengajukan permohonan izin tidak dapat mengikuti aktivitas/bekerja seperti biasa terhitung mulai tanggal ${formatIndoDate(startDate)} sampai dengan ${formatIndoDate(endDate)} (selama ${calculateDayDuration()} hari).

Hal ini dikarenakan:
${sickReason}

${doctorNoteAttached ? 'Sebagai bukti pendukung, saya lampirkan surat keterangan istirahat dari dokter / pihak medis yang berwenang.' : ''}

Demikian surat permohonan izin ini saya sampaikan dengan sebenar-benarnya. Atas perhatian, pengertian, dan kebijaksanaan Bapak/Ibu, saya ucapkan banyak terima kasih.


${letterCity}, ${formatIndoDate(new Date().toISOString().split('T')[0])}
Hormat saya,



( ${senderName} )`;

  // Print Letter Action
  const handlePrintLetter = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka halaman cetak. Pastikan pop-up browser tidak diblokir.');
      return;
    }

    let sigImgSrc = '';
    if (hasLetterSignature && letterSigCanvasRef.current) {
      sigImgSrc = letterSigCanvasRef.current.toDataURL('image/png');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${letterSubjectTitle} - ${senderName}</title>
        <style>
          @page { size: A4 portrait; margin: 25mm 20mm 20mm 20mm; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; margin: 0; padding: 15px; }
          .header { text-align: left; margin-bottom: 25px; }
          .title { text-align: center; font-weight: bold; font-size: 14pt; text-decoration: underline; margin-bottom: 5px; text-transform: uppercase; }
          .meta-table { width: 100%; margin: 15px 0 20px 20px; }
          .meta-table td { padding: 3px 6px; font-size: 12pt; vertical-align: top; }
          .content { text-align: justify; margin-bottom: 20px; }
          .signature-box { float: right; width: 280px; text-align: center; margin-top: 40px; }
          .signature-space { height: 75px; display: flex; align-items: center; justify-content: center; }
          .signature-img { max-height: 70px; max-width: 180px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>${letterCity}, ${formatIndoDate(new Date().toISOString().split('T')[0])}</div>
          <br>
          <div>Hal : <strong>${letterSubjectTitle}</strong></div>
          <div>Lampiran : ${doctorNoteAttached ? '1 (Satu) Berkas Surat Dokter' : '-'}</div>
          <br>
          <div>Kepada Yth.</div>
          <div><strong>${targetRecipient}</strong></div>
          <div>Di Tempat</div>
        </div>

        <div class="content">
          <p>Dengan hormat,</p>
          <p>Saya yang bertanda tangan di bawah ini:</p>
          
          <table class="meta-table">
            <tr>
              <td style="width: 180px;">Nama Lengkap</td>
              <td style="width: 15px;">:</td>
              <td><strong>${senderName}</strong></td>
            </tr>
            <tr>
              <td>${idLabel}</td>
              <td>:</td>
              <td>${senderIdNumber}</td>
            </tr>
            <tr>
              <td>${roleLabel}</td>
              <td>:</td>
              <td>${senderRole}</td>
            </tr>
          </table>

          <p>
            Dengan ini bermaksud memberitahukan bahwa saya tidak dapat hadir dan menjalankan kewajiban sebagaimana mestinya mulai dari tanggal <strong>${formatIndoDate(startDate)}</strong> sampai dengan <strong>${formatIndoDate(endDate)}</strong> (selama ${calculateDayDuration()} hari), dikarenakan:
          </p>
          <p style="padding-left: 20px; font-style: italic;">
            "${sickReason}"
          </p>
          ${doctorNoteAttached ? '<p>Bersama surat ini, saya turut melampirkan surat keterangan medis/dokter sebagai bukti pendukung.</p>' : ''}
          <p>
            Demikian surat permohonan izin ini saya sampaikan. Atas perhatian, izin, dan kebijaksanaan Bapak/Ibu, saya mengucapkan terima kasih.
          </p>
        </div>

        <div class="signature-box">
          <div>Hormat saya,</div>
          <div class="signature-space">
            ${sigImgSrc ? `<img src="${sigImgSrc}" class="signature-img" />` : ''}
          </div>
          <div style="font-weight: bold; text-decoration: underline;">( ${senderName} )</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    triggerSuccess();
  };


  // ----------------------------------------------------
  // 2. SIGNATURE PAD STATES (FOR DIGITAL SIGNATURE TOOL)
  // ----------------------------------------------------
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sigColor, setSigColor] = useState('#0f172a');
  const [sigWidth, setSigWidth] = useState(3);
  const [sigHistory, setSigHistory] = useState<ImageData[]>([]);
  const [hasSignatureContent, setHasSignatureContent] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getSigCoords = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const saveSigState = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setSigHistory((prev) => [...prev.slice(-15), imgData]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) e.preventDefault();
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveSigState();

    ctx.strokeStyle = sigColor;
    ctx.lineWidth = sigWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pt = getSigCoords(canvas, e);
    lastPointRef.current = pt;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, sigWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = sigColor;
    ctx.fill();

    setIsDrawing(true);
    setHasSignatureContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e && e.cancelable) e.preventDefault();
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPt = getSigCoords(canvas, e);
    const lastPt = lastPointRef.current || currentPt;

    ctx.strokeStyle = sigColor;
    ctx.lineWidth = sigWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPt.x, lastPt.y);
    // Smooth quadratic curve interpolation
    const midX = (lastPt.x + currentPt.x) / 2;
    const midY = (lastPt.y + currentPt.y) / 2;
    ctx.quadraticCurveTo(lastPt.x, lastPt.y, midX, midY);
    ctx.lineTo(currentPt.x, currentPt.y);
    ctx.stroke();

    lastPointRef.current = currentPt;
    setHasSignatureContent(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const undoSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas || sigHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...sigHistory];
    const previousState = newHistory.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setSigHistory(newHistory);
      if (newHistory.length === 0) {
        setHasSignatureContent(false);
      }
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveSigState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignatureContent(false);
  };

  // Get tightly cropped canvas containing the signature
  const getCroppedSignatureCanvas = (): HTMLCanvasElement | null => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 10) {
          hasPixels = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixels) return canvas;

    const pad = 20;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(canvas.width - cropX, (maxX - minX) + pad * 2);
    const cropH = Math.min(canvas.height - cropY, (maxY - minY) + pad * 2);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return canvas;

    croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return croppedCanvas;
  };

  const centerSignatureOnCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const cropped = getCroppedSignatureCanvas();
    if (!cropped) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveSigState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const targetX = Math.round((canvas.width - cropped.width) / 2);
    const targetY = Math.round((canvas.height - cropped.height) / 2);
    ctx.drawImage(cropped, targetX, targetY);
    triggerSuccess();
  };

  const downloadSignature = (autoCrop = true) => {
    const targetCanvas = autoCrop ? (getCroppedSignatureCanvas() || sigCanvasRef.current) : sigCanvasRef.current;
    if (!targetCanvas) return;
    targetCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `tanda_tangan_resmi_transparan_${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccess();
    }, 'image/png');
  };

  const downloadSignatureJpg = (autoCrop = true) => {
    const sourceCanvas = autoCrop ? (getCroppedSignatureCanvas() || sigCanvasRef.current) : sigCanvasRef.current;
    if (!sourceCanvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(sourceCanvas, 0, 0);

    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `tanda_tangan_latar_putih_${Date.now()}.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerSuccess();
    }, 'image/jpeg', 0.95);
  };

  const copySignatureToClipboard = async () => {
    const targetCanvas = getCroppedSignatureCanvas() || sigCanvasRef.current;
    if (!targetCanvas) return;

    try {
      targetCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopySuccess(true);
        triggerSuccess();
        setTimeout(() => setCopySuccess(false), 2500);
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };


  // ----------------------------------------------------
  // 3. LABEL 103 / 121 PRINT STATES
  // ----------------------------------------------------
  const [labelNames, setLabelNames] = useState("Pak Enda Prometius\nIbu Syakira Salsabila\nPak Mulyono Widodo\nIbu Sri Mulyani\nBapak Agus Harimurti\nIbu Puan Maharani\nMas Gibran Rakabuming");
  
  const handlePrintLabels = () => {
    const names = labelNames.split('\n').filter(n => n.trim() !== '');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cols = toolId === 'label-103' ? 3 : 4;
    const labelW = toolId === 'label-103' ? '64mm' : '38mm';
    const labelH = toolId === 'label-103' ? '32mm' : '21mm';

    printWindow.document.write(`
      <html>
      <head>
        <title>Cetak Label Undangan</title>
        <style>
          @page { size: A4; margin: 5mm; }
          body { margin: 0; font-family: Arial, sans-serif; }
          .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 3mm; padding: 5mm; }
          .label { width: ${labelW}; height: ${labelH}; border: 1px dashed #cbd5e1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-sizing: border-box; font-size: 10pt; line-height: 1.4; padding: 2mm; background: #fff; }
          .name { font-weight: bold; font-size: 11pt; text-transform: uppercase; }
          @media print {
            .label { border: 1px transparent; }
          }
        </style>
      </head>
      <body>
        <div class="grid">
          ${names.map(name => `
            <div class="label">
              <span>Kepada Yth.</span>
              <span class="name">${name}</span>
              <span style="font-size: 8pt; color: #64748b;">Di Tempat</span>
            </div>
          `).join('')}
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


  // ----------------------------------------------------
  // 4. NIP PARSER & GENERATOR
  // ----------------------------------------------------
  const [nipInput, setNipInput] = useState('199805122023031002');
  const [parsedNip, setParsedNip] = useState<{ lahir: string; angkat: string; jk: string; urutan: string; isValid: boolean } | null>(null);

  const handleParseNip = () => {
    const cleanNip = nipInput.replace(/\s/g, '');
    if (cleanNip.length !== 18 || isNaN(Number(cleanNip))) {
      setParsedNip({ lahir: '', angkat: '', jk: '', urutan: '', isValid: false });
      return;
    }

    const thnLahir = cleanNip.substring(0, 4);
    const blnLahir = cleanNip.substring(4, 6);
    const tglLahir = cleanNip.substring(6, 8);
    const thnAngkat = cleanNip.substring(8, 12);
    const blnAngkat = cleanNip.substring(12, 14);
    const jkCode = cleanNip.substring(14, 15);
    const orderCode = cleanNip.substring(15, 18);

    setParsedNip({
      lahir: `${tglLahir}-${blnLahir}-${thnLahir}`,
      angkat: `${blnAngkat}-${thnAngkat}`,
      jk: jkCode === '1' ? 'Laki-laki' : jkCode === '2' ? 'Perempuan' : 'Tidak Dikenal',
      urutan: orderCode,
      isValid: true
    });
    triggerSuccess();
  };

  const [birthdate, setBirthdate] = useState('1995-10-24');
  const [recruitmentDate, setRecruitmentDate] = useState('2021-03');
  const [gender, setGender] = useState('1');
  const [sequence, setSequence] = useState('001');
  const [generatedNip, setGeneratedNip] = useState('');

  const handleGenerateNip = () => {
    const bYmd = birthdate.replace(/-/g, '');
    const rYm = recruitmentDate.replace(/-/g, '');
    const fullNip = `${bYmd}${rYm}${gender}${sequence}`;
    setGeneratedNip(fullNip);
    triggerSuccess();
  };


  // ----------------------------------------------------
  // 5. OCR DOKUMEN KE TEKS (TESSERACT CLIENT-SIDE OCR)
  // ----------------------------------------------------
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrExtracted, setOcrExtracted] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');

  const handleOcrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOcrFile(file);
      setIsOcrProcessing(true);
      setOcrProgress(0);
      setOcrStatus('Membaca berkas dokumen fisik...');

      try {
        const result = await Tesseract.recognize(
          file,
          'ind+eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                setOcrStatus('Mengekstrak karakter & susunan kalimat...');
                setOcrProgress(Math.round(m.progress * 100));
              } else {
                setOcrStatus(`OCR: ${m.status}...`);
              }
            }
          }
        );
        const text = result.data.text.trim();
        setOcrExtracted(text || 'Tidak ditemukan teks terbaca pada gambar dokumen yang diunggah. Pastikan gambar cukup terang dan tidak terlalu buram.');
        triggerSuccess();
      } catch (err) {
        console.error('Error in Admin OCR:', err);
        setOcrStatus('Gagal memindai otomatis. Silakan coba unggah berkas dengan kontras pencahayaan yang lebih jelas.');
      } finally {
        setIsOcrProcessing(false);
      }
    }
  };


  // ----------------------------------------------------
  // 6. TEXT TO SPEECH (TTS)
  // ----------------------------------------------------
  const [ttsText, setTtsText] = useState('Selamat datang di Alat Ajaib! Semua alat di sini gratis selamanya, aman digunakan, dan langsung diproses di perangkat Anda.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        const defaultIndo = availableVoices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
        if (defaultIndo) {
          setSelectedVoiceURI(defaultIndo.voiceURI);
        } else if (availableVoices.length > 0) {
          setSelectedVoiceURI(availableVoices[0].voiceURI);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSpeak = () => {
    if (!synthRef.current) return;
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(ttsText);
    if (selectedVoiceURI) {
      const activeVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (activeVoice) utter.voice = activeVoice;
    } else {
      utter.lang = 'id-ID';
    }

    utter.rate = speechRate;
    utter.pitch = speechPitch;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utter;
    setIsSpeaking(true);
    synthRef.current.speak(utter);
  };


  // ----------------------------------------------------
  // 7. AGE & PENSIUN CALCULATORS
  // ----------------------------------------------------
  const [birthInput, setBirthInput] = useState('1990-05-15');
  const [activeAgeResult, setActiveAgeResult] = useState<{ thn: number; bln: number; hari: number } | null>(null);

  const handleCalculateAge = () => {
    const today = new Date();
    const bDate = new Date(birthInput);
    let thn = today.getFullYear() - bDate.getFullYear();
    let bln = today.getMonth() - bDate.getMonth();
    let hari = today.getDate() - bDate.getDate();

    if (bln < 0 || (bln === 0 && hari < 0)) {
      thn--;
      bln += 12;
    }
    if (hari < 0) {
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      hari += prevMonth.getDate();
      bln--;
    }

    setActiveAgeResult({ thn, bln, hari });
    triggerSuccess();
  };

  const [pensionBirth, setPensionBirth] = useState('1970-11-20');
  const [bupInput, setBupInput] = useState(58);
  const [pensionResult, setPensionResult] = useState<{ tglPensiun: string; sisaHari: number } | null>(null);

  const handleCalculatePension = () => {
    const birth = new Date(pensionBirth);
    const bup = Number(bupInput);
    const retireYear = birth.getFullYear() + bup;
    const retireMonth = birth.getMonth() + 1;
    const retireDate = new Date(retireYear, retireMonth, 1);
    const today = new Date();
    const diffTime = retireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setPensionResult({
      tglPensiun: retireDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      sisaHari: Math.max(0, diffDays)
    });
    triggerSuccess();
  };

  // Word counter
  const [wordText, setWordText] = useState('');


  return (
    <div className="space-y-6">

      {/* ---------------------------------------------------- */}
      {/* 1. GENERATOR SURAT RESMI & IZIN SAKIT */}
      {/* ---------------------------------------------------- */}
      {toolId === 'generator-surat' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* FORMULIR INPUT SURAT */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                <div>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 block">
                    Formulir Surat Resmi & Izin Sakit
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lengkapi data di bawah ini untuk membuat surat resmi dengan format baku instansi siap cetak atau unduh.
                  </p>
                </div>

                {/* PILIH TEMPLATE */}
                <div className="space-y-1">
                  <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">JENIS TEMPLATE SURAT</label>
                  <select
                    value={letterType}
                    onChange={(e) => setLetterType(e.target.value as any)}
                    className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sakit_kerja">🏥 Surat Izin Sakit Kerja / Karyawan</option>
                    <option value="sakit_sekolah">🏫 Surat Izin Sakit Sekolah / Siswa</option>
                    <option value="sakit_kuliah">🎓 Surat Izin Sakit Kuliah / Mahasiswa</option>
                    <option value="izin_cuti">🏖️ Surat Permohonan Izin Cuti Kerja</option>
                    <option value="izin_keperluan">📑 Surat Izin Urusan Keluarga / Mendesak</option>
                  </select>
                </div>

                {/* IDENTITAS PENGIRIM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">NAMA LENGKAP</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">{idLabel}</label>
                    <input
                      type="text"
                      value={senderIdNumber}
                      onChange={(e) => setSenderIdNumber(e.target.value)}
                      placeholder="Nomor Identitas"
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">{roleLabel}</label>
                    <input
                      type="text"
                      value={senderRole}
                      onChange={(e) => setSenderRole(e.target.value)}
                      placeholder="Contoh: Staff Marketing / Kelas XII-IPA"
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">TUJUAN SURAT (HRD/ATASAN/SEKOLAH)</label>
                    <input
                      type="text"
                      value={targetRecipient}
                      onChange={(e) => setTargetRecipient(e.target.value)}
                      placeholder="Contoh: HRD PT Maju Jaya"
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* TANGGAL MULAI & AKHIR */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">TGL MULAI IZIN</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">TGL SELESAI</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">KOTA SURAT</label>
                    <input
                      type="text"
                      value={letterCity}
                      onChange={(e) => setLetterCity(e.target.value)}
                      placeholder="Kota Domisili"
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* ALASAN SAKIT / IZIN */}
                <div className="space-y-1">
                  <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">ALASAN / GEJALA SAKIT</label>
                  <textarea
                    rows={2}
                    value={sickReason}
                    onChange={(e) => setSickReason(e.target.value)}
                    className="w-full p-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none resize-none"
                  />
                </div>

                {/* LAMPIRAN DOKTER TOGGLE */}
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={doctorNoteAttached}
                    onChange={(e) => setDoctorNoteAttached(e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span>Sebutkan bahwa Surat Dokter / Medis Terlampir</span>
                </label>

                {/* DIGITAL SIGNATURE ON THE LETTER */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-black text-slate-400 uppercase tracking-wider">
                      Coretan Tanda Tangan Anda (Opsional):
                    </span>
                    {hasLetterSignature && (
                      <button
                        onClick={clearLetterSignature}
                        className="text-3xs text-rose-500 font-bold hover:underline"
                      >
                        Hapus Coretan
                      </button>
                    )}
                  </div>
                  <canvas
                    ref={letterSigCanvasRef}
                    width={360}
                    height={100}
                    onMouseDown={startLetterSign}
                    onMouseMove={drawLetterSign}
                    onMouseUp={stopLetterSign}
                    onMouseLeave={stopLetterSign}
                    onTouchStart={startLetterSign}
                    onTouchMove={drawLetterSign}
                    onTouchEnd={stopLetterSign}
                    className="w-full h-24 border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pencil touch-none"
                  />
                </div>

              </div>
            </div>

            {/* LIVE PREVIEW & PRINT ACTIONS */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-[500px]">
                
                <div className="space-y-4 font-serif text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                  
                  {/* PREVIEW HEADER */}
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3 font-sans">
                    <div>
                      <span className="text-3xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                        PRATINJAU DOKUMEN RESMI (A4)
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">{letterSubjectTitle}</h4>
                    </div>
                    <span className="text-3xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                      Durasi: {calculateDayDuration()} Hari
                    </span>
                  </div>

                  {/* PREVIEW CONTENT */}
                  <div className="bg-amber-50/40 dark:bg-slate-950 p-4 rounded-xl border border-amber-100 dark:border-slate-800 max-h-[360px] overflow-y-auto space-y-3">
                    <p className="text-right text-3xs font-sans text-slate-500">
                      {letterCity}, {formatIndoDate(new Date().toISOString().split('T')[0])}
                    </p>

                    <div className="text-3xs font-sans">
                      <p>Kepada Yth.</p>
                      <p><strong>{targetRecipient}</strong></p>
                      <p>Di Tempat</p>
                    </div>

                    <p>
                      Dengan hormat,<br />
                      Saya yang bertanda tangan di bawah ini:
                    </p>

                    <div className="pl-3 text-3xs space-y-1 font-mono">
                      <p>Nama : <strong>{senderName}</strong></p>
                      <p>{idLabel} : {senderIdNumber}</p>
                      <p>{roleLabel} : {senderRole}</p>
                    </div>

                    <p className="text-3xs">
                      Mengajukan permohonan izin tidak masuk mulai tanggal <strong>{formatIndoDate(startDate)}</strong> s.d. <strong>{formatIndoDate(endDate)}</strong> ({calculateDayDuration()} hari) karena "{sickReason}".
                    </p>

                    <div className="pt-2 flex justify-end font-sans">
                      <div className="text-center text-3xs w-36">
                        <p>Hormat saya,</p>
                        <div className="h-12 flex items-center justify-center">
                          {hasLetterSignature ? (
                            <span className="text-emerald-600 font-bold text-[10px]">✓ Tanda Tangan Tersemat</span>
                          ) : (
                            <span className="text-slate-400 italic text-[9px]">(Ttd Digital)</span>
                          )}
                        </div>
                        <p className="font-bold border-t border-slate-400 pt-0.5">({senderName})</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handlePrintLetter}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Lembar Surat (A4)</span>
                  </button>

                  <CopyButton textToCopy={fullLetterBody} label="Salin Teks Surat" size="md" variant="secondary" />
                </div>

              </div>
            </div>

          </div>
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 2. DIGITAL SIGNATURE PAD */}
      {/* ---------------------------------------------------- */}
      {toolId === 'digital-signature' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Setelan Tanda Tangan</span>
                <span className="text-3xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
                  100% Offline & Presisi
                </span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">WARNA TINTA RESMI</label>
                <div className="flex gap-2 items-center">
                  {[
                    { color: '#0f172a', name: 'Hitam Formal' },
                    { color: '#1e3a8a', name: 'Biru Dokumen/Bank' },
                    { color: '#b91c1c', name: 'Merah Pengesahan' },
                    { color: '#15803d', name: 'Hijau Resmi' },
                  ].map((item) => (
                    <button 
                      key={item.color}
                      onClick={() => setSigColor(item.color)}
                      title={item.name}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${sigColor === item.color ? 'border-sky-500 scale-110 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'}`} 
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                  <div className="relative flex items-center">
                    <input 
                      type="color" 
                      value={sigColor} 
                      onChange={(e) => setSigColor(e.target.value)} 
                      className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0" 
                      title="Pilih Warna Kustom"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span className="text-3xs uppercase font-black text-slate-400 tracking-wider">KETEBALAN TINTA</span>
                  <span className="text-xs text-sky-600 font-extrabold">{sigWidth}px</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="0.5" 
                  value={sigWidth} 
                  onChange={(e) => setSigWidth(parseFloat(e.target.value))} 
                  className="w-full accent-sky-600 cursor-pointer" 
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={undoSignature}
                    disabled={sigHistory.length === 0}
                    className="py-2 px-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    ↩ Urungkan (Undo)
                  </button>
                  <button 
                    onClick={centerSignatureOnCanvas}
                    disabled={!hasSignatureContent}
                    className="py-2 px-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    🎯 Pusatkan Posisi
                  </button>
                </div>

                <button 
                  onClick={clearSignature}
                  className="w-full py-2 border border-rose-300 dark:border-rose-800/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hapus / Bersihkan Kanvas
                </button>

                <div className="pt-2 space-y-2">
                  <button 
                    onClick={copySignatureToClipboard}
                    disabled={!hasSignatureContent}
                    className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${copySuccess ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'}`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copySuccess ? 'Berhasil Disalin ke Clipboard!' : 'Salin PNG Transparan (Clipboard)'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => downloadSignature(true)}
                      disabled={!hasSignatureContent}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh PNG
                    </button>
                    <button 
                      onClick={() => downloadSignatureJpg(true)}
                      disabled={!hasSignatureContent}
                      className="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh JPG
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    ✓ Otomatis dipangkas rapi (Auto-Crop) tanpa ruang kosong berlebih.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-center items-center p-6 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl min-h-[420px]">
            <div className="w-full flex items-center justify-between max-w-xl mb-2 px-1">
              <span className="text-3xs font-black text-slate-500 uppercase tracking-wider">
                KANVAS TANDA TANGAN (SENTUH / MOUSE)
              </span>
              <span className="text-3xs text-slate-400">
                Ukuran: 600 x 300 px
              </span>
            </div>
            
            <div className="w-full max-w-xl bg-white rounded-2xl p-2 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm relative">
              <canvas 
                ref={sigCanvasRef}
                width={600}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-auto aspect-[2/1] bg-white rounded-xl cursor-crosshair touch-none select-none block"
              />
              {!hasSignatureContent && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 dark:text-slate-400/50 select-none">
                  <Edit3 className="w-8 h-8 mb-1 opacity-60" />
                  <span className="text-xs font-semibold">Torehkan tanda tangan Anda di sini</span>
                  <span className="text-3xs">Mendukung stylus pen, layar sentuh HP & mouse</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 text-center">
              Posisi sentuhan akurat & presisi pada posisi ujung jari Anda. Hasil unduhan PNG berlatar transparan murni.
            </p>
          </div>
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 3. PRINT LABEL 103 / 121 */}
      {/* ---------------------------------------------------- */}
      {(toolId === 'label-103' || toolId === 'label-121') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                {toolId === 'label-103' ? 'Cetak Label Undangan 103' : 'Cetak Label Kode 121'}
              </span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">DAFTAR NAMA TAMU / BARANG (SATU PER BARIS)</label>
                <textarea 
                  rows={8} 
                  value={labelNames} 
                  onChange={(e) => setLabelNames(e.target.value)}
                  className="w-full text-xs p-3 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 resize-none font-medium" 
                />
              </div>

              <button 
                onClick={handlePrintLabels}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Buka Halaman Cetak (Print)
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col justify-center min-h-[400px]">
            <p className="text-xs text-slate-400 mb-3 text-center font-bold uppercase tracking-wider">Preview Grid Lembar Cetak</p>
            <div className={`grid ${toolId === 'label-103' ? 'grid-cols-3' : 'grid-cols-4'} gap-2 max-w-lg mx-auto w-full`}>
              {labelNames.split('\n').filter(n => n.trim() !== '').slice(0, 12).map((name, idx) => (
                <div key={idx} className="border border-dashed border-slate-700 p-2 text-center text-3xs font-semibold text-slate-500 bg-slate-950 rounded-lg flex flex-col justify-center min-h-[60px] truncate">
                  <span className="text-[8px] text-slate-600">Yth.</span>
                  <span className="text-slate-300 truncate">{name}</span>
                  <span className="text-[7px] text-slate-600 mt-1">Di Tempat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 4. PNS NIP PARSER & GENERATOR */}
      {/* ---------------------------------------------------- */}
      {(toolId === 'pemecah-nip' || toolId === 'nip-generator') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {toolId === 'pemecah-nip' && (
            <>
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Validasi & Pemecah NIP PNS</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">MASUKKAN KODE NIP PNS (18 ANGKA)</label>
                    <input 
                      type="text" 
                      value={nipInput} 
                      onChange={(e) => setNipInput(e.target.value)}
                      placeholder="Contoh: 199805122023031002"
                      className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono tracking-widest text-center" 
                    />
                  </div>

                  <button 
                    onClick={handleParseNip}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <BadgeInfo className="w-4 h-4" /> Mulai Analisis Kode NIP
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col justify-center min-h-[300px]">
                {parsedNip ? (
                  parsedNip.isValid ? (
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl max-w-md mx-auto w-full text-xs space-y-3 font-mono">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-emerald-500 font-bold">✓ KODE NIP PNS VALID</span>
                        <CopyButton textToCopy={`NIP: ${nipInput}\nTgl Lahir: ${parsedNip.lahir}\nPengangkatan: ${parsedNip.angkat}\nGender: ${parsedNip.jk}\nUrutan: ${parsedNip.urutan}`} label="Salin Rincian" size="sm" variant="secondary" />
                      </div>
                      <p className="text-slate-400">Tanggal Lahir: <strong className="text-slate-200">{parsedNip.lahir}</strong></p>
                      <p className="text-slate-400">Tanggal Angkat CPNS: <strong className="text-slate-200">{parsedNip.angkat}</strong></p>
                      <p className="text-slate-400">Jenis Kelamin: <strong className="text-slate-200">{parsedNip.jk}</strong></p>
                      <p className="text-slate-400">Urutan Anggota: <strong className="text-slate-200">{parsedNip.urutan}</strong></p>
                    </div>
                  ) : (
                    <p className="text-center text-rose-500 font-bold font-mono">⚠️ Kode NIP Tidak Valid! Harus berupa 18 digit angka resmi.</p>
                  )
                ) : (
                  <p className="text-center text-slate-500 text-xs font-mono">Belum ada analisis NIP dilakukan</p>
                )}
              </div>
            </>
          )}

          {toolId === 'nip-generator' && (
            <>
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Generator Kode NIP PNS</span>
                  
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">TANGGAL LAHIR</label>
                    <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">BULAN & TAHUN ANGKATAN CPNS</label>
                    <input type="month" value={recruitmentDate} onChange={(e) => setRecruitmentDate(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">JENIS KELAMIN</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                      <option value="1">Laki-Laki</option>
                      <option value="2">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">URUTAN KELULUSAN (3 DIGIT)</label>
                    <input type="text" maxLength={3} value={sequence} onChange={(e) => setSequence(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono text-center" />
                  </div>

                  <button 
                    onClick={handleGenerateNip}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Generate NIP PNS
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col justify-center min-h-[300px]">
                {generatedNip ? (
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl max-w-md mx-auto w-full text-center space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">KODE NIP PNS YANG DI-GENERATE:</span>
                    <span className="text-xl font-mono font-bold text-emerald-500 block tracking-widest bg-slate-900 p-4 rounded-xl border border-slate-850 select-all">
                      {generatedNip}
                    </span>
                    <div className="flex justify-center pt-1">
                      <CopyButton textToCopy={generatedNip} label="Salin Kode NIP" size="md" variant="primary" />
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 text-xs font-mono">Belum ada susunan NIP di-generate</p>
                )}
              </div>
            </>
          )}
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 5. OCR DOKUMEN SCAN */}
      {/* ---------------------------------------------------- */}
      {toolId === 'ocr-scan' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Scan Foto Dokumen ke Teks (OCR)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Potret berkas fisik Anda, sistem otomatis mengekstrak huruf dan kata secara mandiri.</p>
            </div>
            
            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              <ScanText className="w-4 h-4" /> Foto/Ambil Dokumen
              <input type="file" accept="image/*" className="hidden" onChange={handleOcrFile} />
            </label>
          </div>

          {isOcrProcessing && (
            <div className="py-8 text-center space-y-3 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
              <div className="space-y-1.5 max-w-xs mx-auto">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">{ocrStatus || 'Memindai dokumen...'}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
                <p className="text-3xs text-slate-400 font-mono">{ocrProgress}% Selesai</p>
              </div>
            </div>
          )}

          {ocrExtracted && !isOcrProcessing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 block uppercase">FOTO ASLI DOKUMEN</span>
                <div className="p-4 bg-slate-900 rounded-2xl flex justify-center border border-slate-800">
                  {ocrFile && <img src={URL.createObjectURL(ocrFile)} alt="Original file doc" className="max-h-56 rounded-lg shadow" />}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">HASIL EKSTRAKSI HURUF</span>
                  <CopyButton textToCopy={ocrExtracted} label="Salin Teks OCR" size="sm" variant="secondary" />
                </div>
                <textarea 
                  rows={8} 
                  value={ocrExtracted} 
                  onChange={(e) => setOcrExtracted(e.target.value)}
                  className="w-full text-xs p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono leading-relaxed resize-none outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
          )}
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 6. TEXT TO SPEECH (TTS) */}
      {/* ---------------------------------------------------- */}
      {toolId === 'text-to-speech' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Pengonversi Teks Jadi Suara (Suara Google Indonesia)</h3>
          <p className="text-xs text-slate-500">Ketik pesan promosi toko, pengumuman warga, atau naskah Anda, lalu sesuaikan jenis suara dan dengarkan secara offline instan.</p>
          
          <div className="space-y-1.5 pt-2">
            <textarea 
              rows={4} 
              value={ttsText} 
              onChange={(e) => setTtsText(e.target.value)}
              className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-200" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider block">Pilihan Pengisi Suara (Voice)</label>
              <select 
                value={selectedVoiceURI} 
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full text-xs p-2 bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              >
                {voices.length === 0 ? (
                  <option value="">Default Indonesia (id-ID)</option>
                ) : (
                  voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-2xs font-extrabold text-slate-500">
                <span>KECEPATAN (SPEED)</span>
                <span>{speechRate}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={speechRate} 
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-2xs font-extrabold text-slate-500">
                <span>INTONASI (PITCH)</span>
                <span>{speechPitch}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.1" 
                value={speechPitch} 
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <button 
            onClick={handleSpeak}
            className={`w-full py-3 ${isSpeaking ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 animate-bounce" /> Hentikan Suara
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" /> Dengarkan Sekarang (100% Offline)
              </>
            )}
          </button>
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 7. AGE & PENSIUN CALCULATORS */}
      {/* ---------------------------------------------------- */}
      {toolId === 'hitung-umur' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Hitung Umur & Masa Bakti Kerja</span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">PILIH TANGGAL LAHIR / MULAI BEKERJA</label>
                <input 
                  type="date" 
                  value={birthInput} 
                  onChange={(e) => setBirthInput(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono text-center" 
                />
              </div>

              <button 
                onClick={handleCalculateAge}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CalendarDays className="w-4 h-4" /> Mulai Hitung Detil Usia
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col justify-center min-h-[250px]">
            {activeAgeResult ? (
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-sm mx-auto w-full text-center space-y-4 font-mono">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">HASIL HITUNGAN PRESISI:</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-xl font-bold text-emerald-500 block">{activeAgeResult.thn}</span>
                    <span className="text-3xs text-slate-500 mt-1 block">TAHUN</span>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-xl font-bold text-emerald-500 block">{activeAgeResult.bln}</span>
                    <span className="text-3xs text-slate-500 mt-1 block">BULAN</span>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-xl font-bold text-emerald-500 block">{activeAgeResult.hari}</span>
                    <span className="text-3xs text-slate-500 mt-1 block">HARI</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Pilih tanggal di sebelah kiri untuk menghitung umur presisi.</p>
            )}
          </div>
        </div>
      )}

      {toolId === 'pensiun-countdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Kalkulator Masa Pensiun PNS</span>
              
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">TANGGAL LAHIR PEGAWAI</label>
                <input type="date" value={pensionBirth} onChange={(e) => setPensionBirth(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">BATAS USIA PENSIUN (BUP)</label>
                <select value={bupInput} onChange={(e) => setBupInput(Number(e.target.value))} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                  <option value="58">58 Tahun (Pejabat Administrasi / Pelaksana)</option>
                  <option value="60">60 Tahun (Pejabat Pimpinan Tinggi / Guru / Fungsional)</option>
                  <option value="65">65 Tahun (Pejabat Fungsional Ahli Utama)</option>
                </select>
              </div>

              <button 
                onClick={handleCalculatePension}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Mulai Hitung Pensiun
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col justify-center min-h-[250px]">
            {pensionResult ? (
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl max-w-sm mx-auto w-full space-y-4 font-mono">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest block text-center">TMT HARI PENSIUN PNS:</span>
                
                <div className="text-center p-3 bg-slate-900 border border-slate-850 rounded-xl">
                  <span className="text-xs text-slate-400">Efektif Mulai Tanggal (TMT):</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-1">{pensionResult.tglPensiun}</span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">SISA MASA AKTIF KERJA:</span>
                  <span className="text-2xl font-bold text-blue-400 block mt-1">{pensionResult.sisaHari.toLocaleString('id-ID')} Hari</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Pilih tanggal lahir pegawai di sebelah kiri.</p>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. WORD COUNTER */}
      {/* ---------------------------------------------------- */}
      {toolId === 'word-counter' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Penghitung Kata & Karakter Pro (Word Counter)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Analisis jumlah kata, karakter, durasi baca, serta densitas kata kunci tulisan Anda secara offline instan.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <textarea 
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="Mulai ketik atau tempel (paste) artikel, draf esai, atau deskripsi produk Anda di sini..."
                className="w-full h-80 p-4 border border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-xs outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-sans resize-y"
              />

              <div className="flex flex-wrap gap-2">
                <CopyButton textToCopy={wordText} label="Salin Teks" size="sm" variant="secondary" />
                <button 
                  onClick={() => { setWordText(wordText.toUpperCase()); triggerSuccess(); }}
                  disabled={!wordText}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-3xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5" /> HURUF BESAR
                </button>
                <button 
                  onClick={() => { setWordText(wordText.toLowerCase()); triggerSuccess(); }}
                  disabled={!wordText}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-3xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5" /> huruf kecil
                </button>
                <button 
                  onClick={() => setWordText('')}
                  disabled={!wordText}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-3xs rounded-xl flex items-center gap-1.5 ml-auto disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Statistik Real-time</span>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Jumlah Kata</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {wordText.trim() === '' ? 0 : wordText.trim().split(/\s+/).length}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Karakter (Dgn Spasi)</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                    {wordText.length}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Karakter (Tanpa Spasi)</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                    {wordText.replace(/\s/g, '').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
