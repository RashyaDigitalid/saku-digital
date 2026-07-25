import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Navigation, Smile, Sparkles, CalendarHeart, Printer, RefreshCw, Compass, MapPin, Copy, Download, Trash2, Repeat, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import CopyButton from '../CopyButton';

interface SocialToolsProps {
  toolId: string;
}

export default function SocialTools({ toolId }: SocialToolsProps) {
  const triggerSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // 0. TEXT REPEATER STATES
  const [repeaterInput, setRepeaterInput] = useState('');
  const [repeatCount, setRepeatCount] = useState(10);
  const [repeaterSeparator, setRepeaterSeparator] = useState<'newline' | 'space' | 'comma' | 'custom'>('newline');
  const [customSeparator, setCustomSeparator] = useState(' ');
  const [enableNumbering, setEnableNumbering] = useState(false);
  const [repeaterOutput, setRepeaterOutput] = useState('');

  useEffect(() => {
    if (!repeaterInput) {
      setRepeaterOutput('');
      return;
    }

    const arr: string[] = [];
    const count = Math.min(Math.max(1, repeatCount), 10000); // safety cap at 10,000

    for (let i = 1; i <= count; i++) {
      let line = repeaterInput;
      if (enableNumbering) {
        line = `${i}. ${line}`;
      }
      arr.push(line);
    }

    let sep = ' ';
    if (repeaterSeparator === 'newline') sep = '\n';
    else if (repeaterSeparator === 'comma') sep = ', ';
    else if (repeaterSeparator === 'custom') sep = customSeparator;

    setRepeaterOutput(arr.join(sep));
  }, [repeaterInput, repeatCount, repeaterSeparator, customSeparator, enableNumbering]);

  // 1. PRAYER TIMES STATES & PRESETS
  const [cityPreset, setCityPreset] = useState('jakarta');
  const [lat, setLat] = useState(-6.2088);
  const [lng, setLng] = useState(106.8456);
  const [times, setTimes] = useState({ subuh: '04:35', dhuha: '06:15', dzuhur: '11:58', ashar: '15:19', maghrib: '17:52', isya: '19:05' });

  // Simplified prayer time calculator approximation for Indonesian cities
  useEffect(() => {
    let offsetMin = 0;
    if (cityPreset === 'jakarta') { setLat(-6.2088); setLng(106.8456); offsetMin = 0; }
    else if (cityPreset === 'bandung') { setLat(-6.9175); setLng(107.6191); offsetMin = -4; }
    else if (cityPreset === 'surabaya') { setLat(-7.2575); setLng(112.7521); offsetMin = -22; }
    else if (cityPreset === 'medan') { setLat(3.5952); setLng(98.6722); offsetMin = 30; }
    else if (cityPreset === 'makassar') { setLat(-5.1477); setLng(119.4327); offsetMin = -45; }
    else if (cityPreset === 'yogyakarta') { setLat(-7.7956); setLng(110.3695); offsetMin = -15; }

    const addMinutes = (timeStr: string, mins: number) => {
      const [h, m] = timeStr.split(':').map(Number);
      let totalMins = h * 60 + m + mins;
      if (totalMins < 0) totalMins += 24 * 60;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    setTimes({
      subuh: addMinutes('04:40', offsetMin),
      dhuha: addMinutes('06:20', offsetMin),
      dzuhur: addMinutes('12:00', offsetMin),
      ashar: addMinutes('15:20', offsetMin),
      maghrib: addMinutes('17:55', offsetMin),
      isya: addMinutes('19:10', offsetMin),
    });
  }, [cityPreset]);

  const handlePrintPrayerSchedule = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>Jadwal Shalat Digital</title>
        <style>
          body { font-family: sans-serif; padding: 40px; text-align: center; color: #1e293b; }
          .header { border-bottom: 3px double #0284c7; padding-bottom: 15px; margin-bottom: 30px; }
          .header h1 { font-size: 24px; color: #0284c7; text-transform: uppercase; margin: 0; }
          .header p { margin: 5px 0 0; font-size: 14px; color: #64748b; }
          .grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; max-width: 800px; margin: 0 auto; }
          .time-box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #f8fafc; }
          .time-name { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #475569; }
          .time-val { font-size: 22px; font-weight: 800; color: #0284c7; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>JADWAL SHALAT MASJID AL-IKHLAS</h1>
          <p>Wilayah: ${cityPreset.toUpperCase()} | Koordinat: ${lat}, ${lng}</p>
        </div>
        <div class="grid">
          <div class="time-box"><div class="time-name">Subuh</div><div class="time-val">${times.subuh}</div></div>
          <div class="time-box"><div class="time-name">Syuruq</div><div class="time-val">${times.dhuha}</div></div>
          <div class="time-box"><div class="time-name">Dzuhur</div><div class="time-val">${times.dzuhur}</div></div>
          <div class="time-box"><div class="time-name">Ashar</div><div class="time-val">${times.ashar}</div></div>
          <div class="time-box"><div class="time-name">Maghrib</div><div class="time-val">${times.maghrib}</div></div>
          <div class="time-box"><div class="time-name">Isya</div><div class="time-val">${times.isya}</div></div>
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

  // 2. COMPASS ARAH KIBLAT STATES
  const [qiblaAngle, setQiblaAngle] = useState(295); // Approximate Ka'bah angle from Jakarta/Java is around 295° NW
  
  useEffect(() => {
    // Basic calculation of true Kiblat heading based on coordinate projection from Indonesia
    // Kiblat angle = atan2(sin(lng_kaabah - lng), cos(lat)*tan(lat_kaabah) - sin(lat)*cos(lng_kaabah - lng))
    const latKaabah = 21.4225;
    const lngKaabah = 39.8262;
    
    const dLng = (lngKaabah - lng) * Math.PI / 180;
    const phi = lat * Math.PI / 180;
    const phiK = latKaabah * Math.PI / 180;

    const y = Math.sin(dLng);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(dLng);
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    
    if (angle < 0) angle += 360;
    setQiblaAngle(Math.round(angle));
  }, [lat, lng]);

  // 3. AESTHETIC FONTS MAP
  const [fontInput, setFontInput] = useState('Gaya Tulisan');
  const [aestheticOptions, setAestheticOptions] = useState<{ id: string; label: string; text: string }[]>([]);

  const boldAestheticMap = (str: string) => {
    // Map normal alphabets to Bold Fraktur/Script/Mathematical Sans-serif
    const boldChars = "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳";
    const bubbleChars = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ";
    const scriptChars = "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃";
    const gothicChars = "𝔄𝔅𝔖𝔇𝔈𝔉𝔊𝔋𝔌𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔𝔕𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔚𝔞𝔟𝔖𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷";
    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (charMap: string) => {
      return str.split('').map(char => {
        const idx = normalChars.indexOf(char);
        return idx !== -1 ? charMap.substring(idx * 2, idx * 2 + 2) || char : char;
      }).join('');
    };

    const convertSingle = (charMap: string) => {
      return str.split('').map(char => {
        const idx = normalChars.indexOf(char);
        return idx !== -1 ? charMap[idx] : char;
      }).join('');
    };

    return [
      { id: 'math-bold', label: 'Bold Serif', text: convert(boldChars) },
      { id: 'bubble', label: 'Bubble Fonts', text: convertSingle(bubbleChars) },
      { id: 'script', label: 'Cursive / Script', text: convert(scriptChars) },
      { id: 'gothic', label: 'Medieval Gothic', text: convert(gothicChars) },
    ];
  };

  useEffect(() => {
    setAestheticOptions(boldAestheticMap(fontInput));
  }, [fontInput]);

  // Reverse Fonts: Normalizer
  const [lebayInput, setLebayInput] = useState('ⓈⓐⓚⓤⒹⓘⓖⓘⓣⓐⓛ');
  const [normalizedOutput, setNormalizedOutput] = useState('');

  const handleNormalizeFonts = () => {
    // Simple lookup and clean of unicode stylized fonts back to plain ascii alphabets
    const bubbleChars = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ";
    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    
    let cleaned = '';
    for (let i = 0; i < lebayInput.length; i++) {
      const char = lebayInput[i];
      const idx = bubbleChars.indexOf(char);
      if (idx !== -1) {
        cleaned += normalChars[idx];
      } else {
        cleaned += char;
      }
    }
    setNormalizedOutput(cleaned || lebayInput);
    triggerSuccess();
  };

  // 4. TAHLILAN / SELAMATAN JAVA CALCULATOR
  const [passedDate, setPassedDate] = useState('2026-07-08');
  const [selamatanResult, setSelamatanResult] = useState<{ name: string; desc: string; date: string }[] | null>(null);

  const calculateSlametanDays = () => {
    const start = new Date(passedDate);
    
    const addDays = (d: Date, num: number) => {
      const temp = new Date(d);
      temp.setDate(temp.getDate() + num - 1); // Javanese slametan counts start day as Day 1
      return temp.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const results = [
      { name: 'Slametan 3 Hari', desc: 'Penghormatan arwah hari ke-3 meninggal', date: addDays(start, 3) },
      { name: 'Slametan 7 Hari', desc: 'Peringatan tahlilan hari ke-7 meninggal', date: addDays(start, 7) },
      { name: 'Slametan 40 Hari', desc: 'Peringatan tahlilan hari ke-40 meninggal', date: addDays(start, 40) },
      { name: 'Slametan 100 Hari', desc: 'Peringatan tahlilan hari ke-100 meninggal', date: addDays(start, 100) },
      { name: 'Slametan Pendhak I (1 Tahun)', desc: 'Peringatan haul pertama (354 hari jawa)', date: addDays(start, 354) },
      { name: 'Slametan Pendhak II (2 Tahun)', desc: 'Peringatan haul kedua (708 hari jawa)', date: addDays(start, 708) },
      { name: 'Slametan Nyewu (1000 Hari)', desc: 'Puncak tahlilan peringatan hari ke-1000 meninggal', date: addDays(start, 1000) },
    ];

    setSelamatanResult(results);
    triggerSuccess();
  };

  const handleDownloadSlametan = () => {
    if (!selamatanResult) return;
    const formattedDate = new Date(passedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    let txt = `==================================================\n`;
    txt += `     JADWAL SELAMATAN KEMATIAN JAWA & TAHLILAN     \n`;
    txt += `==================================================\n`;
    txt += `Tanggal Meninggal (Gebregan): ${formattedDate}\n\n`;
    selamatanResult.forEach((slam) => {
      txt += `${slam.name.toUpperCase()}\n`;
      txt += `Deskripsi: ${slam.desc}\n`;
      txt += `Tanggal   : ${slam.date}\n`;
      txt += `--------------------------------------------------\n`;
    });
    txt += `Dokumen Jadwal Selamatan Kematian Jawa & Tahlilan\n`;
    
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jadwal_selamatan_kematian_${passedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccess();
  };

  const handleCopySlametan = () => {
    if (!selamatanResult) return;
    const formattedDate = new Date(passedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    let txt = `*JADWAL SELAMATAN KEMATIAN JAWA & TAHLILAN*\n`;
    txt += `Tanggal Meninggal (Gebregan): *${formattedDate}*\n\n`;
    selamatanResult.forEach((slam) => {
      txt += `• *${slam.name}*:\n  ${slam.date}\n`;
    });
    txt += `\n_Dibuat otomatis secara luring_`;
    navigator.clipboard.writeText(txt);
    triggerSuccess();
  };

  const handlePrintSlametan = () => {
    if (!selamatanResult) return;
    const formattedDate = new Date(passedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up browser Anda diperbolehkan.');
      return;
    }
    
    let htmlContent = `
      <html>
        <head>
          <title>Jadwal Selamatan Kematian Jawa</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            h1 { text-align: center; font-size: 20px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; font-weight: 800; }
            h2 { text-align: center; font-size: 13px; font-weight: 600; margin-top: 0; margin-bottom: 30px; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-box { border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 25px; background: #f8fafc; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
            th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 12px; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.6; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Jadwal Hari Peringatan Selamatan Jawa</h1>
          <h2>Portal Keuangan & Administrasi Offline Mandiri</h2>
          
          <div class="info-box">
            <strong>Tanggal Meninggal (Gebregan):</strong> ${formattedDate}
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">No</th>
                <th style="width: 180px;">Hari Selamatan</th>
                <th>Keterangan Tradisi</th>
                <th style="width: 180px;">Tanggal Pelaksanaan</th>
              </tr>
            </thead>
            <tbody>
              ${selamatanResult.map((slam, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${slam.name}</strong></td>
                  <td style="color: #64748b;">${slam.desc}</td>
                  <td style="font-weight: bold; color: #dc2626;">${slam.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Dokumen ini dicetak otomatis secara luring & mandiri.<br/>
            Simpan dokumen ini dengan baik sebagai berkas arsip pribadi.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    triggerSuccess();
  };

  return (
    <div className="space-y-6">
      {/* 1. JADWAL SHOLAT DIGITAL */}
      {toolId === 'jadwal-sholat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Jadwal Salat Digital Masjid</span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">PILIH PRESET KOTA / REGIONAL</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'jakarta', label: 'DKI Jakarta' },
                    { id: 'bandung', label: 'Bandung' },
                    { id: 'surabaya', label: 'Surabaya' },
                    { id: 'medan', label: 'Medan' },
                    { id: 'makassar', label: 'Makassar' },
                    { id: 'yogyakarta', label: 'Yogyakarta' },
                  ].map((city) => (
                    <button 
                      key={city.id}
                      onClick={() => setCityPreset(city.id)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${cityPreset === city.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-2xs font-bold text-slate-400 block mb-1">GARIS LINTANG (LAT)</label>
                  <input type="number" step="0.0001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-center font-mono dark:bg-slate-900" />
                </div>
                <div>
                  <label className="text-2xs font-bold text-slate-400 block mb-1">GARIS BUJUR (LNG)</label>
                  <input type="number" step="0.0001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-center font-mono dark:bg-slate-900" />
                </div>
              </div>

              <button 
                onClick={handlePrintPrayerSchedule}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Buka Lembar Cetak Masjid
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center min-h-[350px]">
            <p className="text-xs text-slate-400 mb-3 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Waktu Salat Masjid Regional {cityPreset.toUpperCase()}
            </p>
            
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto w-full font-mono">
              {Object.entries(times).map(([key, val]) => (
                <div key={key} className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center shadow-lg hover:border-slate-700 transition-all">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">{key}</span>
                  <span className="text-lg font-bold text-emerald-400 block mt-1">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPASS QIBLA COMPASS */}
      {toolId === 'qibla-compass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200">Kompas Arah Kiblat GPS</span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">PILIH PRESET WILAYAH</label>
                <select value={cityPreset} onChange={(e) => setCityPreset(e.target.value)} className="w-full text-xs p-2.5 border rounded-xl dark:bg-slate-900">
                  <option value="jakarta">Jakarta / Banten / Jawa Barat</option>
                  <option value="bandung">Bandung / Tasikmalaya</option>
                  <option value="surabaya">Surabaya / Jawa Timur</option>
                  <option value="medan">Medan / Sumatra Utara</option>
                  <option value="makassar">Makassar / Sulawesi Selatan</option>
                </select>
              </div>

              <div className="text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border space-y-1.5">
                <p className="font-bold text-slate-600 flex items-center gap-1"><Compass className="w-4 h-4 text-rose-500" /> Detil Geodesik Ka'bah:</p>
                <p className="text-slate-500">Sudut Arah Kiblat: <strong className="text-slate-800 dark:text-slate-200">{qiblaAngle}° NW (Barat Laut)</strong></p>
                <p className="text-slate-500 font-mono text-[10px]">Perhitungan presisi busur bumi murni.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-center items-center min-h-[300px]">
            <div className="relative w-44 h-44 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-950 shadow-2xl transition-transform duration-500" style={{ transform: `rotate(-${qiblaAngle - 270}deg)` }}>
              <Navigation className="w-16 h-16 text-emerald-500 animate-pulse transform rotate-180" />
              
              {/* COMPASS DIALS */}
              <span className="absolute top-2 text-[10px] font-bold text-rose-500 font-mono">KIBLAT ({qiblaAngle}°)</span>
              <span className="absolute bottom-2 text-[10px] font-bold text-slate-600 font-mono">S (180°)</span>
              <span className="absolute left-2 text-[10px] font-bold text-slate-600 font-mono">B (270°)</span>
              <span className="absolute right-2 text-[10px] font-bold text-slate-600 font-mono">T (90°)</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-semibold font-mono text-center">Kompas Otomatis Menghadap Kiblat Ka'bah</p>
          </div>
        </div>
      )}

      {/* 3. AESTHETIC FONTS BUILDER */}
      {toolId === 'font-aesthetic' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Generator Tulisan Unik (Aesthetic)</h3>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">MASUKKAN TULISAN BIASA (ALFABET)</label>
            <input 
              type="text" 
              value={fontInput} 
              onChange={(e) => setFontInput(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border rounded-2xl dark:bg-slate-900 font-semibold" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {aestheticOptions.map((opt) => (
              <div key={opt.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-1.50 rounded-xl flex items-center justify-between text-xs">
                <div className="truncate pr-4">
                  <span className="text-3xs text-slate-400 block font-bold mb-1 uppercase">{opt.label}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 select-all font-sans block text-sm truncate">{opt.text}</span>
                </div>
                <CopyButton textToCopy={opt.text} label="Salin" size="sm" variant="secondary" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FONT NORMALIZER */}
      {toolId === 'font-normalizer' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Pembersih Font Unik (Normalizer)</h3>
          <p className="text-xs text-slate-500">Ubah tulisan aneh/lebay sosmed (Kiriman Bubble, Bold, Cursive) kembali menjadi teks tulisan biasa.</p>
          
          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-slate-500">MASUKKAN TULISAN ALEBAY / UNIK</label>
            <input 
              type="text" 
              value={lebayInput} 
              onChange={(e) => setLebayInput(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-xl dark:bg-slate-900" 
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleNormalizeFonts}
              className="flex-grow py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Normalisasi Teks Sekarang
            </button>
          </div>

          {normalizedOutput && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 rounded-xl text-xs flex justify-between items-center font-mono">
              <span>Hasil Normalisasi: <strong className="text-slate-800 dark:text-slate-200">{normalizedOutput}</strong></span>
              <CopyButton textToCopy={normalizedOutput} label="Salin Hasil" size="sm" variant="secondary" />
            </div>
          )}
        </div>
      )}

      {/* 4. SELAMATAN JAWA KEMATIAN */}
      {toolId === 'selamatan-jawa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <CalendarHeart className="w-5 h-5 text-rose-500 animate-pulse" /> Adat Selamatan Kematian Jawa
              </span>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">TANGGAL MENINGGAL DUNIA (GEBREGAN)</label>
                <input 
                  type="date" 
                  value={passedDate} 
                  onChange={(e) => setPassedDate(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl dark:bg-slate-900 font-mono text-center" 
                />
              </div>

              <button 
                onClick={calculateSlametanDays}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow shadow-rose-500/20"
              >
                Mulai Hitung Hari Selamatan
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 p-6 rounded-3xl border shadow-inner flex flex-col justify-between min-h-[350px]">
            {selamatanResult ? (
              <div className="space-y-4">
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {selamatanResult.map((slam, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-white">
                      <div>
                        <span className="text-[10px] text-rose-400 font-bold block">{slam.name}</span>
                        <span className="text-slate-400 text-3xs mt-0.5 block">{slam.desc}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 text-right shrink-0">{slam.date}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button 
                    onClick={handleCopySlametan}
                    className="flex-1 min-w-[120px] py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-3xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" /> Salin Teks
                  </button>
                  <button 
                    onClick={handlePrintSlametan}
                    className="flex-1 min-w-[120px] py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-3xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak / Simpan PDF
                  </button>
                  <button 
                    onClick={handleDownloadSlametan}
                    className="flex-1 min-w-[120px] py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-3xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh .txt
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-xs font-mono">Lakukan hitungan dengan memilih tanggal di kiri.</p>
            )}
          </div>
        </div>
      )}

      {/* 5. TEXT REPEATER */}
      {toolId === 'text-repeater' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-emerald-600" /> Pengulang Teks Cepat (Text Repeater Pro)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Ulangi teks apa saja hingga ribuan kali dengan penomoran dan pemisah kustom secara instan dan 100% offline.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CONFIGURATION COLUMN */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Langkah 1: Konfigurasi Teks</span>

              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border dark:border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">TEKS YANG INGIN DIULANG</label>
                  <textarea 
                    value={repeaterInput}
                    onChange={(e) => setRepeaterInput(e.target.value)}
                    placeholder="Contoh: SEMANGAT JUALAN! 💪"
                    rows={3}
                    className="w-full p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">JUMLAH ULANGAN</label>
                    <input 
                      type="number"
                      min={1}
                      max={10000}
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">TAMBAHKAN NOMOR</label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={enableNumbering}
                          onChange={(e) => setEnableNumbering(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-3xs font-bold text-slate-500 uppercase">Aktif</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">PEMISAH ANTAR TEKS</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => setRepeaterSeparator('newline')}
                      className={`py-1.5 rounded-lg text-4xs font-black uppercase border text-center transition-all cursor-pointer ${repeaterSeparator === 'newline' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white text-slate-600'}`}
                    >
                      Baris Baru
                    </button>
                    <button 
                      onClick={() => setRepeaterSeparator('space')}
                      className={`py-1.5 rounded-lg text-4xs font-black uppercase border text-center transition-all cursor-pointer ${repeaterSeparator === 'space' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white text-slate-600'}`}
                    >
                      Spasi
                    </button>
                    <button 
                      onClick={() => setRepeaterSeparator('comma')}
                      className={`py-1.5 rounded-lg text-4xs font-black uppercase border text-center transition-all cursor-pointer ${repeaterSeparator === 'comma' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white text-slate-600'}`}
                    >
                      Koma ( , )
                    </button>
                    <button 
                      onClick={() => setRepeaterSeparator('custom')}
                      className={`py-1.5 rounded-lg text-4xs font-black uppercase border text-center transition-all cursor-pointer ${repeaterSeparator === 'custom' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white text-slate-600'}`}
                    >
                      Kustom
                    </button>
                  </div>

                  {repeaterSeparator === 'custom' && (
                    <input 
                      type="text"
                      placeholder="Masukkan pemisah kustom..."
                      value={customSeparator}
                      onChange={(e) => setCustomSeparator(e.target.value)}
                      className="w-full mt-2 px-3 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* OUTPUT COLUMN */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Langkah 2: Hasil & Statistik</span>

              <div className="relative">
                <textarea 
                  readOnly
                  value={repeaterOutput}
                  placeholder="Hasil pengulangan teks Anda akan otomatis muncul di sini..."
                  className="w-full h-80 p-4 border dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-xs font-sans outline-none dark:text-white resize-y"
                />

                <div className="absolute top-3 right-3 px-2 py-1 bg-slate-900/80 text-white rounded-md font-mono text-4xs shadow select-none">
                  Karakter: {repeaterOutput.length} | Kata: {repeaterOutput.trim() === '' ? 0 : repeaterOutput.trim().split(/\s+/).length}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <CopyButton textToCopy={repeaterOutput} label="Salin Hasil Teks" size="md" variant="primary" />

                <button 
                  onClick={() => {
                    const blob = new Blob([repeaterOutput], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `sakudigital_teks_ulang.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    triggerSuccess();
                  }}
                  disabled={!repeaterOutput}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold text-3xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Unduh Berkas (.txt)
                </button>

                <button 
                  onClick={() => {
                    setRepeaterInput('');
                    setRepeaterOutput('');
                  }}
                  disabled={!repeaterInput && !repeaterOutput}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-3xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 ml-auto cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Bersihkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
