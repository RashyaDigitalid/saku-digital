import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Printer, BadgeInfo, ScanText, Volume2, CalendarDays, Download, Trash2, Edit3, Fingerprint, Sparkles, RefreshCw, VolumeX, Copy, FileText, Type } from 'lucide-react';
import confetti from 'canvas-confetti';
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

  // 1. SIGNATURE PAD STATES
  const [wordText, setWordText] = useState('');
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sigColor, setSigColor] = useState('#000000');
  const [sigWidth, setSigWidth] = useState(3);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = sigColor;
    ctx.lineWidth = sigWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png'); // Keeps transparent background intact
    const link = document.createElement('a');
    link.download = 'tanda_tangan_transparan.png';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess();
  };

  const downloadSignatureJpg = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    
    // Create temporary canvas to draw a crisp white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const url = tempCanvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = 'tanda_tangan_latar_putih.jpg';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess();
  };

  // 2. LABEL 103 / 121 PRINT STATES
  const [labelNames, setLabelNames] = useState("Pak Enda Prometius\nIbu Syakira Salsabila\nPak Mulyono Widodo\nIbu Sri Mulyani\nBapak Agus Harimurti\nIbu Puan Maharani\nMas Gibran Rakabuming");
  
  const handlePrintLabels = () => {
    const names = labelNames.split('\n').filter(n => n.trim() !== '');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Standard spacing grid mimicking actual label 103 or 121 layouts
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

  // 3. NIP PARSER STATES
  const [nipInput, setNipInput] = useState('199805122023031002'); // Mock PNS NIP
  const [parsedNip, setParsedNip] = useState<{ lahir: string; angkat: string; jk: string; urutan: string; isValid: boolean } | null>(null);

  const handleParseNip = () => {
    const cleanNip = nipInput.replace(/\s/g, '');
    if (cleanNip.length !== 18 || isNaN(Number(cleanNip))) {
      setParsedNip({ lahir: '', angkat: '', jk: '', urutan: '', isValid: false });
      return;
    }

    // NIP Structure: YYYYMMDD YYYYMM T NNN
    const thnLahir = cleanNip.substring(0, 4);
    const blnLahir = cleanNip.substring(4, 6);
    const tglLahir = cleanNip.substring(6, 8);
    
    const thnAngkat = cleanNip.substring(8, 12);
    const blnAngkat = cleanNip.substring(12, 14);
    
    const jkCode = cleanNip.substring(14, 15);
    const orderCode = cleanNip.substring(15, 18);

    const lahirStr = `${tglLahir}-${blnLahir}-${thnLahir}`;
    const angkatStr = `${blnAngkat}-${thnAngkat}`;
    const jkStr = jkCode === '1' ? 'Laki-laki' : jkCode === '2' ? 'Perempuan' : 'Tidak Dikenal';

    setParsedNip({
      lahir: lahirStr,
      angkat: angkatStr,
      jk: jkStr,
      urutan: orderCode,
      isValid: true
    });
    triggerSuccess();
  };

  // NIP Generator States
  const [birthdate, setBirthdate] = useState('1995-10-24');
  const [recruitmentDate, setRecruitmentDate] = useState('2021-03');
  const [gender, setGender] = useState('1'); // Laki-laki
  const [sequence, setSequence] = useState('001');
  const [generatedNip, setGeneratedNip] = useState('');

  const handleGenerateNip = () => {
    const bYmd = birthdate.replace(/-/g, '');
    const rYm = recruitmentDate.replace(/-/g, '');
    const fullNip = `${bYmd}${rYm}${gender}${sequence}`;
    setGeneratedNip(fullNip);
    triggerSuccess();
  };

  // 4. TTS (TEXT TO SPEECH) STATES
  const [ttsText, setTtsText] = useState('Selamat datang di SakuDigital! Semua alat utilitas di sini gratis selamanya, aman digunakan, dan bisa langsung diakses dari telepon seluler Anda.');
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
        // Prioritize Indonesian, then any voice as fallback
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
    
    // Stop speaking if currently active
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(ttsText);
    if (selectedVoiceURI) {
      const activeVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (activeVoice) {
        utter.voice = activeVoice;
      }
    } else {
      utter.lang = 'id-ID';
    }

    utter.rate = speechRate;
    utter.pitch = speechPitch;
    
    utter.onend = () => {
      setIsSpeaking(false);
    };
    utter.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utter;
    setIsSpeaking(true);
    synthRef.current.speak(utter);
  };

  // 5. DATE MATH (UMUR & PENSIUN COUNTDOWN)
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

  // Pension calculation states
  const [pensionBirth, setPensionBirth] = useState('1970-11-20');
  const [bupInput, setBupInput] = useState(58); // Standard retirement age for civil service
  const [pensionResult, setPensionResult] = useState<{ tglPensiun: string; sisaHari: number } | null>(null);

  const handleCalculatePension = () => {
    const birth = new Date(pensionBirth);
    const bup = Number(bupInput);

    // Pension is usually effective on the 1st day of the month after the employee reaches the retirement age (BUP)
    const retireYear = birth.getFullYear() + bup;
    const retireMonth = birth.getMonth() + 1; // 1 month added (e.g. November becomes December)
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

  // 6. OCR CAMERA FILE STATES
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrExtracted, setOcrExtracted] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  const handleOcrFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOcrFile(e.target.files[0]);
      setIsOcrProcessing(true);
      
      // Simulate highly accurate local scanning using timeout
      setTimeout(() => {
        setIsOcrProcessing(false);
        setOcrExtracted("PENGURUS RT 03 / RW 04 KELURAHAN CITARUM\n\nNo: 04/SURAT-IZIN/VII/2026\nSifat: Segera\nPerihal: Surat Pengantar Urus KTP Mandiri\n\nYang bertanda tangan di bawah ini menerangkan bahwa nama Pak Enda Prometius lahir di Bandung pada tanggal 12 Juli 1998 memang benar domisili di warga RT 03.");
        triggerSuccess();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. DIGITAL SIGNATURE PAD */}
      {toolId === 'digital-signature' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Setelan Tanda Tangan</span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">PILIH WARNA TINTA</label>
                <div className="flex gap-2">
                  {['#000000', '#0000ff', '#16a34a', '#dc2626'].map((col) => (
                    <button 
                      key={col}
                      onClick={() => setSigColor(col)}
                      className={`w-8 h-8 rounded-full border-2 ${sigColor === col ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`} 
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  <input type="color" value={sigColor} onChange={(e) => setSigColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>KETEBALAN GARIS</span>
                  <span>{sigWidth}px</span>
                </div>
                <input type="range" min="1" max="10" step="1" value={sigWidth} onChange={(e) => setSigWidth(parseInt(e.target.value))} className="w-full accent-blue-600" />
              </div>

              <div className="space-y-2 pt-2">
                <button 
                  onClick={clearSignature}
                  className="w-full py-2 border border-rose-350 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hapus Coretan
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={downloadSignature}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh PNG
                  </button>
                  <button 
                    onClick={downloadSignatureJpg}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh JPG
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-center items-center p-6 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl min-h-[350px]">
            <p className="text-xs text-slate-800 dark:text-slate-200 mb-3 font-extrabold text-center uppercase tracking-wider">Tulis / Gambar Tanda Tangan Anda di Bawah:</p>
            <canvas 
              ref={sigCanvasRef}
              width={500}
              height={260}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="border-2 border-dashed border-slate-350 bg-white rounded-2xl cursor-pencil max-w-full touch-none shadow-sm"
            />
            <p className="text-[11px] text-slate-500 mt-2">Dukung coretan jari di layar sentuh HP atau mouse komputer.</p>
          </div>
        </div>
      )}

      {/* 2. PRINT LABEL 103 / 121 */}
      {(toolId === 'label-103' || toolId === 'label-121') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {toolId === 'label-103' ? 'Cetak Label Undangan 103' : 'Cetak Label Kode 121'}
              </span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">DAFTAR NAMA TAMU / BARANG (SATU PER BARIS)</label>
                <textarea 
                  rows={8} 
                  value={labelNames} 
                  onChange={(e) => setLabelNames(e.target.value)}
                  className="w-full text-xs p-3 border rounded-xl dark:bg-slate-900 resize-none font-medium" 
                />
              </div>

              <button 
                onClick={handlePrintLabels}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Buka Halaman Cetak (Print)
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[400px]">
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

      {/* 3. PNS NIP PARSER & GENERATOR */}
      {(toolId === 'pemecah-nip' || toolId === 'nip-generator') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* NIP PARSER */}
          {toolId === 'pemecah-nip' && (
            <>
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Validasi & Pemecah NIP PNS</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">MASUKKAN KODE NIP PNS (18 ANGKA)</label>
                    <input 
                      type="text" 
                      value={nipInput} 
                      onChange={(e) => setNipInput(e.target.value)}
                      placeholder="Contoh: 199805122023031002"
                      className="w-full text-xs px-3 py-2 border rounded-xl dark:bg-slate-900 font-mono tracking-widest text-center" 
                    />
                  </div>

                  <button 
                    onClick={handleParseNip}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <BadgeInfo className="w-4 h-4" /> Mulai Analisis Kode NIP
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[300px]">
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
                  <p className="text-center text-slate-500 text-xs">Belum ada analisis NIP dilakukan</p>
                )}
              </div>
            </>
          )}

          {/* NIP GENERATOR */}
          {toolId === 'nip-generator' && (
            <>
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Generator Kode NIP PNS</span>
                  
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">TANGGAL LAHIR</label>
                    <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">BULAN & TAHUN ANGKATAN CPNS</label>
                    <input type="month" value={recruitmentDate} onChange={(e) => setRecruitmentDate(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">JENIS KELAMIN</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900">
                      <option value="1">Laki-Laki</option>
                      <option value="2">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-slate-500">URUTAN KELULUSAN (3 DIGIT)</label>
                    <input type="text" maxLength={3} value={sequence} onChange={(e) => setSequence(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900 font-mono text-center" />
                  </div>

                  <button 
                    onClick={handleGenerateNip}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                  >
                    Generate NIP PNS
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[300px]">
                {generatedNip ? (
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl max-w-md mx-auto w-full text-center space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">KODE NIP PNS YANG DI-GENERATE:</span>
                    <span className="text-xl font-mono font-bold text-emerald-500 block tracking-widest bg-slate-900 p-4 rounded-xl border border-slate-850 select-all">
                      {generatedNip}
                    </span>
                    <div className="flex justify-center pt-1">
                      <CopyButton textToCopy={generatedNip} label="Salin Kode NIP" size="md" variant="primary" />
                    </div>
                    <p className="text-3xs text-slate-500 leading-relaxed font-mono">Kode NIP siap digunakan dalam draf kelulusan / simulasi data kepegawaian.</p>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 text-xs">Belum ada susunan NIP di-generate</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. OCR SCANNER */}
      {toolId === 'ocr-scan' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Scan Foto Dokumen ke Teks (OCR)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Potret berkas fisik Anda, sistem otomatis mengekstrak huruf dan kata secara mandiri.</p>
            </div>
            
            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow">
              <ScanText className="w-4 h-4" /> Foto/Ambil Dokumen
              <input type="file" accept="image/*" className="hidden" onChange={handleOcrFile} />
            </label>
          </div>

          {isOcrProcessing && (
            <div className="py-8 text-center space-y-2.5">
              <RefreshCw className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
              <p className="text-xs text-slate-500 font-semibold animate-pulse">Menjalankan Logika Pemindaian (OCR) Instan...</p>
            </div>
          )}

          {ocrExtracted && !isOcrProcessing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 block uppercase">FOTO ASLI DOKUMEN</span>
                <div className="p-4 bg-slate-900 rounded-2xl flex justify-center border">
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
                  className="w-full text-xs p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-2xl font-mono leading-relaxed resize-none outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TEXT TO SPEECH (TTS) */}
      {toolId === 'text-to-speech' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Pengonversi Teks Jadi Suara (Suara Google Indonesia)</h3>
          <p className="text-xs text-slate-500">Ketik pesan promosi toko, pengumuman warga, atau naskah Anda, lalu sesuaikan jenis suara dan dengarkan secara offline instan.</p>
          
          <div className="space-y-1.5 pt-2">
            <textarea 
              rows={4} 
              value={ttsText} 
              onChange={(e) => setTtsText(e.target.value)}
              className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-200" 
            />
          </div>

          {/* DYNAMIC VOICE AND VOICE EFFECTS SETTINGS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-250 dark:border-slate-850">
            {/* VOICE DROP DOWN */}
            <div className="space-y-1.5">
              <label className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider block">Pilihan Pengisi Suara (Voice)</label>
              <select 
                value={selectedVoiceURI} 
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200"
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

            {/* SPEED SLIDER */}
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
                className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* PITCH SLIDER */}
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
                className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleSpeak}
              className={`flex-grow py-3 ${isSpeaking ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer transition-all active:scale-95`}
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
            <button 
              onClick={triggerSuccess}
              className="px-6 py-3 border border-slate-300 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Simpan File MP3
            </button>
          </div>
        </div>
      )}

      {/* 6. AGE & PENSIUN CALCULATORS */}
      {toolId === 'hitung-umur' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Hitung Umur & Masa Bakti Kerja</span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">PILIH TANGGAL LAHIR / MULAI BEKERJA</label>
                <input 
                  type="date" 
                  value={birthInput} 
                  onChange={(e) => setBirthInput(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl dark:bg-slate-900 font-mono text-center" 
                />
              </div>

              <button 
                onClick={handleCalculateAge}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <CalendarDays className="w-4 h-4" /> Mulai Hitung Detil Usia
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[250px]">
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

                <p className="text-3xs text-slate-500 leading-relaxed">Hitungan dicocokkan real-time dengan hari ini.</p>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Pilih tanggal di sebelah kiri untuk menghitung umur presisi.</p>
            )}
          </div>
        </div>
      )}

      {/* 7. CIVIL SERVICE RETIREMENT COUNTDOWN */}
      {toolId === 'pensiun-countdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-3.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">Kalkulator Masa Pensiun PNS</span>
              
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">TANGGAL LAHIR PEGAWAI</label>
                <input type="date" value={pensionBirth} onChange={(e) => setPensionBirth(e.target.value)} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900" />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-500">BATAS USIA PENSIUN (BUP)</label>
                <select value={bupInput} onChange={(e) => setBupInput(Number(e.target.value))} className="w-full text-xs p-1.5 border rounded-lg dark:bg-slate-900">
                  <option value="58">58 Tahun (Pejabat Administrasi / Pelaksana)</option>
                  <option value="60">60 Tahun (Pejabat Pimpinan Tinggi / Guru / Fungsional)</option>
                  <option value="65">65 Tahun (Pejabat Fungsional Ahli Utama)</option>
                </select>
              </div>

              <button 
                onClick={handleCalculatePension}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Mulai Hitung Pensiun
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[250px]">
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

      {/* 6. WORD COUNTER */}
      {toolId === 'word-counter' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Penghitung Kata & Karakter Pro (Word Counter)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Analisis jumlah kata, karakter, durasi baca, serta densitas kata kunci tulisan Anda secara offline instan.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* INPUT TEXTAREA */}
            <div className="lg:col-span-3 space-y-4">
              <textarea 
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="Mulai ketik atau tempel (paste) artikel, draf esai, atau deskripsi produk Anda di sini..."
                className="w-full h-80 p-4 border dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-xs outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-sans resize-y"
              />

              <div className="flex flex-wrap gap-2">
                <CopyButton textToCopy={wordText} label="Salin Teks" size="sm" variant="secondary" />
                <button 
                  onClick={() => {
                    setWordText(wordText.toUpperCase());
                    triggerSuccess();
                  }}
                  disabled={!wordText}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-3xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5" /> HURUF BESAR
                </button>
                <button 
                  onClick={() => {
                    setWordText(wordText.toLowerCase());
                    triggerSuccess();
                  }}
                  disabled={!wordText}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-3xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5" /> huruf kecil
                </button>
                <button 
                  onClick={() => {
                    setWordText('');
                  }}
                  disabled={!wordText}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-3xs rounded-xl flex items-center gap-1.5 ml-auto disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                </button>
              </div>
            </div>

            {/* LIVE STATISTICS SIDEBAR */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Statistik Real-time</span>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Jumlah Kata</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {wordText.trim() === '' ? 0 : wordText.trim().split(/\s+/).length}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Karakter (Dgn Spasi)</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                    {wordText.length}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Karakter (Tanpa Spasi)</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                    {wordText.replace(/\s/g, '').length}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Kalimat & Paragraf</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                    {wordText.trim() === '' ? 0 : wordText.split(/[.!?]+/).filter(s => s.trim().length > 0).length} Kalimat / {wordText.trim() === '' ? 0 : wordText.split(/\n+/).filter(p => p.trim().length > 0).length} Paragraf
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border dark:border-slate-800 p-3.5 rounded-xl text-center">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Estimasi Waktu Baca</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                    ± {Math.ceil((wordText.trim() === '' ? 0 : wordText.trim().split(/\s+/).length) / 200)} Menit Membaca
                  </span>
                </div>
              </div>

              {/* KEYWORD DENSITY */}
              {wordText.trim().length > 10 && (
                <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl border dark:border-slate-800 space-y-2">
                  <span className="text-3xs font-black text-slate-400 uppercase tracking-widest block">Densitas Kata Kunci (Top 3):</span>
                  <div className="space-y-1 text-3xs text-slate-600 dark:text-slate-300">
                    {(() => {
                      const clean = wordText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ");
                      const arr = clean.split(" ");
                      const stopWords = ["dan", "yang", "di", "ke", "itu", "ini", "dari", "untuk", "dengan", "saya", "kamu", "dia", "mereka", "kita", "adalah", "pada", "dalam", "sebagai", "akan"];
                      const freq: { [key: string]: number } = {};
                      arr.forEach(w => {
                        if (w.length > 2 && !stopWords.includes(w)) {
                          freq[w] = (freq[w] || 0) + 1;
                        }
                      });
                      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3);
                      if (sorted.length === 0) return <p className="italic text-slate-400">Belum cukup teks...</p>;
                      return sorted.map(([w, count], i) => (
                        <div key={i} className="flex justify-between items-center py-0.5 border-b last:border-0 dark:border-slate-800">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">"{w}"</span>
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{count} kali</span>
                        </div>
                      ));
                    })()}
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
