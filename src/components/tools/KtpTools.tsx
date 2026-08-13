import React, { useState, useRef, useEffect } from 'react';
import { Shield, EyeOff, Download, RefreshCw, Layers, Edit, Trash2, Sliders, Type } from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackToolAction } from '../../lib/traffic';

interface KtpToolsProps {
  toolId: string;
}

export default function KtpTools({ toolId }: KtpToolsProps) {
  // Common States
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'watermark' | 'sensor'>(
    toolId === 'redaktur-ktp' ? 'sensor' : 'watermark'
  );

  // Watermark States
  const [watermarkActive, setWatermarkActive] = useState(true);
  const [watermarkText, setWatermarkText] = useState(
    'KTP KHUSUS VERIFIKASI SELLER - ' + new Date().toLocaleDateString('id-ID')
  );
  const [opacity, setOpacity] = useState(0.35);
  const [fontSize, setFontSize] = useState(24);
  const [angle, setAngle] = useState(-30);
  const [density, setDensity] = useState(120); // Spacing between watermarks

  // Redactor/Sensor States
  const [redactZones, setRedactZones] = useState<{ x: number; y: number; w: number; h: number; type: 'black' | 'blur' }[]>([]);
  const [activeRedactType, setActiveRedactType] = useState<'black' | 'blur'>('black');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Success celebration
  const handleSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setRedactZones([]); // Clear previous sensor zones
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Redraw Canvas
  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Set canvas dimension based on the original KTP image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw base KTP image
      ctx.drawImage(img, 0, 0);

      // 1. Draw Watermarks if active
      if (watermarkActive) {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, ' + opacity + ')'; // Default soft red
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxDim = Math.max(canvas.width, canvas.height) * 2;
        for (let x = -maxDim; x < maxDim; x += density * 1.5) {
          for (let y = -maxDim; y < maxDim; y += density) {
            ctx.save();
            ctx.translate(canvas.width / 2 + x, canvas.height / 2 + y);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.fillText(watermarkText, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      }

      // 2. Draw Sensor/Redaction Zones
      redactZones.forEach((zone) => {
        ctx.save();
        if (zone.type === 'black') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
        } else {
          // Responsive blur effect using pixelated style
          const pixelSize = Math.max(8, Math.round(canvas.width * 0.015));
          for (let xx = zone.x; xx < zone.x + zone.w; xx += pixelSize) {
            for (let yy = zone.y; yy < zone.y + zone.h; yy += pixelSize) {
              const w = Math.min(pixelSize, zone.x + zone.w - xx);
              const h = Math.min(pixelSize, zone.y + zone.h - yy);
              ctx.fillStyle = 'rgba(100, 116, 139, 0.96)';
              ctx.fillRect(xx, yy, w, h);
            }
          }
        }
        ctx.restore();
      });
    };
  }, [image, watermarkActive, watermarkText, opacity, fontSize, angle, density, redactZones]);

  // Download secured image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = 'ktp_aman.jpg';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess();
    trackToolAction(toolId);
  };

  // Add auto-positioned preset zones
  const addPresetZone = (zoneType: 'nik' | 'foto' | 'signature' | 'address') => {
    if (!canvasRef.current) return;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;

    let zone = { x: 0, y: 0, w: 0, h: 0, type: activeRedactType };
    if (zoneType === 'nik') {
      zone = { x: cw * 0.23, y: ch * 0.11, w: cw * 0.45, h: ch * 0.09, type: activeRedactType };
    } else if (zoneType === 'foto') {
      zone = { x: cw * 0.70, y: ch * 0.18, w: cw * 0.25, h: ch * 0.58, type: activeRedactType };
    } else if (zoneType === 'signature') {
      zone = { x: cw * 0.70, y: ch * 0.77, w: cw * 0.25, h: ch * 0.20, type: activeRedactType };
    } else if (zoneType === 'address') {
      zone = { x: cw * 0.23, y: ch * 0.23, w: cw * 0.45, h: ch * 0.23, type: activeRedactType };
    }

    setRedactZones([...redactZones, zone]);
  };

  // Click to place custom sensor zone
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'sensor') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Center the sensor box around the clicked coordinates
    const boxW = canvas.width * 0.16;
    const boxH = canvas.height * 0.08;

    const newZone = {
      x: Math.max(0, clickX - boxW / 2),
      y: Math.max(0, clickY - boxH / 2),
      w: Math.min(boxW, canvas.width - clickX + boxW / 2),
      h: Math.min(boxH, canvas.height - clickY + boxH / 2),
      type: activeRedactType
    };

    setRedactZones([...redactZones, newZone]);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="font-extrabold text-slate-950 dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600 animate-pulse" />
          Workspace Pengaman KTP KreasiKaDigital (Dual-Action)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Satu Alat untuk Semua Kebutuhan Pengamanan KTP!</strong> Anda sekarang dapat menempelkan tanda watermark pelindung dari penyalahgunaan pinjol ilegal sekaligus menyensor data rahasia (seperti nomor NIK, tanda tangan, atau foto wajah) secara instan dan bersamaan. 
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> Seluruh proses berjalan 100% offline dan lokal di HP Anda tanpa pengunggahan server.</span>
        </p>
      </div>

      {/* UPLOAD ZONE */}
      {!image && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-750 hover:border-emerald-600 dark:hover:border-emerald-500 rounded-2xl p-10 text-center cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-all group shadow-sm"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-emerald-100">
            <Shield className="w-8 h-8" />
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-200">Pilih / Unggah Foto KTP Anda</p>
          <p className="text-2xs text-slate-400 dark:text-slate-500 mt-1">Dukung format file JPG, JPEG, PNG, WebP (Maksimal 12MB)</p>
          <button className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow active:scale-95">
            Pilih Foto KTP Sekarang
          </button>
        </div>
      )}

      {/* SECURED WORKSPACE */}
      {image && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PANEL CONTROLS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
              
              {/* FILE REPLACE HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="font-extrabold text-slate-950 dark:text-slate-200 text-xs tracking-wider uppercase">Setelan Pengaman</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-2xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Ganti Foto KTP
                </button>
                <input ref={fileInputRef} type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              {/* TABS SELECTOR */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-250 dark:border-slate-850">
                <button
                  onClick={() => setActiveTab('watermark')}
                  className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'watermark' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Type className="w-3.5 h-3.5" /> 1. Watermark
                </button>
                <button
                  onClick={() => setActiveTab('sensor')}
                  className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'sensor' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> 2. Sensor Rahasia
                </button>
              </div>

              {/* TAB 1: WATERMARK SETTINGS */}
              {activeTab === 'watermark' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider">Aktifkan Grid Watermark</label>
                    <input 
                      type="checkbox" 
                      checked={watermarkActive} 
                      onChange={(e) => setWatermarkActive(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  {watermarkActive && (
                    <>
                      {/* TEXT INPUT */}
                      <div className="space-y-1.5">
                        <label className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider">Teks Redaksi Watermark</label>
                        <textarea 
                          value={watermarkText} 
                          onChange={(e) => setWatermarkText(e.target.value)}
                          rows={2}
                          className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-200 resize-none outline-none font-medium"
                        />
                      </div>

                      {/* OPACITY SLIDER */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-2xs font-extrabold text-slate-500">
                          <span>KEBURAMAN (OPACITY)</span>
                          <span>{Math.round(opacity * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="0.8" 
                          step="0.05" 
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      {/* SIZE SLIDER */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-2xs font-extrabold text-slate-500">
                          <span>UKURAN FONT (SIZE)</span>
                          <span>{fontSize}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="12" 
                          max="40" 
                          step="1" 
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      {/* ROTATION SLIDER */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-2xs font-extrabold text-slate-500">
                          <span>SUDUT PUTAR (ROTATION)</span>
                          <span>{angle}°</span>
                        </div>
                        <input 
                          type="range" 
                          min="-90" 
                          max="90" 
                          step="5" 
                          value={angle}
                          onChange={(e) => setAngle(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      {/* DENSITY SLIDER */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-2xs font-extrabold text-slate-500">
                          <span>KERAPATAN WATERMARK</span>
                          <span>{density}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="70" 
                          max="180" 
                          step="10" 
                          value={density}
                          onChange={(e) => setDensity(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: REDACTOR SETTINGS */}
              {activeTab === 'sensor' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* REDACTOR TYPE SELECTOR */}
                  <div className="space-y-2">
                    <label className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider block">Gaya Efek Sensor</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setActiveRedactType('black')}
                        className={`py-2 px-3 text-2xs font-black rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeRedactType === 'black' ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100'}`}
                      >
                        <span className="w-3 h-3 bg-black rounded border border-white"></span> Kotak Hitam
                      </button>
                      <button 
                        onClick={() => setActiveRedactType('blur')}
                        className={`py-2 px-3 text-2xs font-black rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeRedactType === 'blur' ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100'}`}
                      >
                        <span className="w-3 h-3 bg-slate-400 rounded blur-[1px]"></span> Buram (Blur)
                      </button>
                    </div>
                  </div>

                  {/* PRESETS AUTOMATION */}
                  <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                    <label className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Auto-Sensor Sekali Klik (Presets)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => addPresetZone('nik')} className="text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95">
                        🛡️ Sensor NIK
                      </button>
                      <button onClick={() => addPresetZone('foto')} className="text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95">
                        👤 Sensor Foto Wajah
                      </button>
                      <button onClick={() => addPresetZone('signature')} className="text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95">
                        ✍️ Sensor Ttd & Cap
                      </button>
                      <button onClick={() => addPresetZone('address')} className="text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95">
                        📍 Sensor Alamat
                      </button>
                    </div>
                  </div>

                  {/* RESET BUTTON */}
                  {redactZones.length > 0 && (
                    <button 
                      onClick={() => setRedactZones([])}
                      className="w-full py-2 border border-rose-350 hover:border-rose-400 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-2xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Sensor ({redactZones.length})
                    </button>
                  )}
                </div>
              )}

              {/* UNIVERSAL DOWNLOAD BUTTON */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={handleDownload}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Download className="w-4 h-4" /> Unduh Hasil KTP Pengaman (JPG)
                </button>
              </div>

            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-inner flex justify-center items-center overflow-hidden">
              <div className="relative max-w-full">
                <canvas 
                  ref={canvasRef} 
                  onClick={handleCanvasClick}
                  className={`max-w-full h-auto rounded-xl shadow-2xl ${activeTab === 'sensor' ? 'cursor-crosshair border border-dashed border-emerald-500/50' : ''}`}
                  title={activeTab === 'sensor' ? 'Klik pada gambar untuk menempelkan kotak sensor' : ''}
                />
                
                {activeTab === 'sensor' && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/85 text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow backdrop-blur-sm">
                    <Edit className="w-3.5 h-3.5 text-amber-400" /> Ketuk pada KTP untuk memposisikan kotak sensor
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
